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
  dc.onopen = () => log("DataChannel open");
  dc.onmessage = e => log("recv:", e.data);

  pc.onicecandidate = e => {
    if (e.candidate) {
      console.log("ICE:", JSON.stringify(e.candidate));
    }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // ★ここが重要
  window.offerObj = {
    type: offer.type,
    sdp: offer.sdp
  };

  console.log("OFFER:", window.offerObj);
}

async function startReceiver(offerObj) {
  if (!offerObj?.type || !offerObj?.sdp) {
    throw new Error("invalid offer object");
  }

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

  await pc.setRemoteDescription({
    type: offerObj.type,
    sdp: offerObj.sdp
  });

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  window.answerObj = {
    type: answer.type,
    sdp: answer.sdp
  };

  console.log("ANSWER:", window.answerObj);
}

async function applyAnswer(answerObj) {
  await pc.setRemoteDescription({
    type: answerObj.type,
    sdp: answerObj.sdp
  });

  log("answer applied");
}

function sendHello() {
  dc.send("hello from sender");
}
