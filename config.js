module.exports = {


  websocket: {
      https: {
        cert: "../cert/cert.pem",
        certKey: "../cert/key.pem",
        port: 8084,
        wsPath: "/server",
        wsPingInterval: 25000,
        wsPingTimeout: 5000,
      },

      http: {
        ip: "192.168.178.108",
        port: 8080
      }
    },
};
