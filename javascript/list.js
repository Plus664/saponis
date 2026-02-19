// リスト更新
function update_display() {
    const container = document.getElementById("list-container");
    container.innerHTML = "";
    preserved_recipes.forEach(recipe => display_buttons(recipe.id));
}

// 並べ替え
const sort_recipes = (method) => {
    sessionStorage.setItem("sortMethod", method);

    preserved_recipes.sort((a, b) => {
        switch (method) {
            case "newest":
                return new Date(b.created_at) - new Date(a.created_at);

            case "oldest":
                return new Date(a.created_at) - new Date(b.created_at);

            case "name_asc":
                return (a.data?.recipe_name || "").localeCompare(
                    b.data?.recipe_name || "",
                    'ja',
                    { sensitivity: 'base' }
                );

            case "name_desc":
                return (b.data?.recipe_name || "").localeCompare(
                    a.data?.recipe_name || "",
                    'ja',
                    { sensitivity: 'base' }
                );

            case "favorite_first":
                if (a.data.isFavorite === b.data.isFavorite) {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                return a.data.isFavorite ? -1 : 1;

            default:
                return 0;
        }
    });

    update_display();
};

// QRコード読み取り
let qrStream = null;
let scanLoopId = null;
let qrLocked = false;

function stopQrScan() {
    if (scanLoopId) cancelAnimationFrame(scanLoopId);
    scanLoopId = null;

    if (qrStream) {
        qrStream.getTracks().forEach(track => track.stop());
        qrStream = null;
    }

    if (qrLocked) qrLocked = false;
}

function closeQrScanner() {
    document.getElementById("qr-overlay").hidden = true;
    stopQrScan();
}

async function onQRDetected(data) {
    try {
        const url = new URL(data);

        const shareId = url.searchParams.get("share");
        if (!shareId) {
            showMessage({
                message: "レシピが見つかりません",
                type: "error",
                mode: "alert"
            });
            return;
        }

        await loadSharedRecipe(shareId);
        clearShareParam();
        showView("input", true, false);
    } catch (e) {
        showMessage({
            message: "QRコードの形式が不正です",
            type: "error",
            mode: "alert"
        });
    }
}

async function startQrScan() {
    const video = document.getElementById("qr-video");
    const canvas = document.getElementById("qr-canvas");
    const ctx = canvas.getContext("2d", {
        willReadFrequently: true
    });
    const frame = document.querySelector(".scan-frame");
    const wrap = document.querySelector(".qr-camera-wrap");

    qrStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
    });

    video.srcObject = qrStream;
    await video.play();

    scanLoopId = requestAnimationFrame(scanLoop);

    function scanLoop() {
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            scanLoopId = requestAnimationFrame(scanLoop);
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const frameRect = frame.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();

        const scaleX = canvas.width / wrapRect.width;
        const scaleY = canvas.height / wrapRect.height;

        const sx = (frameRect.left - wrapRect.left) * scaleX;
        const sy = (frameRect.top - wrapRect.top) * scaleY;
        const sw = frameRect.width * scaleX;
        const sh = frameRect.height * scaleY;

        const imageData = ctx.getImageData(sx, sy, sw, sh);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && !qrLocked) {
            qrLocked = true;
            navigator.vibrate?.(100);
            closeQrScanner();
            onQRDetected(code.data);
            return;
        }

        scanLoopId = requestAnimationFrame(scanLoop);
    }
}

function openQrScanner() {
    document.getElementById("qr-overlay").hidden = false;
    startQrScan();
}

// 保存したレシピ一覧をボタンで表示
const display_list = async () => {
    // user_key を取得
    const userKey = window.userKey;
    if (!userKey) {
        showMessage({ message: "ユーザーキーが見つかりません", type: "error", mode: "alert" });
        return;
    }

    const { data, error } = await sb
        .from("recipes")
        .select("*")
        .eq("user_key", userKey);

    if (error) {
        showMessage({ message: "保存したレシピを取得できません", type: "error", mode: "alert" });
        console.error(error);
        return;
    }

    preserved_recipes = data;

    const savedMethod = sessionStorage.getItem("sortMethod");
    if (savedMethod) {
        document.getElementById("sort-select").value = savedMethod;
        sort_recipes(savedMethod);
    } else {
        sort_recipes("newest");
    }
};

