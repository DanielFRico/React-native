import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import safebirdScreen from "../screens/SafebirdScreen";
import HomeScreen from "../screens/HomeScreen";


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
                name="safebirdScreen"
                component={safebirdScreen}
                options={{ title: "Safebird" }}
            />

        </HomeStack.Navigator>
    );
}