import React, { useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import BleManager from 'react-native-ble-manager';
import { useNavigation } from '@react-navigation/native';

const SafeBirdDevicesScreen = () => {
const navigation = useNavigation();

useEffect(() => {
BleManager.start({ showAlert: false }).then(() => {
console.log('BleManager initialized');
});
}, []);

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

const handlePlusButtonPress = () => {
// Handle logic for the plus button press
};

return (
<View style={styles.container}>
<Text style={styles.headerText}>Connect to SafeBird</Text>
<Text style={styles.subHeaderText}>
Make sure you hold the button on the computer until it turns blue. When it turns
blue press the plus button on the phone.
</Text>
<View style={styles.logoContainer}>
<Image source={require('../../assets/logo.png')} style={styles.logoImage} />
</View>
<TouchableOpacity style={styles.plusButton} onPress={startScan}>
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
buttonStyle: {
backgroundColor: '#f5f5f5',
padding: 10,
borderRadius: 5,
marginTop: 20,
},
buttonTextStyle: {
color: '#000',
fontSize: 16,
textAlign: 'center',
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


