import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import { contractService, dealService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for routes and navigation
type RootStackParamList = {
  CreateDeal: { contractId: string };
  ContractDeals: { contractId: string };
};

type CreateDealScreenRouteProp = RouteProp<RootStackParamList, 'CreateDeal'>;
type CreateDealNavigationProp = StackNavigationProp<RootStackParamList>;

const CreateDeal = () => {
  const route = useRoute<CreateDealScreenRouteProp>();
  const navigation = useNavigation<CreateDealNavigationProp>();
  const { currentTheme, isDarkMode } = useTheme();
  
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [price, setPrice] = useState('');
  const [dealTerms, setDealTerms] = useState('');
  
  const { contractId } = route.params;
  
  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check for token first
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setError('Authentication required. Please log in to create a deal.');
        setLoading(false);
        return;
      }
      
      console.log(`Fetching contract details for ID: ${contractId}`);
      
      // Fetch contract details
      const contractData = await contractService.getContractById(contractId);
      console.log('Contract details:', contractData);
      
      if (contractData) {
        setContract(contractData);
      } else {
        setError('Failed to fetch contract details');
      }
    } catch (error) {
      console.error('Error fetching contract details:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError('Authentication failed. Please log in again.');
          // Clear the invalid token
          await AsyncStorage.removeItem('userToken');
        } else if (error.response.status === 403) {
          setError('You do not have permission to view this contract.');
        } else if (error.response.status === 404) {
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
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchContractDetails();
  }, [contractId]);
  
  const handleCreateDeal = async () => {
    // Validate inputs
    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price for the deal.');
      return;
    }
    
    if (!dealTerms.trim()) {
      Alert.alert('Validation Error', 'Please enter terms for the deal.');
      return;
    }
    
    try {
      setCreating(true);
      setError(null);
      
      // Check for token first
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in to create a deal.');
        setCreating(false);
        return;
      }
      
      // Verify user role
      const userData = await AsyncStorage.getItem('userData');
      let userRole = '';
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          userRole = parsedUser.role;
          
          // Check if user has permission to create deals
          if (userRole !== 'contentCreator' && userRole !== 'admin') {
            Alert.alert('Permission Error', 'You must be a content creator to request deals.');
            setCreating(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      const dealData = {
        price: parseFloat(price),
        deal_terms: dealTerms.trim(),
      };
      
      console.log(`Creating deal for contract ID: ${contractId} with data:`, dealData);
      
      const response = await dealService.createDealRequest(contractId, dealData);
      
      console.log('Deal creation response:', response);
      
      if (response.success) {
        Alert.alert(
          'Success',
          'Deal request created successfully!',
          [
            { 
              text: 'View Deals',
              onPress: () => navigation.navigate('ContractDeals', { contractId }) 
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to create deal. Please try again.');
      }
    } catch (error) {
      console.error('Error creating deal:', error);
      
      let errorMessage = 'An error occurred while creating the deal. Please try again.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
          // Clear the invalid token
          await AsyncStorage.removeItem('userToken');
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to create deals for this contract. Only content creators can request deals.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setCreating(false);
    }
  };
  
  const handleBackPress = () => {
    navigation.navigate('ContractDeals', { contractId });
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F5F5F5' }]}>
        <View style={styles.header}>
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
            Create Deal
          </Text>
          
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          <Text style={[styles.loadingText, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
            Loading contract details...
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
            onPress={handleBackPress}
          >
            <Icon
              name="arrow-left"
              size={24}
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Create Deal
          </Text>
          
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchContractDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F5F5F5' }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
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
            Create Deal
          </Text>
          
          <View style={styles.headerRight} />
        </View>
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Contract Info Card */}
          {contract && (
            <View style={[styles.card, { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }]}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                Contract Details
              </Text>
              
              <Text style={[styles.contractTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                {contract.title || 'Untitled Contract'}
              </Text>
              
              {contract.description && (
                <Text style={[styles.contractDescription, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>
                  {contract.description}
                </Text>
              )}
              
              {contract.Company && (
                <Text style={[styles.companyName, { color: isDarkMode ? '#AAAAAA' : '#888888' }]}>
                  {contract.Company.name}
                </Text>
              )}
            </View>
          )}
          
          {/* Deal Form */}
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }]}>
            <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              Deal Information
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                Price ($)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDarkMode ? '#2A2A2A' : '#F5F5F5',
                    color: isDarkMode ? '#FFFFFF' : '#000000',
                    borderColor: isDarkMode ? '#444444' : '#DDDDDD'
                  }
                ]}
                value={price}
                onChangeText={setPrice}
                placeholder="Enter price"
                placeholderTextColor={isDarkMode ? '#AAAAAA' : '#999999'}
                keyboardType="decimal-pad"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                Deal Terms
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { 
                    backgroundColor: isDarkMode ? '#2A2A2A' : '#F5F5F5',
                    color: isDarkMode ? '#FFFFFF' : '#000000',
                    borderColor: isDarkMode ? '#444444' : '#DDDDDD'
                  }
                ]}
                value={dealTerms}
                onChangeText={setDealTerms}
                placeholder="Enter deal terms and conditions"
                placeholderTextColor={isDarkMode ? '#AAAAAA' : '#999999'}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: currentTheme.colors.primary },
              creating && { opacity: 0.7 }
            ]}
            onPress={handleCreateDeal}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="send" size={18} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Deal Request</Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.disclaimer, { color: isDarkMode ? '#AAAAAA' : '#888888' }]}>
            By submitting this deal request, you agree to the terms and conditions of the contract.
            The company will review your request and may accept, reject, or request modifications.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contractTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contractDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  companyName: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 32,
  },
});

export default CreateDeal; 