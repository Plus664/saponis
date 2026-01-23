let hasScanned = false;
let scanLoopId;
/*
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("read_button");

  btn.addEventListener("click", () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        const video = document.getElementById("video");
        video.style.display = "block";
        const canvas = document.getElementById("canvas");
        const context = canvas.getContext("2d");
        //const resultText = document.getElementById("resultText");

        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        video.play();

        hasScanned = false;
        scanLoopId = requestAnimationFrame(function scanLoop() {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code && !hasScanned) {
              hasScanned = true;
              //resultText.textContent = "読み取った内容：" + code.data;

              try {
                const url = new URL(code.data);
                if (url.pathname.includes("index.html")) {
                  location.href = code.data;
                } else {
                  alert("無効なQRコードです");
                }
              } catch {
                alert("読み取れませんでした");
              }

              return; // 読み取り成功で停止
            }
          }
          scanLoopId = requestAnimationFrame(scanLoop);
        });
      })
      .catch(err => {
        alert("カメラの起動に失敗しました: " + err.message);
      });
  });
});
*/
function initOtherView() { }