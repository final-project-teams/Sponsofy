import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  StatusBar 
} from 'react-native';
import { 
  Feather, 
  FontAwesome, 
  FontAwesome5, 
  MaterialIcons, 
  Entypo 
} from '@expo/vector-icons';
import { contentCreatorService, userService } from '../services/api';
import {jwtDecode} from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileContent = () => {
    const [contentCreators, setContentCreators] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Add debugging logs
                console.log("Fetching user profile...");
                const token = await AsyncStorage.getItem('userToken');
                console.log("Token found:", token ? "Yes" : "No");
    
                if (token) {
                    const decodedToken = jwtDecode(token);
                    console.log("Decoded token:", decodedToken);
                    const userId = decodedToken.userId
                    console.log("User ID:", userId);
    
                    const profile = await userService.getProfile(userId);
                    console.log("Profile received:", profile);
                    setUserProfile(profile);
                } else {
                    console.log("No token found in AsyncStorage");
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };
    
        fetchUserProfile();
    }, []);
    
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sponsofy</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Feather name="bell" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Feather name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar} />
            <View style={styles.onlineIndicator} />
          </View>
          
          <View style={styles.profileInfo}>
            {userProfile && (
                <Text style={styles.username}>{userProfile.username}</Text>
            )}
            {userProfile && (
                <Text style={styles.pronouns}>{userProfile.pronouns}</Text>
            )}
            {userProfile && (
                <Text style={styles.premiumBadge}>{userProfile.premium ? "Premium Member" : "Regular Member"}</Text>
            )}
          </View>
        </View>
        
        {/* Bio */}
        <Text style={styles.bio}>
          Lorem ipsum dolor sit amet, consectetur adipisci elit, 
          sed eiusmod tempor incidunt ut labore et dolore 
          magna aliqua. Ut enim ad minim veniam.
        </Text>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareProfileButton}>
            <Text style={styles.shareProfileText}>Share profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Social Media Icons */}
        <View style={styles.socialIcons}>
          <TouchableOpacity style={styles.socialIcon}>
            <FontAwesome name="instagram" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <FontAwesome5 name="tiktok" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <FontAwesome name="facebook" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <FontAwesome name="youtube-play" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Instagram Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Instagram Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>9K</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>159K</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>69</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>
        
        {/* Contracts Section */}
        <View style={styles.contractsContainer}>
          <Text style={styles.contractsTitle}>Contracts Done Using Instagram</Text>
          <View style={styles.contractsRow}>
            <View style={styles.contractCard}>
              <View style={styles.contractImage} />
              <View style={styles.contractDetails}>
                <Text style={styles.contractTitle}>Title...</Text>
                <Text style={styles.contractTime}>1 month ago</Text>
                <Text style={styles.contractDescription}>Description...</Text>
              </View>
            </View>
            <View style={styles.contractCard}>
              <View style={styles.contractImage} />
              <View style={styles.contractDetails}>
                <Text style={styles.contractTitle}>Title...</Text>
                <Text style={styles.contractTime}>3 months ago</Text>
                <Text style={styles.contractDescription}>Description...</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Entypo name="plus" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    color: '#8A2BE2', // Purple color for Sponsofy
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#666',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#2ecc71', // Green color for online status
    borderWidth: 2,
    borderColor: '#121212',
  },
  profileInfo: {
    marginLeft: 15,
  },
  username: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pronouns: {
    color: '#888',
    fontSize: 14,
  },
  premiumBadge: {
    color: '#8A2BE2',
    marginTop: 5,
    fontSize: 14,
  },
  bio: {
    color: '#888',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  editProfileButton: {
    backgroundColor: '#8A2BE2',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  editProfileText: {
    color: 'white',
    fontWeight: '500',
  },
  shareProfileButton: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  shareProfileText: {
    color: 'white',
    fontWeight: '500',
  },
  socialIcons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  socialIcon: {
    marginRight: 25,
  },
  statsContainer: {
    margin: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
  },
  statsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
  },
  contractsContainer: {
    margin: 20,
    marginTop: 10,
  },
  contractsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  contractsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contractCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    width: '48%',
  },
  contractImage: {
    height: 80,
    backgroundColor: '#333',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  contractDetails: {
    padding: 10,
  },
  contractTitle: {
    color: 'white',
    fontWeight: '500',
  },
  contractTime: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  contractDescription: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default ProfileContent;