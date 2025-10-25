let input_form_container, input_form, input_form_button, close_button;
let cover;
let sap_ratio_global = 0;
let alkali_ratio_global = 0;
let alcohol_ratio_global = 0;

const recipes = {
    oil1: {
        category: "さっぱり洗浄",
        description: "泡立ちが良く、しっかり洗浄できる石鹸。脂性肌やスポーツ後の使用におすすめ。",
        oils: [
            { name: "ココナッツ油",     percentage: 40 },
            { name: "パーム核油",       percentage: 30 },
            { name: "グレープシード油", percentage: 20 },
            { name: "ひまし油",         percentage: 10 },
        ],
        options: [
            { name: "竹炭パウダー", percentage: 5 },
            { name: "精油", percentage: 3 },
        ],
        saponification_rate: 0.92,
        alkali_purity: 0.98,
        water_ratio: 0.35,
    },
    oil2: {
        category: "しっとり保湿",
        description: "肌に優しく、しっとりとした仕上がり。乾燥肌や冬の使用に最適。",
        oils: [
            { name: "アボガド油",    percentage: 30 },
            { name: "シアバター",    percentage: 25 },
            { name: "ｽｲｰﾄｱｰﾓﾝﾄﾞｵｲﾙ", percentage: 25 },
            { name: "ココナッツ油",  percentage: 20 },
        ],
        options: [
            { name: "はちみつ", percentage: 10 },
            { name: "ミルクプロテイン", percentage: 5 },
        ],
        saponification_rate: 0.93,
        alkali_purity: 0.97,
        water_ratio: 0.36,
    },
    oil3: {
        category: "もっちり泡立ち",
        description: "泡立ちが豊かでクリーミーな石鹸。マイルドな洗浄力で敏感肌にも◎。",
        oils: [
            { name: "ひまし油",     percentage: 30 },
            { name: "パーム核油",   percentage: 30 },
            { name: "ココナッツ油", percentage: 20 },
            { name: "オリーブ油", percentage: 20 },
        ],
        options: [
            { name: "シルクパウダー", percentage: 3 },
            { name: "精油", percentage: 2 },
        ],
        saponification_rate: 0.91,
        alkali_purity: 0.98,
        water_ratio: 0.34,
    },
    oil4: {
        category: "硬め長持ち",
        description: "硬く溶けにくい石鹸。しっかりしたフォームで長く使える。",
        oils: [
            { name: "牛脂",         percentage: 40 },
            { name: "パーム油",     percentage: 30 },
            { name: "シアバター",   percentage: 20 },
            { name: "オリーブ油", percentage: 10 },
        ],
        options: [
            { name: "クレイ", percentage: 8 },
            { name: "紫雲膏パウダー", percentage: 4 },
        ],
        saponification_rate: 0.94,
        alkali_purity: 0.99,
        water_ratio: 0.33,
    },
    oil5: {
        category: "敏感肌向け",
        description: "低刺激で肌に優しい成分を使用。敏感肌の人や赤ちゃんにもおすすめ。",
        oils: [
            { name: "ｽｲｰﾄｱｰﾓﾝﾄﾞｵｲﾙ", percentage: 30 },
            { name: "ホホバオイル",  percentage: 25 },
            { name: "シアバター",    percentage: 25 },
            { name: "ひまわり油",    percentage: 20 },
        ],
        options: [
            { name: "カレンデュラエキス", percentage: 5 },
            { name: "ローズウォーター", percentage: 7 },
        ],
        saponification_rate: 0.90,
        alkali_purity: 0.97,
        water_ratio: 0.37,
    },
    oil6: {
        category: "和風美容",
        description: "椿油や米ぬか油を配合した美容石鹸。日本古来のスキンケアを取り入れた処方。",
        oils: [
            { name: "椿油",               percentage: 40 },
            { name: "米ぬか油",           percentage: 30 },
            { name: "ホホバオイル",       percentage: 20 },
            { name: "ココナッツ油", percentage: 10 },
        ],
        options: [
            { name: "芳香蒸留水", percentage: 10 },
            { name: "アロエベラ", percentage: 5 },
        ],
        saponification_rate: 0.92,
        alkali_purity: 0.98,
        water_ratio: 0.35,
    },
    oil7: {
        category: "冬向け・超保湿",
        description: "保湿力抜群！乾燥しがちな冬の肌をしっかりケア。",
        oils: [
            { name: "シアバター",   percentage: 30 },
            { name: "ココアバター", percentage: 30 },
            { name: "アボガド油",   percentage: 20 },
            { name: "米ぬか油",     percentage: 20 },
        ],
        options: [
            { name: "はちみつ", percentage: 12 },
            { name: "ミルクプロテイン", percentage: 6 },
        ],
        saponification_rate: 0.93,
        alkali_purity: 0.98,
        water_ratio: 0.36,
    },
    oil8: {
        category: "美容ケア",
        description: "美容成分を豊富に含んだ石鹸。肌のハリ・ツヤUPを目指す人向け。",
        oils: [
            { name: "ローズヒップオイル", percentage: 35 },
            { name: "ホホバオイル",       percentage: 30 },
            { name: "グレープシード油",   percentage: 20 },
            { name: "ココナッツ油",         percentage: 15 },
        ],
        options: [
            { name: "ローズウォーター", percentage: 8 },
            { name: "精油", percentage: 3 },
        ],
        saponification_rate: 0.91,
        alkali_purity: 0.97,
        water_ratio: 0.34,
    },
    oil9: {
        category: "夏向け",
        description: "清涼感のある爽やかな石鹸。暑い季節にぴったり。",
        oils: [
            { name: "ココナッツ油", percentage: 40 },
            { name: "グレープシード油", percentage: 30 },
            { name: "ホホバオイル", percentage: 20 },
            { name: "米ぬか油", percentage: 10 },
        ],
        options: [
            { name: "竹炭パウダー", percentage: 6 },
            { name: "精油", percentage: 4 },
        ],
        saponification_rate: 0.93,
        alkali_purity: 0.98,
        water_ratio: 0.34,
    },
    oil10: {
        category: "酸化しづらい",
        description: "長期間品質を保つ、酸化しにくい石鹸。",
        oils: [
            { name: "ホホバオイル", percentage: 35 },
            { name: "ラード[豚脂]", percentage: 25 },
            { name: "ローズヒップオイル", percentage: 20 },
            { name: "シアバター", percentage: 20 },
        ],
        options: [
            { name: "クレイ", percentage: 7 },
            { name: "精油", percentage: 3 },
        ],
        saponification_rate: 0.92,
        alkali_purity: 0.99,
        water_ratio: 0.33,
    },
    oil11: {
        category: "髪用",
        description: "髪と頭皮に優しい、泡立ちが良いヘア用石鹸。",
        oils: [
            { name: "ひまし油", percentage:25 },
            { name: "パーム核油", percentage: 25 },
            { name: "オリーブ油", percentage: 25 },
            { name: "紅花油", percentage: 25 },
        ],
        options: [
            { name: "シルクパウダー", percentage: 10 },
            { name: "精油", percentage: 5 },
        ],
        saponification_rate: 0.91,
        alkali_purity: 0.97,
        water_ratio: 0.35,
    },
};

