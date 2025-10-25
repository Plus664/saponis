let count = 0;
let add_button, remove_button;
let sap_ratio_global = 0;
let alkali_ratio_global = 0;
let alcohol_ratio_global = 0;

const oilRecommendations = {
    "特長を選択": ["オイル1", "オイル2", "オイル3"],
    "洗浄力高め": ["ココナッツ油", "パーム核油", "牛脂"],
    "泡立ち豊か": ["ひまし油", "パーム核油", "ココナッツ油"],
    "保湿力高め": ["アボガド油", "シアバター", "ホホバオイル"],
    "硬め": ["牛脂", "パーム油", "ココアバター"],
    "低刺激": ["ホホバオイル", "アボガド油", "ライスブランオイル"],
    "酸化しづらい": ["ホホバオイル", "ラード[豚脂]", "ココナッツ油"],
    "和風美容": ["椿油", "米ぬか油", "ホホバオイル"],
    "マイルドな洗浄力": ["オリーブ油", "ごま油", "アボガド油"],
    "さっぱりした洗いあがり": ["グレープシード油", "ひまわり油", "米ぬか油"],
    "べたつかない": ["ホホバオイル", "ライスブランオイル", "グレープシード油"],
    "リラックス": ["ｽｲｰﾄｱｰﾓﾝﾄﾞｵｲﾙ", "アボガド油", "米ぬか油"],
    "リフレッシュ": ["グレープシード油", "ココナッツ油", "ひまわり油"],
    "フローラル": ["ホホバオイル", "ｽｲｰﾄｱｰﾓﾝﾄﾞｵｲﾙ", "椿油"],
    "敏感肌向け": ["ホホバオイル", "オリーブ油", "シアバター"],
    "ニキビ肌向け": ["ひまわり油", "ホホバオイル", "グレープシード油"],
    "乾燥肌向け": ["シアバター", "アボガド油", "オリーブ油"],
    "エイジングケア": ["ローズヒップオイル", "小麦胚芽油", "マカデミアナッツ油"],
    "色鮮やか": ["ホホバオイル", "ココナッツ油", "ライスブランオイル"],
    "クリーミーな泡": ["ココナッツ油", "パーム油", "ひまし油"],
    "デトックス": ["グレープシード油", "竹炭", "ココナッツ油"],
    "清涼感": ["ココナッツ油", "グレープシード油", "パーム核油"]
};

