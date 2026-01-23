let oil_amount1, oil_amount2, oil_amount3, oil_amount4, oil_amount5, oil_amount6, oil_amount7, oil_amount8, oil_amount9, oil_amount10;
let sap_ratio, water_ratio;
let sap_ratio_global = 0;
let water_ratio_global = 0;
let alkali_ratio_global = 0;
let alcohol_ratio_global = 0;
let oil_name_infos;
let alkali_result;
let sap_ratio_result;
let water_amount_result;

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

function initInputView() {
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    }, 0);

    initInput();
}

function fillOilAndOption(recipe) {
    recipe.oils.forEach((oil, index) => {
        // 例: "・オリーブ油 100g (20%)"
        const match = oil.amount.match(/^・(.+?)\s+(\d+)g\s+\(\d+%\)$/);
        if (match) {
            const oilName = match[1];   // オリーブ油
            const oilAmount = match[2]; // 100

            // select と input を取得
            const selectEl = document.querySelector(`select[name="sel${index + 1}"]`);
            const amountEl = document.querySelector(`#oil_amount${index + 1}`);

            if (selectEl) selectEl.value = oilName;
            if (amountEl) amountEl.value = oilAmount;
        }
    });

    recipe.options.forEach((opt, index) => {
        // 例: "・ラベンダー精油 10g (2%)"
        const match = opt.amount.match(/^・(.+?)\s+(\d+)g\s+\(\d+%\)$/);
        if (match) {
            const optionName = match[1];   // ラベンダー精油
            const optionAmount = match[2]; // 10

            // select と input を取得
            const selectEl = document.querySelector(`select[name="option_select${index + 1}"]`);
            const amountEl = document.querySelector(`#option_amount${index + 1}`);

            if (selectEl) selectEl.value = optionName;
            if (amountEl) amountEl.value = optionAmount;
        }
    });
}

function fillForm(recipe) {
    document.querySelector("#recipe_name").value = recipe.recipe_name;

    const type = recipe.type;
    if (type === "soda") {
        document.querySelector("#radio_soda").checked = true;
        //document.querySelector("#radio_potash").checked = false;
        document.querySelector("#water_ratio_val").value = recipe.water_ratio * 100 || 34;
        document.querySelector("#alcohol_ratio_val").value = 100;
    } else if (type === "potash") {
        document.querySelector("#radio_potash").checked = true;
        //document.querySelector("#").value = recipe.;
        document.querySelector("#water_ratio_val").value = 34;
    }

    document.querySelector("#sap_ratio_val").value = recipe.sap_ratio * 100 || 92;
    document.querySelector("#alkali_ratio_val").value = recipe.alkali_ratio * 100 || 100;
    //document.querySelector("#alcohol_ratio_val").value = recipe.alcohol_ratio || 100;
    const useAlcohol = recipe.use_alcohol;
    if (useAlcohol) {
        // 「アルコールを使う」を選択
        document.querySelector('input[name="ifUseAlcohol"][value="with"]').checked = true;
        document.querySelector('input[name="ifUseAlcohol"][value="without"]').checked = false;

        // アルコール純度を反映
        document.querySelector("#alcohol_ratio_val").value = recipe.alcohol_ratio * 100 || 100;
    } else {
        // 「アルコールを使わない」を選択
        document.querySelector('input[name="ifUseAlcohol"][value="without"]').checked = true;
        document.querySelector('input[name="ifUseAlcohol"][value="with"]').checked = false;

        // アルコール純度を反映
        document.querySelector("#alcohol_ratio_val").value = 100;
    }

    fillOilAndOption(recipe);

    document.querySelector("#memo").value = recipe.memo || "";
    //document.querySelector("#sap_ratip_val").value = recipe.sap_ratio;
    //document.querySelector("#alkali_ratio_val").value = recipe.;
}

