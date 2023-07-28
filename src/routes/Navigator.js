import { createStackNavigator } from "@react-navigation/stack";
import NavigationContainer from "@react-navigation/native/src/NavigationContainer";
import HomeNavigator from "./HomeNavigator";
import AuthNavigator from "./AuthNavigator";
import React from "react";

export default function NavStack(){



const Stack = createStackNavigator();
return (
    <NavigationContainer>
        <Stack.Navigator
            initialRouteName="Auth"
            screenOptions={{
                headerStyle: { elevation: 0, shadowOpacity: 0,  },
                headerBackTitleVisible: false,
                headerMode: "screen",
            }}
        >
           <Stack.Screen
                name="Auth"
                component={AuthNavigator}
                options={{ headerShown: false}}
            />

            <Stack.Screen
                name="Home"
                component={HomeNavigator}
                options={{ headerShown: false}}
            />


        </Stack.Navigator>
    </NavigationContainer>

    );
}
