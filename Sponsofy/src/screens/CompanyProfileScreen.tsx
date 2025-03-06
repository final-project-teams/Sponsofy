import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Linking,
  RefreshControl,
  Animated,
  Modal,
  FlatList
} from 'react-native';
import { Text, Avatar, Button, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Company, companyApi } from '../services/api/companyApi';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Import ThemeProvider and useTheme
import { ThemeProvider } from '../theme/ThemeContext';
import { useTheme as useThemeHook } from '../theme/ThemeContext';
import Sidebar from '../components/Sidebar';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Companies: undefined;
  CompanyProfile: { company?: Company; companyId?: number; shouldRefresh?: boolean };
  EditProfile: { company: Company };
  ShareProfile: { company: Company };
  Deals: { companyId: number };
  CompanyDeals: { companyId: number };
  Notifications: undefined;
  ContractDetail: { contract: any };
};

type CompanyProfileScreenRouteProp = RouteProp<RootStackParamList, 'CompanyProfile'>;

// Define API base URL and endpoints for this component
const API_BASE_URL = 'http://192.168.11.94:3304/api';
const API_ENDPOINTS = {
  HEALTH: '/health',
  DEALS: '/deals'
};

// Define Deal interface based on your seed.js structure
interface Deal {
  id: number;
  content_creator_id: number;
  company_id: number;
  deal_terms: string;
  price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

// Define fallback theme
const fallbackTheme = {
  colors: {
    primary: '#701FF1',
    secondary: '#5D5FEF',
    background: '#000000',
    surface: '#121212',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    border: '#333333',
    error: '#FF5252',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
    white: '#FFFFFF',
    black: '#000000',
  }
};

// Create a hook that safely uses the theme
const useSafeTheme = () => {
  try {
    return useThemeHook();
  } catch (error) {
    // Return a default theme object if the hook fails
    return {
      currentTheme: fallbackTheme,
      isDarkMode: true,
      toggleTheme: () => console.log('Theme toggle not available')
    };
  }
};

// Create a wrapper component that includes ThemeProvider
const CompanyProfileScreenWithTheme = (props) => {
  return (
    <ThemeProvider>
      <CompanyProfileScreenContent {...props} />
    </ThemeProvider>
  );
};

// The actual component content
const CompanyProfileScreenContent = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<CompanyProfileScreenRouteProp>();
  const { company: routeCompany, companyId, shouldRefresh } = route.params || {};
  const { currentTheme, isDarkMode, toggleTheme } = useSafeTheme();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  
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

  // Add state for sidebar
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  
  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

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

