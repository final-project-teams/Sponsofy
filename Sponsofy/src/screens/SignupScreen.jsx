import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { showMessage } from 'react-native-flash-message';
import api from '../config/axios'; // Import the axios instance
import { getTheme } from "../theme/theme";
import { Ionicons } from '@expo/vector-icons';

const SignupScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true); // Set dark mode to true by default
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const theme = getTheme(isDarkMode); // Get the current theme

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (!validatePassword(text)) {
      setPasswordError('Password must contain at least 8 characters, one uppercase letter, and one number');
    } else {
      setPasswordError('');
    }
  };

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (!validatePassword(password)) {
      setPasswordError('Password must contain at least 8 characters, one uppercase letter, and one number');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSignup = async () => {
    if (!validatePasswords()) {
      showMessage({
        message: 'Validation Error',
        description: passwordError,
        type: 'danger',
        icon: 'auto',
      });
      return;
    }

    try {
      const response = await api.post('/user/register', {
        username,
        email,
        password,
      });

      if (response.data) {
        showMessage({
          message: 'Success',
          description: 'Registration successful!',
          type: 'success',
          icon: 'auto',
        });
        navigation.navigate('Login');
      }
    } catch (error) {
      showMessage({
        message: 'Error',
        description: error.response?.data?.message || 'Registration failed',
        type: 'danger',
        icon: 'auto',
      });
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>
      
      <Text style={styles.title}>Get Started With</Text>
      <Text style={styles.title}>Sponsofy</Text>
      
      <Text style={styles.signupText}>sign up with</Text>
      
      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <View style={styles.instagramIconContainer}>
            <Ionicons name="logo-instagram" size={20} color="white" />
          </View>
          <Text style={styles.socialButtonText}>Instagram</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.socialButton}>
          <View style={styles.googleIconContainer}>
            <Ionicons name="logo-google" size={20} color="white" />
          </View>
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.inputLabel}>Username</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="username..."
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
        />
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
          onChangeText={handlePasswordChange}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons 
            name={showPassword ? "eye-outline" : "eye-off-outline"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.inputLabel}>Confirm Password</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="xxxxxxxx"
          placeholderTextColor="#666"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons 
            name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.continueButton} onPress={handleSignup}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
      
      <View style={styles.loginContainer}>
        <Text style={styles.alreadyAccountText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Login</Text>
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
    marginTop: 15,
    marginBottom: 15,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signupText: {
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
  instagramIconContainer: {
    marginRight: 8,
  },
  googleIconContainer: {
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
    marginTop: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  alreadyAccountText: {
    color: '#666',
    fontSize: 14,
  },
  loginText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SignupScreen;