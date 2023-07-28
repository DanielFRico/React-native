import React, {useEffect, useState} from "react";
import { Text, StyleSheet, View, TouchableOpacity, Image } from "react-native";
import logo from '../../assets/logo.png';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { doc, getDoc } from "firebase/firestore";


const StartScreen = ({ navigation }) => {


    return (
        <View style={styles.container}>

            <View style={styles.logoContainer}>
                <Image source={logo} style={styles.logo} />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate("SafeBirdDevicesScreen")}
                >
                    <Text style={styles.buttonText}>Pair Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate("HomeScreen")}
                >
                    <Text style={styles.buttonText}>Shop For Safebird</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    logoContainer: {
        marginTop: 50,
        marginBottom: 200,
        alignItems: "center",
    },
    logo: {
        width: 100,
        height: 100,
    },
    buttonContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    button: {
        backgroundColor: '#a15943',
        borderRadius: 5,
        width: 173,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default StartScreen;