  // Add a function to toggle dark mode
  const handleToggleTheme = () => {
    toggleTheme();
    // Save the preference to AsyncStorage
    AsyncStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Skip server connection check and go straight to fetching
      // The API methods will handle fallbacks internally
      const fetchedCompany = await companyApi.getCompanyById(companyId || 1);
      setProfileData(fetchedCompany);
      
      // Remove the fetchContracts reference
      // if (fetchContracts) {
      //   await fetchContracts();
      // }
    } catch (err) {
      console.error('Error in fetchCompanyData:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      await fetchCompanyData();
    } catch (err) {
      console.error('Error refreshing company:', err);
      setError('Failed to refresh company profile. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [companyId]);

  // Update the useEffect to use a longer polling interval
  useEffect(() => {
    let isSubscribed = true;
    let pollInterval: NodeJS.Timeout;

    // Initial fetch
    fetchCompanyData();
    
    // Set up polling with a much longer interval
    pollInterval = setInterval(fetchCompanyData, 120000); // 2 minutes

    return () => {
      isSubscribed = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [companyId]);

  // Add focus effect to refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);
          const fetchedCompany = await companyApi.getCompanyById(companyId || profileData.id);
          setProfileData(fetchedCompany);
        } catch (err) {
          console.error('Error fetching company:', err);
          setError('Failed to load company profile. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchData(); // Call the async function immediately
    });

    return unsubscribe;
  }, [navigation, companyId, profileData.id]);

  // Add state for deals
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [dealsError, setDealsError] = useState<string | null>(null);
  
  // Update the fetchDeals function
  const fetchDeals = async () => {
    try {
      setLoadingDeals(true);
      setDealsError(null);

      // Use direct axios call instead of apiClient
      try {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.DEALS}?company_id=${profileData.id}`, {
          timeout: 3000
        });
        
        if (response.data && Array.isArray(response.data)) {
          // Validate that each item has the expected Deal properties
          const validDeals = response.data.filter((item: any) => 
            typeof item.id === 'number' && 
            typeof item.company_id === 'number'
          );
          setDeals(validDeals as Deal[]);
        } else {
          // If data is not an array, set an empty array
          setDeals([]);
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
        // Use mock data as fallback
        setDeals([
          {
            id: 1,
            content_creator_id: 101,
            company_id: profileData.id,
            deal_terms: "Social media promotion for new product launch",
            price: 2500,
            status: "pending"
          },
          {
            id: 2,
            content_creator_id: 102,
            company_id: profileData.id,
            deal_terms: "YouTube video review of product",
            price: 3500,
            status: "accepted"
          },
          {
            id: 3,
            content_creator_id: 103,
            company_id: profileData.id,
            deal_terms: "Instagram story features",
            price: 1500,
            status: "completed"
          }
        ]);
        setDealsError('Using offline data (server unavailable)');
      }
    } finally {
      setLoadingDeals(false);
    }
  };
  
  // Fetch deals when sidebar is opened
  useEffect(() => {
    if (sidebarVisible) {
      fetchDeals();
    }
  }, [sidebarVisible]);

  // Get status color based on deal status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFC107';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'completed': return '#2196F3';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentTheme.colors.background }]}>
        <ActivityIndicator size="large" color={currentTheme.colors.primary} />
      </View>
    );
  }

  if (error && showRetry) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
          {error}
        </Text>
        <Button
          mode="contained"
          onPress={fetchCompanyData}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: currentTheme.colors.border }]}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Icon name="menu" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>Company Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Icon name="bell" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Sidebar */}
      <Sidebar 
        isVisible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)} 
        companyData={profileData}
        navigation={navigation}
        currentScreen="CompanyProfile"
      />
      
      {/* Main Content */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[styles.headerBackground, { 
          backgroundColor: isDarkMode ? '#000000' : currentTheme.colors.primary,
          height: 180
        }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerActions}>
              {/* Remove the sidebar toggle button */}
              <TouchableOpacity 
                style={[styles.iconButton, { 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center'
                }]}
                onPress={handleToggleTheme}
              >
                <Icon 
                  name={isDarkMode ? "white-balance-sunny" : "moon-waning-crescent"} 
                  size={24} 
                  color={isDarkMode ? '#FFFFFF' : currentTheme.colors.white} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Profile Avatar and Info */}
        <View style={[styles.profileContainer, { marginTop: -50 }]}>
          <View style={styles.avatarWrapper}>
          <Avatar.Text 
              size={100} 
            label={profileData.name.substring(0, 2).toUpperCase()}
              style={[
                styles.avatar,
                {
                  backgroundColor: currentTheme.colors.primary,
                  borderColor: '#000000',
                  borderWidth: 4,
                  elevation: 4
                }
              ]}
          />
          {profileData.verified && (
              <View style={[
                styles.verificationBadge,
                {
                  backgroundColor: '#00C853',
                  borderColor: '#000000',
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  right: -5,
                  bottom: 5
                }
              ]}>
                <Icon name="check" size={18} color="#FFFFFF" />
            </View>
          )}
        </View>
        
          <Text style={[
            styles.companyName, 
            { 
              color: currentTheme.colors.white,
              fontSize: 24,
              fontWeight: 'bold',
              marginTop: 10
            }
          ]}>
            {profileData.name}
          </Text>
          
          <View style={[styles.tagContainer, { marginTop: 15 }]}>
            <View style={[
              styles.industryTag,
              { 
                borderColor: 'transparent',
                backgroundColor: 'rgba(112, 31, 241, 0.2)',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                marginHorizontal: 5
              }
            ]}>
              <Icon name="briefcase-outline" size={14} color={currentTheme.colors.primary} style={styles.tagIcon} />
              <Text style={[
                styles.tagText,
                { color: currentTheme.colors.primary }
              ]}>
                {profileData.industry}
              </Text>
            </View>
            <View style={[
              styles.locationTag,
              { 
                borderColor: 'transparent',
                backgroundColor: 'rgba(112, 31, 241, 0.2)',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                marginHorizontal: 5
              }
            ]}>
              <Icon name="map-marker-outline" size={14} color={currentTheme.colors.primary} style={styles.tagIcon} />
              <Text style={[
                styles.tagText,
                { color: currentTheme.colors.primary }
              ]}>
                {profileData.location}
              </Text>
            </View>
          </View>
          
          <Text style={[
            styles.username,
            { 
              color: 'rgba(255, 255, 255, 0.6)',
              marginTop: 8
            }
          ]}>
            @{profileData.name.toLowerCase().replace(/\s+/g, '')}
          </Text>
        </View>
        
        {/* Action Buttons */}
        <View style={[styles.actionButtons, { paddingHorizontal: 20, marginBottom: 20 }]}>
          <TouchableOpacity 
            style={[styles.editButton, { 
              backgroundColor: currentTheme.colors.primary,
              borderRadius: 30,
              elevation: 2,
              flex: 1,
              marginRight: 10,
              height: 50,
              justifyContent: 'center'
            }]}
            onPress={handleEditProfile}
          >
            <Icon name="pencil" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={[styles.actionButtonText, { color: "#FFFFFF", fontWeight: '600', fontSize: 16 }]}>Edit profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.shareButton, { 
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : currentTheme.colors.border,
              borderRadius: 30,
              flex: 1,
              marginLeft: 10,
              height: 50,
              justifyContent: 'center'
            }]}
            onPress={handleShareProfile}
          >
            <Icon name="share-variant" size={18} color={isDarkMode ? '#FFFFFF' : currentTheme.colors.text} style={{ marginRight: 8 }} />
            <Text style={[styles.actionButtonText, { color: isDarkMode ? '#FFFFFF' : currentTheme.colors.text }]}>Share profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Analytics Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { 
            color: isDarkMode ? '#FFFFFF' : currentTheme.colors.text,
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 15,
            paddingHorizontal: 20
          }]}>Analytics</Text>
          <View style={[styles.analyticsContainer, { paddingHorizontal: 20 }]}>
            <View style={[
              styles.analyticsItem, 
              { 
                backgroundColor: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
                borderRadius: 12,
                padding: 15,
                flex: 1,
                marginRight: 10,
                flexDirection: 'row',
                alignItems: 'center'
              }
            ]}>
              <Icon name="eye-outline" size={20} color={currentTheme.colors.primary} style={{ marginRight: 10 }} />
              <View>
                <Text style={[styles.analyticsValue, { 
                  color: isDarkMode ? '#FFFFFF' : currentTheme.colors.text,
                  fontSize: 24,
                  fontWeight: 'bold'
                }]}>1.2K</Text>
                <Text style={[styles.analyticsLabel, { color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : currentTheme.colors.textSecondary }]}>Profile Views</Text>
              </View>
            </View>
            
            <View style={[
              styles.analyticsItem, 
              { 
                backgroundColor: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
                borderRadius: 12,
                padding: 15,
                flex: 1,
                marginLeft: 10,
                flexDirection: 'row',
                alignItems: 'center'
              }
            ]}>
              <Icon name="star-outline" size={20} color={currentTheme.colors.primary} style={{ marginRight: 10 }} />
              <View>
                <Text style={[styles.analyticsValue, { 
                  color: isDarkMode ? '#FFFFFF' : currentTheme.colors.text,
                  fontSize: 24,
                  fontWeight: 'bold'
                }]}>4.8</Text>
                <Text style={[styles.analyticsLabel, { color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : currentTheme.colors.textSecondary }]}>Rating</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { 
            color: isDarkMode ? '#FFFFFF' : currentTheme.colors.text,
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 15,
            paddingHorizontal: 20
          }]}>About</Text>
          <View style={[styles.aboutCard, { 
            backgroundColor: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
            borderRadius: 12,
            padding: 20,
            marginHorizontal: 20
          }]}>
            <Text style={[styles.aboutText, { 
              color: isDarkMode ? '#FFFFFF' : currentTheme.colors.text,
              lineHeight: 22
            }]}>{profileData.description || 'No description provided.'}</Text>
          </View>
        </View>
        
        {/* Contact Section */}
        {profileData.website && (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { 
              color: isDarkMode ? '#FFFFFF' : currentTheme.colors.text,
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 15,
              paddingHorizontal: 20
            }]}>Contact</Text>
            <TouchableOpacity 
              style={[styles.contactItem, { 
                backgroundColor: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
                borderRadius: 12,
                borderWidth: 0,
                elevation: 2,
                padding: 15,
                marginHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center'
              }]}
              onPress={() => Linking.openURL(profileData.website || '')}
            >
              <View style={[styles.contactIconContainer, { 
                backgroundColor: isDarkMode ? 'rgba(112, 31, 241, 0.2)' : currentTheme.colors.primary + '20',
                borderRadius: 20,
                padding: 8,
                marginRight: 15
              }]}>
                <Icon name="web" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={[styles.contactText, { 
                color: isDarkMode ? '#FFFFFF' : currentTheme.colors.text,
                flex: 1
              }]}>{profileData.website}</Text>
              <Icon name="chevron-right" size={22} color={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : currentTheme.colors.textSecondary} />
            </TouchableOpacity>
                </View>
        )}
        
        {/* Contracts Section - Redesigned */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginBottom: 15
          }]}>
            <Text style={[styles.sectionTitle, { 
              color: isDarkMode ? '#FFFFFF' : currentTheme.colors.text,
              fontSize: 20,
              fontWeight: 'bold'
            }]}>Contracts</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { 
                color: currentTheme.colors.primary,
                fontSize: 14
              }]}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {/* Contract Tabs */}
          <View style={[styles.contractTabs, { paddingHorizontal: 20 }]}>
            <TouchableOpacity 
              style={[
                styles.contractTab, 
                styles.activeContractTab,
                { 
                  borderBottomColor: currentTheme.colors.primary,
                  paddingBottom: 8,
                  marginRight: 20
                }
              ]}
            >
              <Text style={[styles.contractTabText, { 
                color: currentTheme.colors.primary, 
                fontWeight: 'bold',
                fontSize: 14
              }]}>Active</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contractTab, { marginRight: 20, borderBottomColor: 'transparent' }]}>
              <Text style={[styles.contractTabText, { 
                color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : currentTheme.colors.textSecondary,
                fontSize: 14
              }]}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contractTab, { borderBottomColor: 'transparent' }]}>
              <Text style={[styles.contractTabText, { 
                color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : currentTheme.colors.textSecondary,
                fontSize: 14
              }]}>Upcoming</Text>
            </TouchableOpacity>
          </View>
          
          {/* Active Contracts */}
          <View style={[styles.contractsContainer, { paddingHorizontal: 20, marginTop: 15 }]}>
            <View style={[
              styles.contractCard, 
              { 
                backgroundColor: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
                borderRadius: 12,
                padding: 15,
                marginBottom: 15,
                borderLeftWidth: 0,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
                position: 'relative',
                overflow: 'hidden'
              }
            ]}>
              <View style={[styles.contractLeftBorder, {
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                backgroundColor: currentTheme.colors.primary,
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12
              }]} />
              
              <View style={styles.contractHeader}>
                <Text style={[styles.contractTitle, { 
                  color: isDarkMode ? '#FFFFFF' : currentTheme.colors.text,
                  fontSize: 16,
                  fontWeight: 'bold'
                }]}>Marketing Campaign</Text>
                <View style={[styles.contractStatusBadge, { 
                  backgroundColor: 'rgba(112, 31, 241, 0.2)',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2
                }]}>
                  <Text style={[styles.contractStatusText, { 
                    color: currentTheme.colors.primary,
                    fontSize: 12,
                    fontWeight: '500'
                  }]}>In Progress</Text>
                </View>
              </View>
              <Text style={[styles.contractDescription, { 
                color: isDarkMode ? '#FFFFFF' : currentTheme.colors.text,
                marginTop: 5,
                fontSize: 14
              }]}>Social media promotion for product launch</Text>
              <View style={[styles.contractFooter, { marginTop: 10 }]}>
                <Text style={[styles.contractDate, { 
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : currentTheme.colors.textSecondary,
                  fontSize: 12
                }]}>Started: 2 weeks ago</Text>
                <Text style={[styles.contractDate, { 
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : currentTheme.colors.textSecondary,
                  fontSize: 12
                }]}>Ends: 2 weeks left</Text>
              </View>
            </View>
            
            <View style={[
              styles.contractCard, 
              { 
                backgroundColor: isDarkMode ? '#1E1E1E' : currentTheme.colors.surface,
                borderRadius: 12,
                padding: 15,
                marginBottom: 15,
                borderLeftWidth: 0,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
                position: 'relative',
                overflow: 'hidden'
              }
            ]}>
              <View style={[styles.contractLeftBorder, {
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                backgroundColor: currentTheme.colors.primary,
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12
              }]} />
              
              <View style={styles.contractHeader}>
                <Text style={[styles.contractTitle, { 
                  color: isDarkMode ? '#FFFFFF' : currentTheme.colors.text,
                  fontSize: 16,
                  fontWeight: 'bold'
                }]}>Content Creation</Text>
                <View style={[styles.contractStatusBadge, { 
                  backgroundColor: 'rgba(112, 31, 241, 0.2)',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2
                }]}>
                  <Text style={[styles.contractStatusText, { 
                    color: currentTheme.colors.primary,
                    fontSize: 12,
                    fontWeight: '500'
                  }]}>In Progress</Text>
                </View>
              </View>
              <Text style={[styles.contractDescription, { 
                color: isDarkMode ? '#FFFFFF' : currentTheme.colors.text,
                marginTop: 5,
                fontSize: 14
              }]}>Video production for brand awareness</Text>
              <View style={[styles.contractFooter, { marginTop: 10 }]}>
                <Text style={[styles.contractDate, { 
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : currentTheme.colors.textSecondary,
                  fontSize: 12
                }]}>Started: 1 week ago</Text>
                <Text style={[styles.contractDate, { 
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : currentTheme.colors.textSecondary,
                  fontSize: 12
                }]}>Ends: 3 weeks left</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Add some bottom padding for scrolling past the bottom nav */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { 
        backgroundColor: isDarkMode ? '#000000' : currentTheme.colors.surface,
        borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : currentTheme.colors.border,
        elevation: 8,
        zIndex: 998
      }]}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home-outline" size={24} color={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : currentTheme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="compass-outline" size={24} color={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : currentTheme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={[styles.centerButton, { 
            backgroundColor: currentTheme.colors.primary,
            width: 56,
            height: 56,
            borderRadius: 28,
            marginTop: -20
          }]}>
            <Icon name="plus" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="bell-outline" size={24} color={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : currentTheme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="account-outline" size={24} color={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : currentTheme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  verificationBadge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -40,
    position: 'relative',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  industryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  tagIcon: {
    marginRight: 5,
  },
  tagText: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  analyticsItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  analyticsLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  aboutCard: {
    padding: 15,
    borderRadius: 10,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: 1,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  centerButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 5,
  },
  contactText: {
    fontSize: 14,
    marginLeft: 10,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  contractTabs: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  contractTab: {
    padding: 10,
    borderBottomWidth: 2,
  },
  activeContractTab: {
    borderBottomWidth: 2,
  },
  contractTabText: {
    fontSize: 14,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  contractCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 0,
  },
  contractLeftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  contractStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  contractStatusText: {
    fontSize: 12,
  },
  contractsContainer: {
    marginTop: 10,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contractDescription: {
    fontSize: 14,
    marginTop: 5,
  },
  contractFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contractDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  analyticsIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoCallButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 120,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 0,
    zIndex: 999
  },
  previousContractCard: {
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 150,
    height: 120,
    justifyContent: 'space-between',
  },
  username: {
    fontSize: 16,
    marginTop: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  analyticsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 20,
  },
  // Sidebar styles
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 280,
    height: '100%',
    paddingTop: 40,
    paddingBottom: 20,
    zIndex: 1000,
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sidebarLogo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  sidebarIcon: {
    marginRight: 15,
    opacity: 0.9,
  },
  sidebarItemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  recentChatsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  recentChatsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  chatAvatar: {
    backgroundColor: '#444444',
  },
  chatInfo: {
    marginLeft: 10,
  },
  chatUsername: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  chatMessage: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  seeAllButton: {
    marginTop: 5,
    marginBottom: 20,
  },
  premiumButton: {
    backgroundColor: '#701FF1',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  themeToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeTheme: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  themeToggleText: {
    color: '#888888',
    marginLeft: 5,
    fontSize: 14,
  },
  activeThemeText: {
    color: '#FFFFFF',
  },
  // Deal list styles
  dealsList: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 10,
  },
  dealItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dealContent: {
    flex: 1,
  },
  dealTerms: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dealPrice: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  noDealsText: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 8,
  },
});

// Export the wrapped component
export default CompanyProfileScreenWithTheme; 