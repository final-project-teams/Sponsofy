import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { showMessage } from "react-native-flash-message";
import Icon from "react-native-vector-icons/FontAwesome";
import api from "../config/axios";
import { getTheme } from "../theme/theme";

const SignupScreen = ({ navigation, route }) => {
  const { userType, role } = route.params || {}; // Access userType and role from navigation params
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const theme = getTheme(isDarkMode);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (!validatePassword(text)) {
      setPasswordError("Password must contain at least 8 characters, one uppercase letter, and one number");
    } else {
      setPasswordError("");
    }
  };

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

  const handleSignup = async () => {
    if (!validatePasswords()) {
      showMessage({
        message: "Validation Error",
        description: passwordError,
        type: "danger",
        icon: "auto",
      });
      return;
    }

    try {
      const response = await api.post("/user/register", {
        username,
        email,
        password,
        role: role || "content_creator", // Default to 'content_creator' if role is not provided
      });

      if (response.data) {
        showMessage({
          message: "Success",
          description: "Registration successful!",
          type: "success",
          icon: "auto",
        });
        navigation.navigate("Login"); // Navigate to Login screen after successful registration
      }
    } catch (error) {
      showMessage({
        message: "Error",
        description: error.response?.data?.message || "Registration failed",
        type: "danger",
        icon: "auto",
      });
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContent}
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>Get Started With Sponsofy</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Sign up as {userType}</Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Username</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
            placeholder="username..."
            placeholderTextColor={theme.colors.textSecondary}
            value={username}
            onChangeText={setUsername}
          />
        </View>

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
          <View style={[styles.passwordInputContainer, { backgroundColor: theme.colors.surface }]}>
            <TextInput
              style={[styles.input, { color: theme.colors.text, flex: 1 }]}
              placeholder="xxxxxxxx"
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Icon name={showPassword ? "eye-slash" : "eye"} size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.passwordHint, { color: theme.colors.textSecondary }]}>
            Password must contain:
            <Text style={validatePassword(password) ? styles.valid : styles.invalid}> 8+ characters</Text>
            <Text style={/[A-Z]/.test(password) ? styles.valid : styles.invalid}>, one uppercase</Text>
            <Text style={/\d/.test(password) ? styles.valid : styles.invalid}>, one number</Text>
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Confirm Password</Text>
          <View style={[styles.passwordInputContainer, { backgroundColor: theme.colors.surface }]}>
            <TextInput
              style={[styles.input, { color: theme.colors.text, flex: 1 }]}
              placeholder="xxxxxxxx"
              placeholderTextColor={theme.colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Icon name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {passwordError ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{passwordError}</Text> : null}

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={handleSignup}>
          <Text style={[styles.buttonText, { color: theme.colors.white }]}>Continue</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.footerLink, { color: theme.colors.primary }]}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#999999",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingRight: 10,
  },
  input: {
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  passwordHint: {
    color: "#999999",
    fontSize: 12,
    marginTop: 5,
  },
  valid: {
    color: "#4CAF50",
  },
  invalid: {
    color: "#FF6B6B",
  },
  button: {
    backgroundColor: "#8B5CF6",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#999999",
    fontSize: 14,
  },
  footerLink: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
});

export default SignupScreen;