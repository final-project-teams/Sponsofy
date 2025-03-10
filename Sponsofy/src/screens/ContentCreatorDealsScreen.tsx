import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/axios';

const ContentCreatorDealsScreen = ({ navigation }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/addDeal/creator/deals');
      setDeals(response.data.deals);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError(err.message || 'Failed to load deals');
      setLoading(false);
    }
  };

  // Get status color based on deal status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f39c12'; // Orange
      case 'accepted':
        return '#2ecc71'; // Green
      case 'rejected':
        return '#e74c3c'; // Red
      case 'completed':
        return '#3498db'; // Blue
      default:
        return '#95a5a6'; // Gray
    }
  };

  // Get rank color
  const getRankColor = (rank) => {
    switch (rank) {
      case 'gold':
        return 'gold';
      case 'silver':
        return 'silver';
      case 'plat':
        return '#8A2BE2'; // Purple
      default:
        return '#95a5a6'; // Gray
    }
  };

  const renderDealItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.dealCard}
      onPress={() => navigation.navigate('DealDetails', { dealId: item.id })}
    >
      <View style={styles.dealHeader}>
        <Text style={styles.dealTitle}>{item.Contract?.title || 'Untitled Deal'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.dealInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={16} color="#aaa" />
          <Text style={styles.infoLabel}>Company:</Text>
          <Text style={styles.infoValue}>{item.Contract?.Company?.name || 'Unknown'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#aaa" />
          <Text style={styles.infoLabel}>Date:</Text>
          <Text style={styles.infoValue}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={16} color="#aaa" />
          <Text style={styles.infoLabel}>Price:</Text>
          <Text style={styles.infoValue}>${item.price || 0}</Text>
        </View>
      </View>

      <View style={styles.dealFooter}>
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(item.Contract?.rank) }]}>
          <Text style={styles.rankText}>{item.Contract?.rank || 'N/A'}</Text>
        </View>
        <View style={styles.viewDetails}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#0099ff" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#555" />
      <Text style={styles.emptyText}>No deals found</Text>
      <Text style={styles.emptySubtext}>
        Browse available contracts and submit deal requests to get started
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0099ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDeals}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Deals</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchDeals}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={deals}
        renderItem={renderDealItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0099ff',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding at bottom for better scrolling
  },
  dealCard: {
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  dealInfo: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#aaa',
    marginLeft: 8,
    width: 70,
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1a1a1a',
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#0099ff',
    fontSize: 14,
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ContentCreatorDealsScreen;