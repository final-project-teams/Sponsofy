import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  Easing,
  ActivityIndicator,
  Switch,
  Platform,
  StatusBar,
  Share,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { contractService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Define API base URL
 // Updated to match ContractsScreen

const { width, height } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 0;

interface SidebarProps {
  isVisible?: boolean;
  onClose: () => void;
  companyData?: any;
  navigation?: any;
  currentScreen?: string;
}

// Define a type for all possible routes
type RootStackParamList = {
  Home: undefined;
  CompanyProfile: { company: any };
  EditProfile: { company: any };
  Notifications: undefined;
  Deals: { status: string };
  Contracts: { status: string };
  ContractDetail: { contract: Contract } | { id: string };
  ChatScreen: undefined;
  PremiumScreen: undefined;
  Settings: undefined;
  Support: undefined;
  Login: undefined;
};

// Add Contract interface
interface Contract {
  id: number | string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'terminated' | 'pending' | string;
  payment_terms: string;
  rank?: 'plat' | 'gold' | 'silver';
  // Add any other fields that might be in the contract
  companyId?: string;
  creatorId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible, onClose, companyData, navigation, currentScreen }) => {
  const { currentTheme, isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [expandedDeals, setExpandedDeals] = useState(false);
  const [contractsExpanded, setContractsExpanded] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThemeToggle, setShowThemeToggle] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Animate sidebar in
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Animate sidebar out
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }

    // Load contracts when contracts section is expanded
    if (isVisible && contractsExpanded) {
      fetchContracts();
    }
  }, [isVisible, contractsExpanded, selectedStatus]);

  const navigateTo = (screen: string, params?: any) => {
    onClose();
    if (navigation) {
      navigation.navigate(screen, params);
    } else {
      console.warn(`Navigation to ${screen} failed: navigation object is undefined`);
      // You could add a fallback behavior here if needed
    }
  };

  const toggleDealsExpanded = () => {
    setExpandedDeals(!expandedDeals);
  };

  const toggleContractsExpanded = () => {
    setContractsExpanded(!contractsExpanded);
    if (!contractsExpanded) {
      // Only clear contracts and don't fetch any when expanding
      setContracts([]);
      setSelectedStatus(null);
    }
  };

  const toggleThemeOptions = () => {
    setShowThemeToggle(!showThemeToggle);
  };

  const fetchContracts = async (status?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if we have a user with a company role
      if (!user) {
        console.error('No authenticated user found - cannot fetch contracts');
        setError('Authentication required to view contracts');
        setIsLoading(false);
        return;
      }
      
      // Get the company ID from the user data or companyData
      const companyId = companyData?.id || user.companyId;
      
      if (!companyId) {
        console.error('No company ID found - cannot fetch contracts');
        setError('Company ID not found');
        setIsLoading(false);
        return;
      }
      
      // Get stored token
      let token = await AsyncStorage.getItem('userToken');

      // If no token in storage, try to get one from user object
      if (!token && user?.token) {
        token = user.token;
        // Store it for future use
        await AsyncStorage.setItem('userToken', token);
        console.log('Retrieved token from user object and stored it');
      }
      
      if (!token) {
        console.error('No authentication token found - cannot fetch contracts');
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      // If no status is provided and not explicitly requesting all contracts, don't fetch anything
      if (!status && selectedStatus !== 'all') {
        console.log('No status filter selected - not fetching contracts');
        setContracts([]);
        setIsLoading(false);
        return;
      }
      
      console.log(`Fetching real contracts for company ID: ${companyId}, status: ${status || 'all'}`);
      
      // Use the specific status endpoint if status is provided, otherwise get all contracts
      let response;
      if (status) {
        response = await contractService.getContractsByStatus(companyId, status);
      } else {
        response = await contractService.getContractsByCompanyId(companyId);
      }
      
      console.log('Contract response in sidebar:', response);
      
      // Handle different response formats
      if (response && response.success && Array.isArray(response.contracts)) {
        console.log(`Fetched ${response.contracts.length} real contracts for sidebar`);
        setContracts(response.contracts);
      } else if (response && Array.isArray(response.contracts)) {
        // Alternative format without success flag
        console.log(`Fetched ${response.contracts.length} real contracts for sidebar (alternative format)`);
        setContracts(response.contracts);
      } else if (Array.isArray(response)) {
        // Direct array format
        console.log(`Fetched ${response.length} real contracts for sidebar (direct array)`);
        setContracts(response);
      } else {
        console.error('Invalid contract response format in sidebar:', response);
        setError('Invalid response format from server');
        setContracts([]);
      }
    } catch (error) {
      console.error('API error fetching contracts in sidebar:', error);
      
      // Check for authentication error
      if (error.response && error.response.status === 401) {
        console.error('Authentication error (401) when fetching contracts in sidebar');
        setError('Authentication failed. Please log in again to view your contracts.');
        
        // Clear the invalid token
        await AsyncStorage.removeItem('userToken');
        setContracts([]);
      } else if (error.response && error.response.status === 403) {
        setError('You do not have permission to view these contracts.');
        setContracts([]);
      } else if (error.response && error.response.status === 404) {
        setError('No contracts found. The server could not find any contracts.');
        setContracts([]);
      } else if (error.response && error.response.status >= 500) {
        setError('Server error. Please try again later.');
        setContracts([]);
      } else if (error.message && error.message.includes('Network Error')) {
        setError('Network connection issue. Please check your internet connection and try again.');
        setContracts([]);
      } else if (error.message && error.message.includes('timeout')) {
        setError('Request timed out. The server is taking too long to respond.');
        setContracts([]);
      } else {
        setError(`Unable to load contracts: ${error.message || 'Please check your connection and try again.'}`);
        setContracts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContractPress = (contract: Contract) => {
    onClose();
    console.log('Navigating to contract detail with contract object:', contract);
    // Pass the entire contract object to avoid authentication issues
    navigation.navigate('ContractDetail', { contract: contract });
  };

  const handleStatusFilter = (status: string) => {
    console.log(`Filtering contracts by status: ${status}`);
    setSelectedStatus(status);
    fetchContracts(status);
  };

  const renderContractItem = (contract: Contract) => (
    <TouchableOpacity
      key={contract.id}
      style={[styles.contractItem, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5' }]}
      onPress={() => {
        console.log('Navigating to contract detail with contract:', contract);
        navigation.navigate('ContractDetail', { contract: contract });
      }}
    >
      <View style={styles.contractHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={[
              styles.rankBadge,
              { backgroundColor: getRankColor(contract.rank || '') }
            ]}
          />
          <Text style={[styles.contractTitle, { color: currentTheme.colors.text }]}>
            {contract.title}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(contract.status) }
          ]}
        >
          <Text style={styles.statusText}>
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </Text>
        </View>
      </View>
      <Text
        style={[styles.contractDescription, { color: currentTheme.colors.textSecondary }]}
        numberOfLines={2}
      >
        {contract.description}
      </Text>
      <View style={styles.contractFooter}>
        <Text style={[styles.contractDate, { color: currentTheme.colors.textSecondary }]}>
          {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'plat':
        return '#7B68EE';
      case 'gold':
        return '#FFD700';
      case 'silver':
        return '#C0C0C0';
      default:
        return '#C0C0C0';
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase()?.trim() || '';
    
    switch (normalizedStatus) {
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'terminated':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const renderContractSection = () => (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={toggleContractsExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderContent}>
          <Icon
            name="file-document-outline"
            size={20}
            color={isDarkMode ? '#FFFFFF' : '#000000'}
          />
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Contracts
          </Text>
        </View>
        <Icon
          name={contractsExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={isDarkMode ? '#FFFFFF' : '#000000'}
        />
      </TouchableOpacity>

      {contractsExpanded && (
        <View style={styles.expandedSection}>
          {/* Status filter tabs */}
          <View style={styles.statusFilterTabs}>
            <TouchableOpacity
              style={[
                styles.statusFilterTab,
                selectedStatus === 'active' && { 
                  backgroundColor: isDarkMode ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.1)',
                  borderColor: isDarkMode ? '#8A2BE2' : '#8A2BE2',
                  borderWidth: 1
                }
              ]}
              onPress={() => handleStatusFilter('active')}
            >
              <View style={styles.filterTabContent}>
                <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                <Text
                  style={[
                    styles.statusFilterText,
                    selectedStatus === 'active' && { 
                      color: isDarkMode ? '#8A2BE2' : '#8A2BE2',
                      fontWeight: '600' 
                    }
                  ]}
                >
                  Active
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.statusFilterTab,
                selectedStatus === 'completed' && { 
                  backgroundColor: isDarkMode ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.1)',
                  borderColor: isDarkMode ? '#8A2BE2' : '#8A2BE2',
                  borderWidth: 1
                }
              ]}
              onPress={() => handleStatusFilter('completed')}
            >
              <View style={styles.filterTabContent}>
                <View style={[styles.statusDot, { backgroundColor: '#2196F3' }]} />
                <Text
                  style={[
                    styles.statusFilterText,
                    selectedStatus === 'completed' && { 
                      color: isDarkMode ? '#8A2BE2' : '#8A2BE2',
                      fontWeight: '600' 
                    }
                  ]}
                >
                  Completed
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.statusFilterTab,
                selectedStatus === 'terminated' && { 
                  backgroundColor: isDarkMode ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.1)',
                  borderColor: isDarkMode ? '#8A2BE2' : '#8A2BE2',
                  borderWidth: 1
                }
              ]}
              onPress={() => handleStatusFilter('terminated')}
            >
              <View style={styles.filterTabContent}>
                <View style={[styles.statusDot, { backgroundColor: '#F44336' }]} />
                <Text
                  style={[
                    styles.statusFilterText,
                    selectedStatus === 'terminated' && { 
                      color: isDarkMode ? '#8A2BE2' : '#8A2BE2',
                      fontWeight: '600' 
                    }
                  ]}
                >
                  Terminated
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={isDarkMode ? '#8A2BE2' : '#8A2BE2'} size="small" />
              <Text style={[styles.loadingText, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
                Loading your contracts...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle-outline" size={24} color="#FF5252" />
              <Text style={styles.errorText}>{error}</Text>
              {error.includes('Authentication') || error.includes('log in') || error.includes('token') ? (
                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: '#8A2BE2' }]}
                  onPress={() => {
                    onClose(); // Close sidebar first
                    if (navigation) {
                      // Navigate back to home
                      navigation.navigate('Home');
                    }
                  }}
                >
                  <Text style={styles.loginButtonText}>Back to Home</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => fetchContracts(selectedStatus || undefined)}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : contracts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Icon
                  name="file-document-outline"
                  size={24}
                  color={isDarkMode ? '#8A2BE2' : '#8A2BE2'}
                />
              </View>
              <Text style={[styles.emptyText, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
                {selectedStatus 
                  ? `No ${selectedStatus} contracts found` 
                  : "You don't have any contracts yet"}
              </Text>
              <TouchableOpacity
                style={styles.createContractButton}
                onPress={() => navigateTo('AddDeal')}
              >
                <Icon name="plus" size={14} color="#FFFFFF" style={{marginRight: 4}} />
                <Text style={styles.createContractText}>Create New Contract</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.contractsList}>
              {contracts.map(contract => (
                <TouchableOpacity
                  key={contract.id}
                  style={[
                    styles.contractItem, 
                    { 
                      backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5',
                      borderLeftWidth: 3,
                      borderLeftColor: getStatusColor(contract.status)
                    }
                  ]}
                  onPress={() => handleContractPress(contract)}
                  activeOpacity={0.7}
                >
                  <View style={styles.contractHeader}>
                    <View style={styles.contractTitleSection}>
                      <Text style={[styles.contractTitle, { color: currentTheme.colors.text }]}>
                        {contract.title}
                      </Text>
                      <View style={styles.contractMetadata}>
                        <Text style={[styles.contractDate, { color: currentTheme.colors.textSecondary }]}>
                          {formatDateRange(contract.start_date, contract.end_date)}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(contract.status) }
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text
                    style={[styles.contractDescription, { color: currentTheme.colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {contract.description}
                  </Text>
                  
                  <View style={styles.contractFooter}>
                    {contract.rank && (
                      <View style={[styles.rankIndicator, { backgroundColor: getRankColor(contract.rank) }]}>
                        <Text style={styles.rankText}>
                          {formatRank(contract.rank)}
                        </Text>
                      </View>
                    )}
                    <Icon name="chevron-right" size={16} color={currentTheme.colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => {
              setSelectedStatus('all');
              fetchContracts();
              navigateTo('Contracts', { status: 'all' });
            }}
          >
            <Text style={styles.viewAllText}>View All Contracts</Text>
            <Icon name="arrow-right" size={16} color="#8A2BE2" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Format date range for contracts
  const formatDateRange = (startDate, endDate) => {
    try {
      const start = startDate ? new Date(startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A';
      const end = endDate ? new Date(endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A';
      return `${start} - ${end}`;
    } catch (error) {
      return 'Invalid dates';
    }
  };

  // Format rank for display
  const formatRank = (rank) => {
    switch (rank.toLowerCase()) {
      case 'plat':
        return 'Platinum';
      case 'gold':
        return 'Gold';
      case 'silver':
        return 'Silver';
      default:
        return rank.charAt(0).toUpperCase() + rank.slice(1);
    }
  };

  // Theme Toggle Option
  const renderThemeToggle = () => (
    <View style={styles.themeToggleWrapper}>
      <Text style={[styles.themeToggleTitle, { color: currentTheme.colors.text }]}>
        APPEARANCE
      </Text>
      <View style={styles.themeToggleContainer}>
        <TouchableOpacity 
          style={[
            styles.themeOption, 
            !isDarkMode && styles.activeThemeOption
          ]}
          onPress={() => {
            if (isDarkMode) toggleTheme();
          }}
          activeOpacity={0.7}
        >
          <Icon name="white-balance-sunny" size={20} color={!isDarkMode ? "#8A2BE2" : "#AAAAAA"} />
          <Text style={[
            styles.themeOptionText, 
            { 
              color: !isDarkMode ? "#8A2BE2" : "#AAAAAA",
              fontWeight: !isDarkMode ? '600' : 'normal'
            }
          ]}>
            Light
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.themeOption, 
            isDarkMode && styles.activeThemeOption
          ]}
          onPress={() => {
            if (!isDarkMode) toggleTheme();
          }}
          activeOpacity={0.7}
        >
          <Icon name="moon-waning-crescent" size={20} color={isDarkMode ? "#8A2BE2" : "#AAAAAA"} />
          <Text style={[
            styles.themeOptionText, 
            { 
              color: isDarkMode ? "#8A2BE2" : "#AAAAAA",
              fontWeight: isDarkMode ? '600' : 'normal'
            }
          ]}>
            Dark
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Add a handleShareProfile function
  const handleShareProfile = async () => {
    if (!companyData) {
      Alert.alert('Error', 'No company data available to share.');
      return;
    }
    
    try {
      const shareOptions = {
        title: `${companyData.name} Profile`,
        message: `Check out ${companyData.name}'s profile on Sponsofy!\n\n${companyData.industry} • ${companyData.location}\n\n${companyData.description || 'No description available.'}`,
        url: companyData.website || 'https://sponsofy.com/profile/' + companyData.id,
      };
      
      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert('Error', 'Could not share profile. Please try again.');
    }
  };

  // Define the renderMenuItem function here
  const renderMenuItem = (
    icon: string,
    label: string,
    screen: string,
    params?: any,
    badge?: number,
    onCustomPress?: () => void
  ) => (
    <TouchableOpacity
      style={[
        styles.menuItem,
        currentScreen === screen && styles.activeMenuItem
      ]}
      onPress={() => onCustomPress ? onCustomPress() : navigateTo(screen, params)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemIconContainer}>
        <Icon name={icon} size={22} color={currentScreen === screen ? currentTheme.colors.primary : currentTheme.colors.text} />
      </View>
      <Text 
        style={[
          styles.menuItemText, 
          { 
            color: currentScreen === screen ? currentTheme.colors.primary : currentTheme.colors.text,
            fontWeight: currentScreen === screen ? '600' : 'normal'
          }
        ]}
      >
        {label}
      </Text>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: currentTheme.colors.primary }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  const renderSubMenuItem = (
    icon: string,
    label: string,
    screen: string,
    params?: any
  ) => (
    <TouchableOpacity
      style={styles.subMenuItem}
      onPress={() => navigateTo(screen, params)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemIconContainer}>
        <Icon name={icon} size={18} color={currentTheme.colors.textSecondary} />
      </View>
      <Text style={[styles.subMenuItemText, { color: currentTheme.colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Move the styles into the component scope to access isDarkMode
  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
    },
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: SIDEBAR_WIDTH,
      height: '100%',
      zIndex: 1001,
    },
    header: {
      paddingTop: Platform.OS === 'ios' ? 50 : STATUS_BAR_HEIGHT + 10,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(138, 43, 226, 0.1)',
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    closeButton: {
      padding: 8,
    },
    profileSection: {
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatarText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    companyName: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    companyDetails: {
      fontSize: 14,
      marginBottom: 16,
    },
    profileActions: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
    },
    profileActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginHorizontal: 6,
    },
    profileActionText: {
      color: '#FFFFFF',
      marginLeft: 6,
      fontSize: 14,
      fontWeight: '500',
    },
    menuContainer: {
      flex: 1,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      marginLeft: 16,
      marginTop: 16,
      marginBottom: 12,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginHorizontal: 8,
      borderRadius: 8,
    },
    activeMenuItem: {
      backgroundColor: 'rgba(138, 43, 226, 0.1)',
    },
    menuItemIconContainer: {
      width: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuItemText: {
      marginLeft: 12,
      fontSize: 15,
      flex: 1,
    },
    subMenuContainer: {
      paddingLeft: 16,
      backgroundColor: 'rgba(138, 43, 226, 0.05)',
    },
    subMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginHorizontal: 8,
      borderRadius: 8,
    },
    subMenuItemText: {
      marginLeft: 12,
      fontSize: 14,
    },
    badge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    loadingText: {
      marginTop: 8,
      fontSize: 14,
    },
    errorContainer: {
      alignItems: 'center',
      padding: 24,
    },
    errorText: {
      color: '#FF5252',
      marginTop: 8,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 12,
    },
    retryButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: '#8A2BE2',
      borderRadius: 4,
    },
    retryText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '500',
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    emptyIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDarkMode ? 'rgba(138, 43, 226, 0.1)' : 'rgba(138, 43, 226, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    emptyText: {
      marginTop: 8,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 16,
    },
    createContractButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: '#8A2BE2',
      borderRadius: 20,
      elevation: 2,
      shadowColor: '#8A2BE2',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    createContractText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    viewAllButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: isDarkMode ? 'rgba(138, 43, 226, 0.1)' : 'rgba(138, 43, 226, 0.05)',
      borderRadius: 8,
      marginTop: 8,
    },
    viewAllText: {
      color: '#8A2BE2',
      fontSize: 14,
      fontWeight: '500',
    },
    sectionContainer: {
      padding: 16,
      marginBottom: 8,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    sectionHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    expandedSection: {
      marginTop: 16,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      borderRadius: 10,
      padding: 16,
    },
    statusFilterTabs: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    statusFilterTab: {
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#333333' : '#EEEEEE',
      flex: 1,
      marginHorizontal: 4,
    },
    filterTabContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    statusFilterText: {
      fontSize: 12,
      fontWeight: '500',
      color: isDarkMode ? '#CCCCCC' : '#666666',
    },
    contractsList: {
      marginBottom: 16,
    },
    contractItem: {
      padding: 14,
      marginBottom: 10,
      borderRadius: 8,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    contractHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    contractTitleSection: {
      flex: 1,
      marginRight: 8,
    },
    contractTitle: {
      fontWeight: 'bold',
      fontSize: 14,
      marginBottom: 4,
    },
    contractMetadata: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    contractDate: {
      fontSize: 12,
    },
    contractDescription: {
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 10,
    },
    contractFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    statusText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
    },
    rankIndicator: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    rankText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
    },
    rankBadge: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: 8,
    },
    expandIcon: {
      marginLeft: 8,
    },
    themeToggleWrapper: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      borderTopWidth: 1,
      borderTopColor: 'rgba(138, 43, 226, 0.1)',
    },
    themeToggleTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 12,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    themeToggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(138, 43, 226, 0.05)',
      borderRadius: 12,
      padding: 4,
      marginHorizontal: 8,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      flex: 1,
      justifyContent: 'center',
    },
    activeThemeOption: {
      backgroundColor: 'rgba(138, 43, 226, 0.15)',
    },
    themeOptionText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '500',
    },
    premiumButton: {
      flexDirection: 'row',
      backgroundColor: '#8A2BE2',
      margin: 16,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#8A2BE2',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    premiumButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    loginButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: '#8A2BE2',
      borderRadius: 4,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '500',
    },
  });

  return (
    <>
      {isVisible && (
        <Animated.View
          style={[
            styles.overlay,
            { opacity: overlayOpacity }
          ]}
        >
          <TouchableOpacity
            style={{ width: '100%', height: '100%' }}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>
      )}
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
            borderRightColor: isDarkMode ? '#333333' : '#E0E0E0',
            borderRightWidth: 1,
            transform: [{ translateX }],
            shadowColor: '#000',
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 10,
            elevation: 10,
            height: height,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>Sponsofy</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color={currentTheme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.profileSection, { 
          borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderBottomWidth: 1,
        }]}>
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: currentTheme.colors.primary },
            ]}
          >
            <Text style={styles.avatarText}>
              {companyData?.name?.charAt(0) || 'C'}
            </Text>
          </View>
          <Text style={[styles.companyName, { color: currentTheme.colors.text }]}>
            {companyData?.name || 'Company Name'}
          </Text>
          <Text style={[styles.companyDetails, { color: currentTheme.colors.textSecondary }]}>
            {companyData?.industry || 'Industry'} • {companyData?.location || 'Location'}
          </Text>
          
          <View style={styles.profileActions}>
            <TouchableOpacity 
              style={[styles.profileActionButton, { backgroundColor: currentTheme.colors.primary }]}
              onPress={() => navigateTo('EditProfile', { company: companyData })}
            >
              <Icon name="pencil" size={16} color="#FFFFFF" />
              <Text style={styles.profileActionText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.profileActionButton, { 
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: currentTheme.colors.primary
              }]}
              onPress={handleShareProfile}
            >
              <Icon name="share-variant" size={16} color={currentTheme.colors.primary} />
              <Text style={[styles.profileActionText, { color: currentTheme.colors.primary }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.menuContainer}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
              MAIN
            </Text>
            {renderMenuItem('home', 'Home', 'Home')}
            {renderMenuItem('account', 'Profile', 'CompanyProfile', { company: companyData })}
            {renderMenuItem('pencil', 'Edit Profile', 'EditProfile', { company: companyData })}
            {renderMenuItem('bell', 'Notifications', 'Notifications', {}, 3)}
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
              BUSINESS
            </Text>
            
            {/* Deals with dropdown */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={toggleDealsExpanded}
            >
              <Icon name="handshake" size={24} color={currentTheme.colors.text} />
              <Text style={[styles.menuItemText, { color: currentTheme.colors.text }]}>
                Deals
              </Text>
              <Icon 
                name={expandedDeals ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={currentTheme.colors.textSecondary} 
                style={styles.expandIcon}
              />
            </TouchableOpacity>
            
            {/* Replace the old contracts section with the new one */}
            {renderContractSection()}
            
            {renderMenuItem('chart-line', 'Analytics', 'Analytics')}
            {renderMenuItem('account-group', 'Content Creators', 'ContentCreators')}
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
              OTHER
            </Text>
            {renderMenuItem('chat', 'Messages', 'ChatScreen')}
            {renderMenuItem('theme-light-dark', 'Theme', '', {}, 0, toggleTheme)}
            {renderMenuItem('crown', 'Premium', 'PremiumScreen')}
            {renderMenuItem('cog', 'Settings', 'Settings')}
            {renderMenuItem('help-circle', 'Help & Support', 'Support')}
            {renderMenuItem('logout', 'Logout', 'Login')}
          </View>
        </ScrollView>
        
        {/* Theme Toggle */}
        {renderThemeToggle()}
        
        {/* Premium Button at Bottom */}
        <TouchableOpacity 
          style={styles.premiumButton}
          onPress={() => navigateTo('PremiumScreen')}
          activeOpacity={0.8}
        >
          <Icon name="crown" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.premiumButtonText}>Join Sponsofy Premium</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

export default Sidebar; 