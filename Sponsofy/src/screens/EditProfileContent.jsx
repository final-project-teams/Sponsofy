import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import api from "../config/axios"; // Using your original import

const EditProfileContent = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const userId = route.params?.userId; // Get userId from navigation params


  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    pricing: "",
    portfolio_links: "",
    location: "",
    category: "",
  });


  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/content-creator/${userId}`);
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        Alert.alert("Error", "Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);



  // Handle input changes
  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };


  
  // Save updated profile data
  const saveProfile = async () => {
    try {
      setLoading(true);
      const response = await api.put(`/content-creator/${userId}`, profileData);
      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack(); // Go back to the profile screen after saving
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* First Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={profileData.first_name}
          onChangeText={(text) => handleInputChange("first_name", text)}
          placeholder="Enter your first name"
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
        />
      </View>

      {/* Bio */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={profileData.bio}
          onChangeText={(text) => handleInputChange("bio", text)}
          placeholder="Enter your bio"
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
          placeholder="Enter your pricing"
        />
      </View>

      {/* Portfolio Links */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Portfolio Links</Text>
        <TextInput
          style={styles.input}
          value={profileData.portfolio_links}
          onChangeText={(text) => handleInputChange("portfolio_links", text)}
          placeholder="Enter your portfolio links"
        />
      </View>

      {/* Location */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={profileData.location}
          onChangeText={(text) => handleInputChange("location", text)}
          placeholder="Enter your location"
        />
      </View>

      {/* Category */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={profileData.category}
          onChangeText={(text) => handleInputChange("category", text)}
          placeholder="Enter your category"
        />
      </View>

      {/* Edit Profile Picture Button */}
      <TouchableOpacity
        style={styles.editPictureButton}
        onPress={() => navigation.navigate("EditProfilePicture", { userId })}
      >
        <Text style={styles.editPictureButtonText}>Edit Profile Picture</Text>
      </TouchableOpacity>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "white",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  editPictureButton: {
    backgroundColor: "#8A2BE2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  editPictureButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#8A2BE2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default EditProfileContent;