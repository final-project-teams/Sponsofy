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
  FlatList,
  Modal,
  Linking,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ImagePicker from "expo-image-picker"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import api from "../config/axios"
import { API_URL } from "../config/source"

const ContentCreatorInfo = ({ route }) => {
  const { userId, profile } = route.params
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false)
  const [mediaLoading, setMediaLoading] = useState(false)
  const [userProfile, setUserProfile] = useState(profile || null)
  const [media, setMedia] = useState([])
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [mediaModalVisible, setMediaModalVisible] = useState(false)
  const [addMediaModalVisible, setAddMediaModalVisible] = useState(false)
  const [portfolioLinks, setPortfolioLinks] = useState([])

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

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const token = await AsyncStorage.getItem("userToken")

      if (token) {
        const response = await api.get(`/user/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setUserProfile(response.data.user)

        // Parse portfolio links
        if (response.data.user.portfolio_links) {
          setPortfolioLinks(parsePortfolioLinks(response.data.user.portfolio_links))
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      Alert.alert("Error", "Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  // Fetch media for the content creator
  const fetchMedia = async () => {
    try {
      setMediaLoading(true)
      const token = await AsyncStorage.getItem("userToken")

      if (token) {
        // Assuming there's an endpoint to fetch media for a content creator
        const response = await api.get(`/user/content-creator/${userId}/media`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setMedia(response.data.media || [])
      }
    } catch (error) {
      console.error("Error fetching media:", error)
      // If the API endpoint doesn't exist yet, we'll just show an empty state
      setMedia([])
    } finally {
      setMediaLoading(false)
    }
  }

  // Delete media
  const deleteMedia = async (mediaId) => {
    try {
      setMediaLoading(true)
      const token = await AsyncStorage.getItem("userToken")

      if (token) {
        await api.delete(`/user/media/${mediaId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Remove the deleted media from the state
        setMedia(media.filter((item) => item.id !== mediaId))
        Alert.alert("Success", "Media deleted successfully")
      }
    } catch (error) {
      console.error("Error deleting media:", error)
      Alert.alert("Error", "Failed to delete media")
    } finally {
      setMediaLoading(false)
    }
  }

  // Add new media
  const addMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow access to your photo library.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    })

    if (!result.canceled) {
      const token = await AsyncStorage.getItem("userToken")
      if (!token) {
        Alert.alert("Error", "You need to be logged in to upload media.")
        return
      }

      const file = {
        uri: result.assets[0].uri,
        name: `media-${Date.now()}.${result.assets[0].uri.split(".").pop()}`,
        type: result.assets[0].type || "image/jpeg",
      }

      const formData = new FormData()
      formData.append("media", file)
      formData.append("contentCreatorId", userProfile.id)
      formData.append("description", "Content creator media")

      try {
        setMediaLoading(true)
        const response = await api.post("/user/media", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        })

        // Add the new media to the state
        setMedia([...media, response.data.media])
        Alert.alert("Success", "Media uploaded successfully")
        setAddMediaModalVisible(false)
      } catch (error) {
        console.error("Error uploading media:", error)
        Alert.alert("Error", "Failed to upload media")
      } finally {
        setMediaLoading(false)
      }
    }
  }

  // Refresh data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile()
      fetchMedia()
    }, [userId]),
  )

  if (loading && !userProfile) {
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Creator Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userProfile.ProfilePicture ? (
              <Image
                source={{ uri: `${API_URL}/uploads/images/${userProfile.ProfilePicture.file_name}` }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Feather name="user" size={30} color="#666" />
              </View>
            )}
          </View>

          <Text style={styles.username}>
            {userProfile.first_name} {userProfile.last_name}
          </Text>

          <View style={styles.badgeContainer}>
            {userProfile.verified && (
              <View style={[styles.badge, styles.verifiedBadge]}>
                <Feather name="check" size={12} color="white" />
                <Text style={styles.badgeText}>Verified</Text>
              </View>
            )}

            {userProfile.isPremium && (
              <View style={[styles.badge, styles.premiumBadge]}>
                <Feather name="star" size={12} color="white" />
                <Text style={styles.badgeText}>Premium</Text>
              </View>
            )}
          </View>
        </View>

        {/* Info Sections */}
        <View style={styles.infoContainer}>
          {/* Bio Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <Text style={styles.bioText}>{userProfile.bio || "No bio available"}</Text>
          </View>

          {/* Portfolio Links Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Portfolio Links</Text>
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
              <Text style={styles.noDataText}>No portfolio links available</Text>
            )}
          </View>

          {/* Location Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.infoText}>{userProfile.location || "Not specified"}</Text>
          </View>

          {/* Category Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Category</Text>
            <Text style={styles.infoText}>{userProfile.category || "Not specified"}</Text>
          </View>

          {/* Pricing Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <Text style={styles.infoText}>{userProfile.pricing || "Not specified"}</Text>
          </View>

          {/* Media Gallery Section */}
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Media Gallery</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setAddMediaModalVisible(true)}>
                <Feather name="plus" size={16} color="white" />
                <Text style={styles.addButtonText}>Add Media</Text>
              </TouchableOpacity>
            </View>

            {mediaLoading ? (
              <ActivityIndicator size="small" color="#8A2BE2" style={styles.mediaLoader} />
            ) : media.length > 0 ? (
              <FlatList
                data={media}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.mediaItem}
                    onPress={() => {
                      setSelectedMedia(item)
                      setMediaModalVisible(true)
                    }}
                  >
                    <Image
                      source={{ uri: `${API_URL}/uploads/images/${item.file_name}` }}
                      style={styles.mediaImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.mediaGrid}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.noMediaContainer}>
                <Feather name="image" size={40} color="#666" />
                <Text style={styles.noMediaText}>No media available</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Media Preview Modal */}
      <Modal
        visible={mediaModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMediaModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.mediaModalContent}>
            <View style={styles.mediaModalHeader}>
              <TouchableOpacity onPress={() => setMediaModalVisible(false)}>
                <Feather name="x" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  setMediaModalVisible(false)
                  Alert.alert("Delete Media", "Are you sure you want to delete this media?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => deleteMedia(selectedMedia.id),
                    },
                  ])
                }}
              >
                <Feather name="trash-2" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {selectedMedia && (
              <Image
                source={{ uri: `${API_URL}/uploads/images/${selectedMedia.file_name}` }}
                style={styles.fullMediaImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Add Media Modal */}
      <Modal
        visible={addMediaModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddMediaModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.addMediaModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Media</Text>
              <TouchableOpacity onPress={() => setAddMediaModalVisible(false)}>
                <Feather name="x" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.addMediaOptions}>
              <TouchableOpacity style={styles.addMediaOption} onPress={addMedia}>
                <View style={styles.addMediaIconContainer}>
                  <Feather name="image" size={30} color="white" />
                </View>
                <Text style={styles.addMediaOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addMediaOption}
                onPress={() => {
                  setAddMediaModalVisible(false)
                  // You could add camera functionality here
                }}
              >
                <View style={styles.addMediaIconContainer}>
                  <Feather name="camera" size={30} color="white" />
                </View>
                <Text style={styles.addMediaOptionText}>Take a Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    padding: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#666",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  verifiedBadge: {
    backgroundColor: "#2ecc71",
  },
  premiumBadge: {
    backgroundColor: "#8A2BE2",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  infoContainer: {
    padding: 20,
  },
  infoSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#8A2BE2",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bioText: {
    color: "white",
    fontSize: 16,
    lineHeight: 24,
  },
  infoText: {
    color: "white",
    fontSize: 16,
  },
  noDataText: {
    color: "#888",
    fontSize: 16,
    fontStyle: "italic",
  },
  linksContainer: {
    marginTop: 5,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  linkIcon: {
    marginRight: 10,
  },
  linkText: {
    color: "white",
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8A2BE2",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  mediaLoader: {
    marginVertical: 20,
  },
  mediaGrid: {
    marginTop: 5,
  },
  mediaItem: {
    flex: 1,
    margin: 3,
    aspectRatio: 1,
    maxWidth: "33%",
    borderRadius: 8,
    overflow: "hidden",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  noMediaContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 30,
    marginTop: 10,
  },
  noMediaText: {
    color: "#888",
    fontSize: 16,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  mediaModalContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  mediaModalHeader: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  fullMediaImage: {
    width: "90%",
    height: "80%",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 20,
    padding: 8,
  },
  addMediaModalContent: {
    width: "90%",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  addMediaOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  addMediaOption: {
    alignItems: "center",
    width: "40%",
  },
  addMediaIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#8A2BE2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  addMediaOptionText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
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
})

export default ContentCreatorInfo