const calc_soda = (sap_values, amounts, discount, alkali_rate) => {
    let alkali = 0;
    sap_values.forEach((val, i) => {
        alkali += Math.floor(val / 56.1 * 400) / 10000 * amounts[i];
    });

    let result = Math.round(alkali * discount / alkali_rate * 10) / 10;
    return result;
};

const calc_alkali = (recipe, sap_values, amounts) => {
    const discount = Number(recipe.saponification_rate);
    const alkali_rate = Number(recipe.alkali_purity);

// 固形せっけん固定
    const result = calc_soda(sap_values, amounts, discount, alkali_rate);
    sap_ratio_global = discount;
    alkali_ratio_global = alkali_rate;
    return result;
};

const calc_water = (recipe, total, alkali) => {
    const water = Math.round(total * Number(recipe.water_ratio) * 10) / 10;
    return water;
};

const get_oil_names = (recipe, amounts, total) => {
    let oil_names = [];
    for(let i = 0; i < recipe.oils.length; i++){
        oil_names.push(`・${recipe.oils[i].name} ${amounts[i]}g (${Math.round(amounts[i] / total * 100)}%)`);
    }
    while(oil_names.length < 10){
        oil_names.push("・ 0g (0%)");
    }

    return oil_names;
};

const get_option_names = (recipe) => {
    let option_names = [];
    for(let i = 0; i < recipe.options.length; i++){
        option_names.push(`・${recipe.options[i].name} ${recipe.options[i].percentage}g`);
    }
    while(option_names.length < 4){
        option_names.push("");
    }

    return option_names;
};

