import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyADtAo7RHPpdHo-6bzmpKN6toG8clFymxo",
    authDomain: "ebikesaivvyapp.firebaseapp.com",
    projectId: "ebikesaivvyapp",
    storageBucket: "ebikesaivvyapp.appspot.com",
    messagingSenderId: "1098728165996",
    appId: "1:1098728165996:web:d265518e3a38adbd5f7e49",
    measurementId: "G-QLBYPT9BMR"
};

const firebase = initializeApp(firebaseConfig);
export default firebase;

const db = getFirestore(firebase);


export const firestoreDB = getFirestore();
export const auth = getAuth();
