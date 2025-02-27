import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";

import FlashMessage from "react-native-flash-message"; // Import FlashMessage

import ChatScreen from "./src/screens/ChatScreen";
import VideoCallScreen from "./src/screens/VideoCallScreen";
import { darkColors, lightColors } from "./src/theme/theme";
const lightTheme = lightColors;
const Stack = createStackNavigator();
const darkTheme = darkColors;
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
      <FlashMessage position="top" />
    </NavigationContainer>
  );
};

export default App;
