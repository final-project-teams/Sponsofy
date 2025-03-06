import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

type RootStackParamList = {
  Deals: { status: string };
  DealDetail: { dealId: number };
  CreateDeal: undefined;
  Notifications: undefined;
};

type DealsRouteProp = RouteProp<RootStackParamList, 'Deals'>;

interface Deal {
  id: number;
  content_creator_id: number;
  company_id: number;
  deal_terms: string;
  price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
  contentCreator?: {
    first_name: string;
    last_name: string;
  };
}

const API_BASE_URL = 'http://192.168.110.131:3304/api';

const DealsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<DealsRouteProp>();
  const { currentTheme } = useTheme();
  const { status = 'pending' } = route.params || {};
  
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    fetchDeals();
  }, [status]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, we'll use mock data
      // In a real app, you would fetch from your API
      // const response = await axios.get(`${API_BASE_URL}/deals?status=${status}`);
      // setDeals(response.data);
      
      // Mock data based on your seed.js structure
      setTimeout(() => {
        setDeals(generateMockDeals(status));
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching deals:', error);
      setDeals(generateMockDeals(status));
      setLoading(false);
    }
  };

  const generateMockDeals = (filterStatus: string): Deal[] => {
    const mockDeals: Deal[] = [];
    const statuses = ['pending', 'accepted', 'rejected', 'completed'];
    const creatorFirstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Olivia'];
    const creatorLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller'];
    
    for (let i = 0; i < 15; i++) {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const deal: Deal = {
        id: i + 1,
        content_creator_id: 100 + i,
        company_id: 1,
        deal_terms: `This is a ${randomStatus} deal with terms for collaboration on social media content. The creator will produce content for our brand for a period of 3 months.`,
        price: Math.floor(Math.random() * 9000) + 1000,
        status: randomStatus as 'pending' | 'accepted' | 'rejected' | 'completed',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        contentCreator: {
          first_name: creatorFirstNames[Math.floor(Math.random() * creatorFirstNames.length)],
          last_name: creatorLastNames[Math.floor(Math.random() * creatorLastNames.length)]
        }
      };
      mockDeals.push(deal);
    }
    
    // Filter by status if provided
    if (filterStatus && filterStatus !== 'all') {
      return mockDeals.filter(deal => deal.status === filterStatus);
    }
    
    return mockDeals;
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const getStatusColor = (dealStatus: string) => {
    switch (dealStatus) {
      case 'pending':
        return '#FFA500'; // Orange
      case 'accepted':
        return '#4CAF50'; // Green
      case 'rejected':
        return '#F44336'; // Red
      case 'completed':
        return '#2196F3'; // Blue
      default:
        return '#757575'; // Grey
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderDealItem = ({ item }: { item: Deal }) => (
    <TouchableOpacity 
      style={[
        styles.dealItem, 
        { backgroundColor: currentTheme.colors.surface }
      ]}
      onPress={() => navigation.navigate('DealDetail', { dealId: item.id })}
    >
      <View style={styles.dealHeader}>
        <Text style={[styles.creatorName, { color: currentTheme.colors.text }]}>
          {item.contentCreator?.first_name} {item.contentCreator?.last_name}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <Text 
        style={[styles.dealTerms, { color: currentTheme.colors.textSecondary }]}
        numberOfLines={2}
      >
        {item.deal_terms}
      </Text>
      
      <View style={styles.dealFooter}>
        <Text style={[styles.price, { color: currentTheme.colors.primary }]}>
          {formatPrice(item.price)}
        </Text>
        <Text style={[styles.date, { color: currentTheme.colors.textSecondary }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="file-search-outline" size={80} color={currentTheme.colors.textSecondary} />
      <Text style={[styles.emptyText, { color: currentTheme.colors.text }]}>
        No {status} deals found
      </Text>
      <TouchableOpacity 
        style={[styles.createButton, { backgroundColor: currentTheme.colors.primary }]}
        onPress={() => navigation.navigate('CreateDeal')}
      >
        <Text style={styles.createButtonText}>Create New Deal</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: currentTheme.colors.border }]}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Icon name="menu" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>
          {status.charAt(0).toUpperCase() + status.slice(1)} Deals
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Icon name="bell" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          <Text style={[styles.loadingText, { color: currentTheme.colors.text }]}>
            Loading deals...
          </Text>
        </View>
      ) : (
        <FlatList
          data={deals}
          renderItem={renderDealItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      )}
      
      <Sidebar 
        isVisible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)} 
        companyData={companyData}
      />
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
  dealItem: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
  dealTerms: {
    fontSize: 14,
    marginBottom: 12,
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
  },
});

export default DealsScreen; 