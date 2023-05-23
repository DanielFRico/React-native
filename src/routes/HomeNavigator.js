import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SafebirdScreen from "../screens/SafebirdScreen";
import HomeScreen from "../screens/HomeScreen";
import BluetoothScreen from "../screens/BluetoothScreen";


export default function HomeNavigator() {
    const HomeStack = createStackNavigator();
    return (
        <HomeStack.Navigator
            screenOptions={{
                headerMode: "screen",
                headerStyle: { elevation: 0, shadowOpacity: 0 },
            }}
        >
               <HomeStack.Screen
                name="HomeScreen"
                options={{
                    headerLargeTitle: false,
                    headerShown: false,
                    title: "Home Screen",
                }}
                component={HomeScreen}
            />
             <HomeStack.Screen
                name="SafebirdScreen"
                component={SafebirdScreen}
                options={{ title: "Safebird" }}
            />
            <HomeStack.Screen
                name="BluetoothScreen"
                component={BluetoothScreen}
                options={{ title: "Bluetooth connection" }}
            />

         
           
        </HomeStack.Navigator>
    );
}