const optionSuggestions = {
    "洗浄力高め": [
        { name: "クレイ", amount: 5, purpose: "洗浄力UP" },
        { name: "竹炭パウダー", amount: 3, purpose: "皮脂吸着" },
        { name: "ミルクプロテイン", amount: 20, purpose: "泡立ち改善＋肌に優しい洗浄" }
    ],
    "泡立ち豊か": [
        { name: "シルクパウダー", amount: 10, purpose: "泡持ちUP" },
        { name: "はちみつ", amount: 5, purpose: "泡のクリーミーさUP" },
        { name: "ヤギミルク", amount: 30, purpose: "泡立ちUP＋保湿" }
    ],
    "保湿力高め": [
        { name: "シルクパウダー", amount: 3, purpose: "肌の滑らかさUP" },
        { name: "ヤギミルク", amount: 10, purpose: "保湿力UP＋しっとり感" },
        { name: "ローズウォーター", amount: 15, purpose: "肌の柔らかさUP＋保湿" }
    ],
    "硬め": [
        { name: "クレイ", amount: 10, purpose: "石鹸の硬さUP" },
        { name: "竹炭パウダー", amount: 5, purpose: "硬さ＋吸着力UP" },
        { name: "紫雲膏パウダー", amount: 8, purpose: "保湿＋硬さUP" }
    ],
    "低刺激": [
        { name: "アロエベラ", amount: 10, purpose: "肌荒れ防止＋保湿" },
        { name: "カレンデュラエキス", amount: 5, purpose: "肌の鎮静化＋抗炎症" },
        { name: "芳香蒸留水", amount: 7, purpose: "肌を落ち着かせる＋抗酸化" }
    ],
    "酸化しづらい": [
        { name: "ビタミンE", amount: 2, purpose: "酸化防止" },
        { name: "ローズウォーター", amount: 3, purpose: "抗酸化作用＋保湿" },
        { name: "竹炭パウダー", amount: 10, purpose: "酸化しづらい＋肌浄化" }
    ],
    "和風美容": [
        { name: "シルクパウダー", amount: 5, purpose: "肌の滑らかさUP" },
        { name: "カレンデュラエキス", amount: 3, purpose: "抗酸化作用＋肌の鎮静化" },
        { name: "ローズウォーター", amount: 8, purpose: "美白＋保湿" }
    ],
    "マイルドな洗浄力": [
        { name: "ミルクプロテイン", amount: 20, purpose: "肌に優しい洗浄" },
        { name: "はちみつ", amount: 5, purpose: "保湿＋抗菌" },
        { name: "ヤギミルク", amount: 15, purpose: "肌を柔らかくする＋保湿" }
    ],
    "さっぱりした洗いあがり": [
        { name: "竹炭パウダー", amount: 3, purpose: "皮脂吸着" },
        { name: "アロエベラ", amount: 5, purpose: "肌の引き締め＋保湿" },
        { name: "ローズウォーター", amount: 2, purpose: "清涼感UP＋抗酸化" }
    ],
    "べたつかない": [
        { name: "シルクパウダー", amount: 5, purpose: "肌さらさら効果" },
        { name: "ミルクプロテイン", amount: 3, purpose: "肌の滑らかさUP＋軽い保湿" },
        { name: "芳香蒸留水", amount: 5, purpose: "軽い保湿＋べたつき防止" }
    ],
    "リラックス": [
        { name: "ラベンダー精油", amount: 20, purpose: "安眠効果" },
        { name: "カモミール精油", amount: 15, purpose: "鎮静効果" },
        { name: "サンダルウッド精油", amount: 10, purpose: "心を落ち着かせる" }
    ],
    "リフレッシュ": [
        { name: "ペパーミント精油", amount: 15, purpose: "清涼感UP" },
        { name: "レモン精油", amount: 10, purpose: "気分をリフレッシュ" },
        { name: "ティーツリー精油", amount: 8, purpose: "爽快感＋抗菌" }
    ],
    "フローラル": [
        { name: "ローズ精油", amount: 20, purpose: "華やかな香り" },
        { name: "ゼラニウム精油", amount: 15, purpose: "バランスを整える" },
        { name: "ジャスミン精油", amount: 10, purpose: "優雅な香り" }
    ],
    "敏感肌向け": [
        { name: "カレンデュラエキス", amount: 5, purpose: "肌の鎮静化＋抗炎症" },
        { name: "アロエベラ", amount: 10, purpose: "肌荒れ防止＋保湿" },
        { name: "カモミール精油", amount: 3, purpose: "鎮静作用" }
    ],
    "ニキビ肌向け": [
        { name: "ティーツリー精油", amount: 10, purpose: "抗菌作用" },
        { name: "竹炭パウダー", amount: 5, purpose: "皮脂吸着＋毛穴洗浄" },
        { name: "シーソルト", amount: 5, purpose: "殺菌＋角質ケア" }
    ],
    "乾燥肌向け": [
        { name: "はちみつ", amount: 10, purpose: "保湿力UP＋抗菌" },
        { name: "ヤギミルク", amount: 20, purpose: "高保湿＋しっとり感" },
        { name: "シアバター", amount: 5, purpose: "高い保湿力＋肌保護" }
    ],
    "エイジングケア": [
        { name: "ビタミンE", amount: 2, purpose: "抗酸化作用" },
        { name: "ローズヒップオイル", amount: 5, purpose: "肌の再生促進" },
        { name: "アルガンオイル", amount: 10, purpose: "エイジングケア＋保湿" }
    ],
    "色鮮やか": [
        { name: "ピンククレイ", amount: 5, purpose: "ピンク色付け" },
        { name: "スピルリナパウダー", amount: 3, purpose: "緑色付け" },
        { name: "紅花パウダー", amount: 5, purpose: "オレンジ色付け" }
    ],
    "クリーミーな泡": [
        { name: "ヤギミルク", amount: 20, purpose: "泡立ちUP＋保湿" },
        { name: "はちみつ", amount: 5, purpose: "泡のクリーミーさUP" },
        { name: "ミルクプロテイン", amount: 15, purpose: "きめ細かい泡＋肌に優しい" }
    ],
    "デトックス": [
        { name: "竹炭パウダー", amount: 10, purpose: "皮脂・毛穴汚れ吸着" },
        { name: "ベントナイトクレイ", amount: 8, purpose: "強い吸着力＋ミネラル補給" },
        { name: "ティーツリー精油", amount: 5, purpose: "抗菌作用" }
    ],
    "清涼感": [
        { name: "ハッカ油", amount: 5, purpose: "清涼感＋抗菌" },
        { name: "ペパーミント精油", amount: 3, purpose: "爽快感UP" },
        { name: "アロエベラ", amount: 5, purpose: "肌の引き締め＋保湿" }
    ]
};


