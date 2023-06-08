import React, { useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image, PermissionsAndroid, Platform, Alert } from 'react-native';
import BleManager from 'react-native-ble-manager';
import { useNavigation } from '@react-navigation/native';

const SafeBirdDevicesScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    BleManager.start({ showAlert: false }).then(() => {
      console.log('BleManager initialized');
    });
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          startScan();
        } else {
          console.log('Location permission denied');
        }
      } catch (error) {
        console.error('Failed to request location permission:', error);
      }
    } else {
      startScan();
    }
  };

  const startScan = () => {
    BleManager.scan([], 5, true)
      .then(() => {
        console.log('Scan started');
        navigation.navigate('BluetoothScanScreen');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handlePlusButtonPress = async () => {
    const isEnabled = await BleManager.checkState();
    if (isEnabled === 'off') {
      const promptResult = await BleManager.enableBluetooth();
      if (promptResult) {
        console.log('Bluetooth enabled');
        requestLocationPermission();
      } else {
        console.log('Bluetooth not enabled');
      }
    } else {
      requestLocationPermission();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Connect to SafeBird</Text>
      <Text style={styles.subHeaderText}>
        Make sure you hold the button on the computer until it turns blue. When it turns
        blue, press the plus button on the phone.
      </Text>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
      </View>
      <TouchableOpacity style={styles.plusButton} onPress={handlePlusButtonPress}>
        <Text style={styles.plusButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 30,
    textAlign: 'center',
    color: '#000',
    marginTop: -10,
  },
  subHeaderText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
    marginHorizontal: 20,
    marginTop: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  plusButton: {
    backgroundColor: '#f5f5f5',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
  },
  plusButtonText: {
    color: '#000',
    fontSize: 30,
  },
});

export default SafeBirdDevicesScreen;
