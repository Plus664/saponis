// ===============================
// service-worker
// ===============================
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then((registration) => {
                //console.log("SW registered", registration);
            })
            .catch((error) => {
                console.error("SW registration failed:", error);
            });
    });
}

// ===============================
// Supabase
// ===============================
const sb = supabase.createClient(
    'https://rmbbsrfstmnfxbbttaro.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtYmJzcmZzdG1uZnhiYnR0YXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDc0OTgsImV4cCI6MjA4NDcyMzQ5OH0.ELoVUxFgbWxaUJDg1DziRp0Y4cSo5MX2zEUDO2bIEzk'
);

async function loginAfterGate() {
    const { data: existing } = await sb.auth.getUser();

    if (existing?.user) {
        return existing.user;
    }

    const { data, error } = await sb.auth.signInAnonymously();
    if (error) {
        console.error("匿名ログイン失敗", error);
        return null;
    }
    console.log("login res:", data?.user)

    return data.user;
}

// 入室コード認証
async function checkRoomCode(inputCode) {
    if (!inputCode) return false;

    const { data, error } = await sb
        .rpc("check_passcode", {
            target_role: "user",
            input_passcode: inputCode
        });

    if (error) {
        console.error(error);
        return false;
    }

    return data === true;
}

const roomCodeInput = document.getElementById("roomCodeInput");
const enterButton = document.getElementById("enterButton");

roomCodeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        enterButton.click();
    }
});

// 入室コード確認ボタン
enterButton.addEventListener("click", async () => {
    showLoader();

    const inputCode = roomCodeInput.value.trim();
    const ok = await checkRoomCode(inputCode);

    if (!ok) {
        gateError.textContent = "パスコードが違います";
        gateError.style.fontSize = "0.8em";
        roomCodeInput.value = "";
        roomCodeInput.focus();
        fadeOutLoader();
        return;
    }

    sessionStorage.setItem("gatePassed", "1");

    const login = await loginAfterGate();
    if (!login) {
        fadeOutLoader();
        return;
    }

    window.currentUser = login;
    window.userKey = login.id;

    openApp();
    fadeOutLoader();
});

// ===============================
// SPA ルーター（画面切り替え）
// ===============================
let isNavigating = false;

// historyにviewをpush
function pushViewHistory(name) {
    const h = JSON.parse(sessionStorage.getItem("viewHistory") || "[]");
    h.push(name);
    sessionStorage.setItem("viewHistory", JSON.stringify(h.slice(-10)));
}

// inputを復元するか判断
function shouldRestoreInput(name) {
    if (!["input", "original"].includes(name)) return false;
    const h = JSON.parse(sessionStorage.getItem("viewHistory") || "[]");
    if (h.length < 3) return;

    const prev = h[h.length - 2];
    const preprev = h[h.length - 3];

    return prev === "result" && preprev === name;
}

// スクロールするか判断
function shouldSkipScroll(name) {
    const h = JSON.parse(sessionStorage.getItem("viewHistory") || "[]");

    if (h.length < 3) return;
    return h[h.length - 3] === name;
}

// ビューを読み込んで表示する
async function showView(name, push = true, back = false) {
    if (isNavigating && push) return;
    isNavigating = true;

    try {
        const html = await fetch(`views/${name}.html`).then(r => r.text());
        document.getElementById("app").innerHTML = html;

        // push が true の時だけ履歴を積む
        if (push) {
            history.pushState({ view: name }, "", `#${name}`);
            pushViewHistory(name);
        } else if (back) {
            pushViewHistory(name);
        }

        const restore = back && shouldRestoreInput(name);
        const skipScroll = shouldSkipScroll(name);

        initView(name, { restore });
        currentView = name;

        if (!skipScroll) {
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "smooth"
                });
            }, 0);
        }
    } catch (e) {
        console.error("ビュー読み込みエラー:", e);
        document.getElementById("app").innerHTML = `<p>読み込みエラー</p>`;
    } finally {
        isNavigating = false;
    }
}

// ===============================
// 戻るボタン対応
// ===============================
window.addEventListener("popstate", () => {
    const view =
        history.state?.view ||
        location.hash.replace("#", "") ||
        "input";

    isNavigating = false;
    showView(view, false, true);
});

// ===============================
// メニュークリックで画面切り替え
// ===============================
function openGate() {
    gate.style.display = "block";
    app.style.display = "none";

    // メニュー無効化
    document.body.classList.add("gate-locked");

    // PCなら自動フォーカス
    if (!("ontouchstart" in window)) {
        roomCodeInput.focus();
    }
}

