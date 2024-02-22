import React, { useState } from 'react';
import {View, TextInput, Button, StyleSheet, Text, ScrollView, TouchableOpacity, Image} from 'react-native';

import auth from '@react-native-firebase/auth';
import logo from "../../assets/logo.png";

const ForgotPasswordScreen = ({ navigation }) => {

    const onFooterLinkPress = () => {
        navigation.navigate('LoginScreen')
    };

    const [email, setEmail] = useState('');

    const handleResetPassword = () => {
        auth().sendPasswordResetEmail(email)
            .then(() => {
                alert("Password reset email sent successfully");
            })
            .catch((error) => {
                alert(error)
            });
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
                    placeholder="Email"
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholderTextColor="#aaaaaa"
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleResetPassword}>
                    <Text style={styles.buttonTitle}>Reset Password</Text>
                </TouchableOpacity>
                <View style={styles.footerView}>
                    <Text onPress={onFooterLinkPress} style={styles.footerLink}>login</Text>
                </View>
            </ScrollView>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    button: {
        backgroundColor: '#a15943',
        marginLeft: 30,
        marginRight: 30,
        marginTop: 20,
        height: 48,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: 'center',

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

export default ForgotPasswordScreen;
