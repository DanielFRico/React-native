
import React, { useState, createRef } from "react";
import {
    SafeAreaView,
    StyleSheet,
    TextInput,
    View,
    Text,
    ScrollView,
    Image,
    Keyboard,
    TouchableOpacity,
    KeyboardAvoidingView,
} from "react-native";

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'
import logo from "../../assets/logo.png";



const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onLoginPress = () => {
        auth()
            .signInWithEmailAndPassword(email, password)
            .then((response) => {
                const uid = response.user.uid;
                const usersRef = firestore().collection('users');
                usersRef
                    .doc(uid)
                    .get()
                    .then(firestoreDocument => {
                        if (!firestoreDocument.exists) {
                            alert("User does not exist anymore.");
                            return;
                        }
                        const user = firestoreDocument.data();
                        navigation.navigate('Home', { screen: 'StartScreen' });
                    })
                    .catch(error => {
                        alert(error)
                    });
            })
            .catch(error => {
                alert(error)
            })
    };


    const onFooterLinkPress = () => {
        navigation.navigate('RegisterScreen')
    };

    const onChangePasswordPress = () => {
        navigation.navigate('ForgotPasswordScreen')
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image source={logo} style={styles.logo} />
            </View>
            <ScrollView
                style={{ flex: 1, width: '100%' }}
                keyboardShouldPersistTaps="always">
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
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => onLoginPress()}>
                    <Text style={styles.buttonTitle}>Log in</Text>
                </TouchableOpacity>
                <View style={styles.footerView}>
                    <Text style={styles.footerText}>Don't have an account? <Text onPress={onFooterLinkPress} style={styles.footerLink}>Sign up</Text></Text>
                    <Text onPress={onChangePasswordPress} style={styles.footerLink}>Forget password?</Text>
                </View>
            </ScrollView>
        </View>
    );
};
export default LoginScreen;

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
