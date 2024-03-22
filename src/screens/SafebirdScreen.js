import React, {useEffect, useState, useRef} from 'react';
import {Device} from 'mediasoup-client';
import {
  RTCView,
  MediaStream,
  mediaDevices,
  registerGlobals,
} from 'react-native-webrtc';
import {WebSocketTransport, Peer} from 'protoo-client';
import {Button} from 'react-native';

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

const fetchServiceConfig = async () => {
  try {
    const response = await fetch(
      'https://webrtc-server.core.dev.2060.io/config',
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching fetchServiceConfig:', error);
    return null;
  }
};

const fetchRoomId = async () => {
  try {
    const response = await fetch(
      'https://webrtc-server.core.dev.2060.io/getRoomId',
    );
    const data = await response.json();
    return data.roomId;
  } catch (error) {
    console.error('Error fetching RoomId:', error);
    throw new Error(error);
  }
};

const getTransportOptions = (transportInfo, serviceConfig) => {
  const {id, iceParameters, iceCandidates, dtlsParameters, sctpParameters} =
    transportInfo;
  return {
    id,
    iceParameters,
    iceCandidates,
    dtlsParameters: {
      ...dtlsParameters,
      role: 'auto',
    },
    sctpParameters,
    iceServers: [
      {
        urls: `turn:${serviceConfig.iceServerHost}:${serviceConfig.iceServerPort}?transport=${serviceConfig.iceServerProto}`,
        username: serviceConfig.iceServerUser,
        credential: serviceConfig.iceServerPass,
      },
    ],
    iceTransportPolicy: 'relay',
  };
};

registerGlobals();
const VideoCall = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const roomId = useRef('vcwrong1');
  const peerId = useRef(null);
  const peer = useRef();
  const consumer = useRef();
  const sendTransport = useRef();
  const recvTransport = useRef();
  const device = useRef();
  const routerRtpCapabilities = useRef();
  const serviceConfig = useRef();

  const getIceServerConfig = async () => {
    try {
      const serviceConfigResponse = await fetchServiceConfig();
      serviceConfig.current = {
        ...serviceConfigResponse.config.iceserver,
        iceServerPass: 'L971EHmpPe',
        iceServerUser: 'mobiera',
      };
    } catch (error) {
      console.error('Error making server config', error);
      throw new Error(error);
    }
  };

  useEffect(() => {
    const setup = async () => {
      //roomId.current = await fetchRoomId();
      peerId.current = generateRandomString(8);
      await getIceServerConfig();
      const webSocketTransport = new WebSocketTransport(
        `wss://webrtc-server.core.dev.2060.io:443/?roomId=${roomId.current}&peerId=${peerId.current}&consumerReplicas=undefined`,
      );
      peer.current = new Peer(webSocketTransport);
      peer.current.on('open', async () => {
        console.log('Socket Connection opened');
        try {
          await createSendTransport();
          await createRecvTransport();
          await joinToRoom();
          await startToProduceStream();
        } catch (error) {
          console.error('Error creating send transport:', error);
        }
      });
      peer.current.on('request', async (request, accept, reject) => {
        console.log('llego un nuevo request', request);
        if (request.method === 'newConsumer') {
          try {
            console.log('*********** New Consumer!');
            const {
              peerId: consumerPeerId,
              producerId,
              id,
              kind,
              rtpParameters,
              appData,
            } = request.data;
            const consumerOptions = {
              id,
              producerId,
              kind,
              rtpParameters,
              streamId: `${consumerPeerId}-${
                appData.share ? 'share' : 'mic-webcam'
              }`,
              appData: {...appData, consumerPeerId}, // Trick.
            };
            consumer.current = await recvTransport.current.consume(
              consumerOptions,
            );
            accept();
            if (kind === 'video') {
              const stream = new MediaStream();
              stream.addTrack(consumer.current.track);
              setRemoteStream(stream);
            }
          } catch (error) {
            console.error('Error when new consumer is coming', error);
          }
        }
      });
      peer.current.on('failed', messageFailed => {
        console.log('Socket connection failed', messageFailed);
      });
      peer.current.on('notification', notification => {
        console.log(notification.method);
        switch (notification.method) {
          case 'producerScore': {
            const {producerId, score} = notification.data;
            console.log('producerScore', producerId, score);
            break;
          }
          case 'newPeer': {
            const newPeer = notification.data;
            console.log('newPeer', newPeer);
            break;
          }
          case 'peerClosed': {
            const {peerId} = notification.data;
            console.log(
              'la otra parte (peer) se salio de la llamada entonces yo tambien me salgo',
              peerId,
            );
            // leaveMeeting();
            break;
          }
          case 'peerDisplayNameChanged': {
            const {peerId, displayName, oldDisplayName} = notification.data;
            console.log(
              'peerDisplayNameChanged',
              peerId,
              displayName,
              oldDisplayName,
            );
            break;
          }
          case 'downlinkBwe': {
            console.log('downlinkBwe');
            break;
          }
          case 'consumerClosed': {
            const {consumerId} = notification.data;
            //const consumer = this._consumers.get(consumerId)
            //if (!consumer) break
            //consumer.close()
            //this._consumers.delete(consumerId)
            //const { peerId } = consumer.appData
            console.log('consumerClosed', consumerId, consumer.current);
            break;
          }
          case 'consumerPaused': {
            const {consumerId} = notification.data;
            /*const consumer = this._consumers.get(consumerId)
      if (!consumer) break
      consumer.pause()
      store.dispatch(stateActions.setConsumerPaused(consumerId, 'remote'))*/
            console.log('consumerPaused');
            break;
          }
          case 'consumerResumed': {
            const {consumerId} = notification.data;
            /*const consumer = this._consumers.get(consumerId)
      if (!consumer) break
      consumer.resume()
      store.dispatch(stateActions.setConsumerResumed(consumerId, 'remote'))*/
            console.log('consumerResumed');
            break;
          }
          case 'consumerLayersChanged': {
            const {consumerId, spatialLayer, temporalLayer} = notification.data;
            /*const consumer = this._consumers.get(consumerId)
      if (!consumer) break
      store.dispatch(stateActions.setConsumerCurrentLayers(consumerId, spatialLayer, temporalLayer))*/
            console.log('consumerLayersChanged');
            break;
          }
          case 'consumerScore': {
            const {consumerId, score} = notification.data;
            console.log('consumerLayersChanged');
            break;
          }
          case 'dataConsumerClosed': {
            const {dataConsumerId} = notification.data;
            /*const dataConsumer = this._dataConsumers.get(dataConsumerId)
      if (!dataConsumer) break
      dataConsumer.close()
      this._dataConsumers.delete(dataConsumerId)
      const { peerId } = dataConsumer.appData
      store.dispatch(stateActions.removeDataConsumer(dataConsumerId, peerId))*/
            console.log('dataConsumerClosed');
            break;
          }
          case 'activeSpeaker': {
            const {peerId} = notification.data;
            //store.dispatch(stateActions.setRoomActiveSpeaker(peerId))
            console.log('activeSpeaker');
            break;
          }
          default: {
            console.error(
              'unknown protoo notification.method "%s"',
              notification.method,
            );
          }
        }
      });
      peer.current.on('close', data => {
        console.log('me sali de la llamada', data);
      });
    };
    setup();
  }, []);

  const createSendTransport = async () => {
    device.current = new Device();
    routerRtpCapabilities.current = await peer.current.request(
      'getRouterRtpCapabilities',
    );
    await device.current.load({
      routerRtpCapabilities: routerRtpCapabilities.current,
    });
    try {
      const producerTransportInfo = await peer.current.request(
        'createWebRtcTransport',
        {
          forceTcp: false,
          producing: true,
          consuming: false,
          sctpCapabilities: true,
        },
      );
      const senderTransportOptions = getTransportOptions(
        producerTransportInfo,
        serviceConfig.current,
      );
      sendTransport.current = device.current.createSendTransport(
        senderTransportOptions,
      );
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
          console.log('rtpParameters on produce', rtpParameters);
          try {
            const {id} = await peer.current.request('produce', {
              transportId: sendTransport.current.id,
              kind,
              rtpParameters,
              appData,
            });
            callback({id});
          } catch (error) {
            errback(error);
          }
        },
      );
      const {id} = producerTransportInfo;
      sendTransport.current.on(
        'producedata',
        async (
          {sctpStreamParameters, label, protocol, appData},
          callback,
          errback,
        ) => {
          try {
            await peer.current.request('produceData', {
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

  const joinToRoom = async () => {
    const joinRoomResponse = await peer.current.request('join', {
      displayName: 'test Name',
      device: device.current,
      rtpCapabilities: routerRtpCapabilities.current,
      sctpCapabilities: undefined,
    });
    console.log(
      'unido a la sala exitosamente en la salaaa',
      joinRoomResponse,
      roomId.current,
    );
  };

  const startToProduceStream = async () => {
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setLocalStream(stream);
    const trackVideo = stream.getVideoTracks()[0];
    const trackAudio = stream.getAudioTracks()[0];
    await sendTransport.current.produce({
      track: trackVideo,
    });
    await sendTransport.current.produce({
      track: trackAudio,
    });
    await sendTransport.current.produceData({
      ordered: true,
      label: 'foo',
    });
  };

  const createRecvTransport = async () => {
    try {
      const consumerTransportInfo = await peer.current.request(
        'createWebRtcTransport',
        {
          forceTcp: false,
          producing: false,
          consuming: true,
          sctpCapabilities: true,
        },
      );
      const receiverTransportOptions = getTransportOptions(
        consumerTransportInfo,
        serviceConfig.current,
      );
      recvTransport.current = device.current.createRecvTransport(
        receiverTransportOptions,
      );
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

  const leaveMeeting = () => {
    peer.current.close();
    setRemoteStream(null);
    setLocalStream(null);
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
      <Button title="leave meeeting" onPress={leaveMeeting} />
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
