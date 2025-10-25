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
    sessionStorage.setItem("oilNames", JSON.stringify(oil_names));

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

// お気に入り登録・解除
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

// QRオーバーレイ表示（canvas描画 + jsQR対応）
const open_qr_overlay = (recipe) => {
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(recipe));
  const shareURL = `https://saponis.netlify.app/html/result.html?data=${compressed}&editable=true`;
  //const shareURL = `../html/result.html?data=${compressed}&editable=true`;

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

// QRコードで共有
function share_pres(id) {
  let recipe = preserved_recipes.find(r => r.id == id);
  if (!recipe) return;
  open_qr_overlay(recipe);
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
    if(document.body.contains(backdrop)) document.body.removeChild(backdrop);
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
/*
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    }, 0);
*/

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