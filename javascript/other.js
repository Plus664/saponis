const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com.19302" }
  ]
};

let pc;
let dc;

function log(...args) {
  console.log("[P2P]", ...args);
}

async function startSender() {
  pc = new RTCPeerConnection(rtcConfig);

  dc = pc.createDataChannel("data");
  dc.onopen = () => log("DataChannel open");
  dc.onmessage = e => log("recv:", e.data);

  pc.onicecandidate = e => {
    if (e.candidate) {
      console.log("ICE:", JSON.stringify(e.candidate));
    }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  console.log("OFFER:", JSON.stringify(offer));
}

async function startReceiver(offerJson) {
  pc = new RTCPeerConnection(rtcConfig);

  pc.ondatachannel = e => {
    dc = e.channel;
    dc.onopen = () => log("DataChannel open");
    dc.onmessage = e => log("recv:", e.data);
  };

  pc.onicecandidate = e => {
    if (e.candidate) {
      console.log("ICE:", JSON.stringify(e.candidate));
    }
  };

  const offer = JSON.strin(offerJson);
  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  console.log("ANSWER:", JSON.stringify(answer));
}

async function applyAnswer(answerJson) {
  const answer = JSON.parse(answerJson);
  await pc.setRemoteDescription(answer);
}

function sendHello() {
  const code = Math.floor(1000 + Math.random() * 9000);
  dc.send(JSON.stringify({
    type: "hello",
    code
  }));
  log("sent code:", code);
}
