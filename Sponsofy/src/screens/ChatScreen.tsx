import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import io from 'socket.io-client';

const ChatComponent = ({ serverUrl = 'http://192.168.119.201:3000', username = 'Username' }) => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Initialize socket
    const newSocket = io(serverUrl);
    
    newSocket.on('connect', () => {
      console.log('Connected to socket server with ID:', newSocket.id);
    });
    
    newSocket.on('message', (data) => {
      setMessages(prevMessages => [
        ...prevMessages, 
        { 
          id: Date.now().toString(),
          text: data.text,
          sent: data.userId !== newSocket.id,
          isImage: data.isImage || false,
          timestamp: new Date(data.timestamp)
        }
      ]);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [serverUrl]);

  const sendMessage = () => {
    if (socket && message.trim()) {
      const messageData = {
        text: message,
        userId: socket.id,
        timestamp: new Date().toISOString(),
        isImage: false
      };

      // Send to server
      socket.emit('message', messageData);
      
      // Log the message sent
      console.log('Message sent:', messageData);
      
      // Add to local state (as a sent message)
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          text: message,
          sent: true,
          isImage: false,
          timestamp: new Date()
        }
      ]);
      
      setMessage('');
    }
  };

  const sendImage = (imageUrl) => {
    if (socket && imageUrl) {
      const messageData = {
        text: imageUrl,
        userId: socket.id,
        timestamp: new Date().toISOString(),
        isImage: true
      };

      // Send to server
      socket.emit('message', messageData);
      
      // Add to local state (as a sent message)
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          text: imageUrl,
          sent: true,
          isImage: true,
          timestamp: new Date()
        }
      ]);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getToday = () => {
    return 'Today ' + formatTime(new Date()).slice(0, 5);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{username.charAt(0)}</Text>
          </View>
          <Text style={styles.username}>{username}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="call" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="video" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date indicator */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{getToday()}</Text>
      </View>

      {/* Messages */}
      <ScrollView 
        style={styles.messagesContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }}
      >
        {messages.map((msg) => (
          <View 
            key={msg.id} 
            style={[
              styles.messageBubble, 
              msg.sent ? styles.sentBubble : styles.receivedBubble
            ]}
          >
            {msg.isImage ? (
              <Image
                source={{ uri: msg.text }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={[
                styles.messageText,
                msg.sent ? styles.sentText : styles.receivedText
              ]}>
                {msg.text}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.attachmentContainer}>
          <TouchableOpacity 
            style={styles.attachmentButton}
            onPress={() => {
              // Here you would normally implement image picker
              // For simplicity, we'll use a placeholder
              sendImage('https://via.placeholder.com/300');
            }}
          >
            <Feather name="image" size={20} color="#888" />
            <Text style={styles.attachmentText}>Add a photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachmentButton}>
            <Feather name="video" size={20} color="#888" />
            <Text style={styles.attachmentText}>Add a video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachmentButton}>
            <Feather name="file" size={20} color="#888" />
            <Text style={styles.attachmentText}>Add a file</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.messageInputContainer}>
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons name="happy-outline" size={24} color="#888" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Message..."
            placeholderTextColor="#888"
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={sendMessage}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  username: {
    color: 'white',
    marginLeft: 10,
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  dateContainer: {
    alignItems: 'center',
    padding: 10,
  },
  dateText: {
    color: '#888',
    fontSize: 12,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
  },
  receivedBubble: {
    backgroundColor: '#333',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  sentBubble: {
    backgroundColor: '#6933FF', // Purple color from the image
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  receivedText: {
    color: 'white',
  },
  sentText: {
    color: 'white',
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  inputContainer: {
    borderTopWidth: 0.5,
    borderTopColor: '#333',
  },
  attachmentContainer: {
    backgroundColor: '#111',
    padding: 10,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  attachmentText: {
    color: '#888',
    marginLeft: 10,
    fontSize: 14,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  emojiButton: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 20,
    padding: 10,
    color: 'white',
  },
  sendButton: {
    marginLeft: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6933FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatComponent;