import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Contracts: { status: string };
  ContractDetail: { 
    contract: Contract;
  };
  Home: undefined;
  Notifications: undefined;
};

type ContractsRouteProp = RouteProp<RootStackParamList, 'Contracts'>;

interface Contract {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'terminated' | 'pending';
  payment_terms: string;
  rank: 'plat' | 'gold' | 'silver';
  company_id?: number;
  content_creator_id?: number;
  createdAt?: string;
  updatedAt?: string;
  contentCreator?: {
    first_name: string;
    last_name: string;
  };
}

// Generate mock contracts function
const generateMockContracts = (filterStatus: string): Contract[] => {
  const mockContracts: Contract[] = [];
  const statuses = ['active', 'pending', 'completed', 'terminated'];
  const ranks = ['plat', 'gold', 'silver'];
  
  // Create 10 mock contracts
  for (let i = 1; i <= 10; i++) {
    const contractStatus = filterStatus === 'all' ? 
      statuses[Math.floor(Math.random() * statuses.length)] : 
      filterStatus as 'active' | 'pending' | 'completed' | 'terminated';
    
    // Skip if the status doesn't match the filter (except for 'all')
    if (filterStatus !== 'all' && contractStatus !== filterStatus) {
      continue;
    }
    
    // Create start date (between 1-30 days in the past)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30) - 1);
    
    // Create end date (3-12 months after start date)
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + Math.floor(Math.random() * 10) + 3);
    
    mockContracts.push({
      id: i,
      title: `Contract ${i} - ${['Social Media Campaign', 'Product Promotion', 'Brand Ambassador', 'Content Creation'][Math.floor(Math.random() * 4)]}`,
      description: `This is a ${contractStatus} contract for ${['TikTok', 'Instagram', 'YouTube', 'Blog'][Math.floor(Math.random() * 4)]} content creation.`,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: contractStatus as 'active' | 'completed' | 'terminated' | 'pending',
      payment_terms: `Payment of $${Math.floor(Math.random() * 5000) + 1000} ${['monthly', 'quarterly', 'annually'][Math.floor(Math.random() * 3)]}`,
      rank: ranks[Math.floor(Math.random() * ranks.length)] as 'plat' | 'gold' | 'silver',
      company_id: Math.floor(Math.random() * 10) + 1,
      content_creator_id: Math.floor(Math.random() * 20) + 1,
      createdAt: new Date(startDate).toISOString(),
      updatedAt: new Date().toISOString(),
      contentCreator: {
        first_name: ['John', 'Jane', 'Alex', 'Sarah', 'Michael'][Math.floor(Math.random() * 5)],
        last_name: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)]
      }
    });
  }
  
  return mockContracts;
};

// Define the component with explicit props
const ContractsScreen = (props) => {
  const { navigation, route } = props;
  const { currentTheme } = useTheme();
  const { status = 'active' } = route?.params || {};
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, [status]);

  // Update the fetchContracts function to use direct axios call
  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_URL = 'http://192.168.11.94:3304/api';
      console.log('Attempting to fetch contracts from:', `${API_URL}/contract`);
      
      try {
        // Use direct axios call
        const response = await axios.get(`${API_URL}/contract`, {
          timeout: 3000
        });
        
        if (response.data && Array.isArray(response.data)) {
          // Filter contracts by status if needed
          let filteredContracts = response.data;
          if (status && status !== 'all') {
            filteredContracts = response.data.filter(
              (contract: Contract) => contract.status === status
            );
          }
          
          setContracts(filteredContracts);
          console.log(`Loaded ${filteredContracts.length} contracts with status: ${status}`);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.log('API call failed, using mock data');
        // Fall back to mock data
        const mockData = generateMockContracts(status);
        setContracts(mockData);
        setError('Using offline data (server unavailable)');
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      // Fall back to mock data on any error
      const mockData = generateMockContracts(status);
      setContracts(mockData);
      setError('An error occurred. Using offline data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchContracts();
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleContractPress = (contract: Contract) => {
    try {
      // Navigate to the ContractDetail screen with the selected contract
      navigation.navigate('ContractDetail', { contract });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(
        'Navigation Error',
        'Unable to navigate to contract details. Please try again.'
      );
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50'; // Green
      case 'completed':
        return '#2196F3'; // Blue
      case 'terminated':
        return '#F44336'; // Red
      default:
        return '#757575'; // Grey
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'plat':
        return '#E5E4E2'; // Platinum color
      case 'gold':
        return '#FFD700'; // Gold color
      case 'silver':
        return '#C0C0C0'; // Silver color
      default:
        return '#FFFFFF'; // White
    }
  };

  const handleNavigateToNotifications = () => {
    try {
      if (navigation) {
        navigation.navigate('Notifications');
      } else {
        console.error('Navigation object is undefined');
        Alert.alert('Navigation Error', 'Unable to navigate to notifications');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to notifications');
    }
  };

  const renderContractItem = ({ item }: { item: Contract }) => (
    <TouchableOpacity
      style={[styles.contractItem, { backgroundColor: currentTheme.colors.surface }]}
      onPress={() => handleContractPress(item)}
    >
      <View style={styles.contractHeader}>
        <Text style={[styles.contractTitle, { color: currentTheme.colors.text }]}>
          {item.title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.creatorInfo}>
        <Icon name="account" size={16} color={currentTheme.colors.text} />
        <Text style={[styles.creatorName, { color: currentTheme.colors.text }]}>
          {item.contentCreator ? 
            `${item.contentCreator.first_name} ${item.contentCreator.last_name}` : 
            'Content Creator'}
        </Text>
      </View>
      
      <Text style={[styles.contractDescription, { color: currentTheme.colors.text }]}>
        {item.description}
      </Text>
      
      <View style={styles.contractDetails}>
        <View style={styles.detailItem}>
          <Icon name="calendar" size={16} color={currentTheme.colors.text} />
          <Text style={[styles.detailText, { color: currentTheme.colors.text }]}>
            {formatDate(item.start_date)} - {formatDate(item.end_date)}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Icon name="cash" size={16} color={currentTheme.colors.text} />
          <Text style={[styles.detailText, { color: currentTheme.colors.text }]}>
            {item.payment_terms || 'Payment terms not specified'}
          </Text>
        </View>
      </View>
      
      <View style={styles.contractFooter}>
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(item.rank) }]}>
          <Text style={styles.rankText}>
            {item.rank === 'plat' ? 'Platinum' : 
             item.rank === 'gold' ? 'Gold' : 'Silver'}
          </Text>
        </View>
        
        <Text style={[styles.date, { color: currentTheme.colors.text }]}>
          Created: {formatDate(item.createdAt || item.start_date)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: currentTheme.colors.border }]}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
          <Icon name="menu" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>
          {status === 'all' ? 'All Contracts' : `${status.charAt(0).toUpperCase() + status.slice(1)} Contracts`}
        </Text>
        <TouchableOpacity onPress={handleNavigateToNotifications}>
          <Icon name="bell" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
      </View>
      
      {sidebarVisible && (
        <Sidebar
          isVisible={sidebarVisible}
          onClose={toggleSidebar}
          navigation={navigation}
          currentScreen="Contracts"
        />
      )}
      
      {error && (
        <View style={[styles.errorContainer, { borderColor: '#F44336' }]}>
          <Text style={[styles.errorText, { color: '#F44336' }]}>
            {error} {error.includes('mock') ? '' : '(Using sample data instead)'}
          </Text>
        </View>
      )}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          <Text style={[styles.loadingText, { color: currentTheme.colors.text }]}>
            Loading contracts...
          </Text>
        </View>
      ) : contracts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="file-document-outline" size={64} color={currentTheme.colors.text} />
          <Text style={[styles.emptyText, { color: currentTheme.colors.text }]}>
            No {status} contracts found
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: currentTheme.colors.primary }]}
            onPress={() => Alert.alert('Create Contract', 'This feature is coming soon!')}
          >
            <Text style={styles.createButtonText}>Create New Contract</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={contracts}
          renderItem={renderContractItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={handleRefresh}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  errorText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  contractItem: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorName: {
    fontSize: 14,
    marginLeft: 4,
  },
  contractDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  contractDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 4,
  },
  contractFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rankText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
  },
});

export default ContractsScreen;