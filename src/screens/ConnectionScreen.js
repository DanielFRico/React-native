import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import BleManager from 'react-native-ble-manager';
import LogoImage from '../../assets/logo.png';

const ConnectionScreen = ({ route }) => {
  const { deviceName } = route.params;
  const [connectionStatus, setConnectionStatus] = useState('');
  const [connected, setConnected] = useState(false);
  const [peripherals, setPeripherals] = useState(new Map());

  console.log('Device Name:', deviceName);

  useEffect(() => {
    BleManager.start({ showAlert: false });
  }, []);

  const handleConnectPress = () => {
    BleManager.getDiscoveredPeripherals([]).then(peripherals => {
      console.log('Discovered Peripherals:');
      peripherals.forEach(peripheral => {
        console.log('Peripheral:', peripheral);
        console.log('Peripheral Name:', peripheral.name);
        console.log('Peripheral ID:', peripheral.id);
        console.log('Peripheral Advertising:', peripheral.advertising);
        console.log('Peripheral RSSI:', peripheral.rssi);
        console.log('Peripheral UUID:', peripheral.id); 
      });

      const selectedPeripheral = peripherals.find(peripheral => peripheral.name === 'Find Me');
      if (selectedPeripheral) {
        connectToPeripheral(selectedPeripheral);
      } else {
        console.log('Peripheral not found');
      }
    });
  };

  const connectToPeripheral = peripheral => {
    if (peripheral.connected) {
      BleManager.disconnect(peripheral.id).then(() => {
        peripheral.connected = false;
        setConnected(false);
        setConnectionStatus(`Disconnected from ${peripheral.name}`);
      });
    } else {
      BleManager.connect(peripheral.id)
        .then(() => {
          let peripheralResponse = peripherals.get(peripheral.id);
          if (peripheralResponse) {
            peripheralResponse.connected = true;
            peripherals.set(peripheral.id, peripheralResponse);
            setConnected(true);
            setConnectionStatus(`Connected to ${peripheral.name}`);
          }
          alert('Connected to ' + peripheral.name);
        })
        .catch(error => console.log(error));

      /* Read current RSSI value */
      setTimeout(() => {
        BleManager.retrieveServices(peripheral.id)
          .then(peripheralData => {
            console.log('Peripheral services:', peripheralData);
          })
          .catch(error => {
            console.log('Service retrieval error:', error);
          });
      }, 900);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.deviceFoundText}>Device Found: {deviceName}</Text>
      </View>
      <Image source={LogoImage} style={styles.logo} />
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.connectButton} onPress={handleConnectPress}>
          <Text style={styles.connectButtonText}>Connect</Text>
        </TouchableOpacity>
        <Text style={styles.connectionStatusText}>{connectionStatus}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  deviceFoundText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  logo: {
    marginVertical: 20,
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 300,
  },
  buttonsContainer: {
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 30,
    marginBottom: 10,
    width: 170,
    alignItems: 'center',
  },
  connectButtonText: {
    color: 'black',
    fontSize: 16,
  },
  connectionStatusText: {
    marginTop: 20,
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
});

export default ConnectionScreen;
