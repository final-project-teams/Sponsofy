import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const ChatListScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const chats = [
    { id: '1', username: 'hama', lastMessage: 'baatour' },
    { id: '2', username: 'Username', lastMessage: 'last message' },
    { id: '3', username: 'Username', lastMessage: 'last message' },
    { id: '4', username: 'Username', lastMessage: 'last message' },
    { id: '5', username: 'Username', lastMessage: 'last message' },
    { id: '6', username: 'Username', lastMessage: 'last message' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Sponsofy</Text>
        <TouchableOpacity>
          <Icon name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={colors.text} style={styles.searchIcon} />
        <Text style={[styles.searchPlaceholder, { color: colors.text }]}>Search...</Text>
      </View>

      <View style={styles.contractsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Completed Contracts With</Text>
        <View style={[styles.lockedContent, { borderColor: colors.border }]}>
          <Icon name="lock-closed" size={24} color={colors.text} />
          <Text style={[styles.lockText, { color: colors.text }]}>Unlock With Premium Membership</Text>
        </View>
      </View>

      <View style={styles.messagesSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Messages</Text>
        <ScrollView>
          {chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatItem}
              onPress={() => navigation.navigate('Chat', { roomId: chat.id })}
            >
              <View style={styles.avatar} />
              <View style={styles.chatInfo}>
                <Text style={[styles.username, { color: colors.text }]}>{chat.username}</Text>
                <Text style={[styles.lastMessage, { color: colors.text }]}>{chat.lastMessage}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="search-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="add-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNav]}>
          <Icon name="chatbubble-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="person-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    opacity: 0.6,
  },
  contractsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  lockedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  lockText: {
    fontSize: 14,
  },
  messagesSection: {
    flex: 1,
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    opacity: 0.7,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navItem: {
    padding: 8,
  },
  activeNav: {
    backgroundColor: 'rgba(128, 0, 128, 0.1)',
    borderRadius: 8,
  },
});

export default ChatListScreen;