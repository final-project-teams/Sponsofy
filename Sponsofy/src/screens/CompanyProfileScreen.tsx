import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Company, companyApi } from '../services/api/companyApi';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Companies: undefined;
  CompanyProfile: { company?: Company; companyId?: number };
  EditProfile: { company: Company };

};

type CompanyProfileScreenRouteProp = RouteProp<RootStackParamList, 'CompanyProfile'>;

export default function CompanyProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<CompanyProfileScreenRouteProp>();
  const { company: routeCompany, companyId } = route.params || {};
  const { currentTheme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create a default mock company profile
  const defaultCompany: Company = {
    id: 1,
    name: 'Company Name',
    industry: 'Technology',
    location: 'El Khazala, Tunis, Tunisia',
    website: 'https://example.com',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
    codeFiscal: 'ABC123456789',
    targetContentType: ['Video'],
    budget: {
      min: 1000,
      max: 5000,
      currency: 'USD'
    },
    collaborationPreferences: {
      contentTypes: ['Video'],
      duration: '3 months',
      requirements: 'High quality content'
    },
    verified: true,
    profileViews: 0,
    dealsPosted: 0,
    previousContracts: [
      {
        title: 'Marketing Campaign',
        date: '1 month ago',
        description: 'Social media promotion'
      },
      {
        title: 'Product Launch',
        date: '3 months ago',
        description: 'Video content creation'
      }
    ]
  };
  
  // Use the company from route params or the default mock company
  const [profileData, setProfileData] = useState<Company>(routeCompany || defaultCompany);

  const handleEditProfile = () => {
    if (profileData) {
      navigation.navigate('EditProfile', { company: profileData });
    }
  };

  const handleShareProfile = () => {
    // Implement share functionality
    console.log('Share profile');
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#000000' }]}>
        <ActivityIndicator size="large" color="#701FF1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#000000' }]}>
        <Text style={{ color: '#FF3A3A', marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: '#701FF1' }]}
          onPress={() => setProfileData(defaultCompany)} // This will reset to default company
        >
          <Text style={{ color: '#FFFFFF' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header with profile picture */}
        <View style={styles.headerBackground}>
          <View style={styles.headerContent}>
            {/* This is an empty view for the header background */}
          </View>
        </View>
        
        {/* Profile Avatar - positioned to overlap the header */}
        <View style={styles.avatarContainer}>
          <Avatar.Text 
            size={80} 
            label={profileData.name.substring(0, 2).toUpperCase()}
            style={{ backgroundColor: '#666', borderWidth: 2, borderColor: '#000' }}
          />
          {profileData.verified && (
            <View style={styles.verificationBadge}>
              <Icon name="check" size={12} color="#FFFFFF" />
            </View>
          )}
          <Text style={styles.premiumText}>Premium Member</Text>
        </View>
        
        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.username}>Username</Text>
          <Text style={styles.companyName}>{profileData.name}</Text>
          <Text style={styles.location}>{profileData.location}</Text>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editButtonText}>Edit profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShareProfile}
          >
            <Text style={styles.shareButtonText}>Share profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Analytics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics</Text>
          <TouchableOpacity style={styles.analyticsItem}>
            <Icon name="eye" size={20} color="#5F5F5F" />
            <Text style={styles.analyticsText}>{profileData.profileViews || 0} Profile Views</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.analyticsItem}>
            <Icon name="handshake" size={20} color="#5F5F5F" />
            <Text style={styles.analyticsText}>{profileData.dealsPosted || 0} Deals posted</Text>
          </TouchableOpacity>
        </View>
        
        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>{profileData.description}</Text>
          </View>
        </View>
        
        {/* Previous Contracts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Previous Contracts</Text>
          <View style={styles.contractsContainer}>
            {profileData.previousContracts?.map((contract, index) => (
              <View key={index} style={styles.contractCard}>
                <Text style={styles.contractTitle}>{contract.title}</Text>
                <Text style={styles.contractDate}>{contract.date}</Text>
                <Text style={styles.contractDescription}>{contract.description}</Text>
              </View>
            )) || (
              <>
                <View style={styles.contractCard}>
                  <Text style={styles.contractTitle}>Title...</Text>
                  <Text style={styles.contractDate}>1 month ago</Text>
                  <Text style={styles.contractDescription}>Description...</Text>
                </View>
                <View style={styles.contractCard}>
                  <Text style={styles.contractTitle}>Title...</Text>
                  <Text style={styles.contractDate}>3 months ago</Text>
                  <Text style={styles.contractDescription}>Description...</Text>
                </View>
              </>
            )}
          </View>
        </View>
        
        {/* Add some bottom padding for scrolling past the bottom nav */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="compass" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.centerButton}>
            <Icon name="plus" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="bell-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="account" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  headerBackground: {
    height: 120,
    backgroundColor: '#1A1A1A',
    position: 'relative',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -40,
    position: 'relative',
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#000000',
  },
  verificationBadge: {
    backgroundColor: '#00C853',
    position: 'absolute',
    bottom: 0,
    right: width / 2 - 45,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 12,
    color: '#701FF1',
    marginTop: 5,
    position: 'absolute',
    right: 20,
    top: 0,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  username: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  companyName: {
    fontSize: 14,
    color: '#5F5F5F',
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: '#5F5F5F',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#701FF1',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#292929',
    backgroundColor: 'transparent',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  analyticsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  analyticsText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },
  aboutCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#5F5F5F',
  },
  contractsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contractCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 20,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contractDate: {
    fontSize: 12,
    marginTop: 4,
    color: '#5F5F5F',
  },
  contractDescription: {
    fontSize: 12,
    marginTop: 8,
    color: '#5F5F5F',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#1A1A1A',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#292929',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#000000',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#292929',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  centerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#701FF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
}); 