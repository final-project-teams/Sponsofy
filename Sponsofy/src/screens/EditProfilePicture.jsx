import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Using expo-image-picker
import api from "../config/axios"; // Using your original import

const EditProfileContent = ({ navigation, route }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const userId = route.params?.userId; // Get userId from navigation params

  // Request permissions for accessing the photo library
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Sorry, we need camera roll permissions to make this work!"
        );
      }
    })();
  }, []);

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow photos
        allowsEditing: true, // Allow cropping
        aspect: [1, 1], // Square aspect ratio
        quality: 1, // Highest quality
      });

      if (!result.canceled) {
        const source = { uri: result.assets[0].uri }; // Access the first selected image
        setImage(source);
      }
    } catch (error) {
      console.log("ImagePicker Error: ", error);
      Alert.alert("Error", "Failed to pick an image. Please try again.");
    }
  };

  const uploadImage = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image first.");
      return;
    }
  
    if (!userId) {
      Alert.alert("Error", "User ID is missing.");
      return;
    }
  
    setLoading(true); // Start loading
  
    // Create form data
    const formData = new FormData();
  
    // Get file extension
    const uriParts = image.uri.split(".");
    const fileType = uriParts[uriParts.length - 1];
  
    // Append the image file with correct format
    formData.append("profilePicture", {
      uri: image.uri,
      name: `profile-picture.${fileType}`,
      type: `image/${fileType}`,
    });
  
    // Append userId as a string
    formData.append("userId", userId.toString());
  
    try {
      console.log("Uploading image with formData:", formData);
  
      const response = await api.post(
        "/user/upload-profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      console.log("Upload response:", response.data);
      Alert.alert("Success", "Profile picture uploaded successfully");
      navigation.goBack(); // Go back to the profile screen after upload
    } catch (error) {
      console.error("Upload Error:", error);
      console.error(
        "Error details:",
        error.response ? error.response.data : error.message
      );
      Alert.alert(
        "Error",
        "Failed to upload profile picture. Please try again."
      );
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={selectImage} style={styles.button}>
        <Text style={styles.buttonText}>Select Image</Text>
      </TouchableOpacity>

      {image && <Image source={image} style={styles.image} />}

      <TouchableOpacity
        onPress={uploadImage}
        style={[styles.button, loading && styles.disabledButton]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Upload Image</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  button: {
    backgroundColor: "#8A2BE2",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#555", // Change button color when disabled
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginVertical: 20,
  },
});

export default EditProfileContent;
