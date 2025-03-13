import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  useTheme,
  ActivityIndicator,
  Divider,
  Button,
  Avatar,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Contract, contractService } from '../services/contractService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  ContractDetail: { id: string };
  Contracts: { status?: string };
  CompanyProfile: { company: any };
};

type ContractDetailNavigationProp = StackNavigationProp<RootStackParamList>;

const ContractDetail = () => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const route = useRoute();
  const navigation = useNavigation<ContractDetailNavigationProp>();
  const theme = useTheme();
  const { id } = route.params as { id: string };

  // Initialize token for authentication
  useEffect(() => {
    const initToken = async () => {
      try {
        // Store the token for authentication
        await AsyncStorage.setItem('userToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJjb21wYW55IiwiaWF0IjoxNzQxNDgzMDg2LCJleHAiOjE3NDE1Njk0ODZ9.SkQDEtGUaLEdD78TdupkJSKLIVk0Dxq2U994srrgQdU');
        console.log('Token initialized for authentication');
      } catch (err) {
        console.error('Error initializing token:', err);
      }
    };

    initToken();
  }, []);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      console.log(`Fetching contract details for ID: ${id}`);
      const data = await contractService.getContractById(id);
      console.log('Contract details fetched successfully:', data);
      setContract(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch contract details');
      console.error('Error fetching contract details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractDetails();
  }, [id]);

  const getInitials = (name: string) => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleCompanyPress = () => {
    if (contract?.Company) {
      navigation.navigate('CompanyProfile', { company: contract.Company });
    }
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading contract details...</Text>
      </View>
    );
  }

  if (error || !contract) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text style={styles.errorText}>{error || 'Contract not found'}</Text>
        <Button 
          mode="contained" 
          onPress={fetchContractDetails} 
          style={{ marginTop: 16 }}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Company Card */}
      {contract.Company && (
        <Card style={styles.card}>
          <Card.Content>
            <TouchableOpacity 
              style={styles.companySection}
              onPress={handleCompanyPress}
            >
              <Avatar.Text 
                size={50} 
                label={getInitials(contract.Company.name)} 
                color="white"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>
                  {contract.Company.name}
                  {contract.Company.verified && (
                    <Icon name="check-decagram" size={16} color="#2196F3" style={{ marginLeft: 4 }} />
                  )}
                </Text>
                <Text style={styles.companyDetails}>
                  {contract.Company.industry} • {contract.Company.location}
                </Text>
              </View>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      )}

      {/* Contract Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{contract.title}</Text>
              <View style={styles.badgeContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(contract.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{contract.status}</Text>
                </View>
                <Icon
                  name={getRankIcon(contract.rank)}
                  size={20}
                  color={
                    contract.rank === 'plat'
                      ? '#A0B2C6'
                      : contract.rank === 'gold'
                      ? '#FFD700'
                      : '#C0C0C0'
                  }
                  style={styles.rankIcon}
                />
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>
            Description
          </Text>
          <Text style={styles.description}>
            {contract.description}
          </Text>

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>
            Contract Details
          </Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text>Amount:</Text>
              <Text style={styles.detailValue}>
                {contract.amount ? `$${contract.amount.toLocaleString()}` : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text>Start Date:</Text>
              <Text style={styles.detailValue}>
                {contract.start_date ? new Date(contract.start_date).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text>End Date:</Text>
              <Text style={styles.detailValue}>
                {contract.end_date ? new Date(contract.end_date).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text>Payment Terms:</Text>
              <Text style={styles.detailValue}>
                {contract.payment_terms || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text>Rank:</Text>
              <Text style={styles.detailValue}>
                {contract.rank ? contract.rank.toUpperCase() : 'N/A'}
              </Text>
            </View>
          </View>

          {contract.criteria && contract.criteria.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <Text style={styles.sectionTitle}>
                Criteria
              </Text>
              {contract.criteria.map((criterion, index) => (
                <View key={criterion.id} style={styles.criteriaItem}>
                  <Icon name="check-circle" size={20} color={theme.colors.primary} style={styles.criteriaIcon} />
                  <View style={styles.criteriaContent}>
                    <Text style={styles.criteriaName}>
                      {criterion.name}
                    </Text>
                    <Text style={styles.criteriaDescription}>
                      {criterion.description}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
          icon="arrow-left"
        >
          Back to Contracts
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  companySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyInfo: {
    marginLeft: 12,
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  companyDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  rankIcon: {
    marginLeft: 8,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 18,
  },
  description: {
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 24,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailValue: {
    fontWeight: '500',
  },
  criteriaItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  criteriaIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  criteriaContent: {
    flex: 1,
  },
  criteriaName: {
    fontWeight: '500',
    marginBottom: 4,
    fontSize: 16,
  },
  criteriaDescription: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  button: {
    borderRadius: 8,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 16,
    color: 'red',
    textAlign: 'center',
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default ContractDetail;