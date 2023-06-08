import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, NativeModules, NativeEventEmitter, Image } from 'react-native';
import BleManager from 'react-native-ble-manager';
import { useNavigation } from '@react-navigation/native';

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const BluetoothScanScreen = () => {
  const navigation = useNavigation();
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  // Initialize BleManager and start scanning on screen load
  useEffect(() => {
    BleManager.start({ showAlert: false }).then(() => {
      console.log('BleManager initialized');
      startScan();
    });

    return () => {
      stopScan();
    };
  }, []);

  // Start scanning for nearby Bluetooth devices
  const startScan = () => {
    if (!isScanning) {
      BleManager.scan([], 5, true)
        .then(() => {
          setIsScanning(true);
          setDiscoveredDevices([]);
          console.log('Scan started');
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  // Stop scanning for nearby Bluetooth devices
  const stopScan = () => {
    if (isScanning) {
      BleManager.stopScan()
        .then(() => {
          console.log('Scan stopped');
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  // Navigate to the next screen with discovered devices
  const navigateToNextScreen = () => {
    setIsScanning(false);
    navigation.navigate('ChooseSafeBirdScreen', { discoveredDevices: discoveredDevices });
  };

  // Handle cancel button press
  const handleCancelPress = () => {
    navigation.navigate('SafeBirdDevicesScreen');
  };

  // Listen for discovered Bluetooth devices and add them to the list
  useEffect(() => {
    const discoverListener = BleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (device) => {
      console.log('Discovered device:', device);
      if (device.advertising.isConnectable && !discoveredDevices.some((d) => d.id === device.id)) {
        setDiscoveredDevices((prevDevices) => [...prevDevices, device]);
      }
    });

    return () => {
      discoverListener.remove();
    };
  }, [discoveredDevices]);

  // Automatically navigate to the next screen after a delay when scanning is not active
  useEffect(() => {
    if (!isScanning) {
      setTimeout(navigateToNextScreen, 5000);
    }
  }, [isScanning]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.scanText}>Searching for SafeBird Device...</Text>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
      </View>

      {isScanning && (
        <TouchableOpacity style={styles.cancelButton} onPress={stopScan}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: 50,
  },
  logo: {
    marginTop: 20,
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  scanText: {
    fontSize: 16,
    color: 'black',
    marginTop: 10,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  cancelButtonText: {
    color: 'blue',
    fontSize: 16,
  },
});

export default BluetoothScanScreen;
