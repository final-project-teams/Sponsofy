"use client"

import { useState, useCallback } from "react"
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
  FlatList,
  Animated,
  Linking,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Feather, FontAwesome5, Entypo } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import api from "../config/axios"
import { API_URL } from "../config/source"
import SideBarContent from "../components/SideBarContent"

const ProfileContent = () => {
  const navigation = useNavigation()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profilePictureUrl, setProfilePictureUrl] = useState(null)
  const [dealsModalVisible, setDealsModalVisible] = useState(false)
  const [deals, setDeals] = useState([])
  const [loadingDeals, setLoadingDeals] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [dealDetailsVisible, setDealDetailsVisible] = useState(false)
  const [creatorInfoVisible, setCreatorInfoVisible] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const sidebarOffset = useState(new Animated.Value(-233))[0]
  const [portfolioLinks, setPortfolioLinks] = useState([])

  // Toggle sidebar with animation
  const toggleSidebar = () => {
    if (sidebarVisible) {
      // Slide out to the left
      Animated.timing(sidebarOffset, {
        toValue: -233, // Move off-screen to the left
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSidebarVisible(false))
    } else {
      // Slide in from the left
      setSidebarVisible(true)
      Animated.timing(sidebarOffset, {
        toValue: 0, // Move to the visible position
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }

  // Close sidebar when clicking outside
  const closeSidebar = () => {
    if (sidebarVisible) {
      Animated.timing(sidebarOffset, {
        toValue: -233,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSidebarVisible(false))
    }
  }

  // Parse portfolio links from string to array
  const parsePortfolioLinks = (linksString) => {
    if (!linksString) return []

    try {
      // Try to parse as JSON if it's in JSON format
      return JSON.parse(linksString)
    } catch (e) {
      // If not JSON, split by commas or spaces
      return linksString.split(/[,\s]+/).filter((link) => link.trim() !== "")
    }
  }

  // Open URL
  const openUrl = (url) => {
    // Add http:// prefix if not present
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url)
        } else {
          Alert.alert("Error", `Cannot open URL: ${url}`)
        }
      })
      .catch((err) => Alert.alert("Error", "An error occurred while opening the link"))
  }

  // Navigate to creator info screen
  const navigateToCreatorInfo = () => {
    if (userProfile) {
      navigation.navigate("ContentCreatorInfo", {
        userId: userProfile.id,
        profile: userProfile.profile,
      })
    }
  }

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const token = await AsyncStorage.getItem("userToken")

      if (token) {
        const response = await api.get("/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const profile = response.data.user.profile
        console.log("User Profile", profile.profile_picture)
        const pictureUrl = profile.profile_picture ? `${API_URL}/uploads/images/${profile.profile_picture}` : null

        setProfilePictureUrl(pictureUrl)
        setUserProfile(response.data.user)

        // Parse portfolio links
        if (profile.portfolio_links) {
          setPortfolioLinks(parsePortfolioLinks(profile.portfolio_links))
        }

        console.log("User Profile", response.data.user)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all deals
  const fetchDeals = async () => {
    try {
      setLoadingDeals(true)
      const token = await AsyncStorage.getItem("userToken")

      if (token) {
        const response = await api.get("/deal", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setDeals(response.data.deals || [])
      }
    } catch (error) {
      console.error("Error fetching deals:", error)
      Alert.alert("Error", "Failed to load deals")
    } finally {
      setLoadingDeals(false)
    }
  }

  // Refresh deals when returning from AddDeal screen
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile()
      fetchDeals()
    }, []),
  )

  // Fetch a specific deal by ID
  const fetchDealById = async (dealId) => {
    try {
      setLoadingDeals(true)
      const token = await AsyncStorage.getItem("userToken")

      if (token) {
        const response = await api.get(`/addDeal/${dealId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setSelectedDeal(response.data.deal)
        setDealDetailsVisible(true)
      }
    } catch (error) {
      console.error("Error fetching deal details:", error)
      Alert.alert("Error", "Failed to load deal details")
    } finally {
      setLoadingDeals(false)
    }
  }

  // Navigate to edit profile screen
  const handleEditProfile = () => {
    if (userProfile) {
      navigation.navigate("EditProfileContent", { userId: userProfile.id })
    } else {
      Alert.alert("Error", "Unable to edit profile. Please try again later.")
    }
  }

  // Handle platform selection
  const handleSelectPlatform = () => {
    navigation.navigate("PlatformSelection")
  }

  // Handle image picker for profile picture
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow access to your photo library.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    if (!result.canceled) {
      const token = await AsyncStorage.getItem("userToken")
      if (!token) {
        Alert.alert("Error", "You need to be logged in to update your profile.")
        return
      }

      const file = {
        uri: result.assets[0].uri,
        name: `profile-${Date.now()}.jpg`,
        type: "image/jpeg",
      }

      const formData = new FormData()
      formData.append("media", file)

      try {
        setLoading(true)
        const response = await api.put(`/user/profile`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        })

        fetchUserProfile()

        Alert.alert("Success", "Profile picture updated successfully!")
      } catch (error) {
        console.error("Error updating profile picture:", error)
        Alert.alert("Error", "Failed to update profile picture.")
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle opening the deals modal
  const handleViewDeals = () => {
    fetchDeals()
    setDealsModalVisible(true)
  }

  // Handle viewing a specific deal
  const handleViewDealDetails = (dealId) => {
    fetchDealById(dealId)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8A2BE2" />
      </View>
    )
  }

  if (!userProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile data.</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Sidebar */}
      {sidebarVisible && (
        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: sidebarOffset }],
            },
          ]}
        >
          <SideBarContent onProfileClick={navigateToCreatorInfo} />
        </Animated.View>
      )}

      {/* Overlay to close sidebar when clicking outside */}
      {sidebarVisible && <TouchableOpacity style={styles.overlay} onPress={closeSidebar} activeOpacity={1} />}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Feather name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sponsofy</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={handleViewDeals}>
            <FontAwesome5 name="handshake" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate("Notifications")}>
            <Feather name="bell" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate("ChatList")}>
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
                  <Image source={{ uri: profilePictureUrl }} style={styles.avatar} />
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
              <Text style={styles.premiumBadge}>{userProfile.isPremium ? "Premium Member" : "Regular Member"}</Text>

              {/* Edit Profile Button */}
              <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>

              {/* Platform Selection Button */}
              <TouchableOpacity
                style={[styles.editProfileButton, styles.platformButton]}
                onPress={handleSelectPlatform}
              >
                <Text style={styles.editProfileText}>Select Platform</Text>
              </TouchableOpacity>

              {/* View Info Button */}
              <TouchableOpacity
                style={[styles.editProfileButton, styles.viewInfoButton]}
                onPress={() => setCreatorInfoVisible(!creatorInfoVisible)}
              >
                <Text style={styles.editProfileText}>{creatorInfoVisible ? "Hide Info" : "View Info"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Creator Info Section - Only Bio and Portfolio Links */}
          {creatorInfoVisible && (
            <View style={styles.creatorInfoContainer}>
              <Text style={styles.creatorInfoTitle}>Creator Information</Text>

              {/* Bio */}
              <Text style={styles.creatorInfoLabel}>Bio:</Text>
              <Text style={styles.creatorInfoText}>{userProfile.profile.bio || "No bio available"}</Text>

              {/* Portfolio Links */}
              <Text style={styles.creatorInfoLabel}>Portfolio Links:</Text>
              {portfolioLinks.length > 0 ? (
                <View style={styles.linksContainer}>
                  {portfolioLinks.map((link, index) => (
                    <TouchableOpacity key={index} style={styles.linkButton} onPress={() => openUrl(link)}>
                      <Feather name="link" size={16} color="white" style={styles.linkIcon} />
                      <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
                        {link}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.creatorInfoText}>No portfolio links available</Text>
              )}

              {/* View Full Profile Button */}
              <TouchableOpacity style={styles.viewFullProfileButton} onPress={navigateToCreatorInfo}>
                <Text style={styles.viewFullProfileText}>View Full Profile</Text>
                <Feather name="arrow-right" size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}

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
                      <TouchableOpacity style={styles.dealItem} onPress={() => handleViewDealDetails(item.id)}>
                        <View style={styles.dealHeader}>
                          <Text style={styles.dealTitle}>{item.Contract?.title || `Deal #${item.id}`}</Text>
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

                        {item.Contract?.Company && <Text style={styles.dealCompany}>{item.Contract.Company.name}</Text>}

                        <Text style={styles.dealDate}>Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
                      </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.dealsList}
                  />
                ) : (
                  <View style={styles.noDealsContainer}>
                    <FontAwesome5 name="handshake-slash" size={50} color="#666" />
                    <Text style={styles.noDealsText}>No deals found</Text>
                    <TouchableOpacity
                      style={styles.createDealButton}
                      onPress={() => {
                        setDealsModalVisible(false)
                        navigation.navigate("PlatformSelectionMedia")
                      }}
                    >
                      <Text style={styles.createDealButtonText}>Create a Deal</Text>
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
              <View style={[styles.modalContent, styles.dealDetailsModalContent]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Deal Details</Text>
                  <TouchableOpacity onPress={() => setDealDetailsVisible(false)}>
                    <Feather name="x" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                {loadingDeals ? (
                  <ActivityIndicator size="large" color="#8A2BE2" />
                ) : selectedDeal ? (
                  <ScrollView style={styles.dealDetailsScroll}>{/* Deal details content */}</ScrollView>
                ) : (
                  <View style={styles.noDealsContainer}>
                    <Text style={styles.noDealsText}>Failed to load deal details</Text>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("PlatformSelectionMedia")}>
          <Entypo name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
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
  platformButton: {
    backgroundColor: "#9370DB",
    marginLeft: 10,
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
  creatorInfoContainer: {
    padding: 20,
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    margin: 20,
  },
  creatorInfoTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  creatorInfoLabel: {
    color: "#8A2BE2",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  creatorInfoText: {
    color: "white",
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  viewInfoButton: {
    backgroundColor: "#6A5ACD",
    marginLeft: 10,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 233,
    backgroundColor: "#000",
    zIndex: 1000, // Ensure it's above other content
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999, // Ensure it's below the sidebar but above other content
  },
  linksContainer: {
    marginBottom: 15,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  linkIcon: {
    marginRight: 10,
  },
  linkText: {
    color: "white",
    flex: 1,
  },
  viewFullProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8A2BE2",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  viewFullProfileText: {
    color: "white",
    fontWeight: "bold",
    marginRight: 8,
  },
})

export default ProfileContent

