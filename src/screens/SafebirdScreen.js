import React, {useEffect, useState, useRef} from 'react';
import {Device} from 'mediasoup-client';
import {
  RTCView,
  MediaStream,
  mediaDevices,
  registerGlobals,
} from 'react-native-webrtc';
import protooClient from 'protoo-client';

function generateRandomString(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const iceServerHost = '148.113.140.112';
const iceServerProto = 'udp';
const iceServerPort = '3478';
const iceServerUser = 'mobiera';
const iceServerPass = 'L971EHmpPe';

registerGlobals();
const VideoCall = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const roomId = useRef(null);
  const peerId = useRef(null);
  const peer = useRef();
  const sendTransport = useRef();
  const recvTransport = useRef();
  const device = useRef();
  const routerRtpCapabilities = useRef();

  const fetchRoomId = async () => {
    try {
      const response = await fetch(
        'https://webrtc-server.core.dev.2060.io/getRoomId',
      );
      const data = await response.json();
      roomId.current = data.roomId;
      peerId.current = generateRandomString(8);
    } catch (error) {
      console.error('Error fetching RoomId:', error);
    }
  };

  useEffect(() => {
    const setup = async () => {
      await fetchRoomId();
      const transport = new protooClient.WebSocketTransport(
        `wss://webrtc-server.core.dev.2060.io:443/?roomId=${roomId.current}&peerId=${peerId.current}&consumerReplicas=undefined`,
      );
      peer.current = new protooClient.Peer(transport);
      peer.current.on('open', async () => {
        console.log('Socket Connection opened');
        try {
          await createSendTransport();
          await createRecvTransport();

          const message = await peer.current.request('join', {
            displayName: 'test Name',
            device: device.current,
            rtpCapabilities: routerRtpCapabilities.current,
            sctpCapabilities: undefined,
          });
          console.log(
            'unido a la sala exitosamente en la sala',
            message,
            roomId.current,
            peerId.current,
          );

          const stream = await mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });
          setLocalStream(stream);
          const trackVideo = stream.getVideoTracks()[0];
          const trackAudio = stream.getAudioTracks()[0];
          const producer = await sendTransport.current.produce({
            track: trackVideo,
          });
          const producerAudio = await sendTransport.current.produce({
            track: trackAudio,
          });
          const dataProducer = await sendTransport.current.produceData({
            ordered: true,
            label: 'foo',
          });
          //console.log('trackAudio', trackAudio);
          //console.log('trackvideo', trackVideo);
          //console.log('producerAudio:', producerAudio);
          //console.log('dataProducer:', dataProducer);
          //console.log('Producer:', producer);
          console.log('SendTransport ID:', sendTransport.current.id);
        } catch (error) {
          console.error('Error creating send transport:', error);
        }
      });
      peer.current.on('request', async (request, accept, reject) => {
        console.log('request lst', request);

        if (request.method === 'newConsumer') {
          console.log('*********** New Consumer!');

          const {
            peerId: consumerPeerId,
            producerId,
            id,
            kind,
            rtpParameters,
            type,
            appData,
            producerPaused,
          } = request.data;

          try {
            const consumer = await recvTransport.current.consume({
              id,
              producerId,
              kind,
              rtpParameters,
              // NOTE: Force streamId to be same in mic and webcam and different
              // in screen sharing so libwebrtc will just try to sync mic and
              // webcam streams from the same remote peer.
              streamId: `${consumerPeerId}-${
                appData.share ? 'share' : 'mic-webcam'
              }`,
              appData: {...appData, consumerPeerId}, // Trick.
            });
            accept();
            if (kind === 'video') {
              const stream = new MediaStream();
              stream.addTrack(consumer.track);
              setRemoteStream(stream);
            }
            // TODO: Add consumer
            consumer.on('transportclose', () => {
              //this._consumers.delete(consumer.id);
              // TODO: Delete consumer
            });
          } catch (error) {
            console.error('Error consuming', error);
          }
        }
      });
      peer.current.on('failed', () => {
        console.log('Socket connection failed');
      });
    };
    setup();
  }, []);

  const createSendTransport = async () => {
    console.log('peer.current', peer.current?.connected);
    device.current = new Device();
    routerRtpCapabilities.current = await peer.current.request(
      'getRouterRtpCapabilities',
    );
    await device.current.load({
      routerRtpCapabilities: routerRtpCapabilities.current,
    });
    try {
      const transportInfo = await peer.current.request(
        'createWebRtcTransport',
        {
          forceTcp: false,
          producing: true,
          consuming: false,
          sctpCapabilities: true,
        },
      );
      const {id, iceParameters, iceCandidates, dtlsParameters, sctpParameters} =
        transportInfo;
      const transportOptions = {
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters: {...dtlsParameters, role: 'auto'},
        sctpParameters,
        iceServers: [
          {
            urls: `turn:${iceServerHost}:${iceServerPort}?transport=${iceServerProto}`,
            username: iceServerUser,
            credential: iceServerPass,
          },
        ],
        iceTransportPolicy: 'relay',
      };
      sendTransport.current =
        device.current.createSendTransport(transportOptions);
      sendTransport.current.on(
        'connect',
        async ({dtlsParameters}, callback, errback) => {
          try {
            console.log('Transport Connected successfully', dtlsParameters);
            await peer.current.request('connectWebRtcTransport', {
              transportId: sendTransport.current.id,
              dtlsParameters,
            });
            callback();
          } catch (error) {
            console.error('Error connecting transport:', error);
            errback();
          }
        },
      );
      sendTransport.current.on(
        'produce',
        async ({kind, rtpParameters, appData}, callback, errback) => {
          try {
            /*console.log('entro al producer listener', {
              transportId: sendTransport.current.id,
              kind,
              rtpParameters,
              appData,
            });*/
            // eslint-disable-next-line no-shadow
            const {id} = await peer.current.request('produce', {
              transportId: sendTransport.current.id,
              kind,
              rtpParameters,
              appData,
            });
            //console.log('paso por produce con id', id);
            callback({id});
          } catch (error) {
            errback(error);
          }
        },
      );
      sendTransport.current.on(
        'producedata',
        async (
          {sctpStreamParameters, label, protocol, appData},
          callback,
          errback,
        ) => {
          // Here we must communicate our local parameters to our remote transport.
          try {
            const {id} = await peer.current.request('produceData', {
              transportId: sendTransport.current.id,
              sctpStreamParameters,
              label,
              protocol,
              appData,
            });

            // Done in the server, pass the response to our transport.
            callback({id});
          } catch (error) {
            // Something was wrong in server side.
            errback(error);
          }
        },
      );
    } catch (error) {
      console.error('Error creating send transport:', error);
    }
  };

  const createRecvTransport = async () => {
    try {
      const transportInfo = await peer.current.request(
        'createWebRtcTransport',
        {
          forceTcp: false,
          producing: false,
          consuming: true,
          sctpCapabilities: true,
        },
      );

      const {id, iceParameters, iceCandidates, dtlsParameters, sctpParameters} =
        transportInfo;

      recvTransport.current = device.current.createRecvTransport({
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters: {
          ...dtlsParameters,
          // Remote DTLS role. We know it's always 'auto' by default so, if
          // we want, we can force local WebRTC transport to be 'client' by
          // indicating 'server' here and vice-versa.
          role: 'auto',
        },
        sctpParameters,
        iceServers: [
          {
            urls: `turn:${iceServerHost}:${iceServerPort}?transport=${iceServerProto}`,
            username: iceServerUser,
            credential: iceServerPass,
          },
        ],
        iceTransportPolicy: 'relay',
        additionalSettings: {
          //encodedInsertableStreams: this._e2eKey && e2e.isSupported(),
        },
      });
      recvTransport.current.on(
        'connect',
        async ({dtlsParameters}, callback, errback) => {
          try {
            console.log(
              'Recv Transport Connected successfully',
              dtlsParameters,
            );
            await peer.current.request('connectWebRtcTransport', {
              transportId: recvTransport.current.id,
              dtlsParameters,
            });
            callback();
          } catch (error) {
            console.error('Error connecting transport:', error);
            errback();
          }
        },
      );
      console.log('RecvTransport ID:', recvTransport.current.id);
    } catch (error) {
      console.error('Error creating recv transport:', error);
    }
  };

  return (
    <>
      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          objectFit="cover"
          style={{width: 400, height: 300}}
        />
      )}

      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          objectFit="cover"
          style={{width: 400, height: 300}}
        />
      )}
    </>
  );
};
export default VideoCall;
