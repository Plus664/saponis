// ===============================
// Supabase
// ===============================
const sb = supabase.createClient(
    'https://rmbbsrfstmnfxbbttaro.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtYmJzcmZzdG1uZnhiYnR0YXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDc0OTgsImV4cCI6MjA4NDcyMzQ5OH0.ELoVUxFgbWxaUJDg1DziRp0Y4cSo5MX2zEUDO2bIEzk'
);

async function loginAfterGate() {
    const { data, error } = await sb.auth.signInAnonymously();
    if (error) {
        console.error("匿名ログイン失敗", error);
        return null;
    }
    return data.user;
}


// 入室コード取得
async function fetchRoomCode() {
    const { data, error } = await sb
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
    const inputCode = roomCodeInput.value.trim();
    const ok = await checkRoomCode(inputCode);

    if (!ok) {
        gateError.textContent = "パスコードが違います";
        return;
    }

    const user = await loginAfterGate();
    window.currentUser = user;

    gate.style.display = "none";
    app.style.display = "block";
});


// ===============================
// SPA ルーター（画面切り替え）
// ===============================

// ビューを読み込んで表示する
async function showView(name, push = true) {
    try {
        const html = await fetch(`views/${name}.html`).then(r => r.text());
        document.getElementById("app").innerHTML = html;

        initView(name);

        // ✅ push が true の時だけ履歴を積む
        if (push) {
            history.pushState({ view: name }, "", `/${name}`);
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
    const view = event.state?.view || "input";
    showView(view, false);
});

// ===============================
// メニュークリックで画面切り替え
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("nav.menu li").forEach(li => {
        li.addEventListener("click", () => {
            const view = li.dataset.view;
            closeMenu();
            showView(view, true);
        });
    });

    const path = location.pathname.replace("/", "");
    const initialView = path || "input";

    // 🔑 初期表示は絶対 push しない
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