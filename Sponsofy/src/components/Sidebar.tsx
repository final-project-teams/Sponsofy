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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

// Define API base URL
const API_BASE_URL = 'http://192.168.11.94:3304/api'; // Updated to match ContractsScreen

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

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
  status: 'active' | 'completed' | 'terminated';
  payment_terms: string;
  rank?: 'plat' | 'gold' | 'silver';
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible, onClose, companyData, navigation, currentScreen }) => {
  const { currentTheme } = useTheme();
  
  // State for expanded sections
  const [expandedDeals, setExpandedDeals] = useState(false);
  const [contractsExpanded, setContractsExpanded] = useState(false);
  // Add state for contracts
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [contractsError, setContractsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: isVisible ? 0 : -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Fetch contracts when contracts section is expanded
    if (contractsExpanded) {
      fetchContracts();
    }
  }, [isVisible, contractsExpanded]);

  const translateX = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const navigateTo = (screen: string, params?: any) => {
    // Close the sidebar first for better UX
    onClose();
    
    // Add a small delay for smoother transition
    setTimeout(() => {
      if (navigation) {
        navigation.navigate(screen, params);
      }
    }, 300);
  };

  const toggleDealsExpanded = () => {
    setExpandedDeals(!expandedDeals);
    // Close contracts if deals is being opened
    if (!expandedDeals) {
      setContractsExpanded(false);
    }
  };

  const toggleContractsExpanded = () => {
    setContractsExpanded(!contractsExpanded);
    // Close deals if contracts is being opened
    if (!contractsExpanded) {
      setExpandedDeals(false);
    }
  };

  // Enhance the fetchContracts function to get real data
  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      
      // If we have company data, use its ID to fetch related contracts
      const companyId = companyData?.id;
      
      if (companyId) {
        // Try to fetch from API first
        try {
          const response = await fetch(`${API_BASE_URL}/contracts?company_id=${companyId}`);
          
          if (response.ok) {
            const data = await response.json();
            setContracts(data);
            return;
          }
        } catch (error) {
          console.log('Error fetching contracts:', error);
          // Fall back to mock data if API fails
        }
      }
      
      // Use mock data as fallback
      const mockData = generateMockContracts();
      setContracts(mockData);
    } catch (error) {
      console.error('Error in fetchContracts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock contracts for demo
  const generateMockContracts = (): Contract[] => {
    const mockContracts: Contract[] = [];
    const statuses = ['active', 'completed', 'terminated'];
    
    // Create 5 mock contracts
    for (let i = 1; i <= 5; i++) {
      const contractStatus = statuses[Math.floor(Math.random() * statuses.length)] as 'active' | 'completed' | 'terminated';
      
      // Create start date (between 1-30 days in the past)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30) - 1);
      
      // Create end date (3-12 months after start date)
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + Math.floor(Math.random() * 10) + 3);
      
      mockContracts.push({
        id: i,
        title: `Contract ${i} - ${['Social Media Campaign', 'Product Promotion', 'Brand Ambassador', 'Content Creation'][Math.floor(Math.random() * 4)]}`,
        description: `This is a ${contractStatus} contract for content creation.`,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: contractStatus,
        payment_terms: `Payment of $${Math.floor(Math.random() * 5000) + 1000}`,
        rank: ['plat', 'gold', 'silver'][Math.floor(Math.random() * 3)] as 'plat' | 'gold' | 'silver',
      });
    }
    
    return mockContracts;
  };

  // Improve the contract press handler
  const handleContractPress = (contract: Contract) => {
    // Navigate to contract detail screen with the contract data
    navigateTo('ContractDetail', { contract });
  };

  // Enhance the render contract item to show more details and better styling
  const renderContractItem = (contract: Contract) => (
    <TouchableOpacity
      key={contract.id}
      style={[
        styles.contractItem,
        { backgroundColor: currentTheme.colors.surface }
      ]}
      onPress={() => handleContractPress(contract)}
    >
      <View style={styles.contractHeader}>
        <Text style={[styles.contractTitle, { color: currentTheme.colors.text }]}>
          {contract.title}
        </Text>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: getStatusColor(contract.status) }
        ]}>
          <Text style={styles.statusText}>
            {contract.status.toUpperCase()}
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
        {contract.rank && (
          <View style={[styles.rankBadge, { backgroundColor: getRankColor(contract.rank) }]}>
            <Text style={styles.rankText}>{contract.rank.toUpperCase()}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Add helper function to get rank color
  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'plat':
        return '#A0B0C0';
      case 'gold':
        return '#FFD700';
      case 'silver':
        return '#C0C0C0';
      default:
        return '#888888';
    }
  };

  // Add helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'terminated':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderMenuItem = (
    icon: string,
    label: string,
    screen: string,
    params?: any,
    badge?: number
  ) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => navigateTo(screen, params)}
    >
      <Icon name={icon} size={24} color={currentTheme.colors.text} />
      <Text style={[styles.menuItemText, { color: currentTheme.colors.text }]}>
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
    >
      <Icon name={icon} size={20} color={currentTheme.colors.textSecondary} />
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
            "check-circle-outline",
            "Completed Contracts",
            "Contracts",
            { status: "completed" }
          )}
          {renderSubMenuItem(
            "close-circle-outline",
            "Terminated Contracts",
            "Contracts",
            { status: "terminated" }
          )}
        </View>
      )}
    </View>
  );

  return (
    <>
      {isVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: currentTheme.colors.background,
            borderRightColor: currentTheme.colors.border,
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={currentTheme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
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
                color={currentTheme.colors.text} 
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
            {renderMenuItem('crown', 'Premium', 'PremiumScreen')}
            {renderMenuItem('cog', 'Settings', 'Settings')}
            {renderMenuItem('help-circle', 'Help & Support', 'Support')}
            {renderMenuItem('logout', 'Logout', 'Login')}
          </View>
        </ScrollView>
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
    borderRightWidth: 1,
    zIndex: 1001,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 16,
    flex: 1,
  },
  subMenuContainer: {
    paddingLeft: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  subMenuItemText: {
    marginLeft: 16,
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
  errorContainer: {
    padding: 16,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  emptyContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rankText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  expandIcon: {
    marginLeft: 8,
  },
  subMenu: {
    padding: 16,
  },
});

export default Sidebar; 