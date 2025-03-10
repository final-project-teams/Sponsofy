import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { showMessage } from 'react-native-flash-message';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/axios';
import { getTheme } from "../theme/theme";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignupScreen = ({ navigation, route }) => {
  const { role } = route.params; // Get role from navigation params
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [industry, setIndustry] = useState('');
  const [codeFiscal, setCodeFiscal] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const theme = getTheme(isDarkMode);

  // Validate password
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  // Handle password change
  const handlePasswordChange = (text) => {
    setPassword(text);
    if (!validatePassword(text)) {
      setPasswordError("Password must contain at least 8 characters, one uppercase letter, and one number");
    } else {
      setPasswordError("");
    }
  };

  // Validate passwords match
  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    if (!validatePassword(password)) {
      setPasswordError("Password must contain at least 8 characters, one uppercase letter, and one number");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Handle image picker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Handle signup
  const handleSignup = async () => {
    if (isSubmitting) return;
    
    // Validate passwords
    if (!validatePasswords()) {
      showMessage({
        message: "Validation Error",
        description: passwordError,
        type: "danger",
        icon: "auto",
      });
      return;
    }

    // Validate role-specific fields
    if (role === 'content_creator' && (!firstName || !lastName)) {
      showMessage({
        message: "Validation Error",
        description: "First name and last name are required",
        type: "danger",
        icon: "auto",
      });
      return;
    }

    if (role === 'company' && (!username || !industry || !codeFiscal)) {
      showMessage({
        message: "Validation Error",
        description: "Username, industry, and code fiscal are required",
        type: "danger",
        icon: "auto",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      
      // Common fields
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      
      // Role-specific fields
      if (role === 'content_creator') {
        formData.append('username', `${firstName} ${lastName}`);
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
      } else {
        formData.append('username', username);
        formData.append('industry', industry);
        formData.append('codeFiscal', codeFiscal);
      }

      // Add profile image if selected
      if (profileImage) {
        const file = {
          uri: profileImage,
          name: `profile-${Date.now()}.jpg`,
          type: 'image/jpeg',
        };
        formData.append('media', file);
      }

      const response = await api.post("/user/register", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        showMessage({
          message: "Success",
          description: "Registration successful!",
          type: "success",
          icon: "auto",
        });
        
        // Store token if returned
        if (response.data.accessToken) {
          await AsyncStorage.setItem('userToken', response.data.accessToken);
        }
        
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      showMessage({
        message: "Error",
        description: error.response?.data?.message || "Registration failed",
        type: "danger",
        icon: "auto",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>
      
      <Text style={styles.title}>Get Started With</Text>
      <Text style={styles.title}>Sponsofy</Text>
      
      {/* Profile Image Picker */}
      <View style={styles.imagePickerContainer}>
        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="camera" size={24} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </View>
      
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
      
      {/* Dynamic Fields Based on Role */}
      {role === 'content_creator' ? (
        <>
          {/* First Name and Last Name */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '48%' }}>
              <Text style={styles.inputLabel}>First Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor="#666"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
            </View>

            <View style={{ width: '48%' }}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor="#666"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>
          </View>
        </>
      ) : (
        <>
          {/* Industry and Code Fiscal */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '48%' }}>
              <Text style={styles.inputLabel}>Industry</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Industry"
                  placeholderTextColor="#666"
                  value={industry}
                  onChangeText={setIndustry}
                />
              </View>
            </View>

            <View style={{ width: '48%' }}>
              <Text style={styles.inputLabel}>Code Fiscal</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="document-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Code Fiscal"
                  placeholderTextColor="#666"
                  value={codeFiscal}
                  onChangeText={setCodeFiscal}
                />
              </View>
            </View>
          </View>

          {/* Username for Company */}
          <Text style={styles.inputLabel}>Username</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#666"
              value={username}
              onChangeText={setUsername}
            />
          </View>
        </>
      )}
      
      {/* Email */}
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
      
      {/* Password */}
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
      
      {/* Confirm Password */}
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
      
      {/* Password Error Message */}
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}
      
      {/* Continue Button */}
      <TouchableOpacity 
        style={[styles.continueButton, isSubmitting && styles.disabledButton]} 
        onPress={handleSignup}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.continueButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
      
      {/* Login Link */}
      <View style={styles.loginContainer}>
        <Text style={styles.alreadyAccountText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  imagePickerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
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
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
  },
  continueButton: {
    backgroundColor: '#8A2BE2',
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#6b21a8',
    opacity: 0.7,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: "bold",
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