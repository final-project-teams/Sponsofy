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
import { useTheme } from '@react-navigation/native';
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

const ChatScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
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
      const response = await api.get(`/messages/${roomId}`);
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
      const response = await api.post(`/messages/${roomId}`, {
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
          <Text style={styles.senderName}>
            {item.sender.first_name} {item.sender.last_name}
          </Text>
        )}
        <View
          style={[
            styles.messageBubble,
            { backgroundColor: isSentByMe ? colors.primary : colors.card }
          ]}
        >
          <Text style={[
            styles.messageText,
            { color: isSentByMe ? '#FFFFFF' : colors.text }
          ]}>
            {item.content}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.username, { color: colors.text }]}>Chat Room</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="call" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="videocam" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
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
          style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={colors.text}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
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