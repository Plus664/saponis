let preserved_recipes = [];        // 保存したレシピの配列
let request;
let db;

// リスト更新
function update_display() {
    const container = document.getElementById("list-container");
    container.innerHTML = "";
    preserved_recipes.forEach(recipe => display_buttons(recipe.id));
}

// 並べ替え
const sort_recipes = (method) => {
    sessionStorage.setItem("sortMethod", method);
    switch(method) {
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
                if(a.isFavorite == b.isFavorite) return b.id - a.id;
                return a.isFavorite ? -1 : 1;
            });
            break;
    }
    update_display();
};

// 保存したレシピ一覧をボタンで表示
const display_list = () => {
    if(!db) {
        alert("IndexedDBが使えません");
        return;
    }

    const transaction = db.transaction("recipes", "readonly");
    const store = transaction.objectStore("recipes");
    const request = store.getAll();

    request.onsuccess = function(e) {
        preserved_recipes = e.target.result;

        const savedMethod = sessionStorage.getItem("sortMethod");
        if(savedMethod) {
            document.getElementById("sort-select").value = savedMethod;
            sort_recipes(savedMethod);
        } else {
            sort_recipes("newest");
        }
    };

    request.onerror = function() {
        alert("レシピの取得に失敗しました");
        return;
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
function display_pres(id){
    // sessionStorageで保存、resultのページで表示
    clear_preserveSession();

    sessionStorage.setItem("scene", "preserve");
    sessionStorage.setItem("prev_page", "preserve");

    sessionStorage.setItem("id", id);

    const recipe = preserved_recipes.find(recipe => recipe.id == id);
    if(!recipe) {
        alert("レシピが見つかりません");
        return;
    }

    sessionStorage.setItem("name", recipe.recipe_name);

    sessionStorage.setItem("type", recipe.type == "★タイプ: 固形せっけん" ? "soda" : "potash");

    sessionStorage.setItem("alkali", recipe.alkali);

    sessionStorage.setItem("oilAmountSum", recipe.oil_amount_sum);

    const oil_names = [recipe.oil1, recipe.oil2, recipe.oil3, recipe.oil4, recipe.oil5, recipe.oil6, recipe.oil7, recipe.oil8, recipe.oil9, recipe.oil10];
    sessionStorage.setItem("oilNames", oil_names.toString());

    const option_names = [recipe.option1, recipe.option2, recipe.option3, recipe.option4];
    sessionStorage.setItem("optionNames", option_names);

    sessionStorage.setItem("waterAmount", recipe.water_amount);

    sessionStorage.setItem("alcoholAmount", recipe.alcohol);

    const additional_infos = [recipe.skin, 
                              recipe.clean, 
                              recipe.foam, 
                              recipe.hard, 
                              recipe.collapse,
                              recipe.stability];
    sessionStorage.setItem("additionalInfos", additional_infos.toString());

    const conditions = [recipe.mix_temp,
                        recipe.cure_temp,
                        recipe.cure_humidity,
                        recipe.final_ph];
    sessionStorage.setItem("conditions", conditions.toString());

    sessionStorage.setItem("memo", recipe.memo.toString());

    location.href = "../html/result.html";
};

// 保存したレシピを削除
function remove_pres(id){
    if(!db) {
        alert("IndexedDBが利用できません");
        return;
    }

    const recipe = preserved_recipes.find(r => r.id === id);
    const name = recipe?.recipe_name || "このレシピ";
    const confirmed = confirm(`\"${name}\"を削除しますか？`);
    if(!confirmed) return;

    const transaction = db.transaction(["recipes", "images"], "readwrite");
    const recipeStore = transaction.objectStore("recipes");
    const imageStore = transaction.objectStore("images");

    const deleteRecipeRequest = recipeStore.delete(id);
    deleteRecipeRequest.onsuccess = function() {
        const deleteImageRequest = imageStore.delete(id);
        deleteImageRequest.onsuccess = function() {
            alert("レシピを削除しました");
            window.location.reload();
        };
    };

    deleteRecipeRequest.onerror = function() {
        alert("レシピの削除に失敗しました");
    };
};

const toggle_favorite = (id) => {
    const recipe = preserved_recipes.find(r => r.id === id);
    if(!recipe) return;

    recipe.isFavorite = !recipe.isFavorite;

    const transaction = db.transaction("recipes", "readwrite");
    const store = transaction.objectStore("recipes");
    store.put(recipe);

    transaction.oncomplete = () => {
        sort_recipes(sessionStorage.getItem("sortMethod") || "newest");
    };
};

const show_context_menu = (id, parent, event) => {
    const existing_menu = document.getElementById("context-menu");
    if(existing_menu) existing_menu.remove();

    const trigger = event.currentTarget;
    const rect = trigger.getBoundingClientRect();
    const menuWidth = 140;
    const menuHeight = 100;
    let left = rect.left + window.scrollX - menuWidth;
    if(left < 0) left = rect.right + window.scrollX;
    let top = rect.top + window.scrollY;
    const viewportHeight = window.innerHeight;
    if(top + menuHeight > viewportHeight) top = rect.bottom + window.scrollY - menuHeight;
    const menu = document.createElement("div");
    menu.id = "context-menu";
    menu.style.position = "absolute";
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.backgroundColor = "#fff";
    menu.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    menu.style.zIndex = "1000";
    menu.style.display = "flex";
    menu.style.flexDirection = "column";

    const recipe = preserved_recipes.find(r => r.id === id);
    if(!recipe) return;

    const fav_option = document.createElement("div");
    fav_option.textContent = recipe.isFavorite ? "お気に入り解除" : "お気に入り登録";
    fav_option.style.padding = "8px 12px";
    fav_option.style.cursor = "pointer";
    fav_option.addEventListener("click", () => {
        toggle_favorite(id);
        menu.remove();
    });

    const delete_option = document.createElement("div");
    delete_option.textContent = "削除";
    delete_option.style.padding = "8px 12px";
    delete_option.style.cursor = "pointer";
    delete_option.addEventListener("click", () => {
        remove_pres(id);
        menu.remove();
    });

    menu.appendChild(fav_option);
    menu.appendChild(delete_option);
    document.body.appendChild(menu);
    menu.classList.add("show");

    const actualHeight = menu.offsetHeight;
    if (top + actualHeight > window.innerHeight) {
        top = rect.bottom + window.scrollY - actualHeight;
        menu.style.top = `${top}px`;
    }
};

// ボタンを生成＆表示
const display_buttons = (id) => {
    const recipe = preserved_recipes.find(r => r.id == id);
    if(!recipe) return;

    // レシピ表示＆削除用のボタンのwrapper
    const button_wrapper = document.createElement("div");
    button_wrapper.className = "marquee-wrapper";
    button_wrapper.style.display = "flex";
    button_wrapper.style.alignItems = "center";
    button_wrapper.style.position = "relative";
    button_wrapper.addEventListener('click', () => display_pres(recipe.id));

    const text_wrapper = document.createElement("div");
    text_wrapper.className = "text-wrapper";
    text_wrapper.style.flexGrow = "1";
    text_wrapper.style.cursor = "pointer";

    const text = document.createElement("div");
    text.className = "marquee-inner";
    text.textContent = recipe.recipe_name;

    text_wrapper.appendChild(text);
    text_wrapper.addEventListener("click", () => display_pres(recipe.id));

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

    const delete_icon = document.createElement("span");
    delete_icon.textContent = "🗑";
    delete_icon.style.cursor = "pointer";
    delete_icon.style.marginLeft = "8px";
    delete_icon.style.fontSize = "20px";
    delete_icon.addEventListener("click", (e) => {
        e.stopPropagation();
        remove_pres(recipe.id);
    });

    // ボタンを表示
    button_wrapper.appendChild(text_wrapper);
    button_wrapper.appendChild(icon);
    button_wrapper.appendChild(delete_icon);
    const list_container = document.getElementById("list-container");
    list_container.appendChild(button_wrapper);

    requestAnimationFrame(() => {
        if(text.scrollWidth > text_wrapper.clientWidth) {
            text.classList.add("scrolling");
        }
    });
};

// ハンバーガーメニューの実装
$(function() {
    $('.hamburger').click(function() {
        $('.menu').toggleClass('open');

        $(this).toggleClass('active');
    });
});

window.onload = () => {
//indexedDB.deleteDatabase("SoapRecipeDB");
    if(shouldShowLoader()) {
        showLoader();
    }

    setTimeout(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    }, 0);

    request = indexedDB.open("SoapRecipeDB", 2);

    request.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("recipes")) {
            db.createObjectStore("recipes", { keyPath: "id", autoIncrement: true });
        }
        if (!db.objectStoreNames.contains("images")) {
            db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
        }
    };

    request.onsuccess = function(e) {
        db = e.target.result;
        display_list();
    };

    document.getElementById("sort-select").addEventListener("change", (e) => {
        sort_recipes(e.target.value);
    });

    const searchBox = document.getElementById("search-box");
    searchBox.addEventListener("input", () => {
        const keyword = searchBox.value.toLowerCase();
        const items = document.querySelectorAll(".marquee-wrapper");

        items.forEach(item => {
            const name = item.textContent.toLowerCase();
            if(name.includes(keyword)){
                item.style.display = "";
            } else {
                item.style.display = "none";
            }
        });
    });
/*
    document.querySelectorAll(".favorite-icon").forEach(icon => {
        icon.addEventListener("click", () => {
            icon.classList.remove("hop");
            void icon.offsetWidth;
            icon.classList.add("hop");
            setTimeout(() => {
                icon.classList.remove("hop");
            }, 400);
        });
    });
*/
    document.addEventListener("click", () => {
        const menu = document.getElementById("context-menu");
        if(menu) menu.remove();
    });

    fadeOutLoader();
};

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