import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from "../theme/ThemeContext";
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
}

const formatMessageTime = (timestamp: string) => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));

  if (diffMinutes < 1) return 'now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return messageDate.toLocaleDateString();
};

const ChatScreen = ({ route, navigation }) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { roomId } = route.params;

  useEffect(() => {
    loadMessages();
  }, [roomId]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/messages/room/${roomId}`);
      if (response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await api.post(`/messages/room/${roomId}`, {
        content: newMessage
      });

      if (response.data) {
        setMessages(prev => [response.data, ...prev]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isSentByMe = item.sender.id === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isSentByMe ? styles.messageSent : styles.messageReceived,
        ]}
      >
        {!isSentByMe && (
          <Text style={[styles.senderName, { color: currentTheme.colors.textSecondary }]}>
            {item.sender.first_name} {item.sender.last_name}
          </Text>
        )}
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isSentByMe ? currentTheme.colors.primary : currentTheme.colors.surface,
              alignSelf: isSentByMe ? 'flex-end' : 'flex-start',
            }
          ]}
        >
          <Text style={[
            styles.messageText,
            { color: isSentByMe ? '#FFFFFF' : currentTheme.colors.text }
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: isSentByMe ? '#FFFFFF80' : currentTheme.colors.textSecondary }
          ]}>
            {formatMessageTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: currentTheme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.username, { color: currentTheme.colors.text }]}>Chat Room</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="call" size={20} color={currentTheme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="videocam" size={20} color={currentTheme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={currentTheme.colors.primary} style={styles.loader} />
      ) : (
          <FlatList
            style={styles.messagesContainer}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            inverted
          />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: currentTheme.colors.text, backgroundColor: currentTheme.colors.surface }]}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={currentTheme.colors.text}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: currentTheme.colors.primary }]}
          onPress={handleSendMessage}
        >
          <Icon name="send" size={20} color="#FFFFFF" />
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
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  username: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  messageSent: {
    alignSelf: 'flex-end',
  },
  messageReceived: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%',
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;