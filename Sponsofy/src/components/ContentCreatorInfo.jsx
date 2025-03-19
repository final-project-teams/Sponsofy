import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking } from "react-native";
import { FontAwesome, Feather, MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";

const ContentCreatorInfo = ({ creator, onClose }) => {
  // Add debug logging
  console.log("ContentCreatorInfo received:", JSON.stringify(creator, null, 2));

  // Function to handle opening portfolio links
  const handleOpenLink = (url) => {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      Linking.openURL(url);
    } else if (url) {
      Linking.openURL(`https://${url}`);
    }
  };

  // Check if we have data to display
  if (!creator) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No creator information available</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Create a simple display of all available creator information
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Image */}
      <View style={styles.profileImageContainer}>
        {creator.profile_picture ? (
          <Image 
            source={{ uri: creator.profile_picture }} 
            style={styles.profileImage} 
          />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <FontAwesome name="user" size={40} color="#666" />
          </View>
        )}
      </View>

      {/* Creator Information */}
      <View style={styles.infoContainer}>
        {/* Name and Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="user" size={18} color="#8A2BE2" />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{creator.first_name} {creator.last_name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <View style={creator.verified ? styles.verifiedBadge : styles.unverifiedBadge}>
              <Text style={styles.badgeText}>
                {creator.verified ? "Verified" : "Unverified"}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Membership:</Text>
            <View style={creator.isPremium ? styles.premiumBadge : styles.regularBadge}>
              <Text style={styles.badgeText}>
                {creator.isPremium ? "Premium" : "Regular"}
              </Text>
            </View>
          </View>
          
          {creator.category && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category:</Text>
              <Text style={styles.infoValue}>{creator.category}</Text>
            </View>
          )}
        </View>

        {/* Bio */}
        {creator.bio && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="info" size={18} color="#8A2BE2" />
              <Text style={styles.sectionTitle}>Bio</Text>
            </View>
            <Text style={styles.bioText}>{creator.bio || "No bio available"}</Text>
          </View>
        )}

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={18} color="#8A2BE2" />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Text style={styles.infoText}>{creator.location || "No location specified"}</Text>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="money-bill-wave" size={16} color="#8A2BE2" />
            <Text style={styles.sectionTitle}>Pricing</Text>
          </View>
          <View style={styles.pricingContainer}>
            <Text style={styles.pricingText}>{creator.pricing || "No pricing information"}</Text>
          </View>
        </View>

        {/* Portfolio Links */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="link" size={16} color="#8A2BE2" />
            <Text style={styles.sectionTitle}>Portfolio Links</Text>
          </View>
          
          {creator.portfolio_links ? (
            <View style={styles.linksContainer}>
              {creator.portfolio_links.split(',').map((link, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.linkButton}
                  onPress={() => handleOpenLink(link.trim())}
                >
                  <FontAwesome name="external-link" size={14} color="white" style={styles.linkIcon} />
                  <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
                    {link.trim()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.infoText}>No portfolio links available</Text>
          )}
        </View>
      </View>

      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#8A2BE2",
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#8A2BE2",
  },
  infoContainer: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 10,
  },
  sectionTitle: {
    color: "#8A2BE2",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    color: "#888",
    fontSize: 16,
    width: 100,
  },
  infoValue: {
    color: "white",
    fontSize: 16,
    flex: 1,
  },
  bioText: {
    color: "#ddd",
    fontSize: 16,
    lineHeight: 24,
  },
  infoText: {
    color: "#ddd",
    fontSize: 16,
  },
  pricingContainer: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 12,
  },
  pricingText: {
    color: "#2ecc71",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
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
    marginBottom: 8,
  },
  linkIcon: {
    marginRight: 10,
  },
  linkText: {
    color: "#ddd",
    fontSize: 14,
    flex: 1,
  },
  closeButton: {
    backgroundColor: "#8A2BE2",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: "center",
    marginVertical: 20,
    minWidth: 120,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  noDataText: {
    color: "#ddd",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 30,
  },
  verifiedBadge: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  unverifiedBadge: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  premiumBadge: {
    backgroundColor: "#8A2BE2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  regularBadge: {
    backgroundColor: "#3498db",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ContentCreatorInfo;