import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import { dealService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for routes and navigation
type RootStackParamList = {
  DealDetail: { dealId: string };
  ContractDeals: { contractId: string };
  ChatScreen: { receiverId: string; receiverName: string };
};

type DealDetailScreenRouteProp = RouteProp<RootStackParamList, 'DealDetail'>;
type DealDetailNavigationProp = StackNavigationProp<RootStackParamList>;

const DealDetail = () => {
  const route = useRoute<DealDetailScreenRouteProp>();
  const navigation = useNavigation<DealDetailNavigationProp>();
  const { currentTheme, isDarkMode } = useTheme();
  
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { dealId } = route.params;
  
  const fetchDealDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check for token first
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setError('Authentication required. Please log in to view deal details.');
        setLoading(false);
        return;
      }
      
      console.log(`Fetching deal details for ID: ${dealId}`);
      
      // Fetch deal details
      const response = await dealService.getDealById(dealId);
      
      console.log('Deal details response:', response);
      
      if (response.success && response.deal) {
        setDeal(response.deal);
      } else {
        setError('Failed to fetch deal details');
      }
    } catch (error) {
      console.error('Error fetching deal details:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError('Authentication failed. Please log in again.');
          // Clear the invalid token
          await AsyncStorage.removeItem('userToken');
        } else if (error.response.status === 403) {
          setError('You do not have permission to view this deal.');
        } else if (error.response.status === 404) {
          setError('Deal not found. It may have been deleted.');
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
    fetchDealDetails();
  }, [dealId]);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchDealDetails();
  };
  
  const handleBackPress = () => {
    // Navigate back to ContractDeals with the contract ID
    if (deal && deal.ContractId) {
      navigation.navigate('ContractDeals', { contractId: deal.ContractId.toString() });
    } else {
      navigation.goBack();
    }
  };
  
  const handleContactCreator = () => {
    if (deal && deal.ContentCreatorDeals) {
      const creatorName = deal.ContentCreatorDeals.first_name 
        ? `${deal.ContentCreatorDeals.first_name} ${deal.ContentCreatorDeals.last_name}`
        : deal.ContentCreatorDeals.user?.username || 'Content Creator';
      
      navigation.navigate('ChatScreen', { 
        receiverId: deal.contentCreatorId.toString(),
        receiverName: creatorName
      });
    } else {
      Alert.alert('Error', 'Cannot find creator information for this deal');
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F5F5F5' }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="arrow-left"
              size={24}
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Deal Details
          </Text>
          
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          <Text style={[styles.loadingText, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
            Loading deal details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F5F5F5' }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="arrow-left"
              size={24}
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Deal Details
          </Text>
          
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchDealDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!deal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F5F5F5' }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="arrow-left"
              size={24}
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Deal Details
          </Text>
          
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Icon
            name="file-document-outline"
            size={64}
            color={isDarkMode ? '#444444' : '#CCCCCC'}
          />
          <Text style={[styles.emptyText, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
            No deal information found
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F5F5F5' }]}>
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
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
        
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          Deal Details
        </Text>
        
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[currentTheme.colors.primary]}
            tintColor={currentTheme.colors.primary}
          />
        }
      >
        {/* Deal Header Card */}
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }]}>
          <View style={styles.dealHeader}>
            <View style={styles.dealInfo}>
              <Text style={[styles.dealTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                {deal.Contract?.title || 'Untitled Contract'}
              </Text>
              
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(deal.status) }
                ]}
              >
                <Text style={styles.statusText}>
                  {deal.status?.charAt(0).toUpperCase() + deal.status?.slice(1) || 'Unknown Status'}
                </Text>
              </View>
            </View>
            
            <Text style={[styles.dealDate, { color: isDarkMode ? '#AAAAAA' : '#888888' }]}>
              Created: {formatDate(deal.createdAt)}
            </Text>
          </View>
        </View>
        
        {/* Creator Info Card */}
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }]}>
          <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Creator Information
          </Text>
          
          <View style={styles.creatorInfo}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorInitials}>
                {deal.ContentCreatorDeals?.first_name?.charAt(0) || 'C'}
              </Text>
            </View>
            
            <View style={styles.creatorDetails}>
              <Text style={[styles.creatorName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                {deal.ContentCreatorDeals?.first_name
                  ? `${deal.ContentCreatorDeals.first_name} ${deal.ContentCreatorDeals.last_name}`
                  : deal.ContentCreatorDeals?.user?.username || 'Content Creator'}
              </Text>
              
              <Text style={[styles.creatorUsername, { color: isDarkMode ? '#AAAAAA' : '#888888' }]}>
                @{deal.ContentCreatorDeals?.user?.username || 'username'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: currentTheme.colors.primary }]}
            onPress={handleContactCreator}
          >
            <Icon name="chat-outline" size={16} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Contact Creator</Text>
          </TouchableOpacity>
        </View>
        
        {/* Deal Details Card */}
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }]}>
          <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Deal Details
          </Text>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: isDarkMode ? '#AAAAAA' : '#888888' }]}>
              Amount
            </Text>
            <Text style={[styles.detailValue, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              ${parseFloat(deal.price?.toString() || '0').toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: isDarkMode ? '#AAAAAA' : '#888888' }]}>
              Status
            </Text>
            <Text style={[styles.detailValue, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              {deal.status || 'Unknown'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: isDarkMode ? '#AAAAAA' : '#888888' }]}>
              Created Date
            </Text>
            <Text style={[styles.detailValue, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              {formatDate(deal.createdAt)}
            </Text>
          </View>
          
          {deal.updatedAt && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: isDarkMode ? '#AAAAAA' : '#888888' }]}>
                Last Updated
              </Text>
              <Text style={[styles.detailValue, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                {formatDate(deal.updatedAt)}
              </Text>
            </View>
          )}
        </View>
        
        {/* Deal Terms Card */}
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }]}>
          <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Deal Terms
          </Text>
          
          <Text style={[styles.termsText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            {deal.deal_terms || 'No specific terms for this deal.'}
          </Text>
        </View>
        
        {/* Terms Section */}
        {deal.Term && (
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }]}>
            <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              Additional Terms
            </Text>
            
            <Text style={[styles.termsText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              {deal.Term.description || 'No additional terms specified.'}
            </Text>
          </View>
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
  card: {
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
    marginBottom: 16,
  },
  dealInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dealDate: {
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  creatorInitials: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  creatorDetails: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  creatorUsername: {
    fontSize: 14,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default DealDetail; 