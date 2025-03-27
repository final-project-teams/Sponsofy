"use client"

import React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../config/axios"

const EditProfileContent = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const userId = route.params?.userId // Get userId from navigation params

  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    pricing: "",
    portfolio_links: "",
    location: "",
    category: "",
    pronouns: "", // Added this field
  })

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const token = await AsyncStorage.getItem("userToken")

        if (!token) {
          Alert.alert("Error", "You need to be logged in to edit your profile.")
          navigation.goBack()
          return
        }

        const response = await api.get("/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const profile = response.data.user.profile

        // Set the profile data from response
        setProfileData({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          bio: profile.bio || "",
          pricing: profile.pricing || "",
          portfolio_links: profile.portfolio_links || "",
          location: profile.location || "",
          category: profile.category || "",
          pronouns: profile.pronouns || "",
        })
      } catch (error) {
        console.error("Error fetching user profile:", error)
        Alert.alert("Error", "Failed to fetch profile data.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [userId])

  // Handle input changes
  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  // Save updated profile data
  const saveProfile = async () => {
    try {
      setSaving(true)
      const token = await AsyncStorage.getItem("userToken")

      if (!token) {
        Alert.alert("Error", "You need to be logged in to update your profile.")
        return
      }

      // Create form data object
      const formData = new FormData()

      // Append all form fields
      Object.keys(profileData).forEach((key) => {
        if (profileData[key] !== undefined && profileData[key] !== null) {
          formData.append(key, profileData[key])
        }
      })

      // Make API call to update profile
      const response = await api.put(`/user/content-creator/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      Alert.alert("Success", "Profile updated successfully!")

      // Navigate back to ProfileContent
      navigation.navigate("ProfileContent")
    } catch (error) {
      console.error("Error updating profile:", error)
      Alert.alert("Error", "Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A2BE2" />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={profileData.first_name}
                onChangeText={(text) => handleInputChange("first_name", text)}
                placeholder="Enter your first name"
                placeholderTextColor="#666"
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={profileData.last_name}
                onChangeText={(text) => handleInputChange("last_name", text)}
                placeholder="Enter your last name"
                placeholderTextColor="#666"
              />
            </View>

            {/* Pronouns */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Pronouns</Text>
              <TextInput
                style={styles.input}
                value={profileData.pronouns}
                onChangeText={(text) => handleInputChange("pronouns", text)}
                placeholder="e.g., he/him, she/her, they/them"
                placeholderTextColor="#666"
              />
            </View>

            {/* Bio */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, { height: 120, textAlignVertical: "top" }]}
                value={profileData.bio}
                onChangeText={(text) => handleInputChange("bio", text)}
                placeholder="Tell others about yourself"
                placeholderTextColor="#666"
                multiline
              />
            </View>

            {/* Pricing */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Pricing</Text>
              <TextInput
                style={styles.input}
                value={profileData.pricing}
                onChangeText={(text) => handleInputChange("pricing", text)}
                placeholder="Your rate for collaborations"
                placeholderTextColor="#666"
              />
            </View>

            {/* Category */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={profileData.category}
                onChangeText={(text) => handleInputChange("category", text)}
                placeholder="e.g., Fashion, Tech, Food"
                placeholderTextColor="#666"
              />
            </View>

            {/* Location */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={profileData.location}
                onChangeText={(text) => handleInputChange("location", text)}
                placeholder="Your location"
                placeholderTextColor="#666"
              />
            </View>

            {/* Portfolio Links */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Portfolio Links</Text>
              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                value={profileData.portfolio_links}
                onChangeText={(text) => handleInputChange("portfolio_links", text)}
                placeholder="Comma-separated links to your work"
                placeholderTextColor="#666"
                multiline
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={saveProfile} disabled={saving}>
              {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "white",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  saveButton: {
    backgroundColor: "#8A2BE2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default EditProfileContent