// 要らないキーのみ削除
function clear_preserveSession() {
    const keysToRemove = [
        "scene",
        "prev_page",
        "id",
        "name",
        "type",
        "alkali",
        "oilAmountSum",
        "oilNames",
        "optionNames",
        "waterAmount",
        "alcoholAmount",
        "additionalInfos",
        "conditions",
        "memo"
    ];

    keysToRemove.forEach(key => sessionStorage.removeItem(key));
}

// 保存したレシピの表示
function display_pres_list(id) {
    // sessionStorageで保存、resultのページで表示
    clear_preserveSession();

    sessionStorage.setItem("scene", "preserve");
    //sessionStorage.setItem("prev_page", "preserve");
    sessionStorage.setItem("id", id);

    const recipe = preserved_recipes.find(recipe => recipe.id == id);
    if (!recipe) {
        showMessage({ message: "レシピが見つかりません", type: "error", mode: "alert" });
        return;
    }

    const data = recipe.data;

    sessionStorage.setItem("name", data.recipe_name);
    sessionStorage.setItem("type", data.type == "★タイプ: 固形せっけん" ? "soda" : "potash");
    sessionStorage.setItem("alkali", data.alkali);
    sessionStorage.setItem("oilAmountSum", data.oil_amount_sum);

    const presOils = data.oils || [];
    const oilList = [];
    if (Array.isArray(presOils)) {
        for (let i = 0; i < 10; i++) {
            const oil = presOils[i];
            if (oil && oil.name && oil.amount) oilList.push(`${oil.amount}`);
            else oilList.push("・ 0g (0%)");
        }
    } else {
        for (let i = 0; i < 10; i++) {
            oilList.push("・ 0g (0%)");
        }
    }
    sessionStorage.setItem("oilNames", JSON.stringify(oilList));

    const presOptions = data.options || [];
    const optionList = [];
    if (Array.isArray(presOptions)) {
        for (let i = 0; i < 4; i++) {
            const option = presOptions[i];
            if (option && option.name && option.amount) optionList.push(`${option.amount}`);
            else optionList.push("");
        }
    } else {
        for (let i = 0; i < 4; i++) {
            optionList.push("");
        }
    }
    sessionStorage.setItem("optionNames", JSON.stringify(optionList));

    sessionStorage.setItem("waterAmount", data.water_amount);
    sessionStorage.setItem("alcoholAmount", data.alcohol);

    const presFeatures = data.features;
    const additional_infos = [presFeatures[0].value,
    presFeatures[1].value,
    presFeatures[2].value,
    presFeatures[3].value,
    presFeatures[4].value,
    presFeatures[5].value];
    sessionStorage.setItem("additionalInfos", JSON.stringify(additional_infos));

    const presConditions = data.conditions;
    const conditions = [presConditions[0].value,
    presConditions[1].value,
    presConditions[2].value,
    presConditions[3].value];
    sessionStorage.setItem("conditions", JSON.stringify(conditions));

    sessionStorage.setItem("memo", data.memo || "");

    showView("result", true, false);
};

// 保存したレシピを削除
async function remove_pres(id) {
    const recipe = preserved_recipes.find(r => r.id === id);
    const name = recipe?.data.recipe_name || "このレシピ";
    const confirmed = await showMessage({
        message: `"${name}"を削除しますか？`,
        type: "info",
        mode: "confirm"
    });
    if (!confirmed) return;

    if (recipe.user_key !== window.userKey) {
        showMessage({ message: "このレシピは削除できません", type: "error", mode: "alert" });
        return;
    }

    const { error } = await sb
        .from("recipes")
        .delete()
        .eq("id", id)
        .eq("user_key", window.userKey);

    if (error) {
        showMessage({ message: "レシピの削除に失敗しました", type: "error", mode: "alert" });
        console.error(error);
        return;
    }

    const path = `${window.userKey}/${id}.jpg`;

    const { imgError } = await sb.storage
        .from("recipe-images")
        .remove([path]);

    if (imgError) console.error("画像の削除に失敗しました:", imgError)

    // preserved_recipes を直接書き換える
    const index = preserved_recipes.findIndex(r => r.id === id);
    if (index !== -1) preserved_recipes.splice(index, 1);

    showMessage({ message: "削除しました", type: "info", mode: "alert" });
    update_display();
};

