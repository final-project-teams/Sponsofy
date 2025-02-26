import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Company } from '../../services/api/companyApi';
import CompanyCard from './CompanyCard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define your navigation parameters
type RootStackParamList = {
  CompanyProfile: { company: Company };
};

const CompanyList: React.FC = () => {
  const { currentTheme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for companies
  const mockCompanies: Company[] = [
    {
      id: 1,
      name: 'Tech Solutions',
      industry: 'Technology',
      location: 'El Khazala, Tunis, Tunisia',
      website: 'https://techsolutions.com',
      description: 'Leading provider of innovative technology solutions for businesses of all sizes.',
      codeFiscal: 'ABC123456789',
      targetContentType: ['Video'],
      budget: {
        min: 1000,
        max: 5000,
        currency: 'USD'
      },
      collaborationPreferences: {
        contentTypes: ['Video'],
        duration: '3 months',
        requirements: 'High quality content'
      },
      verified: true,
      profileViews: 120,
      dealsPosted: 5
    },
    {
      id: 2,
      name: 'Fashion Forward',
      industry: 'Fashion',
      location: 'Carthage, Tunis, Tunisia',
      website: 'https://fashionforward.com',
      description: 'Trendsetting fashion brand looking for creative content creators.',
      codeFiscal: 'DEF987654321',
      targetContentType: ['Photo', 'Video'],
      budget: {
        min: 500,
        max: 3000,
        currency: 'USD'
      },
      collaborationPreferences: {
        contentTypes: ['Photo', 'Video'],
        duration: '1 month',
        requirements: 'Fashion-focused content'
      },
      verified: false,
      profileViews: 85,
      dealsPosted: 3
    },
    {
      id: 3,
      name: 'Foodie Delights',
      industry: 'Food & Beverage',
      location: 'La Marsa, Tunis, Tunisia',
      website: 'https://foodiedelights.com',
      description: 'Artisanal food company seeking food bloggers and content creators.',
      codeFiscal: 'GHI456789123',
      targetContentType: ['Photo', 'Blog'],
      budget: {
        min: 300,
        max: 2000,
        currency: 'USD'
      },
      collaborationPreferences: {
        contentTypes: ['Photo', 'Blog'],
        duration: '2 months',
        requirements: 'Food photography and reviews'
      },
      verified: true,
      profileViews: 210,
      dealsPosted: 8
    }
  ];

  const fetchCompanies = async () => {
    try {
      setError(null);
      console.log('Loading mock companies...');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCompanies(mockCompanies);
      console.log('Mock companies loaded successfully:', mockCompanies.length);
    } catch (err: any) {
      console.error('Error loading mock companies:', err);
      setError('Unable to load companies');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCompanyPress = (company: Company) => {
    navigation.navigate('CompanyProfile', { company });
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: currentTheme.colors.background }]}>
        <ActivityIndicator size="large" color={currentTheme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: currentTheme.colors.background }]}>
        <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: currentTheme.colors.primary }]}
          onPress={fetchCompanies}
        >
          <Text style={[styles.retryText, { color: currentTheme.colors.white }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={companies}
      renderItem={({ item }) => (
        <CompanyCard 
          company={item} 
          onPress={handleCompanyPress}
        />
      )}
      keyExtractor={(item) => item.id?.toString() || ''}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: currentTheme.colors.background }
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchCompanies();
          }}
          colors={[currentTheme.colors.primary]}
        />
      }
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: currentTheme.colors.textSecondary }]}>
            No companies found
          </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
  },
});

export default CompanyList; 