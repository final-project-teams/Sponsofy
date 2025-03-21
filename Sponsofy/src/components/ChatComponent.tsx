import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
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
    timestamp: string;
}

interface ChatComponentProps {
    userId: string;
    username: string;
    first_name: string;
    last_name: string;
    roomId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
    userId,
    username,
    first_name,
    last_name,
    roomId
}) => {
    const { chatSocket, socketConnected, reconnectSocket } = useSocket();
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize user and join room
    useEffect(() => {
        if (!chatSocket || !socketConnected) {
            setIsConnected(false);
            return;
        }

        setIsJoining(true);
        console.log('Initializing user with data:', { userId, username, first_name, last_name });

        // Initialize user
        chatSocket.emit('init_user', {
            id: userId,
            username,
            first_name,
            last_name
        });

        // Listen for initialization success
        const handleInitSuccess = () => {
            console.log('User initialized successfully');

            // Join the room
            chatSocket.emit('join_room', { roomId, userId });
        };

        // Listen for room joined event
        const handleRoomJoined = (data) => {
            console.log('Joined room:', data.roomId);
            console.log('Active users:', data.activeUsers);
            setIsConnected(true);
            setIsJoining(false);
        };

        // Listen for new messages
        const handleReceiveMessage = (message: Message) => {
            console.log('Received message:', message);
            setMessages(prevMessages => [...prevMessages, message]);
        };

        // Listen for typing indicators
        const handleUserTyping = (data) => {
            setTypingUsers(prev => {
                if (!prev.includes(data.username)) {
                    return [...prev, data.username];
                }
                return prev;
            });
        };

        const handleUserStoppedTyping = (data) => {
            setTypingUsers(prev => prev.filter(username => username !== data.username));
        };

        // Listen for message deletion
        const handleMessageDeleted = (data) => {
            setMessages(prevMessages =>
                prevMessages.filter(message => message.id !== data.messageId)
            );
        };

        // Listen for errors
        const handleError = (error) => {
            console.error('Socket error:', error);
            setIsJoining(false);
        };

        // Set up event listeners
        chatSocket.on('init_success', handleInitSuccess);
        chatSocket.on('room_joined', handleRoomJoined);
        chatSocket.on('receive_message', handleReceiveMessage);
        chatSocket.on('user_typing', handleUserTyping);
        chatSocket.on('user_stopped_typing', handleUserStoppedTyping);
        chatSocket.on('message_deleted', handleMessageDeleted);
        chatSocket.on('error', handleError);

        // Clean up on unmount
        return () => {
            if (chatSocket) {
                chatSocket.emit('leave_room', { roomId, userId });
                chatSocket.off('init_success', handleInitSuccess);
                chatSocket.off('room_joined', handleRoomJoined);
                chatSocket.off('receive_message', handleReceiveMessage);
                chatSocket.off('user_typing', handleUserTyping);
                chatSocket.off('user_stopped_typing', handleUserStoppedTyping);
                chatSocket.off('message_deleted', handleMessageDeleted);
                chatSocket.off('error', handleError);
            }
        };
    }, [chatSocket, socketConnected, userId, username, roomId]);

    // Handle typing indicator
    const handleTyping = () => {
        if (!isTyping && chatSocket && isConnected) {
            setIsTyping(true);
            chatSocket.emit('typing_start', { roomId });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            if (chatSocket && isConnected) {
                setIsTyping(false);
                chatSocket.emit('typing_end', { roomId });
            }
        }, 2000);
    };

    // Send message
    const sendMessage = () => {
        if (!messageText.trim() || !chatSocket || !isConnected) return;

        const newMessage = {
            id: Date.now().toString(),
            content: messageText,
            roomId
        };

        console.log('Sending message:', newMessage);
        chatSocket.emit('new_message', newMessage);
        setMessageText('');

        // Stop typing indicator
        if (isTyping) {
            setIsTyping(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            chatSocket.emit('typing_end', { roomId });
        }
    };

    // Delete message
    const deleteMessage = (messageId: string) => {
        if (!chatSocket || !isConnected) return;
        chatSocket.emit('delete_message', { roomId, messageId });
    };

    // Format timestamp
    const formatTime = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (error) {
            console.error('Error formatting time:', error);
            return '';
        }
    };

    // Render message item
    const renderMessageItem = ({ item }: { item: Message }) => {
        const isOwnMessage = item.sender.id === userId;

        return (
            <View style={[
                styles.messageContainer,
                isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
            ]}>
                {!isOwnMessage && (
                    <Text style={styles.senderName}>
                        {item.sender.first_name} {item.sender.last_name}
                    </Text>
                )}
                <View style={[
                    styles.messageBubble,
                    isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
                ]}>
                    <Text style={styles.messageText}>{item.content}</Text>
                    <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
                </View>
                {isOwnMessage && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteMessage(item.id)}
                    >
                        <Text style={styles.deleteButtonText}>×</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (isJoining) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196f3" />
                <Text style={styles.loadingText}>Joining chat room...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {!socketConnected && (
                <View style={styles.connectionError}>
                    <Text style={styles.errorText}>Connection lost</Text>
                    <TouchableOpacity
                        style={styles.reconnectButton}
                        onPress={reconnectSocket}
                    >
                        <Text style={styles.reconnectText}>Reconnect</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={item => item.id}
                style={styles.messagesList}
            />

            {typingUsers.length > 0 && (
                <View style={styles.typingContainer}>
                    <Text style={styles.typingText}>
                        {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </Text>
                </View>
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={messageText}
                    onChangeText={(text) => {
                        setMessageText(text);
                        handleTyping();
                    }}
                    placeholder="Type a message..."
                    placeholderTextColor="#999"
                    editable={isConnected}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!messageText.trim() || !isConnected) && styles.disabledButton
                    ]}
                    onPress={sendMessage}
                    disabled={!messageText.trim() || !isConnected}
                >
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    connectionError: {
        backgroundColor: '#ffebee',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    errorText: {
        color: '#d32f2f',
        fontWeight: 'bold',
    },
    reconnectButton: {
        backgroundColor: '#d32f2f',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    reconnectText: {
        color: 'white',
        fontWeight: 'bold',
    },
    messagesList: {
        flex: 1,
        padding: 10,
    },
    messageContainer: {
        marginBottom: 10,
        maxWidth: '80%',
    },
    ownMessageContainer: {
        alignSelf: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
    },
    otherMessageContainer: {
        alignSelf: 'flex-start',
    },
    senderName: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    messageBubble: {
        padding: 10,
        borderRadius: 16,
        minWidth: 80,
    },
    ownMessageBubble: {
        backgroundColor: '#e3f2fd',
        borderBottomRightRadius: 4,
    },
    otherMessageBubble: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        color: '#333',
    },
    messageTime: {
        fontSize: 10,
        color: '#999',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    deleteButton: {
        marginLeft: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ffebee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: 18,
        color: '#d32f2f',
        fontWeight: 'bold',
    },
    typingContainer: {
        padding: 8,
        backgroundColor: '#f0f0f0',
    },
    typingText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: '#2196f3',
        borderRadius: 20,
        paddingHorizontal: 15,
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#bdbdbd',
    },
    sendButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ChatComponent; 