// お気に入り登録・解除
const toggle_favorite = async (id) => {
    const recipe = preserved_recipes.find(r => r.id === id);
    if (!recipe) return;

    const current = !!recipe.data?.isFavorite;
    const newValue = !current;

    const { error } = await sb
        .from("recipes")
        .update({ data: { ...recipe.data, isFavorite: newValue } })
        .eq("id", id)
        .eq("user_key", window.userKey);

    if (error) {
        showMessage({ message: "お気に入りに登録できませんでした", type: "error", mode: "alert" });
        console.error(error);
        return;
    }

    recipe.data.isFavorite = newValue;

    sort_recipes(sessionStorage.getItem("sortMethod") || "newest");
};

// 三点リーダー用：名前変更
async function change_name(id) {
    const recipe = preserved_recipes.find(r => r.id === id);
    if (!recipe) return;

    // オーバーレイ
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0,0,0,0.3)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "1000";

    // ボックス
    const box = document.createElement("div");
    box.className = "change-name-box";
    box.style.padding = "16px 24px";
    box.style.borderRadius = "8px";
    box.style.background = "rgba(220, 225, 235, 1)";
    box.style.minWidth = "250px";
    box.style.height = "200px";
    box.style.textAlign = "center";

    // 説明文
    const p = document.createElement("p");
    p.textContent = "新しいレシピ名を入力して下さい";
    p.style.marginTop = "20px"
    p.style.marginBottom = "30px";
    p.style.fontSize = "20px"
    p.style.color = "#000";
    box.appendChild(p);

    // 入力欄
    const input = document.createElement("input");
    input.type = "text";
    input.value = recipe.data.recipe_name || "";
    input.style.width = "80%";
    input.style.height = "25px";
    input.style.marginBottom = "30px";
    input.style.fontSize = "20px";
    input.style.outline = "none";
    box.appendChild(input);

    // ボタンコンテナ
    const btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.justifyContent = "center";
    btnContainer.style.gap = "8px";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "キャンセル";
    const okBtn = document.createElement("button");
    okBtn.textContent = "変更";

    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(okBtn);
    box.appendChild(btnContainer);
    overlay.appendChild(box);
    document.getElementById("overlay-root").appendChild(overlay);

    overlay.addEventListener("click", (e) => {
        if (!box.contains(e.target)) {
            overlay.remove();
        }
    });

    // キャンセル
    cancelBtn.onclick = () => overlay.remove();

    // 変更ボタン
    okBtn.onclick = async () => {
        const newName = input.value.trim();
        if (!newName) {
            showMessage({ message: "名前を入力してください", type: "error", mode: "alert" });
            return;
        }

        // Supabase UPDATE（title と data.recipe_name 両方）
        const { data, error } = await sb
            .from("recipes")
            .update({
                title: newName,
                data: { ...recipe.data, recipe_name: newName }
            })
            .eq("id", id)
            .eq("user_key", window.userKey)
            .select();

        if (error) {
            console.error(error);
            showMessage({ message: "名前の変更に失敗しました", type: "error", mode: "alert" });
            return;
        }

        // preserved_recipes を上書き
        if (data && data[0]) {
            recipe.data = data[0].data;
            recipe.title = data[0].title;
        }

        // 表示更新
        update_display();

        showMessage({ message: "名前を変更しました", type: "info", mode: "alert" });

        // オーバーレイ削除
        overlay.remove();
    };
}

// QRオーバーレイ表示（canvas描画 + jsQR対応）
const open_qr_overlay = (share_id) => {
    const shareURL = `${location.origin}/index.html?share=${share_id}`;

    const backdrop = document.createElement("div");
    backdrop.style.position = "fixed";
    backdrop.style.top = "0";
    backdrop.style.left = "0";
    backdrop.style.width = "100vw";
    backdrop.style.height = "100vh";
    backdrop.style.background = "rgba(0, 0, 0, 0.5)";
    backdrop.style.zIndex = "999";
    backdrop.addEventListener("click", () => {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    });

    const box = document.createElement("div");
    box.style.position = "fixed";
    box.style.top = "50%";
    box.style.left = "50%";
    box.style.transform = "translate(-50%, -50%)";
    box.style.background = "white";
    box.style.padding = "5px";
    box.style.borderRadius = "12px";
    box.style.boxShadow = "0 6px 18px rgba(0,0,0,0.3)";
    box.style.textAlign = "center";
    box.addEventListener("click", (e) => { e.stopPropagation(); });

    const title = document.createElement("div");
    title.textContent = "QRコードで共有";
    title.style.fontSize = "20px";
    title.style.marginBottom = "12px";

    const qrCanvas = document.createElement("canvas");
    qrCanvas.width = 280;
    qrCanvas.height = 280;
    qrCanvas.style.width = "260px";
    qrCanvas.style.height = "260px";
    qrCanvas.style.margin = "0 auto";
    qrCanvas.style.background = "white";
    qrCanvas.style.padding = "5px";
    qrCanvas.style.boxSizing = "content-box";
    qrCanvas.style.borderRadius = "8px";

    box.appendChild(title);
    box.appendChild(qrCanvas);
    backdrop.appendChild(box);
    document.body.appendChild(backdrop);

    requestAnimationFrame(() => {
        new QRious({
            element: qrCanvas,
            value: shareURL,
            size: 280,
            level: "M"
        });
    });
};

