"use client"

import { useState, useCallback, useEffect } from "react"
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
  Dimensions,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Feather, FontAwesome5, Entypo, FontAwesome, AntDesign } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import api from "../config/axios"
import { API_URL } from "../config/source"
import SideBarContent from "../components/SideBarContent"

const { width } = Dimensions.get("window")

const ProfileContent = () => {
  const navigation = useNavigation()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profilePictureUrl, setProfilePictureUrl] = useState(null)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const sidebarOffset = useState(new Animated.Value(-233))[0]
  const [portfolioLinks, setPortfolioLinks] = useState([])
  const [selectedPlatform, setSelectedPlatform] = useState("instagram")
  const [socialMediaStats, setSocialMediaStats] = useState([])
  const [loadingStats, setLoadingStats] = useState(false)
  const [mediaLinks, setMediaLinks] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageModalVisible, setImageModalVisible] = useState(false)

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

  // Fetch social media stats and media links
  const fetchSocialMediaStats = async () => {
    try {
      setLoadingStats(true)
      const token = await AsyncStorage.getItem("userToken")

      if (token && userProfile) {
        const response = await api.get(`/user/${userProfile.id}/social-media`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data && response.data.stats) {
          setSocialMediaStats(response.data.stats)

          // Filter media links for the selected platform
          const links = response.data.stats.filter(
            (item) => item.platform === selectedPlatform && item.file_format === "link",
          )
          setMediaLinks(links)
        }
      }
    } catch (error) {
      console.error("Error fetching social media stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  // Get stats for selected platform
  const getStatsForPlatform = (platform) => {
    if (!socialMediaStats || socialMediaStats.length === 0) {
      return { followers: 0, likes: 0, views: 0 }
    }

    const platformStats = socialMediaStats.find(
      (stat) => stat.platform && stat.platform.toLowerCase() === platform.toLowerCase() && stat.file_format !== "link",
    )

    return platformStats || { followers: 0, likes: 0, views: 0 }
  }

  // Refresh profile when returning from other screens
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile()
    }, []),
  )

  // Fetch social media stats when profile is loaded
  useEffect(() => {
    if (userProfile) {
      fetchSocialMediaStats()
    }
  }, [userProfile])

  // Update media links when platform changes
  useEffect(() => {
    if (userProfile && socialMediaStats.length > 0) {
      // Filter media links for the selected platform
      const links = socialMediaStats.filter((item) => item.platform === selectedPlatform && item.file_format === "link")
      setMediaLinks(links)
    }
  }, [selectedPlatform, socialMediaStats])

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

  // Handle platform selection
  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform)
  }

  // Handle image selection
  const handleImageSelect = (image) => {
    setSelectedImage(image)
    setImageModalVisible(true)
  }

  // Format numbers with K, M, B suffixes
  const formatNumber = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + "B"
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
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

  // Get current platform stats
  const currentPlatformStats = getStatsForPlatform(selectedPlatform)

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

              {/* Bio */}
              <Text style={styles.bio}>{userProfile.profile.bio || "No bio available"}</Text>

              {/* Edit Profile Button */}
              <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>

              {/* View Info Button */}
              <TouchableOpacity style={styles.editProfileButton} onPress={navigateToCreatorInfo}>
                <Text style={styles.editProfileText}>View Info</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Select Platform Button */}
          <View style={styles.selectPlatformContainer}>
            <TouchableOpacity style={styles.platformButton} onPress={handleSelectPlatform}>
              <Text style={styles.platformButtonText}>Select Platform</Text>
            </TouchableOpacity>
          </View>

          {/* Social Media Stats Section */}
          <View style={styles.socialMediaContainer}>
            <Text style={styles.sectionTitle}>Social Media Stats</Text>

            {/* Platform Selection and Stats */}
            <View style={styles.platformStatsContainer}>
              {/* Platform Buttons Row */}
              <View style={styles.platformsRow}>
                <TouchableOpacity
                  style={[styles.platformButton, selectedPlatform === "instagram" && styles.selectedPlatformButton]}
                  onPress={() => handlePlatformSelect("instagram")}
                >
                  <AntDesign name="instagram" size={20} color={selectedPlatform === "instagram" ? "white" : "#888"} />
                  <Text
                    style={[styles.platformButtonText, selectedPlatform === "instagram" && styles.selectedPlatformText]}
                  >
                    Instagram
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.platformButton, selectedPlatform === "youtube" && styles.selectedPlatformButton]}
                  onPress={() => handlePlatformSelect("youtube")}
                >
                  <AntDesign name="youtube" size={20} color={selectedPlatform === "youtube" ? "white" : "#888"} />
                  <Text
                    style={[styles.platformButtonText, selectedPlatform === "youtube" && styles.selectedPlatformText]}
                  >
                    YouTube
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.platformButton, selectedPlatform === "facebook" && styles.selectedPlatformButton]}
                  onPress={() => handlePlatformSelect("facebook")}
                >
                  <AntDesign
                    name="facebook-square"
                    size={20}
                    color={selectedPlatform === "facebook" ? "white" : "#888"}
                  />
                  <Text
                    style={[styles.platformButtonText, selectedPlatform === "facebook" && styles.selectedPlatformText]}
                  >
                    Facebook
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.platformButton, selectedPlatform === "tiktok" && styles.selectedPlatformButton]}
                  onPress={() => handlePlatformSelect("tiktok")}
                >
                  <FontAwesome5 name="tiktok" size={20} color={selectedPlatform === "tiktok" ? "white" : "#888"} />
                  <Text
                    style={[styles.platformButtonText, selectedPlatform === "tiktok" && styles.selectedPlatformText]}
                  >
                    TikTok
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Stats Display */}
              {loadingStats ? (
                <View style={styles.statsLoading}>
                  <ActivityIndicator size="small" color="#8A2BE2" />
                </View>
              ) : (
                <View style={styles.statsContainer}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{formatNumber(currentPlatformStats.followers || 0)}</Text>
                    <View style={styles.statLabelContainer}>
                      <FontAwesome name="users" size={14} color="#8A2BE2" />
                      <Text style={styles.statLabel}>Followers</Text>
                    </View>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{formatNumber(currentPlatformStats.likes || 0)}</Text>
                    <View style={styles.statLabelContainer}>
                      <AntDesign name="heart" size={14} color="#e74c3c" />
                      <Text style={styles.statLabel}>Likes</Text>
                    </View>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{formatNumber(currentPlatformStats.views || 0)}</Text>
                    <View style={styles.statLabelContainer}>
                      <Feather name="eye" size={14} color="#3498db" />
                      <Text style={styles.statLabel}>Views</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Media Links/Images Section */}
            <View style={styles.mediaLinksContainer}>
              {loadingStats ? (
                <ActivityIndicator size="small" color="#8A2BE2" style={{ marginTop: 15 }} />
              ) : mediaLinks.length > 0 ? (
                <View>
                  <Text style={styles.mediaLinksTitle}>Media</Text>
                  <FlatList
                    data={mediaLinks}
                    keyExtractor={(item, index) => `${item.id || index}`}
                    numColumns={3}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.mediaItem} onPress={() => handleImageSelect(item)}>
                        <Image
                          source={{ uri: item.url || `${API_URL}/uploads/images/${item.file_name}` }}
                          style={styles.mediaImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.mediaGrid}
                  />
                </View>
              ) : (
                <View style={styles.noMediaContainer}>
                  <Feather name="image" size={24} color="#666" />
                  <Text style={styles.noMediaText}>No media found for {selectedPlatform}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Portfolio Links Section */}
          {portfolioLinks.length > 0 && (
            <View style={styles.portfolioLinksContainer}>
              <Text style={styles.sectionTitle}>Portfolio Links</Text>
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
            </View>
          )}
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
  bio: {
    color: "white",
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
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
  selectPlatformContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  platformButton: {
    backgroundColor: "#9370DB",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  platformButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  socialMediaContainer: {
    padding: 15,
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    margin: 15,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  platformStatsContainer: {
    height: 80,
  },
  platformsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  selectedPlatformButton: {
    backgroundColor: "#8A2BE2",
  },
  selectedPlatformText: {
    color: "white",
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    marginHorizontal: 2,
  },
  statLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  statValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#888",
    fontSize: 10,
    marginLeft: 3,
  },
  statsLoading: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaLinksContainer: {
    marginTop: 15,
  },
  mediaLinksTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  mediaGrid: {
    paddingBottom: 10,
  },
  mediaItem: {
    width: (width - 50) / 3,
    height: (width - 50) / 3,
    margin: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  noMediaContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noMediaText: {
    color: "#888",
    fontSize: 14,
    marginTop: 10,
  },
  portfolioLinksContainer: {
    padding: 15,
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    margin: 15,
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
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 233,
    backgroundColor: "#000",
    zIndex: 1000,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },
})

export default ProfileContent