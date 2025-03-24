import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const PlatformSelectionMedia = () => {
  const navigation = useNavigation();

  const handlePlatformSelect = (platform) => {
    navigation.navigate("SocialMediaStats", { platform });
  };

  const platforms = [
    {
      id: "instagram",
      name: "Instagram",
      icon: "instagram",
      color: "#E1306C",
      iconFamily: "FontAwesome",
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: "youtube",
      color: "#FF0000",
      iconFamily: "FontAwesome",
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: "tiktok", // Using custom icon or approx equivalent
      color: "#000000",
      iconFamily: "FontAwesome5",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: "facebook",
      color: "#1877F2",
      iconFamily: "FontAwesome",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Platform</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>What's this for?</Text>
        <Text style={styles.instructionsText}>
          Select a social media platform to update your stats including views,
          likes, and followers. These metrics help sponsors understand your
          reach and engagement.
        </Text>

        <Text style={styles.instructionsNote}>
          Note : when You add a picture link to your profile picture the number
          of likes and views will be added to that image not the platform
        </Text>
      </View>
      {/* Platform Grid */}
      <View style={styles.platformContainer}>
        {platforms.map((platform) => (
          <TouchableOpacity
            key={platform.id}
            style={[styles.platformButton, { backgroundColor: platform.color }]}
            onPress={() => handlePlatformSelect(platform.id)}
          >
            {platform.iconFamily === "FontAwesome" ? (
              <FontAwesome name={platform.icon} size={32} color="white" />
            ) : (
              <FontAwesome5 name={platform.icon} size={32} color="white" />
            )}
            <Text style={styles.platformText}>{platform.name}</Text>
          </TouchableOpacity>
        ))}
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  platformContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 20,
  },
  platformButton: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  platformText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  instructionsContainer: {
    padding: 20,
    backgroundColor: "#1E1E1E",
    margin: 20,
    borderRadius: 10,
  },
  instructionsTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  instructionsText: {
    color: "#CCC",
    lineHeight: 20,
  },
  instructionsNote: {
    color: "#CCC",
    lineHeight: 20,
    marginTop: 10,
    fontWeight: "bold",
  },
});

export default PlatformSelectionMedia;
