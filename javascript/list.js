// リスト更新
function update_display() {
    const container = document.getElementById("list-container");
    container.innerHTML = "";
    preserved_recipes.forEach(recipe => display_buttons(recipe.id));
}

// 並べ替え
const sort_recipes = (method) => {
    sessionStorage.setItem("sortMethod", method);
    switch (method) {
        case "newest":
            preserved_recipes.sort((a, b) => b.id - a.id);
            break;
        case "oldest":
            preserved_recipes.sort((a, b) => a.id - b.id);
            break;
        case "name_asc":
            preserved_recipes.sort((a, b) =>
                a.recipe_name.localeCompare(b.recipe_name, 'ja', { sensitivity: 'base' })
            );
            break;
        case "name_desc":
            preserved_recipes.sort((a, b) =>
                b.recipe_name.localeCompare(a.recipe_name, 'ja', { sensitivity: 'base' })
            );
            break;
        case "favorite_first":
            preserved_recipes.sort((a, b) => {
                if (a.isFavorite == b.isFavorite) return b.id - a.id;
                return a.isFavorite ? -1 : 1;
            });
            break;
    }
    update_display();
};

// 保存したレシピ一覧をボタンで表示
const display_list = async () => {
    /*if (!db) {
        alert("IndexedDBが使えません");
        return;
    }

    const transaction = db.transaction("recipes", "readonly");
    const store = transaction.objectStore("recipes");
    const request = store.getAll();

    request.onsuccess = function (e) {
        preserved_recipes = e.target.result;

        const savedMethod = sessionStorage.getItem("sortMethod");
        if (savedMethod) {
            document.getElementById("sort-select").value = savedMethod;
            sort_recipes(savedMethod);
        } else {
            sort_recipes("newest");
        }
    };

    request.onerror = function () {
        alert("レシピの取得に失敗しました");
        return;
    }*/
    const user_key = sessionStorage.getItem("user_key");

    const { data: recipes, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_key", user_key)
        .order("created_at", { ascending: false });

    if (error) {
        alert("レシピの取得に失敗しました");
        console.error(error);
        return;
    }

    preserved_recipes = recipes; // ← 今まで通り使える

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
    sessionStorage.setItem("prev_page", "preserve");
    sessionStorage.setItem("id", id);

    const recipe = preserved_recipes.find(recipe => recipe.id == id);
    if (!recipe) {
        alert("レシピが見つかりません");
        return;
    }

    const data = recipe.data

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

    showView("result");
};

// 保存したレシピを削除
async function remove_pres(id) {
    /*if (!db) {
        alert("IndexedDBが利用できません");
        return;
    }*/

    const recipe = preserved_recipes.find(r => r.id === id);
    const name = recipe?.recipe_name || "このレシピ";
    const confirmed = confirm(`\"${name}\"を削除しますか？`);
    if (!confirmed) return;

    /*const transaction = db.transaction(["recipes", "images"], "readwrite");
    const recipeStore = transaction.objectStore("recipes");
    const imageStore = transaction.objectStore("images");

    const deleteRecipeRequest = recipeStore.delete(id);
    deleteRecipeRequest.onsuccess = function () {
        const deleteImageRequest = imageStore.delete(id);
        deleteImageRequest.onsuccess = function () {
            alert("レシピを削除しました");
            showView("list")
        };
    };

    deleteRecipeRequest.onerror = function () {
        alert("レシピの削除に失敗しました");
    };*/

    const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", id);

    if (error) {
        alert("レシピの削除に失敗しました");
        console.error(error);
        return;
    }

    // 画像削除
    await supabase.storage
        .from("recipe-images")
        .remove([`${id}.jpg`]);

    alert("レシピを削除しました");
    showView("list");
};

// お気に入り登録・解除
const toggle_favorite = async (id) => {
    const recipe = preserved_recipes.find(r => r.id === id);
    if (!recipe) return;

    /*recipe.isFavorite = !recipe.isFavorite;

    const transaction = db.transaction("recipes", "readwrite");
    const store = transaction.objectStore("recipes");
    store.put(recipe);

    transaction.oncomplete = () => {
        sort_recipes(sessionStorage.getItem("sortMethod") || "newest");
    };*/

    const newValue = !recipe.data.isFavorite;

    const { error } = await supabase
        .from("recipes")
        .update({ data: { ...recipe.data, isFavorite: newValue } })
        .eq("id", id);

    if (error) {
        alert("お気に入り登録の更新に失敗しました");
        console.error(error);
        return;
    }

    recipe.data.isFavorite = newValue;

    sort_recipes(sessionStorage.getItem("sortMethod") || "newest");
};

// QRオーバーレイ表示（canvas描画 + jsQR対応）
const open_qr_overlay = (recipe) => {
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(recipe));
    const encoded = encodeURIComponent(compressed);

    //const shareURL = `../html/index.html?data=${encoded}&editable=true`;
    //const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(recipe));
    const shareURL = `https://saponis.netlify.app/index.html?data=${encoded}&editable=true`;

    //const shareURL = `http://127.0.0.1:5500/index.html?data=${encoded}&editable=true`;

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
    box.style.padding = "24px";
    box.style.borderRadius = "12px";
    box.style.boxShadow = "0 6px 18px rgba(0,0,0,0.3)";
    box.style.textAlign = "center";

    const title = document.createElement("div");
    title.textContent = "QRコードで共有";
    title.style.fontSize = "20px";
    title.style.marginBottom = "12px";

    const qrCanvas = document.createElement("canvas");
    qrCanvas.width = 384;
    qrCanvas.height = 384;
    qrCanvas.style.margin = "0 auto";
    qrCanvas.id = "qr-canvas";

    box.appendChild(title);
    box.appendChild(qrCanvas);
    backdrop.appendChild(box);
    document.body.appendChild(backdrop);

    requestAnimationFrame(() => {
        new QRious({
            element: qrCanvas,
            value: shareURL,
            size: 384,
            level: "M"
        });
    });
};

