import React, {useEffect, useState} from "react";
import { Text, StyleSheet, View, TouchableOpacity, Image } from "react-native";
import logo from '../../assets/logo.png';
import setting from '../../assets/settings.png';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { doc, getDoc } from "firebase/firestore";

import { Ionicons } from "react-vector-icons";

const HomeScreen = ({ navigation }) => {

  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [disabled,setDisabled]= useState(true);
  const [subscribed, setSubscribed] = useState(false);

  // Fetch the current user data from Firestore when the component mounts
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = auth().currentUser;
      if (user) {
        setCurrentUser(user);
        // Check the user's username from Firestore
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          setUsername(userDoc.data().username);
        }
        const userDocRef = firestore().collection('users').doc(user.uid);
        // Subscribe to real-time updates for the user's document
        const unsubscribe = userDocRef.onSnapshot((docSnapshot) => {
          if (docSnapshot.exists) {
            setSubscribed(docSnapshot.data().subscription);
          }
        });
      }
    };
    fetchCurrentUser();
  }, []);






  return (

    <View style={styles.container}>

      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} />
      </View>
      <View>
        <Text style={styles.textStyle}>Welcome {username},</Text>
        <Text style={styles.textStyle}>you are {subscribed ? 'subscribed' : 'not subscribed'}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity  style={styles.button}
                           onPress={() => navigation.navigate("FreeSafebirdScreen")}
        >
          <Text style={styles.buttonText}>Start Ride</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
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
    marginTop: 20,
    padding: 20,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: 'center'
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerbar:{
    backgroundColor: '#a15943',
    height: 50,
    width: "100%",

  },
  textStyle:{
    fontSize: 25,
    color: '#2e2e2d'
  },
  settings:{
    alignItems: 'flex-end',
    marginRight: 10,
    top: 10,
  },
  setting:{
    height: 50,
    width: 50,
  },



});

export default HomeScreen;