function initInput() {
    if (shouldShowLoader()) {
        showLoader();
    }

    const params = new URLSearchParams(location.search);
    const compressed = params.get("data");

    if (compressed !== null && compressed !== "") {
        try {
            const decoded = decodeURIComponent(compressed);
            //const qrRecipe = JSON.parse(LZString.decompressFromEncodedURIComponent(compressed));
            const qrRecipe = JSON.parse(LZString.decompressFromEncodedURIComponent(decoded));
            if (compressed === "test") {
                fillForm({
                    recipe_name: "テストレシピ",
                    type: "soda",
                    water_ratio: 34,
                    alcohol_ratio: 100,
                    sap_ratio: 92,
                    alkali_ratio: 100,
                    use_alcohol: true,
                    oils: [],
                    options: [],
                    memo: "テストメモ"
                });
                return;
            }
            else fillForm(qrRecipe);
        } catch (e) {
            alert(e.message + "\n表示に失敗しました");
            showView("input");
        }
        return;
    }

    oil_amount1 = document.getElementById("oil_amount1");
    oil_amount2 = document.getElementById("oil_amount2");
    oil_amount3 = document.getElementById("oil_amount3");
    oil_amount4 = document.getElementById("oil_amount4");
    oil_amount5 = document.getElementById("oil_amount5");
    oil_amount6 = document.getElementById("oil_amount6");
    oil_amount7 = document.getElementById("oil_amount7");
    oil_amount8 = document.getElementById("oil_amount8");
    oil_amount9 = document.getElementById("oil_amount9");
    oil_amount10 = document.getElementById("oil_amount10");

    sap_ratio = document.getElementById("sap_ratio_val");
    sap_ratio_global = Number(sap_ratio.value);
    water_ratio = document.getElementById("water_ratio_val");
    water_ratio_global = Number(water_ratio.value);

    fadeOutLoader();
}

// 情報取得
function getInputInfo() {
    const sel1 = document.form.sel1;
    const num1 = sel1.selectedIndex;
    const str1 = sel1.options[num1].value;
    const oil_info1 = window.OilArray[str1];

    const sel2 = document.form.sel2;
    const num2 = sel2.selectedIndex;
    const str2 = sel2.options[num2].value;
    const oil_info2 = window.OilArray[str2];

    const sel3 = document.form.sel3;
    const num3 = sel3.selectedIndex;
    const str3 = sel3.options[num3].value;
    const oil_info3 = window.OilArray[str3];

    const sel4 = document.form.sel4;
    const num4 = sel4.selectedIndex;
    const str4 = sel4.options[num4].value;
    const oil_info4 = window.OilArray[str4];

    const sel5 = document.form.sel5;
    const num5 = sel5.selectedIndex;
    const str5 = sel5.options[num5].value;
    const oil_info5 = window.OilArray[str5];

    const sel6 = document.form.sel6;
    const num6 = sel6.selectedIndex;
    const str6 = sel6.options[num6].value;
    const oil_info6 = window.OilArray[str6];

    const sel7 = document.form.sel7;
    const num7 = sel7.selectedIndex;
    const str7 = sel7.options[num7].value;
    const oil_info7 = window.OilArray[str7];

    const sel8 = document.form.sel8;
    const num8 = sel8.selectedIndex;
    const str8 = sel8.options[num8].value;
    const oil_info8 = window.OilArray[str8];

    const sel9 = document.form.sel9;
    const num9 = sel9.selectedIndex;
    const str9 = sel9.options[num9].value;
    const oil_info9 = window.OilArray[str9];

    const sel10 = document.form.sel10;
    const num10 = sel10.selectedIndex;
    const str10 = sel10.options[num10].value;
    const oil_info10 = window.OilArray[str10];

    return [oil_info1, oil_info2, oil_info3, oil_info4, oil_info5, oil_info6, oil_info7, oil_info8, oil_info9, oil_info10];
}

//アルカリを計算
function calc_alkali() {
    //情報を取得
    const oil_infos = getInputInfo();
    const sap_value1 = oil_infos[0].sap_value_potash;
    const sap_value2 = oil_infos[1].sap_value_potash;
    const sap_value3 = oil_infos[2].sap_value_potash;
    const sap_value4 = oil_infos[3].sap_value_potash;
    const sap_value5 = oil_infos[4].sap_value_potash;
    const sap_value6 = oil_infos[5].sap_value_potash;
    const sap_value7 = oil_infos[6].sap_value_potash;
    const sap_value8 = oil_infos[7].sap_value_potash;
    const sap_value9 = oil_infos[8].sap_value_potash;
    const sap_value10 = oil_infos[9].sap_value_potash;

    const radioNodeList = form.elements['sodaOrPotash'];

    if (radioNodeList.value == "soda") {
        const result = calc_soda(sap_value1, sap_value2, sap_value3, sap_value4, sap_value5, sap_value6, sap_value7, sap_value8, sap_value9, sap_value10);
        return result;
    }
    else {
        const result = calc_potash(sap_value1, sap_value2, sap_value3, sap_value4, sap_value5, sap_value6, sap_value7, sap_value8, sap_value9, sap_value10);
        return result;
    }
}

// 苛性ソーダ(固形せっけん)の場合
function calc_soda(sap_value1, sap_value2, sap_value3, sap_value4, sap_value5, sap_value6, sap_value7, sap_value8, sap_value9, sap_value10) {
    //それぞれのアルカリ計算
    const alkali1 = Math.floor(sap_value1 / 56.1 * 400) / 10000 * Number(oil_amount1.value);
    const alkali2 = Math.floor(sap_value2 / 56.1 * 400) / 10000 * Number(oil_amount2.value);
    const alkali3 = Math.floor(sap_value3 / 56.1 * 400) / 10000 * Number(oil_amount3.value);
    const alkali4 = Math.floor(sap_value4 / 56.1 * 400) / 10000 * Number(oil_amount4.value);
    const alkali5 = Math.floor(sap_value5 / 56.1 * 400) / 10000 * Number(oil_amount5.value);
    const alkali6 = Math.floor(sap_value6 / 56.1 * 400) / 10000 * Number(oil_amount6.value);
    const alkali7 = Math.floor(sap_value7 / 56.1 * 400) / 10000 * Number(oil_amount7.value);
    const alkali8 = Math.floor(sap_value8 / 56.1 * 400) / 10000 * Number(oil_amount8.value);
    const alkali9 = Math.floor(sap_value9 / 56.1 * 400) / 10000 * Number(oil_amount9.value);
    const alkali10 = Math.floor(sap_value10 / 56.1 * 400) / 10000 * Number(oil_amount10.value);

    //ディスカウント計算
    const oil_sum = alkali1 + alkali2 + alkali3 + alkali4 + alkali5 + alkali6 + alkali7 + alkali8 + alkali9 + alkali10;
    const discount = Number(sap_ratio.value) / 100;
    const alkali_ratio_val = document.getElementById("alkali_ratio_val");
    const alkali_ratio = Number(alkali_ratio_val.value) / 100;
    alkali_ratio_global = alkali_ratio;

    alkali_result = Math.round(oil_sum * discount / alkali_ratio * 10) / 10;

    //結果を返す
    return alkali_result;
}

// 苛性カリ(液体せっけん)の場合
function calc_potash(sap_value1, sap_value2, sap_value3, sap_value4, sap_value5, sap_value6, sap_value7, sap_value8, sap_value9, sap_value10) {
    //それぞれのアルカリ計算
    const alkali1 = Math.floor(Number(oil_amount1.value) * (sap_value1 / 1000) * 10) / 10;
    const alkali2 = Math.floor(Number(oil_amount2.value) * (sap_value2 / 1000) * 10) / 10;
    const alkali3 = Math.floor(Number(oil_amount3.value) * (sap_value3 / 1000) * 10) / 10;
    const alkali4 = Math.floor(Number(oil_amount4.value) * (sap_value4 / 1000) * 10) / 10;
    const alkali5 = Math.floor(Number(oil_amount5.value) * (sap_value5 / 1000) * 10) / 10;
    const alkali6 = Math.floor(Number(oil_amount6.value) * (sap_value6 / 1000) * 10) / 10;
    const alkali7 = Math.floor(Number(oil_amount7.value) * (sap_value7 / 1000) * 10) / 10;
    const alkali8 = Math.floor(Number(oil_amount8.value) * (sap_value8 / 1000) * 10) / 10;
    const alkali9 = Math.floor(Number(oil_amount9.value) * (sap_value9 / 1000) * 10) / 10;
    const alkali10 = Math.floor(Number(oil_amount10.value) * (sap_value10 / 1000) * 10) / 10;

    //ディスカウント計算
    const oil_sum = alkali1 + alkali2 + alkali3 + alkali4 + alkali5 + alkali6 + alkali7 + alkali8 + alkali9 + alkali10;
    const discount = Number(sap_ratio.value) / 100;
    const alkali_ratio_val = document.getElementById("alkali_ratio_val");
    const alkali_ratio = Number(alkali_ratio_val.value) / 100;
    alkali_ratio_global = alkali_ratio;

    alkali_result = Math.round(oil_sum * discount / alkali_ratio * 10) / 10;

    //結果を返す
    return alkali_result;
}

