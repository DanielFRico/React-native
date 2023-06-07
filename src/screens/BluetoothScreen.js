import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Platform,
  StatusBar,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  NativeModules,
  useColorScheme,
  TouchableOpacity,
  NativeEventEmitter,
  PermissionsAndroid,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const BluetoothScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const BleManagerModule = NativeModules.BleManager;
  const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

  useEffect(() => {
    // Turn on Bluetooth if it is not on
    BleManager.enableBluetooth()
      .then(() => {
        console.log('Bluetooth is turned on!');

        if (Platform.OS === 'android' && Platform.Version >= 29) {
          // Check for Android 10 and above
          PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then((result) => {
            if (result) {
              console.log('Permission is OK');
            } else {
              PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              ).then((result) => {
                if (result) {
                  console.log('User accepted');
                } else {
                  console.log('User refused');
                }
              });
            }
          });
        }

        // Request Bluetooth Scan permission
        PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        ).then((result) => {
          if (result) {
            console.log('Bluetooth Scan Permission is OK');
          } else {
            PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            ).then((result) => {
              if (result) {
                console.log('User accepted Bluetooth Scan');
              } else {
                console.log('User refused Bluetooth Scan');
              }
            });
          }
        });

        // start bluetooth manager
        BleManager.start({ showAlert: false }).then(() => {
          console.log('BleManager initialized');
        });
      })
      .catch((error) => {
        console.log('The user refused to enable bluetooth');
      });
  }, []);

  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);

  useEffect(() => {
    let stopListener = BleManagerEmitter.addListener(
      'BleManagerStopScan',
      () => {
        setIsScanning(false);
        console.log('Scan is stopped');
      },
    );
    return () => {
      stopListener.remove();
    };
  }, []);

  useEffect(() => {
    const discoverListener = BleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      (device) => {
        console.log('Discovered device:', device);

        if (!discoveredDevices.some((d) => d.id === device.id)) {
          setDiscoveredDevices((prevDevices) => [...prevDevices, device]);
        }
      },
    );

    return () => {
      discoverListener.remove();
    };
  }, []);

  const startScan = () => {
    if (!isScanning) {
      BleManager.scan([], 5, true)
        .then(() => {
          setIsScanning(true);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const sendConnectionRequest = async (device) => {
    console.log('Sending connection request to device:', device);

    try {
      await BleManager.connect(device.id);
      console.log('Connected to device:', device);
      setConnectedDevice(device);
    } catch (error) {
      console.error('Error connecting to device:', error);
    }
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.mainBody]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        style={backgroundStyle}
        contentContainerStyle={styles.mainBody}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
            marginBottom: 40,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 30,
                textAlign: 'center',
                color: isDarkMode ? Colors.white : Colors.black,
              }}
            >
              React Native BLE Manager Tutorial
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.buttonStyle}
            onPress={startScan}
          >
            <Text style={styles.buttonTextStyle}>
              {isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Display discovered devices */}
        {discoveredDevices
          .filter((device) => device.advertising.isConnectable)
          .reduce((uniqueDevices, device) => {
            const duplicateIndex = uniqueDevices.findIndex(
              (d) =>
                d.advertising.localName === device.advertising.localName &&
                JSON.stringify(d.advertising.manufacturerData) ===
                  JSON.stringify(device.advertising.manufacturerData),
            );
            if (duplicateIndex === -1) {
              uniqueDevices.push(device);
            }
            return uniqueDevices;
          }, [])
          .map((device) => (
            <TouchableOpacity
              key={device.id}
              style={[
                styles.deviceButton,
                connectedDevice?.id === device.id && styles.connectedDeviceButton,
              ]}
              onPress={() => sendConnectionRequest(device)}
            >
              <Text style={styles.deviceButtonText}>
                {device.advertising.localName || 'Unknown Device'}
              </Text>
              {connectedDevice?.id === device.id && (
                <Text style={styles.connectedDeviceText}>Connected</Text>
              )}
            </TouchableOpacity>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const windowHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  mainBody: {
    flex: 1,
    justifyContent: 'center',
    height: windowHeight,
  },

  buttonStyle: {
    backgroundColor: '#307ecc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
  },

  buttonTextStyle: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },

  deviceButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
  },

  connectedDeviceButton: {
    backgroundColor: '#00ff00',
  },

  deviceButtonText: {
    color: '#000000',
    fontSize: 16,
  },

  connectedDeviceText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default BluetoothScreen;
