import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather, FontAwesome, FontAwesome5, Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import api from "../config/axios";
import { API_URL } from "../config/source";



const ProfileContent = () => {
  const navigation = useNavigation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState(null);
  const [socialMediaData, setSocialMediaData] = useState({
    audience: "",
    views: "",
    likes: "",
    followers: "",
  });
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [dealsModalVisible, setDealsModalVisible] = useState(false);
  const [deals, setDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [dealDetailsVisible, setDealDetailsVisible] = useState(false);
  const [creatorInfoVisible, setCreatorInfoVisible] = useState(false);

  // Fetch user profile
  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (token) {
        const response = await api.get("/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const profile = response.data.user.profile;
        const pictureUrl = profile.profile_picture
          ? `${API_URL}/uploads/images/${profile.profile_picture}`
          : null;

        setProfilePictureUrl(pictureUrl);
        ///: this is what I have changed "profile_picture"
        setUserProfile(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all deals
  const fetchDeals = async () => {
    try {
      setLoadingDeals(true);
      const token = await AsyncStorage.getItem("userToken");

      if (token) {
        const response = await api.get("/api/deals", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDeals(response.data.deals || []);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      Alert.alert("Error", "Failed to load deals");
    } finally {
      setLoadingDeals(false);
    }
  };

  // Refresh deals when returning from AddDeal screen
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
      fetchDeals();
    }, [])
  );

  // Fetch a specific deal by ID
  const fetchDealById = async (dealId) => {
    try {
      setLoadingDeals(true);
      const token = await AsyncStorage.getItem("userToken");

      if (token) {
        const response = await api.get(`/addDeal/${dealId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSelectedDeal(response.data.deal);
        setDealDetailsVisible(true);
      }
    } catch (error) {
      console.error("Error fetching deal details:", error);
      Alert.alert("Error", "Failed to load deal details");
    } finally {
      setLoadingDeals(false);
    }
  };

  // Refetch profile whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
      fetchDeals();
    }, [])
  );

  // Navigate to edit profile screen
  const handleEditProfile = () => {
    if (userProfile) {
      navigation.navigate("EditProfile", { userId: userProfile.id });
    } else {
      Alert.alert("Error", "Unable to edit profile. Please try again later.");
    }
  };

  // Handle social media edit
  const handleSocialMediaEdit = (platform, data = {}) => {
    setCurrentPlatform(platform);
    setSocialMediaData({
      audience: data.audience?.toString() || "",
      views: data.views?.toString() || "",
      likes: data.likes?.toString() || "",
      followers: data.followers?.toString() || "",
    });
    setEditModalVisible(true);
  };

  // Handle social media update
  const handleSocialMediaUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await api.put(
        `/user/${userProfile.id}/social-media`,
        {
          platform: currentPlatform,
          audience: Number.parseInt(socialMediaData.audience),
          views: Number.parseInt(socialMediaData.views),
          likes: Number.parseInt(socialMediaData.likes),
          followers: Number.parseInt(socialMediaData.followers),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      const updatedProfile = { ...userProfile };
      const platformIndex = updatedProfile.profile.ProfilePicture.findIndex(
        (item) => item.platform === currentPlatform
      );

      if (platformIndex !== -1) {
        updatedProfile.profile.ProfilePicture[platformIndex] = {
          ...updatedProfile.profile.ProfilePicture[platformIndex],
          ...response.data.media,
        };
      } else {
        updatedProfile.profile.ProfilePicture.push(response.data.media);
      }

      setUserProfile(updatedProfile);
      setEditModalVisible(false);
      Alert.alert("Success", "Social media data updated successfully!");
    } catch (error) {
      console.error("Error updating social media:", error);
      Alert.alert("Error", "Failed to update social media data");
    }
  };

  // Handle image picker for profile picture
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Please allow access to your photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(
          "Error",
          "You need to be logged in to update your profile."
        );
        return;
      }

      const file = {
        uri: result.assets[0].uri,
        name: `profile-${Date.now()}.jpg`,
        type: "image/jpeg",
      };

      const formData = new FormData();
      formData.append("media", file);

      try {
        setLoading(true);
        const response = await api.put(`/user/profile`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        fetchUserProfile();

        Alert.alert("Success", "Profile picture updated successfully!");
      } catch (error) {
        console.error("Error updating profile picture:", error);
        Alert.alert("Error", "Failed to update profile picture.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle opening the deals modal
  const handleViewDeals = () => {
    fetchDeals();
    setDealsModalVisible(true);
  };

  // Handle viewing a specific deal
  const handleViewDealDetails = (dealId) => {
    fetchDealById(dealId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8A2BE2" />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile data.</Text>
      </View>
    );
  }

  console.loglog("API_URL ❤️❤️",API_URL)

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sponsofy</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={handleViewDeals}>
            <FontAwesome5 name="handshake" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Feather name="bell" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate("ChatList")}
          >
            <Feather name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Wrap ScrollView and FAB in a parent View */}
      <View style={{ flex: 1, position: "relative" }}>
        <ScrollView style={styles.scrollView}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={pickImage}>
              <View style={styles.avatarContainer}>
                {profilePictureUrl ? (
                  <Image
                    source={{ uri: profilePictureUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Feather name="user" size={30} color="#666" />
                  </View>
                )}
                <View style={styles.onlineIndicator} />
              </View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text style={styles.username}>
                {userProfile.profile.first_name} {userProfile.profile.last_name}
              </Text>
              <Text style={styles.premiumBadge}>
                {userProfile.isPremium ? "Premium Member" : "Regular Member"}
              </Text>

              {/* Edit Profile Button */}
              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={handleEditProfile}
              >
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
              {/* Inside the profileInfo View, after the editProfileButton: */}
              <TouchableOpacity
                style={[styles.editProfileButton, styles.viewInfoButton]}
                onPress={() => setCreatorInfoVisible(true)}
              >
                <Text style={styles.editProfileText}>View Info</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.bio}>
            {userProfile?.profile?.bio || "No bio available"}
          </Text>

          {/* Social Media Icons */}
          <View style={styles.socialIcons}>
            {["instagram", "facebook", "tiktok", "youtube"].map((platform) => {
              // Fetch social media data from the correct field
              const platformData =
                userProfile.profile.Media?.find(
                  (item) => item.platform === platform
                ) || {};

              return (
                <TouchableOpacity
                  key={platform}
                  style={styles.socialIcon}
                  onPress={() => handleSocialMediaEdit(platform, platformData)}
                >
                  <FontAwesome
                    name={platform === "tiktok" ? "tiktok" : platform}
                    size={24}
                    color="white"
                  />
                  {platformData.followers && (
                    <Text style={styles.socialStats}>
                      {platformData.followers} followers
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Edit Modal */}
          <Modal
            visible={editModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setEditModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Edit {currentPlatform} Statistics
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Audience"
                  value={socialMediaData.audience}
                  onChangeText={(text) =>
                    setSocialMediaData((prev) => ({ ...prev, audience: text }))
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Views"
                  value={socialMediaData.views}
                  onChangeText={(text) =>
                    setSocialMediaData((prev) => ({ ...prev, views: text }))
                  }
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Likes"
                  value={socialMediaData.likes}
                  onChangeText={(text) =>
                    setSocialMediaData((prev) => ({ ...prev, likes: text }))
                  }
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Followers"
                  value={socialMediaData.followers}
                  onChangeText={(text) =>
                    setSocialMediaData((prev) => ({ ...prev, followers: text }))
                  }
                  keyboardType="numeric"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleSocialMediaUpdate}
                  >
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Deals Modal */}
          <Modal
            visible={dealsModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setDealsModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, styles.dealsModalContent]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>My Deals</Text>
                  <TouchableOpacity onPress={() => setDealsModalVisible(false)}>
                    <Feather name="x" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                {loadingDeals ? (
                  <ActivityIndicator size="large" color="#8A2BE2" />
                ) : deals.length > 0 ? (
                  <FlatList
                    data={deals}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dealItem}
                        onPress={() => handleViewDealDetails(item.id)}
                      >
                        <View style={styles.dealHeader}>
                          <Text style={styles.dealTitle}>
                            {item.Contract?.title || `Deal #${item.id}`}
                          </Text>
                          <View
                            style={[
                              styles.statusBadge,
                              item.status === "pending"
                                ? styles.pendingBadge
                                : item.status === "accepted"
                                ? styles.acceptedBadge
                                : item.status === "rejected"
                                ? styles.rejectedBadge
                                : styles.completedBadge,
                            ]}
                          >
                            <Text style={styles.statusText}>{item.status}</Text>
                          </View>
                        </View>

                        <Text style={styles.dealPrice}>${item.price}</Text>

                        {item.Contract?.Company && (
                          <Text style={styles.dealCompany}>
                            {item.Contract.Company.name}
                          </Text>
                        )}

                        <Text style={styles.dealDate}>
                          Created:{" "}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.dealsList}
                  />
                ) : (
                  <View style={styles.noDealsContainer}>
                    <FontAwesome5
                      name="handshake-slash"
                      size={50}
                      color="#666"
                    />
                    <Text style={styles.noDealsText}>No deals found</Text>
                    <TouchableOpacity
                      style={styles.createDealButton}
                      onPress={() => {
                        setDealsModalVisible(false);
                        navigation.navigate("AddDeal");
                      }}
                    >
                      <Text style={styles.createDealButtonText}>
                        Create a Deal
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </Modal>

          {/* Deal Details Modal */}
          <Modal
            visible={dealDetailsVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setDealDetailsVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View
                style={[styles.modalContent, styles.dealDetailsModalContent]}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Deal Details</Text>
                  <TouchableOpacity
                    onPress={() => setDealDetailsVisible(false)}
                  >
                    <Feather name="x" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                {loadingDeals ? (
                  <ActivityIndicator size="large" color="#8A2BE2" />
                ) : selectedDeal ? (
                  <ScrollView style={styles.dealDetailsScroll}>
                    {/* Deal details content */}
                  </ScrollView>
                ) : (
                  <View style={styles.noDealsContainer}>
                    <Text style={styles.noDealsText}>
                      Failed to load deal details
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Modal>

          {/* Content Creator Info Modal */}
          <Modal
            visible={creatorInfoVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setCreatorInfoVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View
                style={[styles.modalContent, styles.creatorInfoModalContent]}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Creator Information</Text>
                  <TouchableOpacity
                    onPress={() => setCreatorInfoVisible(false)}
                  >
                    <Feather name="x" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.creatorInfoScroll}>
                  {/* Creator info content */}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Portfolio Section */}
          {userProfile.profile.Media &&
            userProfile.profile.Media.length > 0 && (
              <View style={styles.portfolioContainer}>
                <Text style={styles.portfolioTitle}>Portfolio</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.portfolioScroll}
                >
                  {userProfile.profile.Media.map((item, index) => (
                    <View key={index} style={styles.portfolioItem}>
                      <Image
                        source={{
                          uri: `${API_URL}/uploads/images/${item.file_name}`,
                        }}
                        style={styles.portfolioImage}
                        resizeMode="cover"
                        onError={(error) =>
                          console.error("Image failed to load:", error)
                        }
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AddDeal")}
        >
          <Entypo name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  headerTitle: {
    color: "#8A2BE2",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
  },
  headerIcon: {
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
    borderRadius: 10,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#666",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "#2ecc71",
    borderWidth: 2,
    borderColor: "#121212",
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  username: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  premiumBadge: {
    color: "#8A2BE2",
    marginTop: 5,
    fontSize: 14,
  },
  editProfileButton: {
    backgroundColor: "#8A2BE2",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  editProfileText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  bio: {
    color: "#888",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  socialIcon: {
    alignItems: "center",
  },
  socialStats: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#333",
    color: "white",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: "#444",
  },
  saveButton: {
    backgroundColor: "#8A2BE2",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  portfolioContainer: {
    margin: 20,
    marginTop: 10,
  },
  portfolioTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  portfolioScroll: {
    flexDirection: "row",
    marginBottom: 15,
  },
  portfolioItem: {
    width: 120,
    height: 120,
    marginRight: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  portfolioImage: {
    width: "100%",
    height: "100%",
  },
  fab: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#8A2BE2",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  errorText: {
    color: "white",
    fontSize: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dealsModalContent: {
    maxHeight: "80%",
    width: "95%",
  },
  dealDetailsModalContent: {
    maxHeight: "90%",
    width: "95%",
  },
  dealsList: {
    paddingBottom: 20,
  },
  dealItem: {
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  dealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dealTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: "#f39c12",
  },
  acceptedBadge: {
    backgroundColor: "#2ecc71",
  },
  rejectedBadge: {
    backgroundColor: "#e74c3c",
  },
  completedBadge: {
    backgroundColor: "#3498db",
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  dealPrice: {
    color: "#8A2BE2",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  dealCompany: {
    color: "#bbb",
    fontSize: 14,
    marginBottom: 5,
  },
  dealDate: {
    color: "#888",
    fontSize: 12,
  },
  noDealsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  noDealsText: {
    color: "#888",
    fontSize: 16,
    marginTop: 15,
    marginBottom: 20,
  },
  createDealButton: {
    backgroundColor: "#8A2BE2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  createDealButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  dealDetailsScroll: {
    width: "100%",
  },
  dealDetailSection: {
    marginBottom: 20,
  },
  dealDetailLabel: {
    color: "#888",
    fontSize: 14,
    marginBottom: 5,
  },
  dealDetailValue: {
    color: "white",
    fontSize: 16,
  },
  termItem: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  termHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  termTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  termDescription: {
    color: "#bbb",
    fontSize: 14,
  },
  dealActionsContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  dealActionRow: {
    marginTop: 10,
  },
  dealActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  messageButton: {
    backgroundColor: "#8A2BE2",
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
  },
  dealActionButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  viewInfoButton: {
    backgroundColor: "#6A5ACD",
    marginLeft: 10,
  },
  creatorInfoModalContent: {
    maxHeight: "80%",
    width: "95%",
  },
  creatorInfoScroll: {
    width: "100%",
  },
  creatorInfoSection: {
    marginBottom: 20,
  },
  creatorInfoLabel: {
    color: "#888",
    fontSize: 14,
    marginBottom: 5,
  },
  creatorInfoValue: {
    color: "white",
    fontSize: 16,
  },
  verificationBadge: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  verificationText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  membershipBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  regularBadge: {
    backgroundColor: "#3498db",
  },
  membershipText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default ProfileContent;
