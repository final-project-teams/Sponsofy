import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import api from '../config/axios'; // Import the axios instance
import { getTheme } from "../theme/theme";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false); // You can manage dark mode state here

  const theme = getTheme(isDarkMode); // Get the current theme

  // Handle traditional email/password login
  const handleLogin = async () => {
    try {
      const response = await api.post('/user/login', {
        email,
        password,
      });

      if (response.data) {
        // Save the token to AsyncStorage
        await AsyncStorage.setItem('userToken', response.data.token);

        Alert.alert('Success', 'Login successful!');
        navigation.navigate('Home'); // Navigate to the home screen
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'An error occurred during login');
      console.error(error);
    }
  };

  // Handle Google Sign-In
  // const handleGoogleSignIn = async () => {
  //   try {
  //     // Check if Google Play Services is available
  //     await GoogleSignin.hasPlayServices();

  //     // Sign in with Google
  //     const userInfo = await GoogleSignin.signIn();
  //     const { idToken } = userInfo;

  //     // Send the Google ID token to your backend for verification
  //     const response = await api.post('/user/google-auth', {
  //       token: idToken,
  //     });

  //     if (response.data) {
  //       // Save the token to AsyncStorage
  //       await AsyncStorage.setItem('userToken', response.data.token);

  //       Alert.alert('Success', 'Google Sign-In successful!');
  //       navigation.navigate('Home'); // Navigate to the home screen
  //     }
  //   } catch (error) {
  //     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
  //       Alert.alert('Error', 'Google Sign-In was cancelled');
  //     } else if (error.code === statusCodes.IN_PROGRESS) {
  //       Alert.alert('Error', 'Google Sign-In is already in progress');
  //     } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //       Alert.alert('Error', 'Play services not available or outdated');
  //     } else {
  //       Alert.alert('Error', 'Google Sign-In failed');
  //       console.error(error);
  //     }
  //   }
  // };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.inner}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Login</Text>

        {/* Email/Password Login */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
            placeholder="example@gmail.com"
            placeholderTextColor={theme.colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
            placeholder="xxxxxxxx"
            placeholderTextColor={theme.colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={handleLogin}>
          <Text style={[styles.buttonText, { color: theme.colors.white }]}>Login</Text>
        </TouchableOpacity>

        {/* Google Sign-In Button */}
        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: theme.colors.surface }]}
        
        >
          <Text style={[styles.googleButtonText, { color: theme.colors.text }]}>Sign in with Google</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={[styles.footerLink, { color: theme.colors.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
  },
});

export default LoginScreen;