async function openApp() {
    gate.style.display = "none";
    app.style.display = "block";

    document.body.classList.remove("gate-locked");

    await afterGate();
}

async function loadSharedRecipe(shareId) {
    const { data, error } = await sb
        .from("recipes")
        .select("*")
        .eq("share_id", shareId)
        .single();

    if (error || !data) {
        showMessage({
            message: "レシピが見つかりません",
            type: "error",
            mode: "alert"
        });
        return;
    }

    sessionStorage.setItem("sharedRecipe", JSON.stringify(data));
    sessionStorage.setItem("sharing", "true");
}

function clearShareParam() {
    const url = new URL(location.href);
    url.searchParams.delete("share");

    history.replaceState(
        history.state,
        "",
        url.pathname + url.hash
    );
}

async function checkAgingAndExpireNotifications() {
    // DBからこのユーザーのせっけん一覧取得
    const { data: soaps, error } = await sb
        .from("curing_batches")
        .select("*")
        .eq("user_key", window.userKey);

    if (error || !soaps) return;

    const today = new Date();

    let agingEndingCount = 0;
    let aging10daysCount = 0;
    let expire10daysCount = 0;

    const updates = []; // DB更新用配列

    soaps.forEach(soap => {
        const releaseDate = new Date(soap.release_date);
        const expireDate = new Date(soap.expire_date);

        const tenDaysBeforeRelease = new Date(releaseDate);
        tenDaysBeforeRelease.setDate(releaseDate.getDate() - 10);

        const tenDaysBeforeExpire = new Date(expireDate);
        tenDaysBeforeExpire.setDate(expireDate.getDate() - 10);

        const updateObj = { id: soap.id }; // 更新対象

        // 熟成終了日が過ぎて通知してない
        if (today >= releaseDate && !soap.notified_release) {
            agingEndingCount++;
            updateObj.notified_release = true;
            updates.push(updateObj);
        }
        // 熟成終了10日前～当日
        else if (today >= tenDaysBeforeRelease && today <= releaseDate && !soap.notified_10days) {
            aging10daysCount++;
            updateObj.notified_10days = true;
            updates.push(updateObj);
        }
        // 消費期限10日前～当日 & notifyオン
        if (soap.expire_notify && today >= tenDaysBeforeExpire && today <= expireDate && !soap.notified_expire) {
            expire10daysCount++;
            updateObj.notified_expire = true;
            updates.push(updateObj);
        }
    });

    // DB更新
    for (const u of updates) {
        await sb
            .from("curing_batches")
            .update(u)
            .eq("id", u.id);
    }

    // トースト通知
    const parts = [];

    if (agingEndingCount > 0) {
        parts.push(`熟成が終了したせっけんが${agingEndingCount}件`);
    }
    if (aging10daysCount > 0) {
        parts.push(`熟成終了が近いせっけんが${aging10daysCount}件`);
    }
    if (expire10daysCount > 0) {
        parts.push(`消費期限が近いせっけんが${expire10daysCount}件`);
    }

    if (parts.length > 0) {
        const message = parts.join("、") + "あります。メニューの「熟成中/使用中のせっけん」から詳細を確認できます";

        showMessage({
            message,
            type: "info",
            mode: "alert"
        });
    }
}

async function afterGate() {
    const params = new URLSearchParams(location.search);
    const shareId = params.get("share");

    if (shareId) {
        await loadSharedRecipe(shareId);
        clearShareParam();
        showView("input", true, false);
        return;
    }

    const initialView = location.hash.replace("#", "") || "input";
    showView(initialView, true, false);

    await checkAgingAndExpireNotifications();
}

function initMenu() {
    document.querySelectorAll("nav.menu li").forEach(li => {
        li.addEventListener("click", () => {
            const view = li.dataset.view;
            closeMenu();
            showView(view, true, false);
        });
    });
}

async function initApp() {
    const gatePassed = sessionStorage.getItem("gatePassed") === "1";

    if (!gatePassed) {
        openGate();
        return;
    }

    //await sb.auth.getSession();

    const user = await loginAfterGate();
    if (!user) return;
    window.userKey = user.id;

    const backBtn = document.getElementById("backBtn");
    backBtn.addEventListener("click", () => {
        history.back();
    });

    openApp();
}

document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    initApp();   // ← ここで全部判断させる
});

