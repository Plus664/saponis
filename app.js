// ===============================
// Supabase
// ===============================
const sb = supabase.createClient(
    'https://rmbbsrfstmnfxbbttaro.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtYmJzcmZzdG1uZnhiYnR0YXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDc0OTgsImV4cCI6MjA4NDcyMzQ5OH0.ELoVUxFgbWxaUJDg1DziRp0Y4cSo5MX2zEUDO2bIEzk'
);

function getUserKey() {
    let key = localStorage.getItem("user_key");
    if (!key) {
        key = "uk_" + crypto.randomUUID();
        localStorage.setItem("user_key", key);
    }
    return key;
}

async function loginAfterGate() {
    const { data, error } = await sb.auth.signInAnonymously();
    if (error) {
        console.error("匿名ログイン失敗", error);
        return null;
    }

    const userKey = getUserKey();

    return {
        authUser: data.user,
        userKey: userKey,
    }
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

    window.currentUser = login.authUser;
    window.userKey = login.userKey;

    openApp();
    fadeOutLoader();
});

// ===============================
// SPA ルーター（画面切り替え）
// ===============================
let isNavigating = false;

// ビューを読み込んで表示する
async function showView(name, push = true) {
    if (isNavigating && push) return;
    isNavigating = true;

    try {
        const html = await fetch(`views/${name}.html`).then(r => r.text());
        document.getElementById("app").innerHTML = html;

        initView(name);
        currentView = name;

        // push が true の時だけ履歴を積む
        if (push) {
            history.pushState({ view: name }, "", `#${name}`);
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
    showView(view, false);
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

function openApp() {
    gate.style.display = "none";
    app.style.display = "block";

    document.body.classList.remove("gate-locked");

    const initialView = location.hash.replace("#", "") || "input";
    showView(initialView, false);
}

function initMenu() {
    document.querySelectorAll("nav.menu li").forEach(li => {
        li.addEventListener("click", () => {
            const view = li.dataset.view;
            closeMenu();
            showView(view);
        });
    });
}

async function initApp() {
    const gatePassed = sessionStorage.getItem("gatePassed") === "1";

    if (!gatePassed) {
        openGate();
        return;
    }

    history.replaceState(
        { view: "input" },
        "",
        "#input"
    );

    window.userKey = localStorage.getItem("user_key");

    openApp();
}

document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    initApp();   // ← ここで全部判断させる
});

// ===============================
// ビューごとの初期化
// ===============================
function initView(name) {
    switch (name) {
        case "input":
            if (typeof initInputView === "function") initInputView();
            break;

        case "result":
            if (typeof initResultView === "function") initResultView();
            break;

        case "list":
            if (typeof initListView === "function") initListView();
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

$(function () {
    $('.hamburger').click(function () {
        $('.menu').toggleClass('open');

        $(this).toggleClass('active');
    });
});

// ===============================
// ハンバーガーメニュー制御
// ===============================
function closeMenu() {
    const menu = document.querySelector("nav.menu");
    const hamburger = document.querySelector(".hamburger");

    menu.classList.remove("open");
    hamburger.classList.remove("active");
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