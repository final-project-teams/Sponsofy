import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Text, Card, useTheme, ActivityIndicator, Button, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Contract, contractService } from '../services/contractService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  ContractDetail: { id: string };
  Contracts: { status?: string };
  CompanyProfile: { company: any };
  Notifications: undefined;
};

type ContractListNavigationProp = StackNavigationProp<RootStackParamList>;

const ContractList = () => {
  const theme = useTheme();
  const navigation = useNavigation<ContractListNavigationProp>();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Initialize token
  useEffect(() => {
    initToken();
  }, []);

  const initToken = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      setToken(userToken);
      fetchContracts();
    } catch (error) {
      console.error('Error initializing token:', error);
      setError('Failed to initialize. Please try again.');
      setLoading(false);
    }
  };

  const fetchContracts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching contracts...');
      const fetchedContracts = await contractService.getContracts();
      console.log('Fetched contracts:', fetchedContracts);
      
      if (Array.isArray(fetchedContracts)) {
        setContracts(fetchedContracts);
      } else {
        console.error('Invalid contracts data format:', fetchedContracts);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError('Failed to load contracts. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchContracts();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.primary;
      case 'completed':
        return 'green';
      case 'terminated':
        return theme.colors.error;
      default:
        return '#666666';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'plat':
        return 'medal';
      case 'gold':
        return 'star-circle';
      case 'silver':
        return 'star-half-full';
      default:
        return 'star-outline';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleCompanyPress = (company: any) => {
    navigation.navigate('CompanyProfile', { company });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={fetchContracts} 
            style={{ marginTop: 16 }}
          >
            Retry
          </Button>
        </View>
      );
    }

    if (contracts.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="file-document-outline" size={48} color={theme.colors.primary} />
          <Text style={{ marginTop: 16, textAlign: 'center' }}>
            No contracts found. Create your first contract to get started.
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Contracts', { status: 'active' })}
            style={{ marginTop: 16 }}
          >
            View All Contracts
          </Button>
        </View>
      );
    }

    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {contracts.map((contract) => (
          <Card 
            key={contract.id} 
            style={styles.card}
            onPress={() => navigation.navigate('ContractDetail', { id: contract.id })}
          >
            <Card.Content>
              {/* Contract Title and Status */}
              <View style={styles.headerRow}>
                <Text style={styles.title}>{contract.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(contract.status) }]}>
                    {contract.status}
                  </Text>
                </View>
              </View>
              
              {/* Contract Amount and Dates */}
              <View style={styles.detailsRow}>
                <View style={styles.amountContainer}>
                  <Icon name="currency-usd" size={16} color="#666" />
                  <Text style={styles.amount}>${contract.amount?.toLocaleString() || '0'}</Text>
                </View>
                
                <View style={styles.dateContainer}>
                  <Icon name="calendar-range" size={16} color="#666" />
                  <Text style={styles.dates}>
                    {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              
              {/* Contract Description */}
              {contract.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {contract.description}
                </Text>
              )}
              
              {/* Company Section - Only show if company data exists */}
              {contract.Company && (
                <TouchableOpacity 
                  style={styles.companySection}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleCompanyPress(contract.Company);
                  }}
                >
                  <Avatar.Text 
                    size={40} 
                    label={getInitials(contract.Company.name)} 
                    style={styles.companyAvatar} 
                  />
                  <View style={styles.companyInfo}>
                    <Text style={styles.companyName}>{contract.Company.name}</Text>
                    <Text style={styles.companyDetails}>
                      {contract.Company.industry} • {contract.Company.location}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contracts</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Icon name="bell" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  card: {
    margin: 8,
    borderRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  amount: {
    marginLeft: 4,
    color: '#666',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dates: {
    marginLeft: 4,
    color: '#666',
    fontSize: 12,
  },
  description: {
    color: '#666',
    marginBottom: 12,
  },
  companySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  companyAvatar: {
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontWeight: '500',
  },
  companyDetails: {
    fontSize: 12,
    color: '#666',
  },
});

export default ContractList; 