// QRコードで共有
function share_pres(id) {
    let recipe = preserved_recipes.find(r => r.id == id);
    if (!recipe) return;

    open_qr_overlay(recipe.share_id);
}

function closeOverlay() {
    const overlayRoot = document.getElementById("overlay-root");
    if (!overlayRoot) return;
    overlayRoot.innerHTML = "";
}

function start_curing(id) {
    const recipe = preserved_recipes.find(r => r.id == id);
    if (!recipe) return;

    const overlayRoot = document.getElementById("overlay-root");
    overlayRoot.innerHTML = "";

    // 背景
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0,0,0,0.3)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "1000";

    // ボックス
    const box = document.createElement("div");
    box.style.background = "rgba(220,225,235,1)";
    box.style.padding = "24px";
    box.style.borderRadius = "8px";
    box.style.minWidth = "280px";
    box.style.textAlign = "center";
    box.style.justifyContent = "center";

    // 開始日
    const startLabel = document.createElement("label");
    startLabel.textContent = "★熟成開始日";
    startLabel.style.display = "block";
    startLabel.style.marginTop = "16px";
    startLabel.style.fontSize = "24px";

    const startInput = document.createElement("input");
    startInput.type = "date";
    startInput.value = new Date().toISOString().split("T")[0];
    startInput.style.marginTop = "8px";
    startInput.style.height = "22px";
    startInput.style.fontSize = "20px";

    box.appendChild(startLabel);
    box.appendChild(startInput);

    // 期間ラジオ
    const periodLabel = document.createElement("p");
    periodLabel.textContent = "★熟成期間";
    periodLabel.style.marginTop = "16px";
    periodLabel.style.fontSize = "24px";
    box.appendChild(periodLabel);

    const periodWrapper = document.createElement("div");
    periodWrapper.style.justifySelf = "center";
    periodWrapper.style.width = "60%";
    periodWrapper.style.marginTop = "8px";
    periodWrapper.style.textAlign = "left";
    periodWrapper.style.display = "flex";
    periodWrapper.style.flexDirection = "column";
    periodWrapper.style.gap = "8px";

    const periods = [
        { label: "30日", value: 30 },
        { label: "40日（推奨）", value: 40, checked: true },
        { label: "カスタム", value: "custom" }
    ];

    periods.forEach(p => {
        const label = document.createElement("label");
        label.style.display = "block";
        label.style.marginTop = "5px";
        label.style.fontSize = "22px";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "curingPeriod";
        radio.value = p.value;
        if (p.checked) radio.checked = true;

        label.appendChild(radio);
        label.append(" " + p.label);
        periodWrapper.appendChild(label);
    });

    const customInput = document.createElement("input");
    customInput.type = "number";
    customInput.placeholder = "日数を入力";
    customInput.disabled = true;
    customInput.style.marginTop = "8px";
    customInput.style.width = "90%";
    customInput.style.height = "24px";
    customInput.style.fontSize = "20px";

    periodWrapper.appendChild(customInput);
    box.appendChild(periodWrapper);

    // 終了日表示
    const endPreview = document.createElement("p");
    endPreview.style.marginTop = "12px";
    endPreview.style.fontSize = "24px";
    box.appendChild(endPreview);

    // 通知チェック
    const notifyLabel = document.createElement("label");
    notifyLabel.style.display = "block";
    notifyLabel.style.marginTop = "12px";
    notifyLabel.style.fontSize = "24px";

    const notifyCheckbox = document.createElement("input");
    notifyCheckbox.type = "checkbox";
    notifyCheckbox.checked = true;

    notifyLabel.appendChild(notifyCheckbox);
    notifyLabel.append(" 消費期限の前に通知する");
    box.appendChild(notifyLabel);

    // ボタン
    const btnWrap = document.createElement("div");
    btnWrap.className = "curing-btn-wrap";
    btnWrap.style.marginTop = "16px";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "curing-btn-cancel";
    cancelBtn.textContent = "キャンセル";

    const okBtn = document.createElement("button");
    okBtn.className = "curing-btn-ok";
    okBtn.textContent = "開始";
    okBtn.style.marginLeft = "8px";

    btnWrap.append(cancelBtn, okBtn);
    box.appendChild(btnWrap);

    overlay.appendChild(box);
    overlayRoot.appendChild(overlay);

    // --- ロジック ---

    function calculateEndDate() {
        const selected = document.querySelector("input[name='curingPeriod']:checked").value;

        let days;

        if (selected === "custom") {
            days = parseInt(customInput.value, 10);
        } else {
            days = parseInt(selected, 10);
        }

        if (!days || days <= 0) {
            endPreview.textContent = "★熟成終了日: -";
            return null;
        }

        const startDate = new Date(startInput.value);
        startDate.setDate(startDate.getDate() + days);

        const endStr = startDate.toISOString().split("T")[0];
        endPreview.textContent = "★熟成終了日: " + endStr;

        return endStr;
    }

    document.querySelectorAll("input[name='curingPeriod']").forEach(r => {
        r.addEventListener("change", () => {
            const selected = document.querySelector("input[name='curingPeriod']:checked").value;
            if (selected === "custom") {
                customInput.disabled = false;
                customInput.focus();
            } else {
                customInput.disabled = true;
            }

            calculateEndDate();
        });
    });

    customInput.addEventListener("input", calculateEndDate);
    startInput.addEventListener("change", calculateEndDate);

    calculateEndDate();

    // キャンセル
    cancelBtn.onclick = () => overlay.remove();

    overlay.addEventListener("click", e => {
        if (!box.contains(e.target)) overlay.remove();
    });

    // 開始処理
    okBtn.onclick = async () => {
        const endDate = calculateEndDate();
        if (!endDate) {
            showMessage({ message: "熟成期間を入力してください", type: "error", mode: "alert" });
            return;
        }

        const selected = document.querySelector("input[name='curingPeriod']:checked").value;

        let cureDays;

        if (selected === "custom") {
            cureDays = parseInt(customInput.value, 10);
        } else {
            cureDays = parseInt(selected, 10);
        }

        if (!cureDays || cureDays <= 0) {
            showMessage({ message: "熟成期間を入力してください", type: "error", mode: "alert" });
            return;
        }

        // 消費期限 = 熟成終了 + 365日
        const expireDateObj = new Date(endDate);
        expireDateObj.setFullYear(expireDateObj.getFullYear() + 1);
        const expireDate = expireDateObj.toISOString().split("T")[0];

        const payload = {
            user_key: window.userKey,
            recipe_name: recipe.data.recipe_name,
            memo: recipe.data.memo,
            start_date: startInput.value,
            cure_days: cureDays,
            release_date: endDate,
            expire_date: expireDate,
            status: 0,
            expire_notify: notifyCheckbox.checked,
            notified_10days: false,
            notified_release: false,
            notified_expire: false,
        };

        const { error } = await sb.from("curing_batches").insert(payload);

        if (error) {
            console.error(error);
            showMessage({ message: "熟成開始に失敗しました", type: "error", mode: "alert" });
            return;
        }

        showMessage({ message: "熟成を開始しました", type: "info", mode: "alert" });
        overlay.remove();
    };
}

