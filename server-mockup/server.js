"use strict";

// Log whole objects instead of giving up after two levels of nesting
require("util").inspect.defaultOptions.depth = null;

const CONFIG = require("./config");
const log = require("./logging");

const WebSocket = require('ws');
const Mediasoup = require('mediasoup');

const CryptoSuiteMediasoup = "AES_CM_128_HMAC_SHA1_80";

// ----------------------------------------------------------------------------
// WebSocket server
// ----------------------------------------------------------------------------
const socket = new WebSocket.Server({ port: 8080 });

socket.on('connection', async (socket) => {
  console.log('Client connected');

    socket.on('message', (message) => {
      const parsedMessage = JSON.parse(message);
      log("parsedMessage: ", parsedMessage)
      handleRequest(socket, parsedMessage);
    });
});


// ----------------------------------------------------------------------------

async function handleRequest(socket, request) {
  let responseData = null;

  switch (request.type) {
    case "START_MEDIASOUP": 
      responseData = await handleStartMediasoup();
      break;
    case "WEBRTC_SEND_START": 
      responseData = await handleWebrtcSendStart();
      break;
    case "WEBRTC_SEND_CONNECT":
      responseData = await handleWebrtcSendConnect(request.dtlsParameters);
      break;
    case "WEBRTC_SEND_CONSUME": 
      responseData = await handleWebrtcSendConsume(request.rtpCaps);
      break;
    case "START_VIDEO_RTP_PRODUCER": 
      responseData = await handleStartVideoRtpProducer(request.enableSrtp);
      break;
    case "DEBUG": 
      responseData = await TODO();
      break;
    default:
      log.warn("[handleRequest] Invalid request type:", request.type);
      break;
  }

  socket.send(JSON.stringify({ requestId: request.requestId, type: request.type, data: responseData }));
}


// ----------------------------------------------------------------------------

let router;
let worker;
let transport;
let videoProducer;

// ----------------------------------------------------------------------------

// Creates a mediasoup worker and router

async function handleStartMediasoup() {
  log(0)
  
  try {
    worker = await Mediasoup.createWorker(CONFIG.mediasoup.worker);
  } catch (err) {
    log.error("[handleStartMediasoup] ERROR:", err);
    process.exit(1);
  }

  worker.on("died", () => {
    log.error(
      "mediasoup worker died, exit in 3 seconds... [pid:%d]",
      worker.pid
    );
    setTimeout(() => process.exit(1), 3000);
  });

  log("[handleStartMediasoup] mediasoup worker created [pid:%d]", worker.pid);

  
  try {
    router = await worker.createRouter(CONFIG.mediasoup.router);
  } catch (err) {
    log.error("[handleStartMediasoup] ERROR:", err);
    process.exit(1);
  }

  // At this point, the computed "router.rtpCapabilities" includes the
  // router codecs enhanced with retransmission and RTCP capabilities,
  // and the list of RTP header extensions supported by mediasoup.

  log("[handleStartMediasoup] mediasoup router created");
  log.trace(
    "[handleStartMediasoup] mediasoup router RtpCapabilities:\n%O",
    router.rtpCapabilities
  );

  return router.rtpCapabilities;

}


// ----------------------------------------------------------------------------
// WebRtcTransport Consumer
// ----------------------------------------------------------------------------

// Creates a mediasoup WebRTC SEND transport

async function handleWebrtcSendStart() {
  
  try {
    transport = await router.createWebRtcTransport(
      CONFIG.mediasoup.webrtcTransport
    );
  } catch (err) {
    log.error("[handleWebrtcSendStart] ERROR:", err);
    process.exit(1);
  }

  log("[handleWebrtcSendStart] mediasoup WebRTC SEND transport created");

  const webrtcTransportOptions = {
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
    sctpParameters: transport.sctpParameters,
  };

  log.trace(
    "[handleWebrtcSendStart] mediasoup WebRTC SEND TransportOptions:\n%O",
    webrtcTransportOptions
  );

  return webrtcTransportOptions;
}

// ----------------------------------------------------------------------------

// Calls WebRtcTransport.connect() whenever ???

async function handleWebrtcSendConnect(dtlsParams) {

  log("[handleWebrtcSendConnect] iceCandidates: ", transport.iceCandidates)

  await transport.connect({ dtlsParameters: dtlsParams });

  log("[handleWebrtcSendConnect] mediasoup WebRTC SEND transport connected");
}

// Calls WebRtcTransport.consume() to start sending media to the browser

