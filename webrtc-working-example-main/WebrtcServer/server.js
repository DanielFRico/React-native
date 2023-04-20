const WebSocket = require('ws');
const wrtc = require('wrtc');
const fs = require('fs');
const sharp = require('sharp');

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', (socket) => {
  console.log('Client connected');

  const peerConnection = new wrtc.RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.send(JSON.stringify({ candidate: event.candidate }));
    }
  };

  peerConnection.onnegotiationneeded = async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.send(JSON.stringify({ description: peerConnection.localDescription }));
  };

  socket.on('message', async (message) => {
    const { candidate, description } = JSON.parse(message);

    if (candidate) {
      await peerConnection.addIceCandidate(new wrtc.RTCIceCandidate(candidate));
    } else if (description) {
      await peerConnection.setRemoteDescription(new wrtc.RTCSessionDescription(description));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.send(JSON.stringify({ description: peerConnection.localDescription }));
    }
  });

  // const images = ['sample-video-frames/ezgif-frame-001.jpg'];
  const images = [];
for (let i = 1; i <= 60; i++) {
  const imageIndex = String(i).padStart(3, '0');
  images.push(`sample-video-frames/ezgif-frame-${imageIndex}.jpg`);
}
  let currentImageIndex = 0;


  let totalLatency = 0;
  let imageCounter = 0;

  const dataChannel = peerConnection.createDataChannel('image');
dataChannel.onopen = async () => {
  console.log('Data channel opened');

  socket.on('message', async (message) => {
    // ... Handle connection setup ...
    
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.readyForNextImage) {
      sendImage();
    }
  });

  const sendImage = async () => {
    const image = images[currentImageIndex];
    const imageData = await sharp(image)
      .resize({ height: 360 })
      .jpeg({ quality: 50 })
      .toBuffer();

    const startTime = Date.now();
    dataChannel.send(imageData);
    const endTime = Date.now();

    const latency = endTime - startTime;
    totalLatency += latency;
    imageCounter++;

    if (imageCounter % 200 === 0) {
      console.log(`Average latency for the last 200 pictures: ${totalLatency / 200} ms`);
      console.log(imageCounter)
      totalLatency = 0;
    }

    currentImageIndex = (currentImageIndex + 1) % images.length;
  };

  // Send the first image to start the loop
  sendImage();
  // ...


    const interval = setInterval(sendImage, 1000 / 30);

    // Stop sending the image when the data channel is closed
    dataChannel.onclose = () => {
      clearInterval(interval);
      console.log('Data channel closed');
    };
  };

  socket.on('close', () => {
    console.log('Client disconnected');
    peerConnection.close();
  });
});

console.log('Server listening on port 8080');