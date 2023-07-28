import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import RegisterScreen from "../screens/RegisterScreen";



export default function AuthNavigator() {
    const AuthStack = createStackNavigator();
    return (
        <AuthStack.Navigator
            screenOptions={{
                headerMode: "screen",
                headerStyle: { elevation: 0, shadowOpacity: 0 ,backgroundColor: '#a15943',},
                headerTintColor: '#fff',
            }}
        >
            <AuthStack.Screen
                name="LoginScreen"
                component={LoginScreen}
                options={{ title: "Login" }}
            />
            <AuthStack.Screen
                name="RegisterScreen"
                options={{
                    headerLargeTitle: true,
                    title: "SignUp",
                }}
                component={RegisterScreen}
            />
            <AuthStack.Screen
                name="ForgotPasswordScreen"
                options={{
                    headerLargeTitle: true,
                    title: "Change Password",
                }}
                component={ForgotPasswordScreen}
            />
        </AuthStack.Navigator>
    );
}
