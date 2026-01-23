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

// アプリ起動時
openDB().then(() => {
    showView(location.hash.replace("#", "") || "input") // 初期画面
});