// メニューのオーバーレイ表示
const open_centered_overlay = (id) => {
    const recipe = preserved_recipes.find(r => r.id == id);
    if (!recipe) return;

    const overlayRoot = document.getElementById("overlay-root");

    // 背景レイヤー
    const backdrop = document.createElement("div");
    backdrop.className = "backdrop";
    backdrop.addEventListener("click", closeOverlay);

    // メニュー本体
    const menu = document.createElement("div");
    menu.className = "list-menu";
    menu.style.position = "fixed";
    menu.style.top = "50%";
    menu.style.left = "50%";
    menu.style.transform = "translate(-50%, -50%)";
    menu.style.background = "rgba(220, 225, 235, 1)";
    menu.style.padding = "24px";
    menu.style.borderRadius = "8px";
    menu.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    menu.style.minWidth = "240px";
    menu.style.textAlign = "center";
    menu.style.zIndex = 1001;

    const actions = [
        //{ label: "編集する", handler: () => edit_pres(id) },
        { label: "名前を変更", handler: () => change_name(id) },
        { label: "QRコードを表示", handler: () => share_pres(id) },
        { label: "熟成開始", handler: () => start_curing(id) },
        { label: "このレシピを削除", handler: () => remove_pres(id) }
    ];

    actions.forEach(action => {
        const btn = document.createElement("button");
        btn.textContent = action.label;
        btn.className = "overlay-buttons";
        btn.addEventListener("click", () => {
            closeOverlay();      // 先に閉じる
            action.handler();
        });
        menu.appendChild(btn);
    });

    overlayRoot.append(backdrop, menu);
};

