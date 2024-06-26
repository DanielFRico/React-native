module.exports = {
  https: {
    cert: '../cert/cert.pem',
    certKey: '../cert/key.pem',
    port: 8080,
    wsPath: '/server',
    wsPingInterval: 25000,
    wsPingTimeout: 5000,
  },

  mediasoup: {
    // WorkerSettings
    worker: {
      logLevel: 'debug', // "debug", "warn", "error", "none"
      logTags: [
        'bwe',
        'dtls',
        'ice',
        'info',
        // "rtcp",
        'rtp',
        // "rtx",
        // "score",
        // "sctp",
        // "simulcast",
        'srtp',
        // "svc"
      ],
      rtcMinPort: 40000,
      rtcMaxPort: 45000,
    },

    // RouterOptions
    router: {
      // RtpCodecCapability[]
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          parameters: {},
        },
        {
          kind: 'video',
          mimeType: 'video/H264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '4d0032',
            'level-asymmetry-allowed': 1,
          },
        },
        {
          kind: 'video',
          mimeType: 'video/H264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f',
            'level-asymmetry-allowed': 1,
          },
        },
      ],
    },

    // WebRtcTransportOptions
    webrtcTransport: {
      listenIps: [{ip: '192.168.1.13', announcedIp: null}],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate: 300000,
    },

    // PlainTransportOptions
    plainTransport: {
      // If running from localhost or with Docker "host network", use the
      // localhost IP address.
      listenIp: {ip: '0.0.0.0', announcedIp: '192.168.1.13'},

      // If running from a non-"host network" Linux Docker container, use
      // the Docker network gateway IP, which by default is "192.168.1.13".
      //listenIp: { ip: "0.0.0.0", announcedIp: "192.168.1.13" },

      // If running from Docker for Mac or Windows, use the IP address that
      // results from resolving the special DNS name `host.docker.internal`
      // *from inside the container itself*. You can get it with this command:
      // $ docker run --rm alpine nslookup host.docker.internal
      //listenIp: { ip: "0.0.0.0", announcedIp: "192.168.65.2" },
    },
  },
};