//油脂の明細と合計量を計算
function calc_oil() {
    //情報を取得
    const oil_infos = getInputInfo();
    const oil_info1 = oil_infos[0];
    const oil_info2 = oil_infos[1];
    const oil_info3 = oil_infos[2];
    const oil_info4 = oil_infos[3];
    const oil_info5 = oil_infos[4];
    const oil_info6 = oil_infos[5];
    const oil_info7 = oil_infos[6];
    const oil_info8 = oil_infos[7];
    const oil_info9 = oil_infos[8];
    const oil_info10 = oil_infos[9];

    const oil_name1 = oil_info1.name;
    const oil_name2 = oil_info2.name;
    const oil_name3 = oil_info3.name;
    const oil_name4 = oil_info4.name;
    const oil_name5 = oil_info5.name;
    const oil_name6 = oil_info6.name;
    const oil_name7 = oil_info7.name;
    const oil_name8 = oil_info8.name;
    const oil_name9 = oil_info9.name;
    const oil_name10 = oil_info10.name;

    const oil_amount_sum = Number(oil_amount1.value) + Number(oil_amount2.value) + Number(oil_amount3.value) + Number(oil_amount4.value) + Number(oil_amount5.value) + Number(oil_amount6.value) + Number(oil_amount7.value) + Number(oil_amount8.value) + Number(oil_amount9.value) + Number(oil_amount10.value);

    oil_name_infos = [oil_name1, oil_name2, oil_name3, oil_name4, oil_name5, oil_name6, oil_name7, oil_name8, oil_name9, oil_name10, oil_amount_sum];

    //結果を返す
    return oil_name_infos;
}

// アルコールの量を計算
function calc_alcohol(use) {
    if (use == "with") {
        const alcohol_ratio = document.getElementById("alcohol_ratio_val").value;
        alcohol_ratio_global = Number(alcohol_ratio);
        const sum = Number(oil_amount1.value) + Number(oil_amount2.value) + Number(oil_amount3.value) + Number(oil_amount4.value) + Number(oil_amount5.value) + Number(oil_amount6.value) + Number(oil_amount7.value) + Number(oil_amount8.value) + Number(oil_amount9.value) + Number(oil_amount10.value);
        const alcohol_result = Math.round(sum * 0.3 * 10) / 10;
        return Math.round(alcohol_result / (alcohol_ratio / 100) * 10) / 10;
    }
    else return 0;
}

//水の量を計算
function calc_water(type, alkali) {
    if (type == "soda") {
        //情報を取得 
        const sum = Number(oil_amount1.value) + Number(oil_amount2.value) + Number(oil_amount3.value) + Number(oil_amount4.value) + Number(oil_amount5.value) + Number(oil_amount6.value) + Number(oil_amount7.value) + Number(oil_amount8.value) + Number(oil_amount9.value) + Number(oil_amount10.value);
        water_amount_result = Math.round(sum * (Number(water_ratio.value) / 100) * 10) / 10;

        //結果を返す
        return water_amount_result;
    }
    else {
        const alcoholNodeList = form.elements['ifUseAlcohol'];
        if (alcoholNodeList.value == "with") {
            const sum = Number(oil_amount1.value) + Number(oil_amount2.value) + Number(oil_amount3.value) + Number(oil_amount4.value) + Number(oil_amount5.value) + Number(oil_amount6.value) + Number(oil_amount7.value) + Number(oil_amount8.value) + Number(oil_amount9.value) + Number(oil_amount10.value);
            water_amount_result = sum * 0.5;
        }
        else if (alcoholNodeList.value == "without") {
            water_amount_result = (alkali * 3).toFixed(1);
        }

        //結果を返す
        return water_amount_result;
    }
}