const get_features = (recipe) => {
    let skin = 0;
    let clean = 0;
    let foam = 0;
    let hard = 0;
    let collapse = 0;
    let stability = 0;

    for(let i = 0; i < recipe.oils.length; i++){
        const oil_name = recipe.oils[i].name;
        const oil_data = Object.values(window.OilArray).find(oil => oil.name == oil_name);
        if(oil_data) {
            skin      += Number(oil_data.skin)      * (Number(recipe.oils[i].percentage) / 100);
            clean     += Number(oil_data.clean)     * (Number(recipe.oils[i].percentage) / 100);
            foam      += Number(oil_data.foam)      * (Number(recipe.oils[i].percentage) / 100);
            hard      += Number(oil_data.hard)      * (Number(recipe.oils[i].percentage) / 100);
            collapse  += Number(oil_data.collapse)  * (Number(recipe.oils[i].percentage) / 100);
            stability += Number(oil_data.stability) * (Number(recipe.oils[i].percentage) / 100);
        }
    }

    skin      = Math.round(skin * 10) / 10;
    clean     = Math.round(clean * 10) / 10;
    foam      = Math.round(foam * 10) / 10;
    hard      = Math.round(hard * 10) / 10;
    collapse  = Math.round(collapse * 10) / 10;
    stability = Math.round(stability * 10) / 10;

    if(Number.isNaN(skin) == true){
        skin = 0;
        clean = 0;
        foam = 0;
        hard = 0;
        collapse = 0;
        stability = 0;
    }

    const skText = "・肌適性: " + skin;
    const clText = "・洗浄力: " + clean;
    const foText = "・起泡力: " + foam;
    const haText = "・硬さ: " + hard;
    const coText = "・崩れにくさ: " + collapse;
    const stText = "・安定性: " + stability;
    return [skText, clText, foText, haText, coText, stText];
};

const get_option_adjustments = (recipe) => {
    let clean_adjustment = 0;
    let foam_adjustment = 0;
    let hard_adjustment = 0;
    let stability_adjustment = 0;
    let total_option = 0;
    recipe.options.forEach(option => {
        total_option += option.percentage;
    });

    if(recipe.options) {
        for(let i = 0; i < recipe.options.length; i++){
            const option_name = recipe.options[i].name;
            const option_data = window.OptionArray[option_name];

            if (option_data) {
                const percentage = Number(recipe.options[i].percentage) / total_option;
                const factor = Number(option_data.reduction_factor) || 1;

                clean_adjustment += option_data.clean * percentage * factor;
                foam_adjustment += option_data.foam * percentage * factor;
                hard_adjustment += option_data.hard * percentage * factor;
                stability_adjustment += option_data.stability * percentage * factor;
            }
        }
    }

    return [clean_adjustment, foam_adjustment, hard_adjustment, stability_adjustment];
};

const get_final_features = (recipe) => {
    let features = get_features(recipe); // オイルのみの計算結果
    let option_adjustments = get_option_adjustments(recipe); // オプションの影響値

    let skin      = features[0]; // そのまま
    let clean     = "・洗浄力: " + (parseFloat(features[1].split(": ")[1]) + option_adjustments[0]).toFixed(1);
    let foam      = "・起泡力: " + (parseFloat(features[2].split(": ")[1]) + option_adjustments[1]).toFixed(1);
    let hard      = "・硬さ: " + (parseFloat(features[3].split(": ")[1]) + option_adjustments[2]).toFixed(1);
    let collapse  = features[4]; // そのまま
    let stability = "・安定性: " + (parseFloat(features[5].split(": ")[1]) + option_adjustments[3]).toFixed(1);

    return [skin, clean, foam, hard, collapse, stability];
};

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
        "alkaliRatio",
        "alcoholRatio",
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

