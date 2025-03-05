"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import authService from "../services/authService"

const SocialAccountsScreen = () => {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false)

  const handleInstagramLogin = async () => {
    setLoading(true)
    try {
      const result = await authService.instagramLogin()
      if (result.success) {
        navigation.navigate("Home")
      } else {
        Alert.alert("Error", result.error || "Instagram login failed")
      }
    } catch (error) {
      Alert.alert("Error", "Instagram login failed: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleYoutubeLogin = async () => {
    setLoading(true)
    try {
      const result = await authService.youtubeLogin()
      if (result.success) {
        navigation.navigate("Home")
      } else {
        Alert.alert("Error", result.error || "YouTube login failed")
      }
    } catch (error) {
      Alert.alert("Error", "YouTube login failed: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#212e42", "#1a162e", "#371c43"]}
        start={{ x: 2, y: 0 }}
        end={{ x: 2, y: 1 }}
        style={styles.gradientBackground}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Choose an Account to Login</Text>

        <TouchableOpacity
          style={[styles.socialButton, styles.instagramButton]}
          onPress={handleInstagramLogin}
          disabled={loading}
        >
          <Ionicons name="logo-instagram" size={24} color="#fff" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Login with Instagram</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, styles.youtubeButton]}
          onPress={handleYoutubeLogin}
          disabled={loading}
        >
          <Ionicons name="logo-youtube" size={24} color="#fff" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Login with YouTube</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 40,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
  },
  instagramButton: {
    backgroundColor: "#E1306C",
  },
  youtubeButton: {
    backgroundColor: "#FF0000",
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loader: {
    marginTop: 20,
  },
})

export default SocialAccountsScreen

