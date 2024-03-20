module.exports = {
  websocket: {
    https: {
      cert: '../cert/cert.pem',
      certKey: '../cert/key.pem',
      port: 8084,
      wsPath: '/server',
      wsPingInterval: 25000,
      wsPingTimeout: 5000,
    },
    http: {
      ip: 'webrtc-server.dev.2060.io',
      port: 443,
    },
  },
};