function adjustRecipe(recipe) {
    const keysToKeep = [
        "recipe_name",
        "type",
        "sap_ratio",
        "water_ratio",
        "alkali_ratio",
        "alcohol_ratio",
        "use_alcohol",
        "oils",
        "options",
        "memo",
    ];

    const result = {};
    for (const key of keysToKeep) {
        if (key in recipe) {
            result[key] = recipe[key];
        }
    }

    return result;
}

// QRコードで共有
function share_pres(id) {
    let recipe = preserved_recipes.find(r => r.id == id);
    if (!recipe) return;
    const adjustedRecipe = adjustRecipe(recipe);
    open_qr_overlay(adjustedRecipe);
}

// メニューのオーバーレイ表示
const open_centered_overlay = (id) => {
    const recipe = preserved_recipes.find(r => r.id == id);
    if (!recipe) return;

    // 背景レイヤー
    const backdrop = document.createElement("div");
    backdrop.style.position = "fixed";
    backdrop.style.top = "0";
    backdrop.style.left = "0";
    backdrop.style.width = "100vw";
    backdrop.style.height = "100vh";
    backdrop.style.background = "rgba(0, 0, 0, 0.4)";
    backdrop.style.zIndex = "999";
    backdrop.addEventListener("click", () => {
        if (document.body.contains(backdrop)) document.body.removeChild(backdrop);
    });

    // メニュー本体
    const menu = document.createElement("div");
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

    const actions = [
        //{ label: "編集する", handler: () => edit_pres(id) },
        { label: "QRコードを表示", handler: () => share_pres(id) },
        { label: "カレンダーに登録", handler: () => register_to_calender(id) },
        { label: "削除する", handler: () => remove_pres(id) }
    ];

    actions.forEach(action => {
        const btn = document.createElement("button");
        btn.textContent = action.label;
        btn.className = "overlay-buttons";
        btn.addEventListener("click", () => {
            document.body.removeChild(backdrop); // 先に閉じる
            action.handler();
        });
        menu.appendChild(btn);
    });

    backdrop.appendChild(menu);
    document.body.appendChild(backdrop);
};

function register_to_calender(id) {
    let recipe = preserved_recipes.find(r => r.id == id);
    if (!recipe) {
        alert("レシピが見つかりません");
        return;
    }

    //const startDate = new Date(recipe.
}

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
    text.textContent = recipe.recipe_name;

    text_wrapper.appendChild(text);
    text_wrapper.addEventListener("click", () => display_pres_list(recipe.id));

    const icon = document.createElement("span");
    icon.className = "favorite-icon";
    icon.textContent = recipe.isFavorite ? "♥" : "♡";
    icon.style.cursor = "pointer";
    icon.addEventListener("click", (e) => {
        e.stopPropagation();
        toggle_favorite(recipe.id);
        icon.textContent = recipe.isFavorite ? "♥" : "♡";
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