//特徴を計算
function get_additional_info() {
    //入力情報を取得
    const oil_infos = getInputInfo();
    const oil_info1 = oil_infos[0];
    const oil_info2 = oil_infos[1];
    const oil_info3 = oil_infos[2];
    const oil_info4 = oil_infos[3];
    const oil_info5 = oil_infos[4];
    const oil_info6 = oil_infos[5];
    const oil_info7 = oil_infos[6];
    const oil_info8 = oil_infos[7];
    const oil_info9 = oil_infos[8];
    const oil_info10 = oil_infos[9];

    const oil_ratio1 = Number(oil_amount1.value) / (Number(oil_amount1.value) + Number(oil_amount2.value) + Number(oil_amount3.value) + Number(oil_amount4.value) + Number(oil_amount5.value) + Number(oil_amount6.value) + Number(oil_amount7.value) + Number(oil_amount8.value) + Number(oil_amount9.value) + Number(oil_amount10.value));
    const oil_ratio2 = Number(oil_amount2.value) / (Number(oil_amount1.value) + Number(oil_amount2.value) + Number(oil_amount3.value) + Number(oil_amount4.value) + Number(oil_amount5.value) + Number(oil_amount6.value) + Number(oil_amount7.value) + Number(oil_amount8.value) + Number(oil_amount9.value) + Number(oil_amount10.value));
    const oil_ratio3 = Number(oil_amount3.value) / (Number(oil_amount1.value) + Number(oil_amount2.value) + Number(oil_amount3.value) + Number(oil_amount4.value) + Number(oil_amount5.value) + Number(oil_amount6.value) + Number(oil_amount7.value) + Number(oil_amount8.value) + Number(oil_amount9.value) + Number(oil_amount10.value));
    const oil_ratio4 = Number(oil_amount4.value) / (Number(oil_amount1.value) + Number(oil_amount2.value) + Number(oil_amount3.value) + Number(oil_amount4.value) + Number(oil_amount5.value) + Number(oil_amount6.value) + Number(oil_amount7.value) + Number(oil_amount8.value) + Number(oil_amount9.value) + Number(oil_amount10.value));
    const oil_ratio5 = Number(oil_amount5.value) / (Number(oil_amount1.value) + Number(oil_amount2.value) + Number(oil_amount3.value) + Number(oil_amount4.value) + Number(oil_amount5.value) + Number(oil_amount6.value) + Number(oil_amount7.value) + Number(oil_amount8.value) + Number(oil_amount9.value) + Number(oil_amount10.value));
    const oil_ratio6 = Number(oil_amount6.value) / (Number(oil_amount1.value) + Number(oil_amount2.value) + Number(oil_amount3.value) + Number(oil_amount4.value) + Number(oil_amount5.value) + Number(oil_amount6.value) + Number(oil_amount7.value) + Number(oil_amount8.value) + Number(oil_amount9.value) + Number(oil_amount10.value));
    const oil_ratio7 = Number(oil_amount7.value) / (Number(oil_amount1.value) + Number(oil_amount2.value) + Number(oil_amount3.value) + Number(oil_amount4.value) + Number(oil_amount5.value) + Number(oil_amount6.value) + Number(oil_amount7.value) + Number(oil_amount8.value) + Number(oil_amount9.value) + Number(oil_amount10.value));
    const oil_ratio8 = Number(oil_amount8.value) / (Number(oil_amount1.value) + Number(oil_amount2.value) + Number(oil_amount3.value) + Number(oil_amount4.value) + Number(oil_amount5.value) + Number(oil_amount6.value) + Number(oil_amount7.value) + Number(oil_amount8.value) + Number(oil_amount9.value) + Number(oil_amount10.value));
    const oil_ratio9 = Number(oil_amount9.value) / (Number(oil_amount1.value) + Number(oil_amount2.value) + Number(oil_amount3.value) + Number(oil_amount4.value) + Number(oil_amount5.value) + Number(oil_amount6.value) + Number(oil_amount7.value) + Number(oil_amount8.value) + Number(oil_amount9.value) + Number(oil_amount10.value));
    const oil_ratio10 = Number(oil_amount10.value) / (Number(oil_amount1.value) + Number(oil_amount2.value) + Number(oil_amount3.value) + Number(oil_amount4.value) + Number(oil_amount5.value) + Number(oil_amount6.value) + Number(oil_amount7.value) + Number(oil_amount8.value) + Number(oil_amount9.value) + Number(oil_amount10.value));

    let skin = Math.round((oil_info1.skin * oil_ratio1 + oil_info2.skin * oil_ratio2 + oil_info3.skin * oil_ratio3 + oil_info4.skin * oil_ratio4 + oil_info5.skin * oil_ratio5 + oil_info6.skin * oil_ratio6 + oil_info7.skin * oil_ratio7 + oil_info8.skin * oil_ratio8 + oil_info9.skin * oil_ratio9 + oil_info10.skin * oil_ratio10) * 10) / 10;
    let clean = Math.round((oil_info1.clean * oil_ratio1 + oil_info2.clean * oil_ratio2 + oil_info3.clean * oil_ratio3 + oil_info4.clean * oil_ratio4 + oil_info5.clean * oil_ratio5 + oil_info6.clean * oil_ratio6 + oil_info7.clean * oil_ratio7 + oil_info8.clean * oil_ratio8 + oil_info9.clean * oil_ratio9 + oil_info10.clean * oil_ratio10) * 10) / 10;
    let foam = Math.round((oil_info1.foam * oil_ratio1 + oil_info2.foam * oil_ratio2 + oil_info3.foam * oil_ratio3 + oil_info4.foam * oil_ratio4 + oil_info5.foam * oil_ratio5 + oil_info6.foam * oil_ratio6 + oil_info7.foam * oil_ratio7 + oil_info8.foam * oil_ratio8 + oil_info9.foam * oil_ratio9 + oil_info10.foam * oil_ratio10) * 10) / 10;
    let hard = Math.round((oil_info1.hard * oil_ratio1 + oil_info2.hard * oil_ratio2 + oil_info3.hard * oil_ratio3 + oil_info4.hard * oil_ratio4 + oil_info5.hard * oil_ratio5 + oil_info6.hard * oil_ratio6 + oil_info7.hard * oil_ratio7 + oil_info8.hard * oil_ratio8 + oil_info9.hard * oil_ratio9 + oil_info10.hard * oil_ratio10) * 10) / 10;
    let collapse = Math.round((oil_info1.collapse * oil_ratio1 + oil_info2.collapse * oil_ratio2 + oil_info3.collapse * oil_ratio3 + oil_info4.collapse * oil_ratio4 + oil_info5.collapse * oil_ratio5 + oil_info6.collapse * oil_ratio6 + oil_info7.collapse * oil_ratio7 + oil_info8.collapse * oil_ratio8 + oil_info9.collapse * oil_ratio9 + oil_info10.collapse * oil_ratio10) * 10) / 10;
    let stability = Math.round((oil_info1.stability * oil_ratio1 + oil_info2.stability * oil_ratio2 + oil_info3.stability * oil_ratio3 + oil_info4.stability * oil_ratio4 + oil_info5.stability * oil_ratio5 + oil_info6.stability * oil_ratio6 + oil_info7.stability * oil_ratio7 + oil_info8.stability * oil_ratio8 + oil_info9.stability * oil_ratio9 + oil_info10.stability * oil_ratio10) * 10) / 10;

    if (Number.isNaN(skin) == true) {
        skin = 0;
        clean = 0;
        foam = 0;
        hard = 0;
        collapse = 0;
        stability = 0;
    }

    return [skin, clean, foam, hard, collapse, stability];
}

