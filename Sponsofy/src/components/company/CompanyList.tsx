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
import { Company, companyApi } from '../../services/api/companyApi';
import CompanyCard from './CompanyCard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

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

  const fetchCompanies = async () => {
    try {
      setError(null);
      const data = await companyApi.getAll();
      setCompanies(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to load companies');
      console.error('Error fetching companies:', err);
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