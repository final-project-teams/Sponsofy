"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
  FlatList,
} from "react-native";
import { Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../config/axios";

// Get screen dimensions
const { width } = Dimensions.get("window");

// Custom number picker component
const NumberScrollPicker = ({ value, onChange, max, label, color }) => {
  const valueStr = value.toString().padStart(7, "0");
  const digits = valueStr.split("");

  const generateIncrements = (position) => {
    const increment = Math.pow(10, 6 - position);
    return {
      increment,
      decrement: increment,
    };
  };

  const handleIncrement = (position) => {
    const { increment } = generateIncrements(position);
    const newValue = Math.min(value + increment, max);
    onChange(newValue);
  };

  const handleDecrement = (position) => {
    const { decrement } = generateIncrements(position);
    const newValue = Math.max(value - decrement, 0);
    onChange(newValue);
  };

  return (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <View style={styles.valueContainer}>
        {digits.map((digit, index) => (
          <View key={index} style={styles.digitContainer}>
            <TouchableOpacity
              style={[styles.arrowButton, { backgroundColor: color }]}
              onPress={() => handleIncrement(index)}
              disabled={value + generateIncrements(index).increment > max}
            >
              <Feather name="chevron-up" size={20} color="white" />
            </TouchableOpacity>
            <View style={styles.digitDisplay}>
              <Text style={styles.digitText}>{digit}</Text>
            </View>
            <TouchableOpacity
              style={[styles.arrowButton, { backgroundColor: color }]}
              onPress={() => handleDecrement(index)}
              disabled={value - generateIncrements(index).decrement < 0}
            >
              <Feather name="chevron-down" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

// Media link item component
const MediaLinkItem = ({ item, onDelete, color }) => {
  return (
    <View style={styles.mediaLinkItem}>
      <View style={styles.mediaLinkContent}>
        <Feather name="link" size={18} color={color} style={styles.mediaLinkIcon} />
        <Text style={styles.mediaLinkUrl} numberOfLines={1} ellipsizeMode="middle">
          {item.file_url}
        </Text>
      </View>
      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteButton}>
        <Feather name="trash-2" size={18} color="#FF5555" />
      </TouchableOpacity>
    </View>
  );
};

const SocialMediaStats = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { platform } = route.params;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [socialMediaData, setSocialMediaData] = useState({
    audience: "",
    views: 0,
    likes: 0,
    followers: 0,
  });
  const [mediaLink, setMediaLink] = useState("");
  const [mediaLinks, setMediaLinks] = useState([]);

  // Maximum values for each metric
  const MAX_FOLLOWERS = 10000000; // 10 million
  const MAX_LIKES = 500000000; // 500 million
  const MAX_VIEWS = 1000000000; // 1 billion

  // Platform colors and icons
  const platformConfig = {
    instagram: {
      color: "#E1306C",
      icon: "instagram",
      iconFamily: "FontAwesome",
      name: "Instagram",
    },
    youtube: {
      color: "#FF0000",
      icon: "youtube",
      iconFamily: "FontAwesome",
      name: "YouTube",
    },
    tiktok: {
      color: "#000000",
      icon: "tiktok",
      iconFamily: "FontAwesome5",
      name: "TikTok",
    },
    facebook: {
      color: "#1877F2",
      icon: "facebook",
      iconFamily: "FontAwesome",
      name: "Facebook",
    },
  };

  const config = platformConfig[platform];

  // Fetch user profile and platform data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (token) {
        const response = await api.get("/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserProfile(response.data.user);

        // Fetch social media stats for the specific platform
        const statsResponse = await api.get(`/user/${response.data.user.id}/social-media`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Find platform-specific data if it exists
        const platformData = statsResponse.data.stats.find((item) => item.platform === platform && 
          (item.file_format !== 'link'));

        if (platformData) {
          setSocialMediaData({
            audience: platformData.audience || "",
            views: platformData.views || 0,
            likes: platformData.likes || 0,
            followers: platformData.followers || 0,
          });
        }

        // Filter out media links for this platform
        const links = statsResponse.data.stats.filter(
          (item) => item.platform === platform && item.file_format === 'link'
        );
        setMediaLinks(links);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Call API to update platform stats
  const handleUpdateStats = async () => {
    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Error", "You need to be logged in to update your profile.");
        return;
      }

      if (!userProfile) {
        Alert.alert("Error", "User profile not found.");
        return;
      }

      const payload = {
        platform,
        audience: socialMediaData.audience,
        views: socialMediaData.views,
        likes: socialMediaData.likes,
        followers: socialMediaData.followers,
      };

      const response = await api.put(
        `/user/${userProfile.id}/social-media`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", `Your ${config.name} stats have been updated!`);
        navigation.goBack();
      } else {
        Alert.alert("Error", "Failed to update stats. Please try again.");
      }
    } catch (error) {
      console.error("Error updating social media stats:", error);
      Alert.alert("Error", `Failed to update stats: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Call API to add media link
  const handleAddMediaLink = async () => {
    try {
      // Validate the media link
      if (!mediaLink) {
        Alert.alert("Error", "Please enter a media link");
        return;
      }
      
      // Validate URL format
      if (!mediaLink.startsWith('http://') && !mediaLink.startsWith('https://')) {
        Alert.alert("Error", "Please enter a valid URL starting with http:// or https://");
        return;
      }
  
      setSubmitting(true);
      const token = await AsyncStorage.getItem("userToken");
  
      if (!token) {
        Alert.alert("Error", "You need to be logged in to add a media link.");
        return;
      }
  
      if (!userProfile || !userProfile.id) {
        Alert.alert("Error", "User profile not found.");
        return;
      }
  
      // Prepare the payload for the media link
      const payload = {
        platform,
        media_type: "document", // FIXED: Changed from "link" to "document" to match ENUM
        file_url: mediaLink,
        file_name: `${platform}-link-${Date.now()}`,
        file_format: "link", // This can remain "link" as it's not an ENUM
        description: `${config.name} media link`,
        audience: socialMediaData.audience || "",
        views: 0,
        likes: 0,
        followers: 0,
      };
  
      // Make the API call to add the media link
      const response = await api.post(
        `/user/${userProfile.id}/social-media`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      // Handle the response
      if (response.status === 201 || response.status === 200) {
        Alert.alert("Success", "Your media link has been added!");
        setMediaLink(""); // Clear the input field
        
        // Refresh the data to show the new link
        fetchUserData();
      } else {
        Alert.alert("Error", "Failed to add media link. Please try again.");
      }
    } catch (error) {
      console.error("Error adding media link:", error);
      Alert.alert(
        "Error", 
        `Failed to add media link: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete media link
  const handleDeleteMediaLink = async (mediaId) => {
    try {
      if (!mediaId) {
        Alert.alert("Error", "Invalid media ID");
        return;
      }

      const token = await AsyncStorage.getItem("userToken");
      if (!token || !userProfile) {
        Alert.alert("Error", "Authentication required");
        return;
      }

      // Confirm deletion
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this media link?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setSubmitting(true);
              try {
                const response = await api.delete(
                  `/user/${userProfile.id}/social-media/${mediaId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                if (response.status === 200) {
                  // Update the UI by removing the deleted link
                  setMediaLinks(mediaLinks.filter(link => link.id !== mediaId));
                  Alert.alert("Success", "Media link deleted successfully");
                }
              } catch (error) {
                console.error("Error deleting media link:", error);
                Alert.alert("Error", `Failed to delete media link: ${error.response?.data?.message || error.message}`);
              } finally {
                setSubmitting(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error in delete handler:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [platform]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={config.color} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update {config.name} Stats</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Platform Info */}
        <View style={[styles.platformHeader, { backgroundColor: config.color }]}>
          {config.iconFamily === "FontAwesome" ? (
            <FontAwesome name={config.icon} size={40} color="white" />
          ) : (
            <FontAwesome5 name={config.icon} size={40} color="white" />
          )}
          <Text style={styles.platformTitle}>{config.name}</Text>
        </View>

        {/* Audience (Target Demographics) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Target Audience (Demographics)</Text>
          <View style={styles.audienceInput}>
            <Feather name="users" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="E.g., 18-35 year olds, tech enthusiasts"
              value={socialMediaData.audience}
              onChangeText={(text) => setSocialMediaData((prev) => ({ ...prev, audience: text }))}
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {/* Number Pickers */}
        <View style={styles.scrollPickersContainer}>
          <NumberScrollPicker
            label="Followers"
            value={socialMediaData.followers}
            onChange={(value) => setSocialMediaData((prev) => ({ ...prev, followers: value }))}
            max={MAX_FOLLOWERS}
            color={config.color}
          />

          <NumberScrollPicker
            label="Likes"
            value={socialMediaData.likes}
            onChange={(value) => setSocialMediaData((prev) => ({ ...prev, likes: value }))}
            max={MAX_LIKES}
            color={config.color}
          />

          <NumberScrollPicker
            label="Views"
            value={socialMediaData.views}
            onChange={(value) => setSocialMediaData((prev) => ({ ...prev, views: value }))}
            max={MAX_VIEWS}
            color={config.color}
          />
        </View>

        {/* Format Display */}
        <View style={styles.statsDisplay}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Followers:</Text>
            <Text style={[styles.statValue, { color: config.color }]}>
              {socialMediaData.followers.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Likes:</Text>
            <Text style={[styles.statValue, { color: config.color }]}>{socialMediaData.likes.toLocaleString()}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Views:</Text>
            <Text style={[styles.statValue, { color: config.color }]}>{socialMediaData.views.toLocaleString()}</Text>
          </View>
        </View>

        {/* Media Links Section */}
        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Media Links</Text>
          
          {/* Existing Media Links */}
          {mediaLinks.length > 0 ? (
            <View style={styles.mediaLinksContainer}>
              {mediaLinks.map((link) => (
                <MediaLinkItem 
                  key={link.id} 
                  item={link} 
                  onDelete={handleDeleteMediaLink} 
                  color={config.color} 
                />
              ))}
            </View>
          ) : (
            <Text style={styles.noLinksText}>No media links added yet</Text>
          )}

          {/* Add New Media Link */}
          <Text style={styles.label}>Add New Media Link</Text>
          <View style={styles.audienceInput}>
            <Feather name="link" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter a link to your portfolio or website"
              value={mediaLink}
              onChangeText={(text) => setMediaLink(text)}
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {/* Add Media Link Button */}
        <TouchableOpacity
          style={[styles.updateButton, { backgroundColor: config.color, opacity: submitting ? 0.7 : 1 }]}
          onPress={handleAddMediaLink}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={styles.updateButtonText}>Add Media Link</Text>
              <Feather name="plus-circle" size={20} color="white" style={styles.buttonIcon} />
            </>
          )}
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.updateButton, { backgroundColor: config.color, opacity: submitting ? 0.7 : 1 }]}
          onPress={handleUpdateStats}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={styles.updateButtonText}>Update {config.name} Stats</Text>
              <Feather name="check-circle" size={20} color="white" style={styles.buttonIcon} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  platformHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
  },
  platformTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 15,
  },
  formGroup: {
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "600",
  },
  audienceInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
  },
  scrollPickersContainer: {
    marginVertical: 20,
  },
  pickerContainer: {
    marginVertical: 15,
    paddingHorizontal: 15,
  },
  pickerLabel: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "600",
  },
  valueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 10,
  },
  digitContainer: {
    alignItems: "center",
  },
  arrowButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  digitDisplay: {
    height: 40,
    width: 30,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderRadius: 4,
    backgroundColor: "#333",
  },
  digitText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  statsDisplay: {
    backgroundColor: "#222",
    margin: 15,
    padding: 15,
    borderRadius: 8,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  statLabel: {
    color: "#CCC",
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  mediaLinksContainer: {
    marginBottom: 20,
  },
  mediaLinkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  mediaLinkContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  mediaLinkIcon: {
    marginRight: 10,
  },
  mediaLinkUrl: {
    color: "white",
    fontSize: 14,
    flex: 1,
  },
  deleteButton: {
    padding: 5,
  },
  noLinksText: {
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 15,
  },
  updateButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 25,
    padding: 15,
    borderRadius: 10,
  },
  updateButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonIcon: {
    marginLeft: 10,
  },
});

export default SocialMediaStats;