const signalingServer = new WebSocket("ws://localhost:8080/ws");

const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});


let dataChannel;

signalingServer.addEventListener("message", async (message) => {
    console.log("Received signaling message:", message.data);
    const data = JSON.parse(message.data);

    if (data.type === "offer") {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.payload)));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        signalingServer.send(JSON.stringify({ type: "answer", payload: JSON.stringify(answer) }));
    } else if (data.type === "answer") {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.payload)));
    } else if (data.type === "candidate") {
        await peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(data.payload)));
    }
});

peerConnection.addEventListener("icecandidate", (event) => {
    if (event.candidate) {
        signalingServer.send(JSON.stringify({ type: "candidate", payload: JSON.stringify(event.candidate) }));
    }
});



peerConnection.addEventListener("datachannel", (event) => {
    dataChannel = event.channel;
    dataChannel.addEventListener("message", (msg) => {
        console.log("Received message:", msg.data);
        document.querySelector("#chat").innerHTML += `<p>Peer: ${msg.data}</p>`;
    });
    dataChannel.addEventListener("open", () => console.log("Data channel opened"));
    dataChannel.addEventListener("close", () => console.log("Data channel closed"));
});


async function setupWebRTC() {
    dataChannel = peerConnection.createDataChannel("chat");
    dataChannel.addEventListener("message", (msg) => {
        document.querySelector("#chat").innerHTML += `<p>Peer: ${msg.data}</p>`;
    });
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    signalingServer.send(JSON.stringify({ type: "offer", payload: JSON.stringify(offer) }));
}


signalingServer.addEventListener("open", setupWebRTC);



document.querySelector("#send").addEventListener("click", () => {
    const message = document.querySelector("#message").value;
    if (dataChannel && dataChannel.readyState === "open") {
        dataChannel.send(message);
        document.querySelector("#chat").innerHTML += `<p>You: ${message}</p>`;
    } else {
        console.log("Data channel is not open");
    }
});