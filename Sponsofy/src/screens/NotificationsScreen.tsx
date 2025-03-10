import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const connectSocket = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token not found');
        return;
      }

      const socket = io("http://localhost:4000/notification", {
        auth: {
          token: token  // Send token for server-side verification
        }
      });

      socket.on("new_notification", (data) => {
        setNotifications(prev => [...prev, data]);
      });

      return () => {
        socket.disconnect();
      };
    };

    connectSocket();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <ScrollView>
        {notifications.map((notification, index) => (
          <TouchableOpacity key={index} style={styles.notificationItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications" size={24} color="white" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationSubtitle}>{notification.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    padding: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
  },
  notificationSubtitle: {
    color: '#666',
    fontSize: 14,
  },
});

export default NotificationsScreen; 