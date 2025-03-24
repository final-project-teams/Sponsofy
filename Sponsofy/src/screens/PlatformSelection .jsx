import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Twitter, Instagram, Facebook, Youtube } from "lucide-react-native";

const PlatformSelection = () => {
  const navigation = useNavigation();

  const platforms = [
    { name: "instagram", icon: Instagram, color: "#E1306C" },
    { name: "facebook", icon: Facebook, color: "#1877F2" },
    { name: "tiktok", icon: () => <Text style={styles.tiktokIcon}>TikTok</Text>, color: "#000000" },
    { name: "youtube", icon: Youtube, color: "#FF0000" },
  ];

  const handleSelectPlatform = (platform) => {
    navigation.navigate("CriteriaSelection", { platform });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Platform</Text>
      <View style={styles.buttonsContainer}>
        {platforms.map((platform) => (
          <TouchableOpacity
            key={platform.name}
            style={[styles.platformButton, { backgroundColor: platform.color }]}
            onPress={() => handleSelectPlatform(platform.name)}
          >
            <platform.icon color="white" size={24} style={styles.icon} />
            <Text style={styles.platformButtonText}>
              {platform.name.charAt(0).toUpperCase() + platform.name.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  buttonsContainer: {
    gap: 15,
  },
  platformButton: {
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 10,
  },
  tiktokIcon: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  platformButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PlatformSelection;