// オプションの入力情報取得
function getOptionInputInfo() {
    const option_selects = document.querySelectorAll(".option_selects"); // すべてのオプション選択欄
    const option_amounts = document.querySelectorAll(".option_amounts"); // すべてのオプション量入力欄
    let options = [];

    option_selects.forEach((select, index) => {
        const option_name = select.value;
        const option_amount = Number(option_amounts[index].value) || 0; // 数値変換（未入力は0）

        if (option_name && option_amount > 0) { // 有効なオプションのみ追加
            options.push({ name: option_name, amount: option_amount });
        }
    });

    return options;
}

// オプションで微調整
function get_option_adjustments() {
    const option_infos = getOptionInputInfo(); // オプションの入力情報を取得
    const total_option_amount = option_infos.reduce((sum, option) => sum + Number(option.amount), 0);

    let clean_adjustment = 0;
    let foam_adjustment = 0;
    let hard_adjustment = 0;
    let stability_adjustment = 0;

    option_infos.forEach(option => {
        const option_data = window.OptionArray[option.name];
        if (!option_data) return;

        const ratio = Number(option.amount) / total_option_amount; // オプションの割合
        const factor = Number(option_data.reduction_factor) || 1;

        clean_adjustment += option_data.clean * ratio * factor;
        foam_adjustment += option_data.foam * ratio * factor;
        hard_adjustment += option_data.hard * ratio * factor;
        stability_adjustment += option_data.stability * ratio * factor;
    });

    return [
        Math.round(clean_adjustment) / 10,
        Math.round(foam_adjustment) / 10,
        Math.round(hard_adjustment) / 10,
        Math.round(stability_adjustment) / 10
    ];
}

// オイル＆オプション
function get_final_characteristics() {
    const oil_values = get_additional_info(); // オイルの計算結果
    const option_values = get_option_adjustments(); // オプションの計算結果

    return [
        Math.round(oil_values[0] * 10) / 10,                      // skin
        Math.round((oil_values[1] + option_values[0]) * 10) / 10, // clean
        Math.round((oil_values[2] + option_values[1]) * 10) / 10, // foam
        Math.round((oil_values[3] + option_values[2]) * 10) / 10, // hard
        Math.round(oil_values[4] * 10) / 10,                      // collapse
        Math.round((oil_values[5] + option_values[3]) * 10) / 10  // stability
    ];
}

