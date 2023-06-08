import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SafebirdScreen from "../screens/SafebirdScreen";
import HomeScreen from "../screens/HomeScreen";
import BluetoothScreen from "../screens/BluetoothScreen";
import BluetoothScanScreen from "../screens/BluetoothScanScreen";
import ChooseSafeBirdScreen from "../screens/ChooseSafeBirdScreen";
import SafeBirdDevicesScreen from "../screens/SafeBirdDevicesScreen";
import ConnectionScreen from "../screens/ConnectionScreen"; 


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
      <HomeStack.Screen
        name="BluetoothScanScreen"
        component={BluetoothScanScreen}
        options={{ title: "Scan Bluetooth Devices" }}
      />
      <HomeStack.Screen
        name="ChooseSafeBirdScreen"
        component={ChooseSafeBirdScreen}
        options={{ title: "Choose SafeBird" }}
      />
      <HomeStack.Screen
        name="ConnectionScreen"
        component={ConnectionScreen}
        options={{ title: "Connection" }}
      />
      <HomeStack.Screen
        name="SafeBirdDevicesScreen"
        component={SafeBirdDevicesScreen}
        options={{ title: "SafeBird Devices" }}
      />
    </HomeStack.Navigator>
  );
}
