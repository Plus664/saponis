const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
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

  dc.onopen = () => log("DataChannel open (sender)");
  dc.onmessage = e => log("recv:", e.data);

  pc.onicecandidate = e => {
    if (e.candidate) {
      console.log("ICE(sender):", e.candidate);
    }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // 🔑 必ず localDescription を使う
  window.offerObj = pc.localDescription;

  log("offer ready", window.offerObj);
}

async function startReceiver(offer) {
  if (!offer || !offer.type || !offer.sdp) {
    throw new Error("invalid offer object");
  }

  pc = new RTCPeerConnection(rtcConfig);

  pc.ondatachannel = e => {
    dc = e.channel;
    dc.onopen = () => log("DataChannel open (receiver)");
    dc.onmessage = e => log("recv:", e.data);
  };

  pc.onicecandidate = e => {
    if (e.candidate) {
      console.log("ICE(receiver):", e.candidate);
    }
  };

  // ✅ プレーンオブジェクトとして渡す
  await pc.setRemoteDescription({
    type: offer.type,
    sdp: offer.sdp
  });

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  window.answerObj = pc.localDescription;

  log("answer ready", window.answerObj);
}

async function applyAnswer(answer) {
  if (!answer || !answer.type || !answer.sdp) {
    throw new Error("invalid answer object");
  }

  await pc.setRemoteDescription({
    type: answer.type,
    sdp: answer.sdp
  });

  log("answer applied");
}

function sendHello() {
  dc.send("hello from sender");
}
