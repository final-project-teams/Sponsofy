import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/axios'; // Import the axios instance
import { getTheme } from "../theme/theme";
import { Ionicons } from '@expo/vector-icons';


const LoginScreen = ({ navigation, route }) => {
  const { userType } = route.params || {};
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const theme = getTheme(isDarkMode);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      const response = await api.post("/user/login", {
        email,
        password,
      });

      if (response.data) {
        await AsyncStorage.setItem("userToken", response.data.token);
        await AsyncStorage.setItem("userRole", response.data.user.role);
        await AsyncStorage.setItem("userData", JSON.stringify(response.data.user));
        console.log("response.data.token",response.data.token)

        if (response.data.user.role === "content_creator") {
          navigation.navigate("Home");
        } else if (response.data.user.role === "company") {
          navigation.navigate("Home");
        } else {
          navigation.navigate("Home");
        }
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "An error occurred during login");
      console.error(error);
    }
  };

  const handleSocialLogin = () => {
    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>
      
      <Text style={styles.title}>Sign In To Sponsofy</Text>
      
      <Text style={styles.signInText}>sign in with</Text>
      
      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-instagram" size={20} color="white" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Instagram</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-google" size={20} color="white" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.inputLabel}>Email</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="example@gmail.com"
          placeholderTextColor="#666"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      
      <Text style={styles.inputLabel}>Password</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="xxxxxxxx"
          placeholderTextColor="#666"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons 
            name={showPassword ? "eye-outline" : "eye-off-outline"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.continueButton} onPress={handleLogin}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
      
      <View style={styles.signupContainer}>
        <Text style={styles.newToText}>new to Sponsofy? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  signInText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 5,
    padding: 10,
    width: '48%',
  },
  socialIcon: {
    marginRight: 8,
  },
  socialButtonText: {
    color: 'white',
    fontSize: 14,
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: 'white',
    paddingVertical: 12,
  },
  continueButton: {
    backgroundColor: '#8A2BE2', // Purple color
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  newToText: {
    color: '#666',
    fontSize: 14,
  },
  signUpText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen