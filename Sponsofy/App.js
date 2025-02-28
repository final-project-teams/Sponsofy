import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import FlashMessage from 'react-native-flash-message';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

const Stack = createStackNavigator();

// Configure Google Sign-In
// GoogleSignin.configure({
//     webClientId: "346617996333-e4ven3pmerrbdistl3m9pfh8u3959cj5.apps.googleusercontent.com", // Replace with your actual web client ID
//     offlineAccess: true, // Optional: If you need to request offline access
// });

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