// 適切な温度・湿度、予想されるpH
const calculateRecipeConditions = (selectedOils) => {
    let totalTemp = 0, totalCureTemp = 0, totalHumidity = 0, totalPHInitial = 0, totalPHFinal = 0;
    let totalWeightTemp = 0, totalWeightHumidity = 0, totalWeightPH = 0;
    let count = selectedOils.length;

    selectedOils.forEach(oilName => {
        let oilData = Object.values(window.OilArray).find(oil => oil.name === oilName);
        let conditionData = window.OilConditions[oilName];

        if (!oilData || !conditionData) return; // データがないオイルはスキップ

        let weightTemp = oilData.hard || 5;
        let weightHumidity = oilData.skin || 5;
        let weightPH = (oilData.foam || 5) * 1.1;

        totalWeightTemp += weightTemp;
        totalWeightHumidity += weightHumidity;
        totalWeightPH += weightPH;

        totalTemp += (conditionData.mix_temp || 50) * weightTemp;
        totalCureTemp += (conditionData.cure_temp || 20) * weightTemp;
        totalHumidity += (Math.min(conditionData.humidity - 5, 50) || 50) * weightHumidity;
        totalPHInitial += (conditionData.initialPH || 11.5) * weightPH;
        totalPHFinal += (conditionData.finalPH || 9.5) * weightPH;
    });

    return {
        optimal_mix_temp: Math.round(totalTemp / totalWeightTemp),
        optimal_cure_temp: Math.round(totalCureTemp / totalWeightTemp),
        optimal_humidity: Math.min(Math.round(totalHumidity / totalWeightHumidity) - 5, 50),
        estimated_pH_initial: (totalPHInitial / totalWeightPH).toFixed(1),
        estimated_pH_final: (totalPHFinal / totalWeightPH).toFixed(1)
    };
};

