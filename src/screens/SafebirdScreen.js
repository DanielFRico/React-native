const CONFIG = require("../../config");
const log = require("../../logging");
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
const MediasoupClient = require("mediasoup-client");
import { registerGlobals } from 'react-native-webrtc';
import { RTCView } from 'react-native-webrtc';

registerGlobals(); // Register WebRTC globals


// ----------------------------------------------------------------------------

// Utility functions
// ================


let requestId = 0;
const pendingRequests = new Map();

function socketRequest(socket, message) {
  return new Promise((resolve, reject) => {
    const currentRequestId = requestId++;
    message.requestId = currentRequestId;

    pendingRequests.set(currentRequestId, { resolve, reject });
    socket.send(JSON.stringify(message));
  });
}


// ----------------------------------------------------------------------------



const SafebirdScreen = () => {
  const reconnectDelay = 3000; // delay 5 seconds for the first reconnection
  let reconnectAttempts = 0


  const activeTransports = [];

  // const [socket, setSocket] = useState(null);
  
  const [videoTrack, setVideoTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState("SAFEBIRD view loading ...");

  const videoRef = React.createRef();

  WebSocket.prototype.sendAsync = function (data) {
    return new Promise((resolve, reject) => {
      this.send(JSON.stringify(data), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  let device;

  useEffect(() => {
    
    let heartbeatIntervalId;
    let reconnectTimeoutId; // variable to hold reconnect timeout id
    let isComponentMounted = true; // Keep track of whether the component is mounted
    let streamCheckInterval;

    async function initializeWebSocket() {

      socket = new WebSocket(CONFIG.http);

      // Setup heartbeat sender
      heartbeatIntervalId = setInterval(() => sendHeartbeat(socket), 1000);

      // Setup a single 'onmessage' event listener for the socket
      // This implementation assigns a unique ID to each request, and it 
      // stores the pending requests in a pendingRequests Map. When a response 
      // is received, it looks up the corresponding request by its ID and 
      // resolves or rejects the Promise accordingly.
      socket.onmessage = (event) => {
        const response = JSON.parse(event.data);
        const { requestId, error } = response;

        const pendingRequest = pendingRequests.get(requestId);

        if (pendingRequest) {
          const { resolve, reject } = pendingRequest;

          if (error) {
            reject(error);
          } else {
            resolve(response);
          }

          pendingRequests.delete(requestId);
        } else {
          console.error('Received response for unknown request ID:', requestId);
        }
      };

      socket.onopen = async () => {
        console.log('Connected to server');
        reconnectAttempts = 0; // reset the counter
        await startWebRTC()
      };

      socket.onclose = async (event) => {
        console.log(`Socket closed with code ${event.code}`);

        // Close any active transports
        for (const transport of activeTransports) {
          transport.close();
        }
        activeTransports.length = 0; // Clear the array
        
        if(isComponentMounted) { // Only attempt to reconnect if the component is still mounted
          reconnectAttempts++;
          reconnectTimeoutId = setTimeout(initializeWebSocket, reconnectDelay * reconnectAttempts);
          console.log(`Attempt to reconnect... (attempt number ${reconnectAttempts})`);
        }
      };

    }

    initializeWebSocket();

     // Clear the heartbeat interval and reconnect timeout when the component unmounts.
     return () => {
      isComponentMounted = false; // Indicate that the component is no longer mounted
      if (heartbeatIntervalId) {
        clearInterval(heartbeatIntervalId);
      }
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
      }
    };


    async function startWebRTC() {
      log("[startWebRTC] Start WebRTC transmission from browser to mediasoup");
      await startMediasoup();
      await startVideoRtpProducer();
      await startWebrtcRecv();
    }


    async function startMediasoup() {
    
      const response = await socketRequest(socket, { type: "START_MEDIASOUP" });
      const routerRtpCaps = response.data;

      log("[startMediasoup] mediasoup router created");
    

      try {
        device = new MediasoupClient.Device();
      } catch (err) {
        log.error("[startMediasoup] ERROR:", err);
        return;
      }
    
      try {
        await device.load({ routerRtpCapabilities: routerRtpCaps });
      } catch (err) {
        log.error("[startMediasoup] ERROR:", err);
        return;
      }
    
      log(
        "[startMediasoup] mediasoup device created, handlerName: %s, use audio: %s, use video: %s",
        device.handlerName,
        device.canProduce("audio"),
        device.canProduce("video")
      );
    
      log.trace(
        "[startMediasoup] Device RtpCapabilities:\n%O",
        device.rtpCapabilities
      );
    }


    // ----

    async function startVideoRtpProducer() {
    
      // start VideoRtpProducer
      // --------------------------

      // TODO: put this in config and allow for encryption too
      let enableSrtp = false;
      const response = await socketRequest(socket, {
        type: "START_VIDEO_RTP_PRODUCER",
        enableSrtp: enableSrtp,
      });

      log("[startVideoRtpProducer] VideoRtpProducer consumer created");

    }

    async function startWebrtcRecv() {
    
      // mediasoup WebRTC transport
      // --------------------------

      let response = await socketRequest(socket, { type: "WEBRTC_SEND_START" });
      const webrtcTransportOptions = response.data;
    
      log("[startWebrtcRecv] WebRTC SEND transport created");
    
      let transport;
      try {
        transport = device.createRecvTransport(webrtcTransportOptions);
        activeTransports.push(transport); // Add the transport to the array
      } catch (err) {
        log.error("[startWebrtcRecv] ERROR:", err);
        return;
      }

      transport.on("connectionstatechange", async (state) => {
        // Check if the connection state has changed to "failed" or "disconnected"
        if (state === "failed" || state === "disconnected") {
          if(isComponentMounted) {
            console.log(`Transport connection state changed to ${state}`);
            // Close any active transports
            for (const transport of activeTransports) {
              transport.close();
            }
            activeTransports.length = 0; // Clear the array

            initializeWebSocket()
            // Attempt to reconnect
            // reconnectAttempts++;
            // reconnectTimeoutId = setTimeout(initializeWebSocket, reconnectDelay * reconnectAttempts);
            // console.log(`Attempt to reconnect... (attempt number ${reconnectAttempts})`);
            console.log(`Attempt to reconnect...`);
          }
        }
      });
    
      log("[startWebrtcRecv] WebRTC RECV transport created");
    
      // "connect" is emitted upon the first call to transport.consume()
      try {
        transport.on("connect", ({ dtlsParameters }, callback, _errback) => {
          // Signal local DTLS parameters to the server side transport
          response = socketRequest(socket, {
            type: "WEBRTC_SEND_CONNECT",
            dtlsParameters: dtlsParameters,
          })
          callback();
        });
      } catch (err) {
        log.error("[startWebrtcRecv] ERROR:", err);
        return;
       }

      log("transport.connectionState before WEBRTC_SEND_CONSUME", transport.connectionState)

      log(device.rtpCapabilities)
    
      // mediasoup WebRTC consumer
      // -------------------------
      try {
        response = await socketRequest(socket, {
        type: "WEBRTC_SEND_CONSUME",
        rtpCaps: device.rtpCapabilities,
       });
      } catch (err) {
        log.error("[startWebrtcRecv] ERROR:", err);
        return;
       }

      log("transport.connectionState after WEBRTC_SEND_CONSUME", transport.connectionState)
      
      const webrtcConsumerOptions = response.data;
    
      log("[startWebrtcRecv] WebRTC SEND consumer created");
    
      let useVideo = true;

      // Start mediasoup-client's WebRTC consumer(s)
    
      const stream = new MediaStream();  
          
      if (useVideo) {

        const consumer = await transport.consume(webrtcConsumerOptions);
        stream.addTrack(consumer.track);
        
        log('[startWebrtcRecv] WebRTC RECV consumer created');

        // Update the videoTrack state
        setVideoTrack(new MediaStream([consumer.track]));

        // Check if the stream is being received
        if (stream.getVideoTracks().length > 0) {
          log('Stream received:', stream);
          setIsPlaying(true);
        } else {
          log('No stream received');
        }
      }

      return () => {
        isComponentMounted = false; // Indicate that the component is no longer mounted
        if (heartbeatIntervalId) {
          clearInterval(heartbeatIntervalId);
        }
        
      };
      
    }
    
        
  }, []);

  function sendHeartbeat(socket) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ source: "react-native", type: "HEARTBEAT" }));
    }
  }

  return (
    <View style={styles.container}>
  <Text>{`${statusMessage}`}</Text> 
  {videoTrack && (
    <RTCView
      style={styles.video}
      streamURL={videoTrack.toURL()}
      objectFit="cover"
    />
  )}
</View>
  );
};  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

export default SafebirdScreen;