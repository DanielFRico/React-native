import React, {useEffect, useState} from 'react';
import {View, TextInput, Button, ScrollView, TouchableOpacity, Text, StyleSheet, Image} from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import logo from "../../assets/logo.png";

const ProfileScreen = ({ navigation }) =>{
    const [newUsername, setNewUsername] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');


    useEffect(() => {
        const fetchCurrentUser = async () => {
            const user = auth().currentUser;
            if (user) {
                setCurrentUser(user);
                // Check the user's subscription status from Firestore
                const userDoc = await firestore().collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    setSubscribed(userDoc.data().subscription);
                    setNewUsername(userDoc.data().username);
                }
            }
        };
        fetchCurrentUser();
    }, []);


    const toggleSubscription = async () => {
        if (currentUser) {
            const userId = currentUser.uid;
            const newSubscriptionStatus = !subscribed;

            try {
                // Update Firestore with the new subscription status
                await firestore().collection('users').doc(userId).update({
                    subscription: newSubscriptionStatus,
                });
                setSubscribed(newSubscriptionStatus);
                alert('Subscription status updated successfully!');
            } catch (error) {
                console.error('Error updating subscription:', error);
            }
        }
    };

    const updateUsername = async () => {
        if (currentUser && newUsername.trim() !== '') {
            const userId = currentUser.uid;

            try {
                // Update Firestore with the new username
                await firestore().collection('users').doc(userId).update({
                    username: newUsername,
                });
                alert('Username updated successfully!');
            } catch (error) {
                console.error('Error updating username:', error);
            }
        }
    };


    const signOut = () => {
        auth().signOut().then(() => {
            navigation.navigate('LoginScreen')
        })
            .catch((error) => {
                alert(error)
            });
    };


    const handlePasswordChange = () => {
        const user = auth().currentUser;
        const credential = auth.EmailAuthProvider.credential(
            user.email,
            password
        );

        user.reauthenticateWithCredential(credential)
            .then(() => {
                user.updatePassword(newPassword)
                    .then(() => {
                        alert("Password updated successfully");
                    })
                    .catch((error) => {
                        alert(error)
                    });
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
                    placeholder='Full Name'
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(text) => setNewUsername(text)}
                    value={newUsername}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={updateUsername}>
                    <Text style={styles.buttonTitle}>Change name</Text>
                </TouchableOpacity>
                <TextInput
                    placeholder="Current password"
                    style={styles.input}
                    secureTextEntry={true}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder="New password"
                    style={styles.input}
                    secureTextEntry={true}
                    onChangeText={(text) => setNewPassword(text)}
                    value={newPassword}
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    style={styles.button1}
                    onPress={handlePasswordChange}>
                    <Text style={styles.buttonTitle}>Change Password</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button1}  onPress={toggleSubscription} >
                    <Text style={styles.buttonTitle}>{subscribed ? 'Unsubscribe' : 'Subscribe'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button1}
                    onPress={() => signOut()}>
                    <Text style={styles.buttonTitle}>Log out</Text>
                </TouchableOpacity>
            </ScrollView>

        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white'
    },
    title: {

    },
    logoContainer: {
        marginTop: 50,
        marginBottom: 50,
        alignItems: "center",
    },
    logo: {
        width: 100,
        height: 100,
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
        height: 48,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: 'center'
    },

    button1: {
        backgroundColor: '#a15943',
        marginLeft: 30,
        marginRight: 30,
        height: 48,
        marginBottom: 10,
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
    }

});
