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
  Alert,
  ScrollView
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import { dealService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for routes and navigation
type RootStackParamList = {
  Deals: { status: string };
  DealDetail: { dealId: string };
  CreateDeal: { contractId: string };
  Home: undefined;
};

type DealsScreenRouteProp = RouteProp<RootStackParamList, 'Deals'>;
type DealsNavigationProp = StackNavigationProp<RootStackParamList>;

interface Deal {
  id: string | number;
  status: string;
  price: number;
  deal_terms: string;
  createdAt: string;
  ContractId?: string | number;
  Contract?: {
    id: string | number;
    title: string;
    description?: string;
  };
  ContentCreatorDeals?: {
    id: string | number;
    first_name: string;
    last_name: string;
    profile_picture?: string;
    user?: {
      username: string;
    };
  };
}

const DealsScreen = () => {
  const route = useRoute<DealsScreenRouteProp>();
  const navigation = useNavigation<DealsNavigationProp>();
  const { currentTheme, isDarkMode } = useTheme();
  
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get status from route params, default to 'all' if not provided
  const { status = 'all' } = route.params || {};
  
  const fetchDeals = async () => {
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
      
      console.log(`Fetching deals with status: ${status}`);
      
      // Use the appropriate method based on user role
      // For demonstration, we'll use the company deals method
      let response;
      
      // Different API calls based on status
      if (status === 'all') {
        response = await dealService.getCompanyDeals();
      } else {
        response = await dealService.getCompanyDeals();
        // If the API doesn't support filtering by status directly,
        // we can filter the results here
        if (response.success && Array.isArray(response.deals)) {
          response.deals = response.deals.filter(
            deal => deal.status.toLowerCase() === status.toLowerCase()
          );
        }
      }
      
      console.log('Deals response:', response);
      
      if (response.success && Array.isArray(response.deals)) {
        console.log(`Found ${response.deals.length} deals with status "${status}"`);
        setDeals(response.deals);
      } else {
        console.error('Invalid deals response format:', response);
        setError('Failed to fetch deals');
        setDeals([]);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError('Authentication failed. Please log in again.');
          // Clear the invalid token
          await AsyncStorage.removeItem('userToken');
        } else if (error.response.status === 403) {
          setError('You do not have permission to view these deals.');
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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchDeals();
  }, [status]);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchDeals();
  };
  
  const handleDealPress = (dealId: string | number) => {
    navigation.navigate('DealDetail', { dealId: dealId.toString() });
  };
  
  const handleBackPress = () => {
    navigation.navigate('Home');
  };
  
  const getStatusColor = (dealStatus: string) => {
    switch (dealStatus.toLowerCase()) {
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
  
  const getStatusTitle = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case 'all':
        return 'All Deals';
      case 'accepted':
        return 'Accepted Deals';
      case 'pending':
        return 'Pending Deals';
      case 'rejected':
        return 'Rejected Deals';
      case 'completed':
        return 'Completed Deals';
      default:
        return `${statusName.charAt(0).toUpperCase() + statusName.slice(1)} Deals`;
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
      
      {item.Contract && (
        <Text
          style={[styles.contractTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
          numberOfLines={1}
        >
          {item.Contract.title || 'Untitled Contract'}
        </Text>
      )}
      
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
          {getStatusTitle(status)}
        </Text>
        
        <View style={styles.headerRight} />
      </View>
      
      {/* Status Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            status === 'all' && { 
              backgroundColor: isDarkMode ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.1)', 
              borderColor: '#8A2BE2'
            }
          ]}
          onPress={() => navigation.navigate('Deals', { status: 'all' })}
        >
          <Text
            style={[
              styles.filterChipText,
              status === 'all' && { color: '#8A2BE2', fontWeight: '600' }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterChip,
            status === 'pending' && { 
              backgroundColor: isDarkMode ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)', 
              borderColor: '#FFC107' 
            }
          ]}
          onPress={() => navigation.navigate('Deals', { status: 'pending' })}
        >
          <View style={styles.filterChipContent}>
            <View style={[styles.statusDot, { backgroundColor: '#FFC107' }]} />
            <Text
              style={[
                styles.filterChipText,
                status === 'pending' && { color: '#FFC107', fontWeight: '600' }
              ]}
            >
              Pending
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterChip,
            status === 'accepted' && { 
              backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)', 
              borderColor: '#4CAF50' 
            }
          ]}
          onPress={() => navigation.navigate('Deals', { status: 'accepted' })}
        >
          <View style={styles.filterChipContent}>
            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
            <Text
              style={[
                styles.filterChipText,
                status === 'accepted' && { color: '#4CAF50', fontWeight: '600' }
              ]}
            >
              Accepted
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterChip,
            status === 'rejected' && { 
              backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)', 
              borderColor: '#F44336' 
            }
          ]}
          onPress={() => navigation.navigate('Deals', { status: 'rejected' })}
        >
          <View style={styles.filterChipContent}>
            <View style={[styles.statusDot, { backgroundColor: '#F44336' }]} />
            <Text
              style={[
                styles.filterChipText,
                status === 'rejected' && { color: '#F44336', fontWeight: '600' }
              ]}
            >
              Rejected
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterChip,
            status === 'completed' && { 
              backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.1)', 
              borderColor: '#2196F3' 
            }
          ]}
          onPress={() => navigation.navigate('Deals', { status: 'completed' })}
        >
          <View style={styles.filterChipContent}>
            <View style={[styles.statusDot, { backgroundColor: '#2196F3' }]} />
            <Text
              style={[
                styles.filterChipText,
                status === 'completed' && { color: '#2196F3', fontWeight: '600' }
              ]}
            >
              Completed
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      
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
            onPress={fetchDeals}
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
            {status === 'all' 
              ? "You don't have any deals yet" 
              : `No ${status} deals found`}
          </Text>
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
  filtersContainer: {
    maxHeight: 60,
    backgroundColor: 'transparent',
  },
  filtersContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  filterChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
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
    marginBottom: 8,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contractTitle: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
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
    marginBottom: 8,
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
});

export default DealsScreen; 