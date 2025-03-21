"use client"

import { useState, useEffect } from "react"
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
  TextInput, // Import TextInput
} from "react-native"
import { Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../config/axios"

// Get screen dimensions
const { width } = Dimensions.get("window")

// Custom number picker component
const NumberScrollPicker = ({ value, onChange, max, label, color }) => {
  // Convert the value to a string and pad with zeros to ensure at least 7 digits
  const valueStr = value.toString().padStart(7, "0")
  const digits = valueStr.split("")

  // Generate increments for each digit position
  const generateIncrements = (position) => {
    const increment = Math.pow(10, 6 - position)
    return {
      increment,
      decrement: increment,
    }
  }

  const handleIncrement = (position) => {
    const { increment } = generateIncrements(position)
    const newValue = Math.min(value + increment, max)
    onChange(newValue)
  }

  const handleDecrement = (position) => {
    const { decrement } = generateIncrements(position)
    const newValue = Math.max(value - decrement, 0)
    onChange(newValue)
  }

  return (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <View style={styles.valueContainer}>
        {/* Millions */}
        <View style={styles.digitContainer}>
          <TouchableOpacity
            style={[styles.arrowButton, { backgroundColor: color }]}
            onPress={() => handleIncrement(0)}
            disabled={value + 1000000 > max}
          >
            <Feather name="chevron-up" size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.digitDisplay}>
            <Text style={styles.digitText}>{digits[0]}</Text>
          </View>
          <TouchableOpacity
            style={[styles.arrowButton, { backgroundColor: color }]}
            onPress={() => handleDecrement(0)}
            disabled={value < 1000000}
          >
            <Feather name="chevron-down" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* 100k */}
        <View style={styles.digitContainer}>
          <TouchableOpacity
            style={[styles.arrowButton, { backgroundColor: color }]}
            onPress={() => handleIncrement(1)}
            disabled={value + 100000 > max}
          >
            <Feather name="chevron-up" size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.digitDisplay}>
            <Text style={styles.digitText}>{digits[1]}</Text>
          </View>
          <TouchableOpacity
            style={[styles.arrowButton, { backgroundColor: color }]}
            onPress={() => handleDecrement(1)}
            disabled={value < 100000}
          >
            <Feather name="chevron-down" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* 10k */}
        <View style={styles.digitContainer}>
          <TouchableOpacity
            style={[styles.arrowButton, { backgroundColor: color }]}
            onPress={() => handleIncrement(2)}
            disabled={value + 10000 > max}
          >
            <Feather name="chevron-up" size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.digitDisplay}>
            <Text style={styles.digitText}>{digits[2]}</Text>
          </View>
          <TouchableOpacity
            style={[styles.arrowButton, { backgroundColor: color }]}
            onPress={() => handleDecrement(2)}
            disabled={value < 10000}
          >
            <Feather name="chevron-down" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* 1k */}
        <View style={styles.digitContainer}>
          <TouchableOpacity
            style={[styles.arrowButton, { backgroundColor: color }]}
            onPress={() => handleIncrement(3)}
            disabled={value + 1000 > max}
          >
            <Feather name="chevron-up" size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.digitDisplay}>
            <Text style={styles.digitText}>{digits[3]}</Text>
          </View>
          <TouchableOpacity
            style={[styles.arrowButton, { backgroundColor: color }]}
            onPress={() => handleDecrement(3)}
            disabled={value < 1000}
          >
            <Feather name="chevron-down" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* 100s */}
        <View style={styles.digitContainer}>
          <TouchableOpacity
            style={[styles.arrowButton, { backgroundColor: color }]}
            onPress={() => handleIncrement(4)}
            disabled={value + 100 > max}
          >
            <Feather name="chevron-up" size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.digitDisplay}>
            <Text style={styles.digitText}>{digits[4]}</Text>
          </View>
          <TouchableOpacity
            style={[styles.arrowButton, { backgroundColor: color }]}
            onPress={() => handleDecrement(4)}
            disabled={value < 100}
          >
            <Feather name="chevron-down" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* 10s */}
        <View style={styles.digitContainer}>
          <TouchableOpacity
            style={[styles.arrowButton, { backgroundColor: color }]}
            onPress={() => handleIncrement(5)}
            disabled={value + 10 > max}
          >
            <Feather name="chevron-up" size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.digitDisplay}>
            <Text style={styles.digitText}>{digits[5]}</Text>
          </View>
          <TouchableOpacity
            style={[styles.arrowButton, { backgroundColor: color }]}
            onPress={() => handleDecrement(5)}
            disabled={value < 10}
          >
            <Feather name="chevron-down" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* 1s */}
        <View style={styles.digitContainer}>
          <TouchableOpacity
            style={[styles.arrowButton, { backgroundColor: color }]}
            onPress={() => handleIncrement(6)}
            disabled={value + 1 > max}
          >
            <Feather name="chevron-up" size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.digitDisplay}>
            <Text style={styles.digitText}>{digits[6]}</Text>
          </View>
          <TouchableOpacity
            style={[styles.arrowButton, { backgroundColor: color }]}
            onPress={() => handleDecrement(6)}
            disabled={value === 0}
          >
            <Feather name="chevron-down" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const SocialMediaStats = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { platform } = route.params
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [socialMediaData, setSocialMediaData] = useState({
    audience: "",
    views: 0,
    likes: 0,
    followers: 0,
  })

  // Maximum values for each metric
  const MAX_FOLLOWERS = 10000000 // 10 million
  const MAX_LIKES = 500000000 // 500 million
  const MAX_VIEWS = 1000000000 // 1 billion

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
  }

  const config = platformConfig[platform]

  // Fetch user profile and platform data
  const fetchUserData = async () => {
    try {
      setLoading(true)
      const token = await AsyncStorage.getItem("userToken")

      if (token) {
        const response = await api.get("/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setUserProfile(response.data.user)

        // Find platform-specific data if it exists
        const platformData = response.data.user.profile.Media?.find((item) => item.platform === platform)

        if (platformData) {
          setSocialMediaData({
            audience: platformData.audience || "",
            views: platformData.views || 0,
            likes: platformData.likes || 0,
            followers: platformData.followers || 0,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      Alert.alert("Error", "Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  // Call API to update platform stats
  const handleUpdateStats = async () => {
    try {
      setSubmitting(true)
      const token = await AsyncStorage.getItem("userToken")

      if (!token) {
        Alert.alert("Error", "You need to be logged in to update your profile.")
        return
      }

      const response = await api.post(
        "/api/media",
        {
          media_type: "image", // Default media type
          platform,
          file_url: "placeholder.jpg", // Placeholder value
          file_name: "placeholder.jpg", // Placeholder value
          file_format: "jpg", // Placeholder value
          description: `${platform} stats`,
          audience: socialMediaData.audience,
          views: socialMediaData.views,
          likes: socialMediaData.likes,
          followers: socialMediaData.followers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      Alert.alert("Success", `Your ${config.name} stats have been updated!`)
      navigation.goBack()
    } catch (error) {
      console.error("Error updating social media stats:", error)
      Alert.alert("Error", "Failed to update stats. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [platform])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={config.color} />
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
})

export default SocialMediaStats