// ===============================
// ビューごとの初期化
// ===============================
function initView(name, options = {}) {
    switch (name) {
        case "input":
            if (typeof initInputView === "function") initInputView(options);
            break;

        case "result":
            if (typeof initResultView === "function") initResultView();
            break;

        case "list":
            if (typeof initListView === "function") initListView();
            break;

        case "curing-list":
            if (typeof initCuringListView === "function") initCuringListView();
            break;

        case "original":
            if (typeof initOriginalView === "function") initOriginalView();
            break;

        case "recommend":
            if (typeof initRecommendView === "function") initRecommendView();
            break;

        case "oil-characteristics":
            if (typeof initOilCharacteristicsView === "function") initOilCharacteristicsView();
            break;

        case "column":
            if (typeof initColumnView === "function") initColumnView();
            break;

        case "other":
            if (typeof initOtherView === "function") initOtherView();
            break;

        default:
            console.warn("未定義ビュー:", name);
    }
}

// ===============================
// ハンバーガーメニュー制御
// ===============================
$(function () {
    $('.hamburger').click(function () {
        closeAllMessages();
        $('.menu').toggleClass('open');

        $(this).toggleClass('active');
    });
});

function closeMenu() {
    const menu = document.querySelector("nav.menu");
    const hamburger = document.querySelector(".hamburger");

    menu.classList.remove("open");
    hamburger.classList.remove("active");
}

// ===============================
// 通知UI
// ===============================
// 全表示中のメッセージを管理
const activeMessages = new Set();

function showMessage({ message, type = "info", mode = "alert" }) {
    const root = document.getElementById("overlay-root");
    if (!root) return;

    // メッセージ用オーバーレイ
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0,0,0,0.2)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "1000";

    const box = document.createElement("div");
    box.className = `msg-box msg-${type}`;
    box.style.padding = "16px 24px";
    box.style.borderRadius = "8px";
    box.style.background = "rgba(220, 225, 235, 1)";
    box.style.color = type === "error" ? "red" : "black";
    box.style.minWidth = "200px";
    box.style.width = "90%";
    box.style.maxWidth = "500px";
    box.style.minHeight = "200px";
    box.style.textAlign = "center";
    box.style.display = "flex";
    box.style.flexDirection = "column";
    box.style.justifyContent = "center";
    box.style.zIndex = "1001";

    const text = document.createElement("p");
    text.textContent = message;
    text.style.wordBreak = "break-word";
    text.style.overflowWrap = "break-word";
    box.appendChild(text);

    const btnContainer = document.createElement("div");
    btnContainer.style.marginTop = "30px";
    btnContainer.style.display = "flex";
    btnContainer.style.justifyContent = "center";
    btnContainer.style.gap = "8px";
    box.appendChild(btnContainer);

    overlay.appendChild(box);
    root.appendChild(overlay);

    // 全表示中メッセージに追加
    activeMessages.add(overlay);

    if (mode === "alert") {
        const okBtn = document.createElement("button");
        okBtn.textContent = "OK";
        okBtn.onclick = () => { overlay.remove(); activeMessages.delete(overlay); };
        btnContainer.appendChild(okBtn);

        // 外クリックで消せる
        overlay.addEventListener("click", (e) => {
            if (!box.contains(e.target)) {
                overlay.remove();
                activeMessages.delete(overlay);
            }
        });

        return;
    }

    if (mode === "confirm") {
        const okBtn = document.createElement("button");
        okBtn.textContent = "OK";
        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "キャンセル";

        btnContainer.appendChild(cancelBtn);
        btnContainer.appendChild(okBtn);

        return new Promise(resolve => {
            okBtn.onclick = () => { overlay.remove(); activeMessages.delete(overlay); resolve(true); };
            cancelBtn.onclick = () => { overlay.remove(); activeMessages.delete(overlay); resolve(false); };
        });
    }
}

// 全メッセージを閉じる
function closeAllMessages() {
    activeMessages.forEach(box => box.remove());
    activeMessages.clear();
}

// ===============================
// LOADING制御
// ===============================
const shouldShowLoader = () => {
    const logo = document.querySelector(".logo");
    return logo && !logo.complete;
};

const showLoader = () => {
    const loader = document.getElementById("loader");
    loader.style.display = "flex";
    loader.style.opacity = "1";
};

const fadeOutLoader = () => {
    const loader = document.getElementById("loader");
    loader.style.opacity = "0";
    setTimeout(() => {
        loader.style.display = "none";
    }, 300);
};