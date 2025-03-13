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
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useTheme } from "../theme/ThemeContext";
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'react-native-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { API_URL } from '../config/source';
import { SOCKET_URL } from '../config/source';
import { useSocket } from '../context/socketContext';

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
  Media?: {
    id: string;
    media_type: 'image' | 'video' | 'audio' | 'document';
    file_url: string;
    file_name: string;
    file_size: number;
    file_format: string;
  };
  roomId?: string;
}

// Add type for file upload
interface UploadFile {
  name?: string;
  fileName?: string;
  type?: string;
  mimeType?: string;
  uri: string;
  size?: number;
}

const formatMessageTime = (timestamp: string) => {
  try {
    const now = new Date();
    const messageDate = new Date(timestamp);

    if (isNaN(messageDate.getTime())) {
      return 'just now';
    }

    const diffMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return messageDate.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'just now';
  }
};

const ChatScreen = ({ route, navigation }) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const { chatSocket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { roomId } = route.params;
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadMessages();

    if (!chatSocket) {
      console.error('Socket not initialized');
      return;
    }

    // Initialize user in the socket
    chatSocket.emit('init_user', {
      id: user.id,
      username: user.username
    });

    // Join the room
    chatSocket.emit('join_room', {
      roomId,
      userId: user.id
    });

    // Listen for new messages
    chatSocket.on('receive_message', (message) => {
      console.log('Received message:', message);
      setMessages(prevMessages => {
        // Check if message already exists to avoid duplicates
        if (prevMessages.some(m => m.id === message.id)) {
          return prevMessages;
        }
        // Add new message to the beginning since FlatList is inverted
        return [message, ...prevMessages];
      });
    });

    // Listen specifically for media messages
    chatSocket.on('receive_media_message', (message) => {
      console.log('Received media message:', message);
      setMessages(prevMessages => {
        // Check if message already exists to avoid duplicates
        if (prevMessages.some(m => m.id === message.id)) {
          return prevMessages;
        }
        // Add new message to the beginning since FlatList is inverted
        return [message, ...prevMessages];
      });
    });

    // Cleanup socket listeners when component unmounts
    return () => {
      if (chatSocket) {
        chatSocket.off('receive_message');
        chatSocket.off('receive_media_message');
        chatSocket.emit('leave_room', {
          roomId,
          userId: user.id
        });
      }
    };
  }, [roomId, chatSocket, user]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/messages/room/${roomId}`);
      if (response.data) {
        console.log("Messages from server:", JSON.stringify(response.data, null, 2));

        // Apply the fix to messages
        const fixedMessages = fixMessagesWithMedia(response.data);
        setMessages(fixedMessages);
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
      if (!chatSocket || !isConnected) {
        console.error('Socket not connected');
        return;
      }

      // Create a temporary message
      const tempMessage = {
        id: `temp_${Date.now()}`,
        content: newMessage,
        sender: {
          id: user.id,
          username: user.username,
          first_name: user.first_name || '',
          last_name: user.last_name || ''
        },
        created_at: new Date().toISOString()
      };

      // Add temporary message immediately
      setMessages(prevMessages => [tempMessage, ...prevMessages]);

      // First, save to database
      const response = await api.post(`/messages/room/${roomId}`, {
        content: newMessage
      });

      if (response.data) {
        // Replace temporary message with server response
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === tempMessage.id ? response.data : msg
          )
        );

        // Then, emit through socket for real-time update
        chatSocket.emit('new_message', {
          ...response.data,
          roomId,
          content: newMessage,
          userId: user.id,
          sender: {
            id: user.id,
            username: user.username,
            first_name: user.first_name || '',
            last_name: user.last_name || ''
          }
        });
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temporary message if sending failed
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.id !== tempMessage.id)
      );
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'mixed',
        quality: 0.8,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Convert ImagePicker asset to UploadFile type
        const uploadFile: UploadFile = {
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'image.jpg',
          size: asset.fileSize
        };
        await uploadMedia(uploadFile);
      }
    } catch (error) {
      console.error('ImagePicker Error:', error);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Convert DocumentPicker asset to UploadFile type
        const uploadFile: UploadFile = {
          uri: asset.uri,
          type: asset.mimeType || 'application/octet-stream',
          name: asset.name,
          size: asset.size
        };
        await uploadMedia(uploadFile);
      }
    } catch (err) {
      console.error('Document Picker Error:', err);
    }
  };

  const uploadMedia = async (file: UploadFile) => {
    if (!chatSocket || !isConnected) {
      console.error('Socket not connected');
      return;
    }

    const tempMessageId = `temp_${Date.now()}`;
    const tempMessage: Message = {
      id: tempMessageId,
      content: newMessage || 'Sent a file',
      sender: {
        id: user.id,
        username: user.username,
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      },
      created_at: new Date().toISOString(),
      Media: {
        id: 'temp',
        media_type: (file.type?.includes('image') ? 'image' :
          file.type?.includes('video') ? 'video' :
            file.type?.includes('audio') ? 'audio' : 'document') as 'image' | 'video' | 'audio' | 'document',
        file_url: file.uri,
        file_name: file.name || 'Unknown file',
        file_size: file.size || 0,
        file_format: file.type || 'unknown'
      }
    };

    try {
      setIsUploading(true);
      console.log("Uploading file:", file);

      // Add the temporary message to the beginning of the messages list
      setMessages(prevMessages => [tempMessage, ...prevMessages]);

      // Create FormData for upload
      const formData = new FormData();
      const fileBlob = {
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        name: file.name || 'file'
      };
      formData.append('file', fileBlob as any);

      if (newMessage.trim()) {
        formData.append('content', newMessage);
      }

      // Upload the file
      const response = await api.post(
        `/messages/room/${roomId}/media`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("Upload response:", response.data);

      if (response.data) {
        // Replace the temporary message with the server response
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === tempMessageId ? response.data : msg
          )
        );

        // Emit socket event for real-time update
        chatSocket.emit('new_message_with_media', {
          ...response.data,
          roomId,
          sender: {
            id: user.id,
            username: user.username,
            first_name: user.first_name || '',
            last_name: user.last_name || ''
          }
        });

        setNewMessage('');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      // Remove the temporary message if upload fails
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.id !== tempMessageId)
      );
      Alert.alert('Error', 'Failed to upload media');
    } finally {
      setIsUploading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isSentByMe = item.sender.id === user?.id;

    // Check if Media exists and has a file_url
    const hasMedia = item.Media && item.Media.file_url;

    console.log("Rendering message:", item.id, "Has media:", hasMedia);

    // Add this debug log to see the full message object
    console.log("Full message object:", JSON.stringify(item));

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
          {/* Show a placeholder for debugging */}
          {item.content === 'Sent a file' && !hasMedia && (
            <View style={styles.mediaPlaceholder}>
              <Text style={{ color: 'white' }}>Media not loaded properly</Text>
              <Text style={{ color: 'white', fontSize: 10 }}>Check console for details</Text>
            </View>
          )}

          {/* Render media based on type */}
          {hasMedia && item.Media.media_type === 'image' && (
            <View style={styles.mediaImageContainer}>
              <Image
                source={{ uri: `${API_URL}/uploads/images/${item.Media.file_name}` }}
                style={styles.mediaImage}
                resizeMode="cover"
              />
            </View>
          )}

          {hasMedia && item.Media.media_type === 'video' && (
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: `${API_URL}/uploads/videos/${item.Media.file_name}` }}
                style={styles.mediaVideo}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
              />
            </View>
          )}

          {hasMedia && item.Media.media_type === 'audio' && (
            <View style={styles.audioContainer}>
              <Icon name="musical-note" size={24} color={isSentByMe ? '#FFFFFF' : currentTheme.colors.text} />
              <Text style={[styles.mediaFileName, { color: isSentByMe ? '#FFFFFF' : currentTheme.colors.text }]}>
                {item.Media.file_name}
              </Text>
            </View>
          )}

          {hasMedia && item.Media.media_type === 'document' && (
            <View style={styles.documentContainer}>
              <Icon name="document-text" size={24} color={isSentByMe ? '#FFFFFF' : currentTheme.colors.text} />
              <Text style={[styles.mediaFileName, { color: isSentByMe ? '#FFFFFF' : currentTheme.colors.text }]}>
                {item.Media.file_name}
              </Text>
            </View>
          )}

          {/* Only show content if it's not the default "Sent a file" message or if there's no media */}
          {(!hasMedia || (item.content && item.content !== 'Sent a file')) && (
            <Text style={[
              styles.messageText,
              { color: isSentByMe ? '#FFFFFF' : currentTheme.colors.text }
            ]}>
              {item.content}
            </Text>
          )}

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

  // Add this function to manually fix messages with missing media
  const fixMessagesWithMedia = (messages) => {
    return messages.map(message => {
      // If the message content is "Sent a file" but has no Media property,
      // we'll create a placeholder Media object
      if (message.content === 'Sent a file' && !message.Media) {
        console.log(`Adding placeholder Media for message ${message.id}`);
        return {
          ...message,
          Media: {
            id: 'placeholder',
            media_type: 'document',
            file_url: null,
            file_name: 'Unknown file',
            file_size: 0,
            file_format: 'unknown'
          }
        };
      }
      return message;
    });
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
        <View style={styles.mediaButtons}>
          <TouchableOpacity onPress={handlePickImage} style={styles.mediaButton}>
            <Icon name="image" size={24} color={currentTheme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePickDocument} style={styles.mediaButton}>
            <Icon name="document" size={24} color={currentTheme.colors.text} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, { color: currentTheme.colors.text, backgroundColor: currentTheme.colors.surface }]}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={currentTheme.colors.textSecondary}
          multiline
        />

        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: currentTheme.colors.primary }]}
          onPress={handleSendMessage}
          disabled={isUploading || (!newMessage.trim() && !isUploading)}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
              <Icon name="send" size={20} color="#FFFFFF" />
          )}
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
  mediaButtons: {
    flexDirection: 'row',
    marginRight: 8,
  },
  mediaButton: {
    marginHorizontal: 4,
  },
  mediaImageContainer: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  videoContainer: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#000',
  },
  mediaVideo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediaFileName: {
    marginLeft: 8,
    fontSize: 14,
  },
  mediaPlaceholder: {
    width: 200,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;