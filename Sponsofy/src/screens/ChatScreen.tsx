import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { socketService } from '../services/socketService';
import { chatService } from '../services/api';
import api from '../config/axios';
interface Message {
  id: string;
  content: string;
  UserId: string;
  created_at: string;
}

const ChatScreen = ({ route }) => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const roomId = route.params?.roomId || '1';
  const currentUserId = '1'; // Replace with actual user ID from your auth system
const getTest = async () => {
  try {

    const response = await api.get("/");
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",response.data)
  } catch (error) {
    console.error('Error loading messages:', error);  
  }
}
  useEffect(() => {
    getTest();
    // loadMessages();
    // setupSocketConnection();

    // return () => {
    //   socketService.disconnect();
    // };
  }, []);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await chatService.getMessages(roomId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketConnection = () => {
    // socketService.connect(/* your auth token */);
    socketService.joinRoom(roomId);
    socketService.onReceiveMessage((message) => {
      setMessages(prev => [...prev, message]);
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      socketService.sendMessage({
        roomId,
        message: newMessage,
        userId: currentUserId
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isSentByMe = item.UserId === currentUserId;

    return (
      <View
        style={[
          isSentByMe ? styles.messageSent : styles.messageReceived,
          { backgroundColor: isSentByMe ? colors.primary : colors.card }
        ]}
      >
        <Text style={[
          styles.messageText,
          { color: isSentByMe ? '#FFFFFF' : colors.text }
        ]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.username, { color: colors.text }]}>Username</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="call" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="videocam" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        style={styles.messagesContainer}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        inverted
      />

      <View style={styles.inputContainer}>
        <View style={styles.attachmentButtons}>
          <TouchableOpacity>
            <Icon name="image" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="videocam" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="document" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Message..."
            placeholderTextColor={colors.border}
            style={[styles.input, { color: colors.text }]}
          />
          <TouchableOpacity onPress={handleSendMessage}>
            <Icon name="send" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ... existing styles remain the same ...



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
    fontWeight: '600',
    marginLeft: 12,
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
  messageReceived: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  messageSent: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
  },
  messageSentText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  inputContainer: {
    padding: 16,
  },
  attachmentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 24,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
  },
});

export default ChatScreen;