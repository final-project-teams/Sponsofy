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
  ContractDetail: { contract: Contract };
  ChatScreen: undefined;
  PremiumScreen: undefined;
  Settings: undefined;
  Support: undefined;
  Login: undefined;
};

// Add Contract interface
interface Contract {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'terminated' | 'pending';
  payment_terms: string;
  rank?: 'plat' | 'gold' | 'silver';
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
    if (!contractsExpanded && contracts.length === 0) {
      fetchContracts();
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
        console.warn('No authenticated user found');
        setContracts(generateMockContracts());
        setIsLoading(false);
        return;
      }
      
      // Get the company ID from the user data or companyData
      const companyId = companyData?.id || user.companyId;
      
      if (!companyId) {
        console.warn('No company ID found');
        setContracts(generateMockContracts());
        setIsLoading(false);
        return;
      }
      
      console.log(`Fetching contracts for company ID: ${companyId}, status: ${status || 'all'}`);
      
      // Use the contractService to fetch contracts by company ID
      const response = await contractService.getContractsByCompanyId(companyId);
      
      if (response && response.contracts) {
        console.log(`Fetched ${response.contracts.length} contracts`);
        
        // Filter contracts by status if specified
        let filteredContracts = response.contracts;
        if (status) {
          filteredContracts = response.contracts.filter(
            (contract: Contract) => contract.status.toLowerCase() === status.toLowerCase()
          );
          console.log(`Filtered to ${filteredContracts.length} ${status} contracts`);
        }
        
        setContracts(filteredContracts);
      } else {
        console.warn('No contracts found or invalid response format');
        setContracts(generateMockContracts());
      }
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError('Failed to load contracts');
      // Fallback to mock data on error
      setContracts(generateMockContracts());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockContracts = (): Contract[] => {
    return [
      {
        id: 1,
        title: 'Instagram Promotion',
        description: 'Promote our new product on Instagram',
        start_date: '2023-01-01',
        end_date: '2023-02-01',
        status: 'active',
        payment_terms: 'Net 30',
        rank: 'gold'
      },
      {
        id: 2,
        title: 'YouTube Review',
        description: 'Create a review video for our service',
        start_date: '2023-02-15',
        end_date: '2023-03-15',
        status: 'completed',
        payment_terms: 'Net 15',
        rank: 'plat'
      },
      {
        id: 3,
        title: 'TikTok Campaign',
        description: 'Run a viral challenge campaign',
        start_date: '2023-04-01',
        end_date: '2023-05-01',
        status: 'terminated',
        payment_terms: 'Net 45',
        rank: 'silver'
      }
    ];
  };

  const handleContractPress = (contract: Contract) => {
    onClose();
    navigation.navigate('ContractDetail', { contract });
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    fetchContracts(status);
  };

  const renderContractItem = (contract: Contract) => (
    <TouchableOpacity
      key={contract.id}
      style={[styles.contractItem, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5' }]}
      onPress={() => handleContractPress(contract)}
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
    switch (status.toLowerCase()) {
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

  // Update the contracts section to navigate to different pages instead of expanding in the sidebar
  const renderContractSection = () => (
    <View>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={toggleContractsExpanded}
      >
        <Icon name="file-document-outline" size={24} color={currentTheme.colors.text} />
        <Text style={[styles.menuItemText, { color: currentTheme.colors.text }]}>
          Contracts
        </Text>
        <Icon
          name={contractsExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={currentTheme.colors.textSecondary}
          style={styles.expandIcon}
        />
      </TouchableOpacity>

      {contractsExpanded && (
        <View style={styles.subMenu}>
          {/* Navigate to different contract pages based on status */}
          {renderSubMenuItem(
            "check-circle",
            "Active Contracts",
            "Contracts",
            { status: "active" }
          )}
          {renderSubMenuItem(
            "clock-outline",
            "Pending Contracts",
            "Contracts",
            { status: "pending" }
          )}
          {renderSubMenuItem(
            "check-all",
            "Completed Contracts",
            "Contracts",
            { status: "completed" }
          )}
          {renderSubMenuItem(
            "close-circle",
            "Terminated Contracts",
            "Contracts",
            { status: "terminated" }
          )}
          
          {/* Show recent contracts if available */}
          {contracts.length > 0 && (
            <View style={styles.contractsContainer}>
              <Text style={[styles.contractsHeader, { color: currentTheme.colors.textSecondary }]}>
                RECENT CONTRACTS
              </Text>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={currentTheme.colors.primary} />
                  <Text style={[styles.loadingText, { color: currentTheme.colors.textSecondary }]}>
                    Loading...
                  </Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
                    {error}
                  </Text>
                </View>
              ) : contracts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.loadingText, { color: currentTheme.colors.textSecondary }]}>
                    No contracts found
                  </Text>
                </View>
              ) : (
                contracts.slice(0, 2).map(renderContractItem)
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );

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
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  errorText: {
    color: '#FF5252',
  },
  emptyContainer: {
    padding: 16,
    backgroundColor: 'rgba(138, 43, 226, 0.05)',
  },
  contractsContainer: {
    marginTop: 8,
    paddingBottom: 8,
  },
  contractsHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 8,
  },
  contractItem: {
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 1,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  contractTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  contractDescription: {
    fontSize: 12,
    marginBottom: 6,
  },
  contractFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contractDate: {
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  statusText: {
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
  rankText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  expandIcon: {
    marginLeft: 8,
  },
  subMenu: {
    padding: 16,
    backgroundColor: 'rgba(138, 43, 226, 0.05)',
  },
  // Theme toggle styles
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
  // Premium button
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
});

export default Sidebar; 