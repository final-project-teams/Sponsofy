import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";

interface SideBarContentProps {
  onProfileClick: () => void;
  onDealsClick: () => void;
  onTransactionsClick: () => void;
  onCardPaymentClick: () => void;
  onActiveContractsClick: () => void;
  onCompletedContractsClick: () => void;
}

const SideBarContent: React.FC<SideBarContentProps> = ({
  onProfileClick,
  onDealsClick,
  onTransactionsClick,
  onCardPaymentClick,
  onActiveContractsClick,
  onCompletedContractsClick,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Sponsofy</Text>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={onProfileClick}>
          <Ionicons name="person-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={onDealsClick}>
          <MaterialIcons name="compare-arrows" size={20} color="#fff" />
          <Text style={styles.menuText}>Accept / Deny Deals</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={onActiveContractsClick}>
          <Ionicons name="timer-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Active Contracts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={onCompletedContractsClick}>
          <MaterialIcons name="pending-actions" size={20} color="#fff" />
          <Text style={styles.menuText}>Completed Contracts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={onCardPaymentClick}>
          <Ionicons name="card-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Payment Methods</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={onTransactionsClick}>
          <Ionicons name="time-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>History Transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Chats Section */}
      <View style={styles.recentChatsContainer}>
        <Text style={styles.sectionTitle}>Recent Chats</Text>

        <View style={styles.chatItem}>
          <View style={styles.avatar} />
          <View style={styles.chatInfo}>
            <Text style={styles.username}>Username</Text>
            <Text style={styles.lastMessage}>last message</Text>
          </View>
        </View>

        <View style={styles.chatItem}>
          <View style={styles.avatar} />
          <View style={styles.chatInfo}>
            <Text style={styles.username}>Username</Text>
            <Text style={styles.lastMessage}>last message</Text>
          </View>
        </View>

        <TouchableOpacity>
          <Text style={styles.seeAll}>see all</Text>
        </TouchableOpacity>
      </View>

      {/* Premium Button */}
      <TouchableOpacity style={styles.premiumButton}>
        <Text style={styles.premiumButtonText}>Join Sponsofy Premium</Text>
      </TouchableOpacity>

      {/* Theme Toggle */}
      <View style={styles.themeToggle}>
        <TouchableOpacity style={styles.themeOption}>
          <Ionicons name="sunny-outline" size={16} color="#fff" />
          <Text style={styles.themeText}>Light</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.themeOption, styles.activeTheme]}>
          <Ionicons name="moon-outline" size={16} color="#fff" />
          <Text style={styles.themeText}>Dark</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingTop: 20,
    width: 233,
  },
  logo: {
    color: "#8B5CF6",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  menuContainer: {
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#111",
    borderRadius: 10,
    marginBottom: 8,
  },
  menuText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 14,
  },
  recentChatsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
  },
  chatInfo: {
    marginLeft: 10,
  },
  username: {
    color: "#fff",
    fontSize: 14,
  },
  lastMessage: {
    color: "#777",
    fontSize: 12,
  },
  seeAll: {
    color: "#777",
    textAlign: "center",
    fontSize: 13,
    marginTop: 5,
  },
  premiumButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 12,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 15,
  },
  premiumButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  themeToggle: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 50,
    overflow: "hidden",
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
  },
  activeTheme: {
    backgroundColor: "#222",
  },
  themeText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 13,
  },
});

export default SideBarContent;