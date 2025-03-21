import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const BottomNavBar = () => {
  const{user} = useAuth()
  console.log("user insaide bottom navbare ......",user);
  
  const navigation = useNavigation();
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MyDeals')}>
        <Ionicons name="home-outline" size={26} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ExploreScreen')}>
        <Ionicons name="compass-outline" size={26} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AddDeal')}>
        <View style={styles.addButton}>
          <Ionicons name="add" size={30} color="white" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ChatList')}>
        <Ionicons name="chatbubble-outline" size={26} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => {user.role==="content_creator"?navigation.navigate('ProfileContent'):navigation.navigate('CompanyProfile', { company: user?.company || {} })}}>        <Ionicons name="person-outline" size={26} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PremiumScreen')}>
        <Ionicons name="star-outline" size={26} color="#666" />
        
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center' ,
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