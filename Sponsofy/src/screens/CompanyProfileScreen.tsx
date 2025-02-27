import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Share,
  Alert
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
};

type CompanyProfileScreenRouteProp = RouteProp<RootStackParamList, 'CompanyProfile'>;

export default function CompanyProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<CompanyProfileScreenRouteProp>();
  const { company: routeCompany, companyId } = route.params || {};
  const { currentTheme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<Company | null>(routeCompany || null);

  // Fetch company data if we have a companyId but no company object
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (companyId && !profileData) {
        try {
          setLoading(true);
          setError(null);
          const company = await companyApi.getCompanyById(companyId);
          setProfileData(company);
        } catch (err) {
          console.error('Error fetching company:', err);
          setError('Failed to load company profile');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCompanyData();
  }, [companyId, profileData]);

  const handleEditProfile = () => {
    if (profileData) {
      navigation.navigate('EditProfile', { company: profileData });
    }
  };

  // Enhanced share profile functionality
  const handleShareProfile = () => {
    if (profileData) {
      // Navigate to the dedicated share screen for more sharing options
      navigation.navigate('ShareProfile', { company: profileData });
    }
  };

  // Quick share functionality for the floating action button
  const handleQuickShare = async () => {
    if (!profileData) return;
    
    try {
      // Generate a shareable message with company details
      const message = `Check out ${profileData.name} on Sponsofy!\n\n` +
        `Industry: ${profileData.industry}\n` +
        `Location: ${profileData.location}\n\n` +
        `${profileData.description ? profileData.description + '\n\n' : ''}` +
        `They're looking for content creators for ${profileData.targetContentType?.join(', ') || 'various content types'}.\n\n` +
        `View their full profile at: https://sponsofy.com/company/${profileData.id}`;
      
      const result = await Share.share({
        title: `${profileData.name} on Sponsofy`,
        message,
        // On iOS, the URL will be used instead of the message when sharing to some apps
        url: `https://sponsofy.com/company/${profileData.id}`,
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log(`Shared via ${result.activityType}`);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share profile');
    }
  };

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
          onPress={() => {
            if (companyId) {
              setLoading(true);
              companyApi.getCompanyById(companyId)
                .then(company => {
                  setProfileData(company);
                  setError(null);
                })
                .catch(err => {
                  console.error('Error retrying fetch:', err);
                  setError('Failed to load company profile');
                })
                .finally(() => setLoading(false));
            }
          }}
        >
          <Text style={{ color: currentTheme.colors.white }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentTheme.colors.background }]}>
        <Text style={{ color: currentTheme.colors.error, marginBottom: 20 }}>No company data available</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: currentTheme.colors.primary }]}
          onPress={() => navigation.navigate('Companies')}
        >
          <Text style={{ color: currentTheme.colors.white }}>View All Companies</Text>
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
          <Text style={[styles.premiumText, { color: currentTheme.colors.premiumText || currentTheme.colors.primary }]}>
            {profileData.isPremium ? 'Premium Member' : ''}
          </Text>
        </View>
        
        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={[styles.companyName, { color: currentTheme.colors.text }]}>{profileData.name}</Text>
          <Text style={[styles.industry, { color: currentTheme.colors.textSecondary }]}>{profileData.industry}</Text>
          <Text style={[styles.location, { color: currentTheme.colors.textSecondary }]}>{profileData.location}</Text>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: currentTheme.colors.primary }]}
            onPress={handleEditProfile}
            activeOpacity={0.8}
          >
            <Icon name="pencil" size={16} color={currentTheme.colors.white} style={styles.buttonIcon} />
            <Text style={[styles.editButtonText, { color: currentTheme.colors.white }]}>Edit profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.shareButton, { borderColor: currentTheme.colors.border }]}
            onPress={handleShareProfile}
            activeOpacity={0.8}
          >
            <Icon name="share-variant" size={16} color={currentTheme.colors.text} style={styles.buttonIcon} />
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
        
        {/* Target Content Types Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>Target Content Types</Text>
          <View style={[styles.contentTypesContainer, { backgroundColor: currentTheme.colors.surface }]}>
            {profileData.targetContentType && profileData.targetContentType.length > 0 ? (
              <View style={styles.contentTypeChips}>
                {profileData.targetContentType.map((type, index) => (
                  <View 
                    key={index} 
                    style={[styles.contentTypeChip, { backgroundColor: currentTheme.colors.primary + '20' }]}
                  >
                    <Text style={[styles.contentTypeText, { color: currentTheme.colors.primary }]}>{type}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.noContentText, { color: currentTheme.colors.textSecondary }]}>
                No target content types specified
              </Text>
            )}
          </View>
        </View>
        
        {/* Budget Section */}
        {profileData.budget && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>Budget Range</Text>
            <View style={[styles.budgetCard, { backgroundColor: currentTheme.colors.surface }]}>
              <View style={styles.budgetContent}>
                <Icon name="currency-usd" size={24} color={currentTheme.colors.primary} />
                <Text style={[styles.budgetText, { color: currentTheme.colors.text }]}>
                  {profileData.budget.min} - {profileData.budget.max} {profileData.budget.currency}
                </Text>
              </View>
            </View>
          </View>
        )}
        
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
                  <Text style={[styles.contractTitle, { color: currentTheme.colors.text }]}>No previous contracts</Text>
                  <Text style={[styles.contractDescription, { color: currentTheme.colors.textSecondary }]}>
                    This company hasn't completed any contracts yet
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
        
        {/* Add some bottom padding for scrolling past the bottom nav */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Floating Action Button for Quick Share */}
      <TouchableOpacity 
        style={[styles.fab, { 
          backgroundColor: currentTheme.colors.primary,
          borderColor: currentTheme.colors.primary
        }]}
        onPress={handleQuickShare}
        activeOpacity={0.8}
      >
        <Icon name="share-variant" size={24} color={currentTheme.colors.white} />
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
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  industry: {
    fontSize: 16,
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
    flexDirection: 'row',
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
    flexDirection: 'row',
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
  buttonIcon: {
    marginRight: 8,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
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
  contentTypesContainer: {
    borderRadius: 12,
    padding: 15,
  },
  contentTypeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contentTypeChip: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  contentTypeText: {
    fontSize: 14,
  },
  noContentText: {
    fontSize: 14,
  },
  budgetCard: {
    borderRadius: 12,
    padding: 15,
  },
  budgetContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  contractsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
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
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 80,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
}); 