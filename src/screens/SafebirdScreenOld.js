import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Image, Text} from 'react-native';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import base64 from 'base-64';

const WebRTCScreen = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [nextImageSrc, setNextImageSrc] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (nextImageSrc) {
      setImageSrc(nextImageSrc);
      setNextImageSrc(null);
      socket.send(JSON.stringify({readyForNextImage: true}));
    }
  }, [nextImageSrc]);

  useEffect(() => {
    const setupWebrtc = async () => {
      console.log('newwwww');
      const peerConnection = new RTCPeerConnection({
        iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
      });

      const ws = new WebSocket('ws://192.168.1.13:8080');
      console.log('ws', ws);
      setSocket(ws);
      const iceCandidatesQueue = [];

      ws.onopen = () => {
        console.log('Connected to server');
      };

      ws.onerror = event => {
        console.error('WebSocket error:', event);
      };

      ws.onmessage = async event => {
        const {candidate, description} = JSON.parse(event.data);

        if (candidate) {
          iceCandidatesQueue.push(new RTCIceCandidate(candidate));
        } else if (description) {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(description),
          );
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          ws.send(
            JSON.stringify({description: peerConnection.localDescription}),
          );

          // Process queued ICE candidates
          while (iceCandidatesQueue.length) {
            const candidate = iceCandidatesQueue.shift();
            await peerConnection.addIceCandidate(candidate);
          }
        }
      };

      peerConnection.ondatachannel = event => {
        const dataChannel = event.channel;

        function arrayBufferToBase64(buffer) {
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          return base64.encode(binary);
        }

        dataChannel.binaryType = 'arraybuffer';
        dataChannel.onmessage = ({data}) => {
          const base64Image = arrayBufferToBase64(data);
          setNextImageSrc(`data:image/jpeg;base64,${base64Image}`);
          // console.log('Image received');
        };

        dataChannel.onopen = () => {
          console.log('Data channel opened');
          console.log('Data channel state:', dataChannel.readyState);
        };

        dataChannel.onclose = () => {
          console.log('Data channel closed');
        };
      };

      ws.onclose = event => {
        console.log('Disconnected from server', event);
        peerConnection.close();
      };
    };

    setupWebrtc();
  }, []);

  return (
    <View style={styles.container}>
      {imageSrc ? (
        <>
          <Image style={styles.image} source={{uri: imageSrc}} />
          <Text style={styles.overlayText}>It works!</Text>
        </>
      ) : (
        <Text>Loading...</Text>
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
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
  },
  overlayText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WebRTCScreen;
