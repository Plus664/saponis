// --- [START_NETLIFY_SECRET] ---
// --- [END_NETLIFY_SECRET] ---

function checkPassword() {
  const input = document.getElementById("password-input").value;

  if(input === ACCESS_PASSWORD) {
    document.getElementById("overlay-lock").style.display = "none";
    sessionStorage.setItem("isMemberAuthenticated", "true");
  } else {
    alert("パスワードが違います");
    document.getElementById("password-input").value = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if(sessionStorage.getItem("isMemberAuthenticated") === "true") {
    return;
  }

  createLoginOverlay();
});

function createLoginOverlay() {
  const overlayHTML = `
    <div id="overlay-lock">
      <div id="login-form-box">
        <form onsubmit="checkPassword(); return false;">
          <p>グループ会員限定コンテンツです</p>
          <p>アクセスコードを入力してください</p>
          <input type="password" id="password-input" placeholder="アクセスコード">
          <button type="submit">ログイン</button>
        </form>
      </div>
    </div>

    <style>
      #overlay-lock {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 99999;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      #login-form-box {
        background-color: white;
        padding: 40px;
        border-radius: 10px;
        text-align: center;
        font-size: 22px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      #login-form-box input {
        padding: 10px;
        margin: 15px 0;
        width: 250px;
        display: block;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      #login-form-box button {
        border: none;
        color: white;
        background-color: blue;
        width: 120px;
        padding: 5px 0;
        border-radius: 8px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 6px rgba(148, 170, 255, 0.2);
        cursor: pointer;
      }

      #login-form-box button:hover {
        background-color: rgb(148, 170, 255);
        box-shadow: rgba(148, 170, 255, 0.4);
        transform: translateY(-2px);
      }
      #login-form-box button:active {
        transform: translateY(1px);
        box-shadow: 0 2px 4px rgba(148, 170, 255, 0.3);
        background-color: rgba(120, 140, 230, 1); /* 少し濃いめで押した感 */
      }
    </style>
  `;

  document.body.insertAdjacentHTML("afterbegin", overlayHTML);
}