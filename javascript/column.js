const glossaryData = {
    "glycerin": {
        title: "グリセリン",
        content: "グリセリン（Glycerin）は、せっけんの製造過程で生まれる副産物で、保湿性に優れています。化学式はC₃H₈O₃で、三価アルコールです。\n↓化学式",
        img: "../assets/glossary/glycerol_structure.png",
    },
    "fatty-acid": {
        title: "脂肪酸",
        content: "脂肪酸は長い炭素鎖を持つ有機酸で、油脂を構成する基本成分。せっけんの原料として重要で、ラウリン酸やオレイン酸などがあります。\n↓化学式",
        img: "../assets/glossary/fatty_acids_structure.png",
    },
    "1-dodecanol": {
        title: "1-ドデカノール",
        content: "1-ドデカノールは、炭素数12の直鎖飽和高級アルコール（化学式 C₁₂H₂₆O）で、別名ラウリルアルコールとも呼ばれます。合成洗剤の原料として用いられ、スルホン化することで界面活性剤の基になる化合物です。\n↓化学式",
        img: "../assets/glossary/1-dodecanol_structure.png",
    },
    "alkylbenzene": {
        title: "アルキルベンゼン",
        content: "アルキルベンゼンは、ベンゼン環にアルキル基（直鎖または分岐鎖）が結合した化合物群の総称で、洗剤用には直鎖アルキルベンゼン（LAB）が好まれます。スルホン化してLAS（リニアアルキルベンゼンスルホン酸塩）を合成する原料になります。\n↓化学式",
        img: "../assets/glossary/alkylbenzene.png",
    },
    "surfactant": {
        title: "界面活性剤",
        content: "界面活性剤（Surfactant）は、水と油のように本来混ざり合わない物質の境界（界面）で、両者をなじませる働きをする化合物。\n親水基（水に溶けやすい部分）と疎水基（油に溶けやすい部分）の両方を持っているのが特徴です。\n↓界面活性剤のイメージ図(水色の部分が親水基、灰色の部分が疎水基)",
        img: "../assets/glossary/surfactant.png",
    },
    "micelle": {
        title: "ミセル",
        content: "ミセル（Micelle）は、せっけんなどの界面活性剤が水中でつくる球状の集合体。\n疎水基（油になじむ部分）は内側に、親水基（水になじむ部分）は外側に向く構造になっていて、油汚れを包み込んで水に溶かすことで洗浄します。\n↓ミセルのイメージ図",
        img: "../assets/glossary/micelle.png",
    },
};

onload = function(){
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

    document.querySelectorAll(".glossary").forEach(el => {
        el.addEventListener("click", () => {
            const term = el.dataset.term;
            const data = glossaryData[term];
            if (data) {
                document.getElementById("glossary-title").textContent = data.title;
                document.getElementById("glossary-content").innerHTML = data.content.replace(/\n/g, "<br>");;
                document.getElementById("glossary-img").src = data.img;
                document.getElementById("glossary-modal").style.display = "block";
                document.getElementById("glossary-overlay").style.display = "block";
            }
        });
    });

    document.getElementById("glossary-close").addEventListener("click", () => {
        document.getElementById("glossary-modal").style.display = "none";
        document.getElementById("glossary-overlay").style.display = "none";
    });

    document.getElementById("glossary-overlay").addEventListener("click", () => {
        document.getElementById("glossary-modal").style.display = "none";
        document.getElementById("glossary-overlay").style.display = "none";
    });

    document.querySelectorAll(".accordion-header").forEach(header => {
        header.addEventListener("click", () => {
            const parent = header.parentElement;
            parent.classList.toggle("open");
        });
    });

    fadeOutLoader();
}

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