// ===============================
// Supabase
// ===============================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
    'https://rmbbsrfstmnfxbbttaro.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtYmJzcmZzdG1uZnhiYnR0YXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDc0OTgsImV4cCI6MjA4NDcyMzQ5OH0.ELoVUxFgbWxaUJDg1DziRp0Y4cSo5MX2zEUDO2bIEzk'
);

// ユーザーキー生成
function getOrCreateUserKey() {
    let key = localStorage.getItem("user_key");
    if (!key) {
        key = crypto.randomUUID();
        localStorage.setItem("user_key", key);
    }
    return key;
}

const USER_KEY = getOrCreateUserKey();

async function ensureAnonymousLogin() {
    const { data: { session } } = await supabase.auth.getSession();

    // すでにログイン済みなら何もしない
    if (session) return session;

    // 匿名ログイン
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
        console.error("匿名ログイン失敗:", error);
        return null;
    }

    return data.session;
}

async function refreshJWTWithUserKey() {
    await supabase.auth.updateUser({
        data: { user_key: USER_KEY }
    });
}

await ensureAnonymousLogin();
await refreshJWTWithUserKey();

// 入室コード取得
async function fetchRoomCode() {
    const { data, error } = await supabase
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

