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
  ShareProfile: { company: Company };
  VideoCall: { roomId?: string; remoteUserId?: string; isIncoming?: boolean };
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
    location: 'El Khazela, Tunis, Tunisia',
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
    if (profileData) {
      navigation.navigate('ShareProfile', { company: profileData });
    }
  };

  const handleVideoCall = () => {
    const roomId = `room-${profileData.id}-${Date.now()}`;
    navigation.navigate('VideoCall', {
      roomId,
      remoteUserId: profileData.name,
      isIncoming: false
    });
  };

  // Update the useEffect to fetch company data
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!routeCompany && companyId) {
        try {
          setLoading(true);
          setError(null);
          const fetchedCompany = await companyApi.getCompanyById(companyId);
          setProfileData(fetchedCompany);
        } catch (err) {
          console.error('Error fetching company:', err);
          setError('Failed to load company profile. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCompanyData();
  }, [routeCompany, companyId]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentTheme.colors.background }]}>
        <ActivityIndicator size="large" color={currentTheme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentTheme.colors.background }]}>
        <Text style={{ color: currentTheme.colors.error, marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: currentTheme.colors.primary }]}
          onPress={() => setProfileData(defaultCompany)}
        >
          <Text style={{ color: currentTheme.colors.white }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <ScrollView style={[styles.scrollView, { backgroundColor: currentTheme.colors.background }]}>
        {/* Header with profile picture */}
        <View style={[styles.headerBackground, { backgroundColor: currentTheme.colors.profileHeaderBackground || currentTheme.colors.surface }]}>
          <View style={styles.headerContent}>
            {/* This is an empty view for the header background */}
          </View>
        </View>
        
        {/* Profile Avatar - positioned to overlap the header */}
        <View style={styles.avatarContainer}>
          <Avatar.Text 
            size={currentTheme.profile?.avatarSize || 80} 
            label={profileData.name.substring(0, 2).toUpperCase()}
            style={{ backgroundColor: currentTheme.colors.avatarBackground || '#666', borderWidth: 2, borderColor: currentTheme.colors.background }}
          />
          {profileData.verified && (
            <View style={[styles.verificationBadge, { backgroundColor: currentTheme.colors.verificationBadge || '#00C853' }]}>
              <Icon name="check" size={12} color={currentTheme.colors.white} />
            </View>
          )}
          <Text style={[styles.premiumText, { color: currentTheme.colors.premiumText || currentTheme.colors.primary }]}>Premium Member</Text>
        </View>
        
        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={[styles.username, { color: currentTheme.colors.text }]}>Username</Text>
          <Text style={[styles.companyName, { color: currentTheme.colors.textSecondary }]}>{profileData.name}</Text>
          <Text style={[styles.location, { color: currentTheme.colors.textSecondary }]}>{profileData.location}</Text>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: currentTheme.colors.primary }]}
            onPress={handleEditProfile}
          >
            <Text style={[styles.editButtonText, { color: currentTheme.colors.white }]}>Edit profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.shareButton, { borderColor: currentTheme.colors.border }]}
            onPress={handleShareProfile}
          >
            <Text style={[styles.shareButtonText, { color: currentTheme.colors.text }]}>Share profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Analytics Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>Analytics</Text>
          <TouchableOpacity style={[styles.analyticsItem, { backgroundColor: currentTheme.colors.surface }]}>
            <Icon name="eye" size={20} color={currentTheme.colors.textSecondary} />
            <Text style={[styles.analyticsText, { color: currentTheme.colors.text }]}>{profileData.profileViews || 0} Profile Views</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.analyticsItem, { backgroundColor: currentTheme.colors.surface }]}>
            <Icon name="handshake" size={20} color={currentTheme.colors.textSecondary} />
            <Text style={[styles.analyticsText, { color: currentTheme.colors.text }]}>{profileData.dealsPosted || 0} Deals posted</Text>
          </TouchableOpacity>
        </View>
        
        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>About</Text>
          <View style={[styles.aboutCard, { backgroundColor: currentTheme.colors.surface }]}>
            <Text style={[styles.aboutText, { color: currentTheme.colors.textSecondary }]}>{profileData.description}</Text>
          </View>
        </View>
        
        {/* Previous Contracts Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>Previous Contracts</Text>
          <View style={styles.contractsContainer}>
            {profileData.previousContracts?.map((contract, index) => (
              <View key={index} style={[styles.contractCard, { backgroundColor: currentTheme.colors.surface }]}>
                <Text style={[styles.contractTitle, { color: currentTheme.colors.text }]}>{contract.title}</Text>
                <Text style={[styles.contractDate, { color: currentTheme.colors.textSecondary }]}>{contract.date}</Text>
                <Text style={[styles.contractDescription, { color: currentTheme.colors.textSecondary }]}>{contract.description}</Text>
              </View>
            )) || (
              <>
                <View style={[styles.contractCard, { backgroundColor: currentTheme.colors.surface }]}>
                  <Text style={[styles.contractTitle, { color: currentTheme.colors.text }]}>Title...</Text>
                  <Text style={[styles.contractDate, { color: currentTheme.colors.textSecondary }]}>1 month ago</Text>
                  <Text style={[styles.contractDescription, { color: currentTheme.colors.textSecondary }]}>Description...</Text>
                </View>
                <View style={[styles.contractCard, { backgroundColor: currentTheme.colors.surface }]}>
                  <Text style={[styles.contractTitle, { color: currentTheme.colors.text }]}>Title...</Text>
                  <Text style={[styles.contractDate, { color: currentTheme.colors.textSecondary }]}>3 months ago</Text>
                  <Text style={[styles.contractDescription, { color: currentTheme.colors.textSecondary }]}>Description...</Text>
                </View>
              </>
            )}
          </View>
        </View>
        
        {/* Add some bottom padding for scrolling past the bottom nav */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity style={[styles.fab, { 
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border
      }]}>
        <Icon name="plus" size={24} color={currentTheme.colors.text} />
      </TouchableOpacity>
      
      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { 
        backgroundColor: currentTheme.colors.bottomNavBackground || currentTheme.colors.background,
        borderTopColor: currentTheme.colors.bottomNavBorder || currentTheme.colors.border
      }]}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="compass" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={[styles.centerButton, { backgroundColor: currentTheme.colors.primary }]}>
            <Icon name="plus" size={24} color={currentTheme.colors.white} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="bell-outline" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="account" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: currentTheme.colors.primary }]}
        onPress={handleVideoCall}
      >
        <Icon name="video" size={24} color="#FFFFFF" />
        <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
          Video Call
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
  verificationBadge: {
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
    marginBottom: 5,
  },
  companyName: {
    fontSize: 14,
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
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
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  editButtonText: {
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
    backgroundColor: 'transparent',
  },
  shareButtonText: {
    fontWeight: '600',
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  analyticsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  analyticsText: {
    marginLeft: 10,
    fontSize: 16,
  },
  aboutCard: {
    borderRadius: 12,
    padding: 15,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
  contractsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contractCard: {
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 20,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  contractDate: {
    fontSize: 12,
    marginTop: 4,
  },
  contractDescription: {
    fontSize: 12,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
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
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 120,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
}); 