const ratioArray = {
    1: [1.0],
    2: [0.6, 0.4],
    3: [0.5, 0.3, 0.2],
    4: [0.4, 0.3, 0.2, 0.1],
    5: [0.35, 0.25, 0.2, 0.15, 0.05]
};

const calc_soda = (oils, total, ratios, discount, alkali_rate) => {
    let alkali = 0;

    oils.forEach((oil, i) => {
        let sap_value = Object.values(window.OilArray).find(oil => oil.name == oils[i]).sap_value_potash;
        const amount = ratios[i] * total;
        alkali += Math.floor(sap_value / 56.1 * 400) / 10000 * amount;
    });

    const result = Math.round(alkali * discount / alkali_rate * 10) / 10;
    return result;
};

const calc_alkali = (oils, total, ratios) => {
    let discount = Number(document.getElementById("sap_ratio_val").value);
    if(!discount || discount <= 0) {
        alert("鹸化率を正しく入力して下さい");
        return;
    } else {
        discount *= 0.01;
    }
    let alkali_rate = Number(document.getElementById("alkali_ratio_val").value);
    if(!alkali_rate || alkali_rate <= 0) {
        alert("アルカリの純度を正しく入力して下さい");
        return;
    } else {
        alkali_rate *= 0.01;
    }

    // 固形せっけん固定
    const alkali = calc_soda(oils, total, ratios, discount, alkali_rate);
    sap_ratio_global = discount;
    alkali_ratio_global = alkali_rate;

    return alkali;
};

const calc_water = (total, alkali) => {
    const water_ratio = document.getElementById("water_ratio_val");
    if(!water_ratio || water_ratio <= 0) {
        alert("水の割合を正しく入力して下さい");
        return;
    } else {
        return Math.round(total * Number(water_ratio.value) * 0.01 * 10) / 10;
    }
};

const get_oil_names = (oils, total, ratios) => {
    let oil_names = [];
    for(let i = 0; i < oils.length; i++){
        //oil_names.push(`・${oils[i]} ${Math.round(total * ratios[i])}g (${Math.round(ratios[i] * 100)}%)`);
        oil_names.push(`・${oils[i]}`);
    }
    while(oil_names.length < 10){
        oil_names.push("・ 0g (0%)");
        //oil_names.push("・");
    }

    return oil_names;
};

const get_option_names = (options) => {
    let option_names = [];
    if(options.length > 0) {
        for(let i = 0; i < options.length; i++){
            option_names.push(`・${options[i].name} ${options[i].amount}g`);
        }
        while(option_names.length < 4) {
            option_names.push("");
        }
    } else {
        while(option_names.length < 4) {
            option_names.push("");
        }
    }

    return option_names;
};

