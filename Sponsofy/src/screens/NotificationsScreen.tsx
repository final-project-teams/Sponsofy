import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/axios';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/source';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch existing notifications
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/notifications');
        setNotifications(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up socket connection for real-time notifications
    const setupSocket = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const socket = io(`${API_URL}/notification`);
        
        socket.on('connect', () => {
          console.log('Connected to notification socket');
          socket.emit('subscribe_notifications', userId);
        });

        socket.on('new_notification', (notification) => {
          console.log('Received new notification:', notification);
          setNotifications(prev => [notification, ...prev]);
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        return () => {
          socket.disconnect();
        };
      } catch (error) {
        console.error('Error setting up socket:', error);
      }
    };

    const cleanup = setupSocket();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, item.read ? styles.readNotification : styles.unreadNotification]}
      onPress={() => {
        markAsRead(item.id);
        // Navigate to the relevant screen based on notification type
        if (item.type === 'deal_accepted') {
          const dealId = item.link.split('/').pop();
          navigation.navigate('DealDetails', { dealId });
        }
      }}
    >
      <View style={styles.notificationIcon}>
        <Ionicons 
          name={item.type === 'deal_accepted' ? 'checkmark-circle' : 'notifications'} 
          size={24} 
          color={item.type === 'deal_accepted' ? '#00cc66' : '#0099ff'} 
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#cc0000" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off" size={48} color="#666" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  unreadNotification: {
    backgroundColor: '#222',
    borderLeftWidth: 4,
    borderLeftColor: '#0099ff',
  },
  readNotification: {
    backgroundColor: '#1a1a1a',
  },
  notificationIcon: {
    marginRight: 16,
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  notificationTime: {
    color: '#666',
    fontSize: 12,
  },
});

export default NotificationsScreen; 