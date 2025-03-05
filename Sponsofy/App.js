import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// import ChatScreen from './src/screens/ChatScreen';
// import VideoCallScreen from './src/screens/VideoCallScreen';
import HomeScreen from './src/screens/homeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

import FlashMessage from "react-native-flash-message"; // Import FlashMessage

import ChatScreen from "./src/screens/ChatScreen";
import VideoCallScreen from "./src/screens/VideoCallScreen";
import { ThemeProvider } from "./src/theme/ThemeContext"; // Make sure this import is correct
import { darkColors, lightColors } from "./src/theme/theme";
const lightTheme = lightColors;
const Stack = createStackNavigator();
const darkTheme = darkColors;

import AddDeal from "./src/screens/AddDeal";

const App = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="AddDeal">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Signup" 
            component={SignupScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AddDeal" 
            component={AddDeal} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="VideoCall" 
            component={VideoCallScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
        <FlashMessage position="top" />
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
