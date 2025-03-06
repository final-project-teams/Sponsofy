import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen = () => {
  const notifications = [
    {
      id: 1,
      title: 'An Influencer Accepted Your Deal!',
      subtitle: 'Click here to view more details.',
    },
    {
      id: 2,
      title: 'An Influencer Has Completed All Milestones.',
      subtitle: 'Click here to view milestones.',
    },
    {
      id: 3,
      title: 'An Influencer Has Almost Completed All Milestones.',
      subtitle: 'Click here to view milestones.',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <ScrollView>
        {notifications.map((notification) => (
          <TouchableOpacity key={notification.id} style={styles.notificationItem}>
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