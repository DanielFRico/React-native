import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import setting from "../../assets/settings.png";
import HomeScreen from "../screens/HomeScreen";


const HomeHeaderRightComponent = () => {
    const navigation = useNavigation();

    const onSettingsPress = () => {
        navigation.navigate('ProfileScreen');
    };

    return (
        <TouchableOpacity  style={{alignItems: 'flex-end', marginRight: 10, }}
                           onPress={onSettingsPress}
        >
            <Image source={setting} style={{height: 50,width: 50,}} />
        </TouchableOpacity>
    );
};


export default HomeHeaderRightComponent;