// ボタンを生成＆表示
const display_buttons = (id) => {
    const recipe = preserved_recipes.find(r => r.id == id);
    if (!recipe) return;

    // レシピ表示＆削除用のボタンのwrapper
    const button_wrapper = document.createElement("div");
    button_wrapper.className = "marquee-wrapper";
    button_wrapper.style.display = "flex";
    button_wrapper.style.alignItems = "center";
    button_wrapper.style.position = "relative";
    button_wrapper.addEventListener('click', () => display_pres_list(recipe.id));

    const text_wrapper = document.createElement("div");
    text_wrapper.className = "text-wrapper";
    text_wrapper.style.flexGrow = "1";
    text_wrapper.style.cursor = "pointer";

    const text = document.createElement("div");
    text.className = "marquee-inner";
    text.textContent = recipe.title;

    text_wrapper.appendChild(text);
    text_wrapper.addEventListener("click", () => display_pres_list(recipe.id));

    const icon = document.createElement("span");
    icon.className = "favorite-icon";
    icon.textContent = recipe.data.isFavorite ? "♥" : "♡";
    icon.style.cursor = "pointer";
    icon.addEventListener("click", async (e) => {
        e.stopPropagation();
        await toggle_favorite(recipe.id);
        icon.textContent = recipe.data.isFavorite ? "♥" : "♡";
    });

    text_wrapper.appendChild(text);
    text_wrapper.appendChild(icon);

    const menu_icon_wrapper = document.createElement("div");
    menu_icon_wrapper.className = "menu_icon-wrapper";

    const menu_icon = document.createElement("span");
    menu_icon.textContent = "⋮";
    menu_icon.style.cursor = "pointer";
    menu_icon.style.marginLeft = "8px";
    menu_icon.style.fontSize = "20px";
    menu_icon.style.pointEvents = "none";

    menu_icon_wrapper.addEventListener("click", (e) => {
        e.stopPropagation();
        open_centered_overlay(recipe.id, menu_icon);
    });

    menu_icon_wrapper.appendChild(menu_icon);

    // ボタンを表示
    button_wrapper.appendChild(text_wrapper);
    button_wrapper.appendChild(icon);
    button_wrapper.appendChild(menu_icon_wrapper);
    const list_container = document.getElementById("list-container");
    list_container.appendChild(button_wrapper);

    requestAnimationFrame(() => {
        if (text.scrollWidth > text_wrapper.clientWidth) {
            text.classList.add("scrolling");
        }
    });
};

function initListView() {
    if (shouldShowLoader()) {
        showLoader();
    }

    display_list();

    document.getElementById("sort-select").addEventListener("change", (e) => {
        sort_recipes(e.target.value);
    });

    const searchBox = document.getElementById("search-box");
    searchBox.addEventListener("input", () => {
        const keyword = searchBox.value.toLowerCase();
        const items = document.querySelectorAll(".marquee-wrapper");

        items.forEach(item => {
            const name = item.textContent.toLowerCase();
            if (name.includes(keyword)) {
                item.style.display = "";
            } else {
                item.style.display = "none";
            }
        });
    });

    document.addEventListener("click", () => {
        const menu = document.getElementById("context-menu");
        if (menu) menu.remove();
    });

    fadeOutLoader();
};