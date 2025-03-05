import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// import ChatScreen from './src/screens/ChatScreen';
// import VideoCallScreen from './src/screens/VideoCallScreen';
import HomeScreen from './src/screens/homeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ContractDetail from './src/screens/ContractDetail';
import FlashMessage from 'react-native-flash-message'; // Import FlashMessage
import ProfileContent from './src/screens/ProfileContent';
import ChatScreen from './src/screens/ChatScreen';
import VideoCallScreen from './src/screens/VideoCallScreen';
import { darkColors, lightColors } from './src/theme/theme';
import PremiumScreen from './src/screens/PremiumScreen';
import SplashScreen from "./src/screens/SplashScreen"
import WelcomeScreen from "./src/screens/WelcomeScreen"
import UserTypeScreen from "./src/screens/UserTypeScreen"
import TermsScreen from "./src/screens/terms"
const lightTheme=lightColors
const Stack = createStackNavigator();
const darkTheme=darkColors
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Terms">
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ContractDetail" component={ContractDetail} />
        <Stack.Screen name="ProfileContent" component={ProfileContent} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="VideoCallScreen" component={VideoCallScreen} />
        <Stack.Screen name="PremiumScreen" component={PremiumScreen} />
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="UserType" component={UserTypeScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
      </Stack.Navigator>
      <FlashMessage position="top" />
    </NavigationContainer>
  );
  
};

export default App;