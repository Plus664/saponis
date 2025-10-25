/*let hasScanned = false;

function startScan() {
  const qrScanner = new Html5Qrcode("reader");
  qrScanner.start(
    { facingMode: "environment" },
    {
      fps: 5,
      qrbox: 300
    },
    (decodedText) => {
      try {
        if(hasScanned) return;
        hasScanned = true;

        const url = newURL(decodedText);
        if(url.pathname.includes("result.html")) {
          location.href = decodedText;
        } else {
          alert("無効なQRコードです");
        }
      } catch {
        alert("読み取れませんでした");
      }

      setTimeout(() => {
        qrScanner.stop();
      }, 1000);
    },

  );
}
*/

let hasScanned = false;
let scanLoopId;

//document.getElementById("read_button").addEventListener("click", () => {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      const video = document.getElementById("video");
      const canvas = document.getElementById("canvas");
      const context = canvas.getContext("2d");
      const resultText = document.getElementById("resultText");

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
            resultText.textContent = "読み取った内容：" + code.data;

            try {
              const url = new URL(code.data);
              if (url.pathname.includes("result.html")) {
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
//});

$(function() {
    $('.hamburger').click(function() {
        $('.menu').toggleClass('open');

        $(this).toggleClass('active');
    });
});