module.exports = {
  https: {
    cert: "../cert/cert.pem",
    certKey: "../cert/key.pem",
    port: 8080,
    wsPath: "/server",
    wsPingInterval: 25000,
    wsPingTimeout: 5000,
  },

  http: "ws://172.17.0.1:8080",

};
