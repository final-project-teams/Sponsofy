import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from "../theme/ThemeContext";
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import api from '../config/axios';
import Header from '../components/Header';
import BottomNavBar from '../components/BottomNavBar';

const formatMessageTime = (timestamp: string) => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));

  if (diffMinutes < 1) return 'now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return messageDate.toLocaleDateString();
};

const ChatListScreen = ({ navigation }) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await api.get('/rooms/user');
      // Fetch last message for each chat room
      const chatsWithLastMessage = await Promise.all(
        response.data.map(async (chat) => {
          const messagesResponse = await api.get(`/messages/room/${chat.id}`);
          const lastMessage = messagesResponse.data[0] || null;
          return {
            ...chat,
            lastMessage
          };
        })
      );
      setChats(chatsWithLastMessage);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setLoading(false);
    }
  };

  const handleChatPress = (roomId) => {
    navigation.navigate('ChatScreen', { roomId });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.black }]}>
      <Header title="Sponsofy" />

      <View style={[styles.searchContainer, { backgroundColor: currentTheme.colors.surface }]}>
        <Icon name="search" size={20} color={currentTheme.colors.text} style={styles.searchIcon} />
        <Text style={[styles.searchPlaceholder, { color: currentTheme.colors.text }]}>search...</Text>
      </View>

      <View style={styles.contractsSection}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>Completed Contracts With</Text>
        <TouchableOpacity
          style={[styles.lockedContent, { borderColor: currentTheme.colors.border }]}
        >
          <Icon name="lock-closed" size={20} color={currentTheme.colors.text} />
          <Text style={[styles.lockText, { color: currentTheme.colors.text }]}>
            Unlock With Premium Membership
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.messagesSection}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>Messages</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          </View>
        ) : (
          <ScrollView style={styles.chatList}>
            {chats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={[styles.chatItem, { borderBottomColor: currentTheme.colors.border }]}
                onPress={() => handleChatPress(chat.id)}
              >
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, { backgroundColor: currentTheme.colors.surface }]}>
                    <Text style={[styles.avatarText, { color: currentTheme.colors.text }]}>
                      {chat.participants[0]?.username?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                </View>
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={[
                      styles.username,
                      {
                        color: currentTheme.colors.text,
                        fontWeight: chat.lastMessage?.sender.id !== user?.id ? 'bold' : 'normal'
                      }
                    ]}>
                      {chat.participants[0]?.username || 'Username'}
                    </Text>
                    {chat.lastMessage && (
                      <Text style={[styles.timeText, { color: currentTheme.colors.textSecondary }]}>
                        {formatMessageTime(chat.lastMessage.created_at)}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.lastMessage,
                      {
                        color: currentTheme.colors.textSecondary,
                        fontWeight: chat.lastMessage?.sender.id !== user?.id ? 'bold' : 'normal'
                      }
                    ]}
                    numberOfLines={1}
                  >
                    {chat.lastMessage?.content || 'No messages yet'}
                  </Text>
                </View>
                <Icon name="camera-outline" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
  },
  contractsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
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
    paddingHorizontal: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '500',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    fontSize: 12,
  },
  username: {
    fontSize: 14,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatList: {
    flex: 1,
  },
});

export default ChatListScreen;