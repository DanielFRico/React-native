# webrtc-working-example

Make sure to follow the [Setup development environment](https://github.com/saivvy/ebike-app-beta/wiki/Setup-development-environment) instructions.


## Server
```
cd ../WebrtcServer/
npm i
node server.js
```

## Client

```
cd WebrtcImageApp
npm i
react-native run-android
npx react-native start
```

## Current limitations

1. If we want to achieve a flawless video streaming experience, we should consider using actual video codecs and streaming protocols like WebRTC's built-in video streaming instead of sending individual frames as images. This will allow us to leverage more advanced video compression algorithms and adaptive bitrate streaming, resulting in a better experience overall;

2. We should introduce also a second server in python where the neural network will publish its predictions and pass it to the node server via websocket; 

3. We should handle all possible connection issues and have a more adaptive streaming approach;

4. We should introduce a debugging mode

5. We should wrap-up all server code in a higher-level functionality