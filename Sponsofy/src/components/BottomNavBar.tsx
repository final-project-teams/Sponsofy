import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomNavBar = ({ navigation }) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomeScreen')}>
        <Ionicons name="home-outline" size={26} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PremiumScreen')}>
        <Ionicons name="compass-outline" size={26} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <View style={styles.addButton}>
          <Ionicons name="add" size={30} color="white" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ChatScreen')}>
        <Ionicons name="chatbubble-outline" size={26} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ProfileContent')}>
        <Ionicons name="person-outline" size={26} color="#666" />
      </TouchableOpacity>
      
     
    </View>
  );
};

const styles = {
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#333',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  addButton: {
    backgroundColor: '#8A2BE2',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default BottomNavBar; 