const get_features = (oils, total, ratios) => {
    let skin = 0;
    let clean = 0;
    let foam = 0;
    let hard = 0;
    let collapse = 0;
    let stability = 0;

    for(let i = 0; i < oils.length; i++){
        const oil_name = oils[i];
        const oil_data = Object.values(window.OilArray).find(oil => oil.name == oil_name);
        if(oil_data) {
            skin      += Number(oil_data.skin)      * (Number(ratios[i]));
            clean     += Number(oil_data.clean)     * (Number(ratios[i]));
            foam      += Number(oil_data.foam)      * (Number(ratios[i]));
            hard      += Number(oil_data.hard)      * (Number(ratios[i]));
            collapse  += Number(oil_data.collapse)  * (Number(ratios[i]));
            stability += Number(oil_data.stability) * (Number(ratios[i]));
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

const get_option_adjustments = (options) => {
    if(options.length == 0) return [0, 0, 0, 0];
    else {
        let clean_adjustment = 0;
        let foam_adjustment = 0;
        let hard_adjustment = 0;
        let stability_adjustment = 0;
        let total_option = 0;
        options.forEach(option => {
            total_option += option.amount
        });

        if(options) {
            for(let i = 0; i < options.length; i++){
                const option_name = options[i].name;
                const option_data = window.OptionArray[option_name];

                if (option_data) {
                    const percentage = Number(options[i].amount) / total_option;
                    const factor = Number(option_data.reduction_factor) || 1;

                    clean_adjustment += option_data.clean * percentage * factor;
                    foam_adjustment += option_data.foam * percentage * factor;
                    hard_adjustment += option_data.hard * percentage * factor;
                    stability_adjustment += option_data.stability * percentage * factor;
                }
            }
        }

        return [clean_adjustment, foam_adjustment, hard_adjustment, stability_adjustment];
    }
};

const get_final_features = (oils, total, ratios, options) => {
    let features = get_features(oils, total, ratios);
    let option_adjustments = get_option_adjustments(options);

    let skin      = features[0]; // そのまま
    let clean     = "・洗浄力: " + (parseFloat(features[1].split(": ")[1]) + option_adjustments[0]).toFixed(1);
    let foam      = "・起泡力: " + (parseFloat(features[2].split(": ")[1]) + option_adjustments[1]).toFixed(1);
    let hard      = "・硬さ: " + (parseFloat(features[3].split(": ")[1]) + option_adjustments[2]).toFixed(1);
    let collapse  = features[4]; // そのまま
    let stability = "・安定性: " + (parseFloat(features[5].split(": ")[1]) + option_adjustments[3]).toFixed(1);

    return [skin, clean, foam, hard, collapse, stability];
};

const calculateRecipeConditions = (oils) => {
    let totalTemp = 0, totalCureTemp = 0, totalHumidity = 0, totalPHInitial = 0, totalPHFinal = 0;
    let totalWeightTemp = 0, totalWeightHumidity = 0, totalWeightPH = 0;

    oils.forEach(oilName => {
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

const calc_result = () => {
    let oils = [];
    count = 0;

    for(let i = 0; i < 5; i++){
        const select = document.getElementById(`select${i+1}`);
        if(select.value !== "特長を選択") {
            const radios = document.getElementsByName(`feature${i+1}_oils`);
            for(let radio of radios) {
                if(radio.checked) {
                    oils.push(radio.value);
                    count++;
                }
            }
        }
    }
    if(count == 0) {
        alert("オイルを選択してください");
        return;
    }
    let options = [];
    const checkboxes = document.getElementById("options-container").getElementsByTagName("input");
    if(checkboxes.length > 0) {
        for(let i = 0; i < checkboxes.length; i++){
            if(checkboxes[i].type == "checkbox" && checkboxes[i].checked) {
                options.push({
                    name: checkboxes[i].value,
                    amount: parseFloat(checkboxes[i].getAttribute("amount")),
                    purpose: checkboxes[i].getAttribute("purpose")
                });
            }
        }
    }
    const total = Number(document.getElementById("oil_sum_val").value);
    if(!total || total <= 0) {
        alert("油脂の合計量を正しく入力して下さい");
        return;
    }
    const ratios = ratioArray[count];

    const name = document.getElementById("recipe_name").value;
    const alkali = calc_alkali(oils, total, ratios);
    const water = calc_water(total, alkali);
    const type = "soda";
    const oil_names = get_oil_names(oils, total, ratios);
    const option_names = get_option_names(options);
    const features = get_final_features(oils, total, ratios, options);
    const condition = calculateRecipeConditions(oils);
    const mix_temp      = `・混合時の推奨温度: ${condition.optimal_mix_temp}℃`;
    const cure_temp     = `・熟成時の推奨温度: ${condition.optimal_cure_temp}℃`;
    const cure_humidity = `・熟成時の推奨湿度: ${condition.optimal_humidity}％`;
    const final_ph      = `・完成品のpH値予想: ${condition.estimated_pH_final}`;
    const conditions = [mix_temp, cure_temp, cure_humidity, final_ph];
    const memo = document.getElementById("memo").value;
    
    sessionStorage.setItem("scene", "result");
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

const suggestOptions = (features) => {
    let recommendedOptionsMap = new Map();

    // option.nameをキーとしてMapに保存
    features.forEach(feature => {
        if(optionSuggestions[feature]) {
            optionSuggestions[feature].forEach(option => {
                if(!recommendedOptionsMap.has(option.name)) {
                    recommendedOptionsMap.set(option.name, option);
                }
            });
        }
    });

    let recommendedOptions = Array.from(recommendedOptionsMap.values());

    let shuffled = Array.from(recommendedOptions).sort(() => Math.random() - 0.5);

    return shuffled.slice(0, 3);
};

const display_options = () => {
    let features = [];
    for(let i = 0; i < 5; i++){
        const select = document.getElementById(`select${i+1}`);
        if(select.value !== "特長を選択") {
            features.push(select.value);
        }
    }

    const suggested = suggestOptions(features);

    const options_container = document.getElementById("options-container");
    options_container.innerHTML = "";
    suggested.forEach(option => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = option.name;
        checkbox.name = "options";
        checkbox.setAttribute("amount", option.amount);
        checkbox.setAttribute("purpose", option.purpose);
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(`${option.name} ${option.amount}g (${option.purpose})`));
        options_container.appendChild(label);
    });
};

const handleEvent = (idx) => {
    const select = document.getElementById(`select${idx}`);
    const feature = select.value;
    const oils = oilRecommendations[feature] || ["オイル1", "オイル2", "オイル3"];

    for (let i = 1; i <= 3; i++) {
        const radio = document.getElementById(`feature${idx}_${i}`);
        const labelSpan = document.getElementById(`feature${idx}_label${i}`);

        if (radio && labelSpan) {
            radio.disabled = oils[i - 1] == `オイル${i}` ? true : false;
            radio.checked = false;
            radio.value = oils[i - 1];
            labelSpan.textContent = oils[i - 1];
        }
    }
};

const refillRadio = (idx) => {
    const selected = sessionStorage.getItem(`original_feature${idx}_selected`);
    if(selected) {
        const target = document.querySelector(
            `input[type="radio"][name="feature${idx}_oils"][value="${selected}"]`
        );
        if(target) {
            target.checked = true;
        }
    }
};

const initPage = () => {
    for (let i = 1; i <= 5; i++) {
        const select = document.getElementById(`select${i}`);
        if (select) {
            const value = select.value;
            const isDisabled = (value === "特長を選択");

            // "特徴を選択"の場合は全部disabled＆ラジオボタン保存
            for (let j = 1; j <= 3; j++) {
                const radio = document.getElementById(`feature${i}_${j}`);
                if (radio) {
                    radio.disabled = isDisabled;

                    radio.addEventListener("change", () => {
                        if(radio.checked) {
                            sessionStorage.setItem(`original_feature${i}_selected`, radio.value);
                        }
                    });
                }
            }
            // その他の場合
            if (!isDisabled) {
                handleEvent(i);
                refillRadio(i);
            }

            // 値が変わった時
            select.addEventListener("change", () => {
                handleEvent(i);
            });
        }
    }
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

window.addEventListener("pageshow", () => {
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
    initPage();

    fadeOutLoader();
});

$(function() {
    $('.hamburger').click(function() {
        $('.menu').toggleClass('open');

        $(this).toggleClass('active');
    });
});