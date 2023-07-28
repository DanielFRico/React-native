import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SafebirdScreen from "../screens/SafebirdScreen";
import HomeScreen from "../screens/HomeScreen";
import BluetoothScanScreen from "../screens/BluetoothScanScreen";
import ChooseSafeBirdScreen from "../screens/ChooseSafeBirdScreen";
import SafeBirdDevicesScreen from "../screens/SafeBirdDevicesScreen";
import ConnectionScreen from "../screens/ConnectionScreen";
import FreeSafebirdScreen from "../screens/FreeSafebirdScreen";
import ProfileScreen from "../screens/ProfileScreen";
import StartScreen from "../screens/StartScreen";
import HomeHeaderRightComponent from "../compontents/HomeHeaderRightComponent"

export default function HomeNavigator() {
  const HomeStack = createStackNavigator();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerMode: "screen",
        headerStyle: { elevation: 0, shadowOpacity: 0, backgroundColor: '#a15943',},
        headerTintColor: '#fff',
      }}
    >
      <HomeStack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={({ navigation }) => ({
            headerLargeTitle: false,
            headerLeft: null,
            title: 'Home',
            headerRight: () => <HomeHeaderRightComponent navigation={navigation} />,
          })}
      />
        <HomeStack.Screen
            name="FreeSafebirdScreen"
            component={FreeSafebirdScreen}
            options={{ title: "Free Safebird" }}
        />
      <HomeStack.Screen
        name="SafebirdScreen"
        component={SafebirdScreen}
        options={{ title: "Safebird" }}
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
      <HomeStack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{ title: "Profile" }}
      />
      <HomeStack.Screen
          name="StartScreen"
          component={StartScreen}
          options={{ headerShown: false, }}
      />
    </HomeStack.Navigator>
  );
}
