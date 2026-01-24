// ===============================
// Supabase
// ===============================
const sb = window.supabase.createClient(
    'https://rmbbsrfstmnfxbbttaro.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtYmJzcmZzdG1uZnhiYnR0YXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDc0OTgsImV4cCI6MjA4NDcyMzQ5OH0.ELoVUxFgbWxaUJDg1DziRp0Y4cSo5MX2zEUDO2bIEzk'
);
window.supabase = sb;

// ユーザーキー生成
function getOrCreateUserKey() {
    let key = localStorage.getItem("user_key");
    if (!key) {
        key = crypto.randomUUID();
        localStorage.setItem("user_key", key);
    }
    return key;
}

async function ensureAnonymousLogin() {
    const { data: { session } } = await window.supabase.auth.getSession();

    // すでにログイン済みなら何もしない
    if (session) return session;

    // 匿名ログイン
    const { data, error } = await window.supabase.auth.signInAnonymously();
    if (error) {
        console.error("匿名ログイン失敗:", error);
        return null;
    }

    return data.session;
}

async function setUserKey(user_id, user_key) {
    const res = await fetch("https://rmbbsrfstmnfxbbttaro.supabase.co/functions/v1/set-user-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, user_key })
    });

    return await res.json();
}

async function refreshJWTWithUserKey(USER_KEY) {
    await window.supabase.auth.updateUser({
        data: { user_key: USER_KEY },
        user_key: USER_KEY
    });
}

async function initApp() {
    const session = await ensureAnonymousLogin();

    const user = session.user;

    const USER_KEY = getOrCreateUserKey();

    await setUserKey(user.id, USER_KEY);

    await window.supabase.auth.refreshSession();

    //await refreshJWTWithUserKey(USER_KEY);
}
initApp();

// 入室コード取得
async function fetchRoomCode() {
    const { data, error } = await window.supabase
        .from("settings")
        .select("value")
        .eq("setting_key", "room_code")
        .maybeSingle();

    if (error) {
        console.error("パスコード取得エラー:", error);
        return null;
    }

    if (!data) {
        console.warn("room_codeが存在しません");
        return null;
    }

    return data.value;
}

// 入室コード認証
async function checkRoomCode(inputCode) {
    const currentCode = await fetchRoomCode();

    if (!currentCode) {
        console.warn("現在のパスコードが取得できません");
        return false;
    }

    return inputCode === currentCode;
}

// 入室コード確認ボタン
document.getElementById("enterButton").addEventListener("click", async () => {
    const inputCode = document.getElementById("roomCodeInput").value.trim();
    const errorBox = document.getElementById("gateError");

    errorBox.textContent = "";

    if (!inputCode) {
        errorBox.textContent = "パスコードを入力して下さい";
        return;
    }

    const ok = await checkRoomCode(inputCode);

    if (ok) {
        document.getElementById("gate").style.display = "none";
        document.getElementById("app").style.display = "block";

        // アプリ起動時
        showView(location.hash.replace("#", "") || "input") // 初期画面
    } else {
        errorBox.textContent = "パスコードが違います";
    }
});

/*// ===============================
// indexedDB
// ===============================
let db = null;
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("SoapRecipeDB", 2);

        request.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("recipes")) {
                db.createObjectStore("recipes", { keyPath: "id", autoIncrement: true });
            }
            if (!db.objectStoreNames.contains("images")) {
                db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = e => {
            db = e.target.result;
            resolve(db);
        };

        request.onerror = e => reject(e);
    });
}

function loadAllData() {
    return new Promise(resolve => {
        const tx1 = db.transaction("recipes", "readonly");
        const req1 = tx1.objectStore("recipes").getAll();

        const tx2 = db.transaction("images", "readonly");
        const req2 = tx2.objectStore("images").getAll();

        req1.onsuccess = () => {
            preserved_recipes = req1.result;

            req2.onsuccess = () => {
                preserved_images = req2.result;
                resolve();
            };
        };
    });
}*/

// ===============================
// SPA ルーター（画面切り替え）
// ===============================

// ビューを読み込んで表示する
async function showView(name, push = true) {
    try {
        const html = await fetch(`views/${name}.html`).then(r => r.text());
        document.getElementById("app").innerHTML = html;

        // ビューごとの初期化
        initView(name);

        // 履歴に積む（戻るボタン対応）
        if (push) {
            history.pushState({ view: name }, "", `#${name}`);
        }

    } catch (e) {
        console.error("ビュー読み込みエラー:", e);
        document.getElementById("app").innerHTML = `<p>読み込みエラー</p>`;
    }
}

// ===============================
// 戻るボタン対応
// ===============================
window.addEventListener("popstate", (event) => {
    const view = event.state?.view || location.hash.replace("#", "") || "input";
    showView(view, false);
});

// ===============================
// メニュークリックで画面切り替え
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("nav.menu li").forEach(li => {
        li.addEventListener("click", () => {
            const view = li.dataset.view;
            closeMenu(); // ハンバーガーメニューを閉じる
            showView(view);
        });
    });

    // 初期表示
    const initialView = location.hash.replace("#", "") || "input";
    showView(initialView, false);
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