async function handleWebrtcSendConsume(rtpCaps) {
  
  if (!videoProducer) {
    log.error("[handleWebrtcSendConsume] BUG: The videoProducer doesn't exist!");
    process.exit(1);
  }

  const consumer = await transport.consume({
    producerId: videoProducer.id,
    rtpCapabilities: rtpCaps,
    paused: false,
  });

  log(
    "[handleWebrtcSendConsume] mediasoup WebRTC SEND consumer created, kind: %s, type: %s, paused: %s",
    consumer.kind,
    consumer.type,
    consumer.paused
  );

  log.trace(
    "[handleWebrtcSendConsume] mediasoup WebRTC SEND consumer RtpParameters:\n%O",
    consumer.rtpParameters
  );

  const webrtcConsumerOptions = {
    id: consumer.id,
    producerId: consumer.producerId,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters,
  };

  return webrtcConsumerOptions;
}

// ----------------------------------------------------------------------------
// PlainRtpTransport Producer
// ----------------------------------------------------------------------------

async function handleStartVideoRtpProducer(enableSrtp) {
  const videoTransport = await router.createPlainTransport({ 
      // There is no need to `connect()` this transport: with COMEDIA enabled,
      // mediasoup waits until neural_netowrk_broadcaster.py starts sending RTP, 
      // and then detect its outbound RTP and RTCP ports.
      comedia: true,

      // RtpEndpoint doesn't support RTP/RTCP multiplexing ("a=rtcp-mux" in SDP)
      rtcpMux: false,

      // Enable SRTP if requested
      enableSrtp: enableSrtp,
      srtpCryptoSuite: CryptoSuiteMediasoup,

      ...CONFIG.mediasoup.plainTransport,
    });
  
  // Read the transport local RTP port.
  // const videoRtpPort = videoTransport.tuple.localPort;
  // // => 
  
  // // Read the transport local RTCP port.
  // const videoRtcpPort = videoTransport.rtcpTuple.localPort;
  // // => 

  log(
    "[startVideoRtpProducer] mediasoup RTP RECV transport created: %s:%d (%s)",
    videoTransport.tuple.localIp,
    videoTransport.tuple.localPort,
    videoTransport.tuple.protocol
  );

  log(
    "[startVideoRtpProducer] mediasoup RTCP RECV transport created: %s:%d (%s)",
    videoTransport.rtcpTuple.localIp,
    videoTransport.rtcpTuple.localPort,
    videoTransport.rtcpTuple.protocol
  );

  // COMEDIA is enabled, so the transport connection will happen asynchronously

  videoTransport.on("tuple", (tuple) => {
    log(
      "[startVideoRtpProducer] mediasoup RTP RECV transport connected: %s:%d <--> %s:%d (%s)",
      tuple.localIp,
      tuple.localPort,
      tuple.remoteIp,
      tuple.remotePort,
      tuple.protocol
    );
  });

  videoTransport.on("rtcptuple", (rtcpTuple) => {
    log(
      "[startVideoRtpProducer] mediasoup RTCP RECV transport connected: %s:%d <--> %s:%d (%s)",
      rtcpTuple.localIp,
      rtcpTuple.localPort,
      rtcpTuple.remoteIp,
      rtcpTuple.remotePort,
      rtcpTuple.protocol
    );

  });

  // mediasoup RTP producer (receive media from ffmpeg stream)
  // ---------------------------------------------------

  try {
    videoProducer = await videoTransport.produce(
      {
        kind          : 'video',
        paused: false,
        rtpParameters :
        {
          codecs :
          [
            {
              mimeType     : 'video/vp8',
              clockRate    : 90000,
              payloadType  : 102,
              rtcpFeedback : [ ], // FFmpeg does not support NACK nor PLI/FIR.
            }
          ],
          encodings : [ { ssrc: 22222222 } ]
        }
      });
  } catch (err) {
    log.error("[startVideoRtpProducer] ERROR:", err);
    process.exit(1);
  }

  log(
    "[startVideoRtpProducer] mediasoup RTP RECV producer created, kind: %s, type: %s, paused: %s",
    videoProducer.kind,
    videoProducer.type,
    videoProducer.paused
  );

  log(
    "[startVideoRtpProducer] mediasoup RTP RECV producer RtpParameters:\n%O",
    videoProducer.rtpParameters
  );

  // Connect the mediasoup transport to enable receiving (S)RTP/RTCP and sending
  // (S)RTCP packets
  // IMPORTANT: if comedia is enabled in this plain transport and SRTP is not, connect() must not be called.
  let srtpParams = undefined;
  if (enableSrtp) {
    srtpParams = {
      cryptoSuite: CryptoSuiteMediasoup,
      keyBase64: CONFIG.srtp.keyBase64,
    };

    await videoTransport.connect({
      srtpParameters: srtpParams,
    });
    log("[startVideoRtpProducer] mediasoup RTP RECV producer connected");
  }

}


// ----------------------------------------------------------------------------



console.log('Server listening on port 8080');
