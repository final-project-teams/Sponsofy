import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import { contractService, dealService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for routes and navigation
type RootStackParamList = {
  ContractDeals: { contractId: string };
  DealDetail: { dealId: string };
  CreateDeal: { contractId: string };
  ContractDetail: { id: string };
};

type ContractDealsScreenRouteProp = RouteProp<RootStackParamList, 'ContractDeals'>;
type ContractDealsNavigationProp = StackNavigationProp<RootStackParamList>;

interface Deal {
  id: string | number;
  status: string;
  price: number;
  deal_terms: string;
  createdAt: string;
  ContentCreatorDeals?: {
    id: string | number;
    first_name: string;
    last_name: string;
    profile_picture?: string;
    user?: {
      username: string;
    };
  };
  Contract?: {
    id: string | number;
    title: string;
  };
}

const ContractDeals = () => {
  const route = useRoute<ContractDealsScreenRouteProp>();
  const navigation = useNavigation<ContractDealsNavigationProp>();
  const { currentTheme, isDarkMode } = useTheme();
  
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { contractId } = route.params;
  
  const fetchContractAndDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check for token first
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setError('Authentication required. Please log in to view deals.');
        setLoading(false);
        return;
      }
      
      console.log(`Attempting to fetch contract with deals for ID: ${contractId}`);
      
      try {
        // Use the new efficient endpoint that fetches contract and deals together
        const response = await contractService.getContractWithDeals(contractId);
        
        console.log('Contract with deals response:', response);
        
        if (response.success) {
          // Set contract details
          if (response.contract) {
            console.log('Setting contract from response');
            setContract(response.contract);
          }
          
          // Set deals list
          const dealsArray = response.deals || [];
          console.log(`Setting ${dealsArray.length} deals in state`);
          setDeals(dealsArray);
        } else {
          console.error('Failed to fetch contract with deals:', response);
          setError('Failed to fetch contract details and deals');
        }
      } catch (error) {
        console.error('Error fetching contract with deals:', error);
        
        if (error.response) {
          if (error.response.status === 401) {
            setError('Authentication failed. Please log in again.');
            // Clear the invalid token
            await AsyncStorage.removeItem('userToken');
          } else if (error.response.status === 403) {
            setError('You do not have permission to view this contract.');
          } else if (error.response.status === 404) {
            // Contract not found
            setError('Contract not found. It may have been deleted.');
          } else {
            setError(`Error: ${error.response.data?.message || 'Something went wrong'}`);
          }
        } else if (error.message) {
          if (error.message.includes('Network Error')) {
            setError('Network error. Please check your internet connection.');
          } else {
            setError(`Error: ${error.message}`);
          }
        } else {
          setError('An unknown error occurred');
        }
      }
    } catch (error) {
      console.error('Error in fetchContractAndDeals:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchContractAndDeals();
  }, [contractId]);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchContractAndDeals();
  };
  
  const handleDealPress = (dealId: string | number) => {
    navigation.navigate('DealDetail', { dealId: dealId.toString() });
  };
  
  const handleCreateDeal = () => {
    navigation.navigate('CreateDeal', { contractId });
  };
  
  const handleBackPress = () => {
    navigation.navigate('ContractDetail', { id: contractId });
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return '#4CAF50';
      case 'pending':
        return '#FFC107';
      case 'rejected':
        return '#F44336';
      case 'completed':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };
  
  const renderDealItem = ({ item }: { item: Deal }) => (
    <TouchableOpacity
      style={[
        styles.dealCard,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
      ]}
      onPress={() => handleDealPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.dealHeader}>
        <Text
          style={[styles.creatorName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
        >
          {item.ContentCreatorDeals?.first_name
            ? `${item.ContentCreatorDeals.first_name} ${item.ContentCreatorDeals.last_name}`
            : item.ContentCreatorDeals?.user?.username || 'Content Creator'}
        </Text>
        
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) }
          ]}
        >
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.dealDetails}>
        <Text
          style={[styles.dealPrice, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}
        >
          ${parseFloat(item.price.toString()).toFixed(2)}
        </Text>
        
        <Text
          style={[styles.dealDate, { color: isDarkMode ? '#AAAAAA' : '#888888' }]}
        >
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <Text
        style={[styles.dealTerms, { color: isDarkMode ? '#BBBBBB' : '#777777' }]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {item.deal_terms || 'No specific terms'}
      </Text>
      
      <View style={styles.viewDetailsRow}>
        <Text style={[styles.viewDetailsText, { color: currentTheme.colors.primary }]}>
          View Details
        </Text>
        <Icon
          name="chevron-right"
          size={16}
          color={currentTheme.colors.primary}
        />
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000000' : '#F5F5F5' }
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'}
      />
      
      {/* Header */}
      <View style={[
        styles.header,
        { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Icon
            name="arrow-left"
            size={24}
            color={isDarkMode ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>
        
        <Text style={[
          styles.headerTitle,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          Contract Deals
        </Text>
        
        <View style={styles.headerRight} />
      </View>
      
      {/* Contract Details */}
      {contract && (
        <View style={[
          styles.contractHeader,
          { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }
        ]}>
          <Text style={[
            styles.contractTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            {contract.title}
          </Text>
          
          {contract.description && (
            <Text style={[
              styles.contractDescription,
              { color: isDarkMode ? '#CCCCCC' : '#666666' }
            ]}
            numberOfLines={2}
            >
              {contract.description}
            </Text>
          )}
        </View>
      )}
      
      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          <Text style={[
            styles.loadingText,
            { color: isDarkMode ? '#CCCCCC' : '#666666' }
          ]}>
            Loading deals...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchContractAndDeals}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : deals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon
            name="handshake-outline"
            size={64}
            color={isDarkMode ? '#444444' : '#CCCCCC'}
          />
          <Text style={[
            styles.emptyText,
            { color: isDarkMode ? '#CCCCCC' : '#666666' }
          ]}>
            No deals found for this contract
          </Text>
          <TouchableOpacity
            style={[
              styles.createDealButton,
              { backgroundColor: currentTheme.colors.primary }
            ]}
            onPress={handleCreateDeal}
          >
            <Icon name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.createDealButtonText}>Create Deal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={deals}
          renderItem={renderDealItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[currentTheme.colors.primary]}
              tintColor={currentTheme.colors.primary}
            />
          }
          ListFooterComponent={
            <TouchableOpacity
              style={[
                styles.createDealButtonFooter,
                { backgroundColor: currentTheme.colors.primary }
              ]}
              onPress={handleCreateDeal}
            >
              <Icon name="plus" size={16} color="#FFFFFF" />
              <Text style={styles.createDealButtonText}>Create New Deal</Text>
            </TouchableOpacity>
          }
        />
      )}
      
      {/* Floating Action Button */}
      {!loading && !error && (
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: currentTheme.colors.primary }
          ]}
          onPress={handleCreateDeal}
        >
          <Icon name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
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
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  contractHeader: {
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contractTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contractDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: '#F44336',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8A2BE2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  createDealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createDealButtonFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    margin: 16,
  },
  createDealButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  dealCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dealDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dealPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dealDate: {
    fontSize: 14,
  },
  dealTerms: {
    fontSize: 14,
    marginBottom: 12,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default ContractDeals; 