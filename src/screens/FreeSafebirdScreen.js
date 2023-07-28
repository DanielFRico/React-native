import React from "react";
import { Text, StyleSheet, View, TouchableOpacity, Image } from "react-native";
import otherBiker from '../../assets/otherBiker.png';

const FreeSafebirdScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.OtherBikerContainer}>
                <Image source={otherBiker} style={styles.otherbiker} />
            </View>
            <View style={styles.bikerContainer}>
                <Image source={otherBiker} style={styles.biker} />
            </View>
            <View style={styles.containerLines}>
                <View style={styles.leftLine}>
                </View>
                <View style={styles.rightLine}>
                </View>
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
    OtherBikerContainer:{
        top: 100,
        width: '100%',
        height: 3,
        backgroundColor: 'black',
        alignItems: "center",
        justifyContent: "center",
    },
    bikerContainer: {
        position: 'absolute',
        width: '100%',
        height: 50,
        backgroundColor: '#FFA500',
        alignItems: "center",
        justifyContent: "center",

    },
    biker: {
        justifyContent: "center",
        alignItems: "center",
        width: 30,
        height: 40,


    },
    otherbiker: {
        justifyContent: "center",
        alignItems: "center",
        width: 30,
        height: 40,
        backgroundColor: "#fff",

    },
    containerLines:{

        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: 'row',
        width: 30
    },
    leftLine:{
        marginRight: 15,
        width: 3,
        backgroundColor: 'black',
        height: '100%'
    },
    rightLine:{
        marginLeft: 15,
        width: 3,
        height: '100%',
        backgroundColor: 'black',
    }


});

export default FreeSafebirdScreen;
