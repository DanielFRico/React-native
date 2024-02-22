import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import BleManager from 'react-native-ble-manager';
import LogoImage from '../../assets/computer.png';

const ConnectionScreen = ({ route, navigation }) => {
  const { deviceName } = route.params;
  const [connectionStatus, setConnectionStatus] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Start the BleManager when the component mounts
    BleManager.start({ showAlert: false });
  }, []);

  useEffect(() => {
    console.log('Connected:', connected);
  }, [connected]);

  // Function to handle the connect button press
  const handleConnectPress = async () => {
    try {
      const discoveredPeripherals = await BleManager.getDiscoveredPeripherals([]);

      const selectedPeripheral = discoveredPeripherals.find(peripheral => peripheral.name === deviceName);
      if (selectedPeripheral) {
        connectToPeripheral(selectedPeripheral);
      } else {
        Alert.alert('Peripheral Not Found', `Cannot find peripheral "${deviceName}".`);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  // Function to connect to the peripheral
  const connectToPeripheral = peripheral => {
    if (peripheral.connected) {
      Alert.alert('Connection Status', `Already connected to ${peripheral.name}`);
      return;
    }

    BleManager.connect(peripheral.id)
      .then(() => {
        setConnected(true);
        setConnectionStatus(`Connected to ${peripheral.name}`);
      })
      .catch(error => {
        Alert.alert('Connection Error', `Failed to connect to "${deviceName}".`);
        console.log(error);
      });

    setTimeout(() => {
      // Retrieve services from the peripheral
      BleManager.retrieveServices(peripheral.id)
        .then(peripheralData => {
          // Handle retrieved services
        })
        .catch(error => {
          console.log('Service retrieval error:', error);
        });
    }, 900);
  };

  // Function to handle the finish button press
  const handleFinishPress = () => {
    navigation.navigate('HomeScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.deviceFoundText}>Device Found: {deviceName}</Text>
      </View>
      <Image source={LogoImage} style={styles.logo} />
      <View style={styles.buttonsContainer}>
        {!connected && (
          <TouchableOpacity style={styles.connectButton} onPress={handleConnectPress}>
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.connectionStatusText}>{connectionStatus}</Text>
      </View>
      <TouchableOpacity style={styles.finishButton} onPress={handleFinishPress}>
        <Text style={styles.finishButtonText}>Done</Text>
      </TouchableOpacity>
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
    width: 260,
    height: 200,
    alignSelf: 'center',
    marginBottom: 300,
    marginTop: 50
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
  finishButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#a15943',
    padding: 10,
    borderRadius: 30,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ConnectionScreen;
