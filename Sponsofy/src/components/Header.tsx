import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Header = ({ title }) => {
  const navigation = useNavigation();
  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const handleChatPress = () => {
    navigation.navigate('ChatList');
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity>
        <View style={styles.userAvatar} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.headerIcon} onPress={handleNotificationPress}>
          <Ionicons name="notifications" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="paper-plane" size={24} color="white" onPress={handleChatPress} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 15,
  },
});

export default Header;