// 要らないキーのみ削除
function clear_preserveSession() {
    const keysToRemove = [
        "scene",
        "prev_page",
        "id",
        "name",
        "type",
        "sapRatio",
        "alcoholRatio",
        "alkaliRatio",
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

//結果を表示
function calc_result() {
    if (Number(sap_ratio.value) == "") {
        alert("鹸化率を入力して下さい");
        return;
    }

    // せっけんの名前
    const name = document.getElementById("recipe_name").value;

    //　せっけんのタイプ
    const radioNodeList = form.elements['sodaOrPotash'];

    // アルコールを使うかどうか
    const alcoholNodeList = form.elements['ifUseAlcohol'];

    //アルカリ、油脂の合計量、水の量、特徴の結果取得
    const alkali = calc_alkali();
    const oil_amount_info = calc_oil();
    if (Number(oil_amount_info[10]) == 0) {
        alert("オイルを選択してください");
        return;
    }

    const oil_name1 = `・${oil_amount_info[0]} ${Number(oil_amount1.value)}g (${Math.round(Number(oil_amount1.value) / Number(oil_amount_info[10]) * 100)}%)`;
    const oil_name2 = `・${oil_amount_info[1]} ${Number(oil_amount2.value)}g (${Math.round(Number(oil_amount2.value) / Number(oil_amount_info[10]) * 100)}%)`;
    const oil_name3 = `・${oil_amount_info[2]} ${Number(oil_amount3.value)}g (${Math.round(Number(oil_amount3.value) / Number(oil_amount_info[10]) * 100)}%)`;
    const oil_name4 = `・${oil_amount_info[3]} ${Number(oil_amount4.value)}g (${Math.round(Number(oil_amount4.value) / Number(oil_amount_info[10]) * 100)}%)`;
    const oil_name5 = `・${oil_amount_info[4]} ${Number(oil_amount5.value)}g (${Math.round(Number(oil_amount5.value) / Number(oil_amount_info[10]) * 100)}%)`;
    const oil_name6 = `・${oil_amount_info[5]} ${Number(oil_amount6.value)}g (${Math.round(Number(oil_amount6.value) / Number(oil_amount_info[10]) * 100)}%)`;
    const oil_name7 = `・${oil_amount_info[6]} ${Number(oil_amount7.value)}g (${Math.round(Number(oil_amount7.value) / Number(oil_amount_info[10]) * 100)}%)`;
    const oil_name8 = `・${oil_amount_info[7]} ${Number(oil_amount8.value)}g (${Math.round(Number(oil_amount8.value) / Number(oil_amount_info[10]) * 100)}%)`;
    const oil_name9 = `・${oil_amount_info[8]} ${Number(oil_amount9.value)}g (${Math.round(Number(oil_amount9.value) / Number(oil_amount_info[10]) * 100)}%)`;
    const oil_name10 = `・${oil_amount_info[9]} ${Number(oil_amount10.value)}g (${Math.round(Number(oil_amount10.value) / Number(oil_amount_info[10]) * 100)}%)`;
    const oil_amount_sum = oil_amount_info[10];

    const options = getOptionInputInfo();
    const option1 = options[0] ? `・${options[0].name} ${options[0].amount}g` : "";
    const option2 = options[1] ? `・${options[1].name} ${options[1].amount}g` : "";
    const option3 = options[2] ? `・${options[2].name} ${options[2].amount}g` : "";
    const option4 = options[3] ? `・${options[3].name} ${options[3].amount}g` : "";

    let alcohol;
    if (radioNodeList.value == "potash") {
        alcohol = calc_alcohol(alcoholNodeList.value);
    }

    const water_amount = calc_water(radioNodeList.value, alkali);
    const additional_info = get_final_characteristics();
    const skin = "・肌適性: " + additional_info[0];
    const clean = "・洗浄力: " + additional_info[1];
    const foam = "・起泡力: " + additional_info[2];
    const hard = "・硬さ: " + additional_info[3];
    const collapse = "・崩れにくさ: " + additional_info[4];
    const stability = "・安定性: " + additional_info[5];

    let selectedOils = [];
    for (let i = 0; i < 10; i++) {
        if (oil_amount_info[i] != "") selectedOils.push(oil_amount_info[i]);
    }
    const condition = calculateRecipeConditions(selectedOils);
    const mix_temp = `・混合時の推奨温度: ${condition.optimal_mix_temp}℃`;
    const cure_temp = `・熟成時の推奨温度: ${condition.optimal_cure_temp}℃`;
    const cure_humidity = `・熟成時の推奨湿度: ${condition.optimal_humidity}％`;
    const final_ph = `・完成品のpH値予想: ${condition.estimated_pH_final}`;

    const memo = document.getElementById("memo").value;

    // 結果をsessionStorageに保存
    clear_preserveSession();

    sessionStorage.setItem("scene", "result");

    sessionStorage.setItem("name", name);
    sessionStorage.setItem("prev_name", name);

    sessionStorage.setItem("type", radioNodeList.value);

    sessionStorage.setItem("sapRatio", (sap_ratio_global / 100).toString());
    sessionStorage.setItem("waterRatio", (water_ratio_global / 100).toString());
    sessionStorage.setItem("alkaliRatio", alkali_ratio_global.toString());
    sessionStorage.setItem("alcoholRatio", (alcohol_ratio_global / 100).toString());
    const alcoholNode = form.elements['ifUseAlcohol'].value;
    let useAlcohol = true;
    if (alcoholNode === "with") useAlcohol = true;
    else useAlcohol = false;
    sessionStorage.setItem("useAlcohol", useAlcohol);

    const alkali_text = "★アルカリ: " + alkali + "g";
    sessionStorage.setItem("alkali", alkali_text);

    const oil_amount_sum_text = "★油脂の合計量: " + oil_amount_sum + "g";
    sessionStorage.setItem("oilAmountSum", oil_amount_sum_text);

    const oil_names = [oil_name1, oil_name2, oil_name3, oil_name4, oil_name5, oil_name6, oil_name7, oil_name8, oil_name9, oil_name10];
    sessionStorage.setItem("oilNames", JSON.stringify(oil_names));

    const option_names = [option1, option2, option3, option4];
    sessionStorage.setItem("optionNames", JSON.stringify(option_names));

    const alcohol_text = "★アルコールの量: " + alcohol + "g";
    sessionStorage.setItem("alcoholAmount", alcohol_text);

    const water_amount_text = "★水の量: " + water_amount + "g";
    sessionStorage.setItem("waterAmount", water_amount_text);

    const additional_infos = [skin, clean, foam, hard, collapse, stability];
    sessionStorage.setItem("additionalInfos", JSON.stringify(additional_infos));

    const conditions = [mix_temp, cure_temp, cure_humidity, final_ph];
    sessionStorage.setItem("conditions", JSON.stringify(conditions));

    sessionStorage.setItem("memo", memo || "");

    sessionStorage.setItem("img", "");

    showView("result");
}