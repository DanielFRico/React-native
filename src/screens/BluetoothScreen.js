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
    const initializeBluetooth = async () => {
      try {
        await BleManager.enableBluetooth();
        console.log('Bluetooth is turned on!');
  
        if (Platform.OS === 'android' && Platform.Version >= 29) {
          const locationPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (!locationPermission) {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              console.log('Location permission granted');
            } else {
              console.log('Location permission denied');
            }
          }
        }
  
        const scanPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
        );
        if (!scanPermission) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Bluetooth Scan permission granted');
          } else {
            console.log('Bluetooth Scan permission denied');
          }
        }
  
        await BleManager.start({ showAlert: false });
        console.log('BleManager initialized');
      } catch (error) {
        console.log('The user refused to enable Bluetooth');
      }
    };
  
    initializeBluetooth();
  }, []);
  

  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

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
        if (!discoveredDevices.some(d => d.id === device.id)) {
          setDiscoveredDevices((prevDevices) => [...prevDevices, device]);
        }
      },
    );

    return () => {
      discoverListener.remove();
    };
  }, [discoveredDevices]);

  const startScan = () => {
    if (!isScanning) {
      BleManager.scan([], 30, true)
        .then(() => {
          setIsScanning(true);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const connectToDevice = (device) => {
    BleManager.connect(device.id)
      .then(() => {
        console.log('Connected to device:', device.name);
      })
      .catch((error) => {
        console.error('Failed to connect:', error);
      });
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
  
          {discoveredDevices.map((device) => (
  <TouchableOpacity
    key={device.id} // Assign a unique key
    style={styles.deviceButton}
    onPress={() => connectToDevice(device)}
  >
    <Text style={styles.deviceButtonText}>
      {device.name || device.advertising?.localName || device.id || 'Unknown Device'}
    </Text>
  </TouchableOpacity>
))}


        </View>
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
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#307ecc',
    height: 40,
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 15,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
  deviceButton: {
    backgroundColor: '#307ecc',
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#307ecc',
    height: 40,
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 15,
  },
  deviceButtonText: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
});

export default BluetoothScreen;
