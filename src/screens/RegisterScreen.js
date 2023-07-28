
import React, { useState, createRef } from "react";
import {
    SafeAreaView,
    StyleSheet,
    TextInput,
    View,
    Text,
    Image,
    KeyboardAvoidingView,
    Keyboard,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { collection, addDoc } from "firebase/firestore";


import auth from '@react-native-firebase/auth';

import firestore from '@react-native-firebase/firestore';
import logo from "../../assets/logo.png";

const RegisterScreen = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [subscription, setSubscription ] = useState(false);

    const onFooterLinkPress = () => {
        navigation.navigate('LoginScreen')
    };

    const onRegisterPress = async () => {
        // if(email || password === ''){
        //     alert("Password or email are empty");
        //     return
        // }
        // if (password !== confirmPassword) {
        //     alert("Passwords don't match.");
        //     return
        // }
        try {
            // Create a user with email and password using Firebase Auth
            const { user } = await auth().createUserWithEmailAndPassword(email, password);
            // Get a reference to the Firestore collection
            const usersRef = firestore().collection('users');

            // Create a new user document with the user ID from Firebase Auth
            await usersRef.doc(user.uid).set({
                username: userName,
                email: email,
                subscription: subscription,
            });
            alert('User is created successfully!');
            navigation.navigate("LoginScreen");
            // Optionally, perform additional actions after the user document is created
        } catch (error) {
            alert(error)
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={{ flex: 1, width: '100%' }}
                keyboardShouldPersistTaps="always">
                <View style={styles.logoContainer}>
                    <Image source={logo} style={styles.logo} />
                </View>
                <TextInput
                    style={styles.input}
                    placeholder='Full Name'
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(text) => setUserName(text)}
                    value={userName}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder='E-mail'
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#aaaaaa"
                    secureTextEntry
                    placeholder='Password'
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#aaaaaa"
                    secureTextEntry
                    placeholder='Confirm Password'
                    onChangeText={(text) => setConfirmPassword(text)}
                    value={confirmPassword}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => onRegisterPress()}>
                    <Text style={styles.buttonTitle}>Create account</Text>
                </TouchableOpacity>
                <View style={styles.footerView}>
                    <Text style={styles.footerText}>Already got an account? <Text onPress={onFooterLinkPress} style={styles.footerLink}>Log in</Text></Text>
                </View>
            </ScrollView>
        </View>
    );
};
export default RegisterScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white'
    },
    title: {

    },
    input: {
        height: 48,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: 'white',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 30,
        marginRight: 30,
        paddingLeft: 16,
        borderWidth: 2,
        borderColor: '#a15943'
    },
    button: {
        backgroundColor: '#a15943',
        marginLeft: 30,
        marginRight: 30,
        marginTop: 20,
        height: 48,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: 'center'
    },
    buttonTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: "bold"
    },
    footerView: {
        flex: 1,
        alignItems: "center",
        marginTop: 20
    },
    footerText: {
        fontSize: 16,
        color: '#2e2e2d'
    },
    footerLink: {
        color: "#a15943",
        fontWeight: "bold",
        fontSize: 16
    },

    logoContainer: {
        marginTop: 50,
        marginBottom: 75,
        alignItems: "center",
    },
    logo: {
        width: 100,
        height: 100,
    },
});
