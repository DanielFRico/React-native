import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ChooseSafeBirdScreen = ({ route, navigation }) => {
  const { discoveredDevices } = route.params;

  // Filter the devices for isConnectable: true and with a name
  const connectableDevices = discoveredDevices.filter(
    device => device.advertising.isConnectable && device.name
  );

  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const handleDevicePress = (deviceId) => {
    // Handle logic when a device is pressed
    setSelectedDeviceId(deviceId);
  };

  const handleContinuePress = () => {
    // Handle logic when the continue text is pressed
    if (selectedDeviceId) {
      const selectedDevice = connectableDevices.find(device => device.id === selectedDeviceId);
      if (selectedDevice) {
        const deviceName = selectedDevice.name;
        navigation.navigate('ConnectionScreen', { deviceName });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Choose SafeBird Device</Text>
      <Text style={styles.subHeaderText}>
        There are more than one SafeBird devices in this area. Press on your SafeBird device and press "Continue".
      </Text>
      <View style={styles.devicesContainer}>
        {connectableDevices.map(device => (
          <TouchableOpacity
            key={device.id}
            style={[
              styles.deviceItem,
              selectedDeviceId === device.id && styles.selectedDeviceItem,
            ]}
            onPress={() => handleDevicePress(device.id)}
          >
            <Text style={styles.deviceText}>{device.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.continueText} onPress={handleContinuePress}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
      color: '#2e2e2d',
  },
  subHeaderText: {
    fontSize: 16,
    textAlign: 'center',
      color: '#2e2e2d',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  devicesContainer: {
    backgroundColor: 'white',
    width: '80%',
    padding: 10,
    borderRadius: 5,
    marginBottom: 50,
    marginTop: 20,
    minHeight: 200,
      borderWidth: 2,
      borderColor: '#a15943'
  },
  deviceItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#a15943',
  },
  selectedDeviceItem: {
      color: 'white',
    backgroundColor: '#a15943',
  },
  deviceText: {
    fontSize: 16,
      color: '#a15943',
  },
  continueText: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  continueButtonText: {
      color: '#a15943',
    fontSize: 16,
    textDecorationLine: 'none',
  },
});

export default ChooseSafeBirdScreen;
