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
import SocialAccountsScreen from "./src/screens/SocialAccountsScreen"
import CompanyProfileScreen from './src/screens/CompanyProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import DealsScreen from './src/screens/DealsScreen';
import ContractsScreen from './src/screens/ContractsScreen';
import { ThemeProvider } from './src/theme/ThemeContext';
import { View, Text } from 'react-native';

// Create a placeholder component for Notifications
const NotificationsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
    <Text style={{ color: '#fff', fontSize: 18 }}>Notifications Coming Soon</Text>
  </View>
);

const Stack = createStackNavigator();

const App = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="CompanyProfile">
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="UserType" component={UserTypeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SocialAccounts" component={SocialAccountsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ProfileContent" component={ProfileContent} options={{ headerShown: false }} />
          <Stack.Screen name="PremiumScreen" component={PremiumScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ContractDetail" component={ContractDetail} options={{ headerShown: false }} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
          <Stack.Screen name="VideoCallScreen" component={VideoCallScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Deals" component={DealsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Contracts" component={ContractsScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
        <FlashMessage position="top" />
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;