const calc_result = (recipe, total) => {
    let sap_values = [];
    let amounts = [];
    for(let i = 0; i < recipe.oils.length; i++){
        const oil_name = recipe.oils[i].name;
        const oil_data = Object.values(window.OilArray).find(oil => oil.name == oil_name);

        if(oil_data) {
            sap_values.push(oil_data.sap_value_potash);
        
            const amount = total * (Number(recipe.oils[i].percentage) / 100);
            amounts.push(amount);
        } else {
            alert("エラー: データが見つかりません");
            return;
            window.location.reload();
        }
    }

    const alkali = calc_alkali(recipe, sap_values, amounts); // 固形せっけん
    const water = calc_water(recipe, total, alkali);
    const name = recipe.category;
    const type = "soda";
    const oil_names = get_oil_names(recipe, amounts, total);
    const option_names = get_option_names(recipe);
    const features = get_final_features(recipe);
    let selectedOils = [];
    for(let i = 0; i < recipe.oils.length; i++){
        selectedOils.push(recipe.oils[i].name);
    }
    const condition = calculateRecipeConditions(selectedOils);
    const mix_temp      = `・混合時の推奨温度: ${condition.optimal_mix_temp}℃`;
    const cure_temp     = `・熟成時の推奨温度: ${condition.optimal_cure_temp}℃`;
    const cure_humidity = `・熟成時の推奨湿度: ${condition.optimal_humidity}％`;
    const final_ph      = `・完成品のpH値予想: ${condition.estimated_pH_final}`;
    const conditions = [mix_temp, cure_temp, cure_humidity, final_ph];
    const memo = recipe.description;

    clear_preserveSession();
    sessionStorage.setItem("scene", "result");
    sessionStorage.setItem("prev_page", "result");
    sessionStorage.setItem("name", name.toString());
    sessionStorage.setItem("type", type.toString());
    sessionStorage.setItem("sapRatio", sap_ratio_global.toString());
    sessionStorage.setItem("alkaliRatio", alkali_ratio_global.toString());
    sessionStorage.setItem("alcoholRatio", alcohol_ratio_global.toString());
    sessionStorage.setItem("alkali", "★アルカリ: " + alkali + "g");
    sessionStorage.setItem("oilAmountSum", "★油脂の合計量: " + total + "g");
    sessionStorage.setItem("oilNames", JSON.stringify(oil_names));
    sessionStorage.setItem("optionNames", option_names.toString());
    sessionStorage.setItem("waterAmount", "★水の量: " + water + "g");
    sessionStorage.setItem("additionalInfos", features.toString());
    sessionStorage.setItem("conditions", conditions.toString());
    sessionStorage.setItem("memo", memo.toString());
    sessionStorage.setItem("img", "");

    location.href = "../html/result.html";
};

const display_recipes = () => {
    const recipe_container = document.getElementById("recipe-container");

    Object.values(recipes).forEach((recipe) => {
        const button = document.createElement("input");
        button.type = "button";
        button.value = recipe.category;
        button.classList.add("button");
        button.addEventListener("click", () => {
            cover.style.display = "block";
            input_form_container.style.display = "block";

            input_form_button.addEventListener("click", () => {
                const total = Number(input_form.value) || 500;
                calc_result(recipe, total);
            });
        });

        recipe_container.appendChild(button);
    });
};

window.onload = () => {
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
    input_form_container = document.getElementById("input_form-container");
    input_form_container.style.display = "none";
    close_button = document.getElementById("close_button");
    close_button.addEventListener("click", () => {
    cover.style.display = "none";
        input_form_container.style.display = "none";
    });
    input_form = document.getElementById("input_form");
    input_form_button = document.getElementById("input_form_button");
    cover = document.getElementById("cover");
    cover.style.display = "none";
    cover.addEventListener("click", () => {
        cover.style.display = "none";
        input_form_container.style.display = "none";
    });

    display_recipes();

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

$(function() {
    $('.hamburger').click(function() {
        $('.menu').toggleClass('open');

        $(this).toggleClass('active');
    });
});