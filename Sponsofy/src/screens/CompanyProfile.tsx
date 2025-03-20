import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Linking,
  RefreshControl,
  Animated,
  Share,
  Platform,
  Alert,
  Image,
  ImageURISource
} from 'react-native';
import { Avatar, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../theme/ThemeContext';
import Sidebar from '../components/Sidebar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { companyService } from '../services/api';
import { contractService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { dealService } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  CompanyProfile: { company: any };
  EditProfile: { companyId: string; company: any };
  ShareProfile: { company: any };
  Notifications: undefined;
  ContractDetail: { id: string };
  AddDeal: undefined;
  Home: undefined;
};

type CompanyProfileScreenRouteProp = RouteProp<RootStackParamList, 'CompanyProfile'>;

// Add this after the imports
// Fallback image as base64 string (small gray avatar icon)
const FALLBACK_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFEmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjAtMDEtMzFUMTI6NDI6MDUiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTAxLTMxVDEyOjQzOjA1KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTAxLTMxVDEyOjQzOjA1KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjQ5MGJjZWUyLTU3MGQtNDI0ZC04MjRlLTgyMjc5YTEwY2JkZCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0OTBiY2VlMi01NzBkLTQyNGQtODI0ZS04MjI3OWExMGNiZGQiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0OTBiY2VlMi01NzBkLTQyNGQtODI0ZS04MjI3OWExMGNiZGQiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjQ5MGJjZWUyLTU3MGQtNDI0ZC04MjRlLTgyMjc5YTEwY2JkZCIgc3RFdnQ6d2hlbj0iMjAyMC0wMS0zMVQxMjo0MjowNSIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKE1hY2ludG9zaCkiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+FQzIQAAAAMRJREFUeNrt3MENgCAQRFEasgWtxFqsxVq0EnuxhVlDiCbGKO78l7BwdgPZbEYAAAAAAADwy3ZSDLDlsFq9bPd/0zQT8tUhHWKywu+QmpS7C1tl3j8p3KS82yHcpMylcHf9LIWblLkUuD6hpVRdiE+lOCFtKeVPpSrF/WqslyY3KX0pdsgs0nYpvg+JKW4pDyUmJUqpLcY3dhZSXILFSPHRPELKJemilBrSfDyTYuNXLcXhFQAAAAAAAIA5HHwsJBGBbvRpAAAAAElFTkSuQmCC';

const CompanyProfile = () => {
  const { currentTheme, isDarkMode } = useTheme();
  const route = useRoute<CompanyProfileScreenRouteProp>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  
  // Add default company and safely access route.params
  const defaultCompany = {
    id: '',
    name: '',
    industry: '',
    location: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    verified: false
  };
  
  // Use optional chaining to safely access route.params
  const initialCompany = route.params?.company || defaultCompany;
  const [company, setCompany] = useState(initialCompany);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [contractsError, setContractsError] = useState(null);
  const [dealsCount, setDealsCount] = useState(0);
  const [profileViews, setProfileViews] = useState(0);
  const [companyPhoto, setCompanyPhoto] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isUsingLocalImage, setIsUsingLocalImage] = useState(false);
  const [lastPhotoUpdate, setLastPhotoUpdate] = useState(Date.now());

  // Declare the function reference
  let loadCompanyContracts: () => Promise<void>;

  // Load company data using AuthContext
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setLoading(true);
        console.log('Starting company data load process...');
        
        // First try to load local image - do this before anything else
        await loadProfileImageFromStorage();
        
        // Check if we have a user from AuthContext
        if (!user) {
          console.log('No authenticated user found');
          setLoading(false);
          return;
        }
        
        // Get the user ID (handle both id and Id formats)
        const userId = user.id || user.Id;
        
        console.log('User from AuthContext:', userId);
        
        // Check if user is a company
        if (user.role !== 'company') {
          console.log('User is not a company:', user.role);
          setError('You need a company account to view this profile.');
          setLoading(false);
          return;
        }
        
        // Fetch company by user ID
        try {
            const userCompany = await companyService.getCompanyByUserId(userId);
            
            if (userCompany) {
              console.log('Found user company in backend:', userCompany);
              setCompany(userCompany);
            // Store in AsyncStorage for offline access
              await AsyncStorage.setItem('companyData', JSON.stringify(userCompany));
              setLoading(false);
              return;
            } else {
              console.log('No company found with UserId:', userId);
            setError('No company profile found for your account.');
            }
          } catch (apiError) {
            console.error('Error fetching company by user ID:', apiError);
          setError('Failed to load company profile. Please try again.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading company data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [user, refreshing]);
  
  // Load contracts for the company when it changes
  useEffect(() => {
    if (company && company.id) {
      loadCompanyContracts();
      fetchCompanyDeals();
    }
  }, [company]);

  // Define the function to load contracts for the company
  loadCompanyContracts = async () => {
      if (!company || !company.id) return;
      
      try {
        setContractsLoading(true);
        setContractsError(null);
        console.log('Fetching contracts for company ID:', company.id);
        
      // Get the authentication token (if needed)
      const token = await AsyncStorage.getItem('userToken');
      console.log('Using token for contract fetch:', token ? 'Token exists' : 'No token');
      
      const response = await contractService.getContractsByCompanyId(company.id);
      console.log('Contract response:', response);
      
      // Check if response has the expected format with contracts array
      if (response && response.success && Array.isArray(response.contracts)) {
        console.log(`Loaded ${response.contracts.length} contracts for company`);
        setContracts(response.contracts);
      } else {
        console.error('Invalid contract response format:', response);
        setContracts([]);
      }
      } catch (error) {
        console.error('Error loading company contracts:', error);
      setContractsError(error.message || 'Failed to load contracts');
      setContracts([]);
      } finally {
        setContractsLoading(false);
      }
    };
    
  // Add a function to fetch company deals
  const fetchCompanyDeals = async () => {
    try {
      // Check if we have the dealService
      if (typeof dealService !== 'undefined') {
        const response = await dealService.getCompanyDeals();
        if (response && response.success && Array.isArray(response.deals)) {
          console.log(`Found ${response.deals.length} deals for company`);
          setDealsCount(response.deals.length);
        }
      } else {
        // If dealService is not available, count the deals related to contracts
        console.log('Deal service not available, estimating deals from contracts');
        let dealCount = 0;
        if (Array.isArray(contracts)) {
          // Count deals related to contracts if available
          contracts.forEach(contract => {
            if (contract.deals && Array.isArray(contract.deals)) {
              dealCount += contract.deals.length;
            }
          });
          setDealsCount(dealCount);
        }
      }
      
      // For demonstration, simulate fetching profile views
      // In a real app, this would come from an analytics API
      const randomViews = Math.floor(Math.random() * 100) + 5;
      setProfileViews(randomViews);
      
    } catch (error) {
      console.error('Error fetching company deals:', error);
    }
  };

  // Load profile image from AsyncStorage
  const loadProfileImageFromStorage = async () => {
    try {
      // First check for locally saved image
      const localImageUri = await AsyncStorage.getItem('localProfileImage');
      if (localImageUri) {
        console.log('Found local image in storage:', localImageUri.substring(0, 50) + '...');
        setCompanyPhoto(localImageUri);
        setIsUsingLocalImage(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading profile image from storage:', error);
      return false;
    }
  };

  // Try to load server image, with fallback to local
  const tryLoadServerImage = async (imageUrl: string) => {
    if (!imageUrl || imageUrl.trim() === '') return false;
    
    try {
      console.log('Attempting to load server image:', imageUrl.substring(0, 50) + '...');
      
      // First ensure local image is loaded as backup
      await loadProfileImageFromStorage();
      
      // Add cache busting parameters
      const cacheBustedUrl = `${imageUrl}?t=${Date.now()}&nocache=${Math.random()}`;
      
      // Just set the image URL and let the Image component handle loading/errors
      setCompanyPhoto(cacheBustedUrl);
      setImageLoadError(false);
      
      // Let the Image component's onError handler take care of fallbacks
      console.log('Set image URL, will display with fallback if needed');
      return true;
    } catch (error) {
      console.error('Error setting server image:', error);
      // Fall back to local image
      setImageLoadError(true);
      return false;
    }
  };

  // Use effect to refresh the profile photo when company object changes
  useEffect(() => {
    if (company && company.profilePhoto && company.profilePhoto.trim() !== '') {
      // Try to load server image, with fallback to local
      tryLoadServerImage(company.profilePhoto);
    } else {
      // If no company photo, try to load from local storage
      loadProfileImageFromStorage();
    }
  }, [company, lastPhotoUpdate]);

  // Render profile image with proper fallbacks
  const renderProfileImage = () => {
    if (!companyPhoto && !isUsingLocalImage) {
      // No image available at all - show placeholder
      return (
        <View style={[styles.profilePhoto, { 
          backgroundColor: isDarkMode ? '#333' : '#ddd',
          justifyContent: 'center',
          alignItems: 'center' 
        }]}>
          <Icon name="account" size={50} color={isDarkMode ? '#666' : '#999'} />
        </View>
      );
    }

    // Show image with error handling
    return (
      <Image
        source={{ 
          uri: companyPhoto || FALLBACK_IMAGE_BASE64,
          headers: {
            'Cache-Control': 'no-cache'
          }
        }}
        style={styles.profilePhoto}
        key={`profile-image-${lastPhotoUpdate}`}
        onLoadStart={() => console.log('Image loading started...')}
        onLoad={() => {
          console.log('Image loaded successfully');
          setImageLoadError(false);
        }}
        onLoadEnd={() => console.log('Image loading completed')}
        onError={(error) => {
          console.error('Image loading error:', error.nativeEvent?.error || 'Unknown error');
          setImageLoadError(true);
          loadProfileImageFromStorage();
        }}
      />
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { 
      companyId: company.id,
      company: company
    });
  };

  const handleShareProfile = async () => {
    try {
      const shareOptions = {
        title: `${company.name} Profile`,
        message: `Check out ${company.name}'s profile on Sponsofy!\n\n${company.industry} • ${company.location}\n\n${company.description || 'No description available.'}`,
        url: company.website || 'https://sponsofy.com/profile/' + company.id,
      };
      
      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert('Error', 'Could not share profile. Please try again.');
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    
    try {
      // Use the user ID from AuthContext
      if (user) {
        // Get the user ID (handle both id and Id formats)
        const userId = user.id || user.Id;
      
      if (userId) {
        try {
            // Fetch company by user ID
            const userCompany = await companyService.getCompanyByUserId(userId);
            if (userCompany) {
              console.log('Found user company on refresh:', userCompany);
              setCompany(userCompany);
              await AsyncStorage.setItem('companyData', JSON.stringify(userCompany));
            } else {
              console.log('No company found on refresh');
              setError('No company profile found for your account.');
          }
        } catch (apiError) {
            console.error('Error fetching company by user ID on refresh:', apiError);
            setError('Failed to refresh company profile. Please try again.');
          }
        } else {
          console.log('No user ID found for refresh');
          setError('User ID not found. Please log in again.');
        }
      } else {
        console.log('No user found for refresh');
        setError('Please log in to view your company profile.');
      }
    } catch (error) {
      console.error('Error refreshing company data:', error);
      setError('An error occurred while refreshing. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  // Get status color for contract cards
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'pending':
        return '#FFC107';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };
  
  // Navigate to contract detail
  const handleContractPress = (contractId) => {
    navigation.navigate('ContractDetail', { id: contractId });
  };
  
  // Render contracts section
  const renderContractsSection = () => {
    // Ensure contracts is always an array, even if null or undefined
    const contractsArray = Array.isArray(contracts) ? contracts : [];
    
    if (contractsLoading) {
      return (
        <View style={[styles.centerContainer, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
          <ActivityIndicator size="large" color="#8A2BE2" />
          <Text style={[styles.loadingText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Loading contracts...</Text>
        </View>
      );
    }
    
    if (contractsError) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
          <Icon name="alert-circle-outline" size={24} color="#FF5252" />
          <Text style={[styles.errorText, { color: "#FF5252" }]}>
            Error loading contracts: {contractsError}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: '#8A2BE2' }]}
            onPress={() => {
              if (company && company.id) {
                loadCompanyContracts();
              }
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
      return (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          Previous Contracts ({contractsArray.length})
          </Text>
        
        {contractsArray.length === 0 ? (
          <View style={styles.contractsGrid}>
            <View style={[styles.emptyContractCard, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5' }]}>
              <Text style={[styles.contractTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>No contracts yet</Text>
              <Text style={[styles.contractTime, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>-</Text>
              <Text style={[styles.contractDescription, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
                Create your first contract to see it here.
              </Text>
            </View>
            <View style={[styles.emptyContractCard, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5' }]}>
              <Text style={[styles.contractTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Need help?</Text>
              <Text style={[styles.contractTime, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>-</Text>
              <Text style={[styles.contractDescription, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
                Use the + button to add a new contract.
              </Text>
            </View>
          </View>
        ) : (
        <View style={styles.contractsGrid}>
            {contractsArray.map((contract) => (
            <TouchableOpacity 
                key={contract.id || Math.random().toString()} 
              style={[styles.contractCard, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5' }]}
              onPress={() => handleContractPress(contract.id)}
            >
                <Text style={[styles.contractTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                  {contract.title || 'Untitled Contract'}
                </Text>
              <Text style={[styles.contractTime, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
                  {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : 'No date'} 
              </Text>
              <Text style={[styles.contractDescription, { color: isDarkMode ? '#AAAAAA' : '#666666' }]} numberOfLines={1}>
                  {contract.description || 'No description available'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        )}
      </View>
    );
  };

  const handlePhotoUpload = async () => {
    try {
      // Check and request permissions based on platform
      if (Platform.OS !== 'web') {
        if (Platform.OS === 'android') {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert(
              'Permission Required',
              'Please grant access to your photo library to upload photos.',
              [{ text: 'OK', onPress: () => console.log('Permission denied') }]
            );
            return;
          }
        }
      }

      setLoading(true);
      console.log('Launching image picker...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log('Image picker result:', result);

      if (result.canceled) {
        console.log('User cancelled image picker');
        setLoading(false);
        return;
      }

      const selectedImage = result.assets[0];
      if (!selectedImage.uri) {
        throw new Error('No image selected');
      }

      // Save and display local image immediately
      await AsyncStorage.setItem('localProfileImage', selectedImage.uri);
      setCompanyPhoto(selectedImage.uri);
      setIsUsingLocalImage(true);
      setImageLoadError(false);
      setLastPhotoUpdate(Date.now());

      // Create form data for upload
      const formData = new FormData();
      const fileType = selectedImage.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = fileType === 'jpg' || fileType === 'jpeg' ? 'image/jpeg' : `image/${fileType}`;
      
      const fileToUpload = {
        uri: Platform.OS === 'ios' ? selectedImage.uri.replace('file://', '') : selectedImage.uri,
        type: mimeType,
        name: `photo_${Date.now()}.${fileType}`,
      };

      console.log('Uploading file:', fileToUpload);
      formData.append('image', fileToUpload as any);

      try {
        const response = await companyService.uploadCompanyMedia(company.id, formData);
        
        if (response.success && response.media && response.media.file_url) {
          console.log('Upload successful, new URL:', response.media.file_url);
          
          // Update company object
          const updatedCompany = {
            ...company,
            profilePhoto: response.media.file_url
          };
          
          await AsyncStorage.setItem('companyData', JSON.stringify(updatedCompany));
          setCompany(updatedCompany);
          
          // We will continue using the local image until we can verify the server image loads
          tryLoadServerImage(response.media.file_url);
          
          Alert.alert('Success', 'Profile photo updated successfully');
        } else {
          throw new Error('Upload response invalid');
        }
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert(
          'Warning',
          'Using local image as fallback. Server upload failed.'
        );
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to upload photo'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
        <ActivityIndicator size="large" color="#8A2BE2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
        <Icon name="alert-circle-outline" size={48} color="#FF5252" />
        <Text style={[styles.errorText, { color: currentTheme.colors.error || '#FF5252' }]}>{error}</Text>
        <View style={styles.errorButtonsContainer}>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: '#8A2BE2' }]}
          onPress={() => onRefresh()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.homeButton, { backgroundColor: '#333333' }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeButtonText}>Go to Home</Text>
        </TouchableOpacity>
        </View>
        
        {user && user.role !== 'company' && (
          <Text style={styles.helpText}>
            Note: You are currently logged in as a {user.role}. 
            You need a company account to view and manage a company profile.
          </Text>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => setSidebarVisible(true)}
        >
          <Icon name="menu" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Sponsofy</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="bell-outline" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="cog-outline" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sidebar */}
      {sidebarVisible && (
        <Sidebar
          isVisible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          navigation={navigation}
          currentScreen="CompanyProfile"
          companyData={company}
        />
      )}

      {loading ? (
        <View style={[styles.centerContainer, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
          <ActivityIndicator size="large" color="#8A2BE2" />
          <Text style={[styles.loadingText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Loading profile...</Text>
        </View>
      ) : error ? (
        <View style={[styles.centerContainer, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
          <Icon name="alert-circle-outline" size={48} color="#FF5252" />
          <Text style={[styles.errorText, { color: currentTheme.colors.error || '#FF5252' }]}>{error}</Text>
          <View style={styles.errorButtonsContainer}>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: '#8A2BE2' }]}
            onPress={() => onRefresh()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.homeButton, { backgroundColor: '#333333' }]}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>
          </View>
          
          {user && user.role !== 'company' && (
            <Text style={styles.helpText}>
              Note: You are currently logged in as a {user.role}. 
              You need a company account to view and manage a company profile.
            </Text>
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={{ backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#8A2BE2']}
              tintColor="#8A2BE2"
            />
          }
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={handlePhotoUpload}>
              {renderProfileImage()}
              <View style={styles.editPhotoButton}>
                <Icon name="camera" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            {company.verified && (
              <View style={styles.verifiedBadge}>
                <View style={styles.verifiedDot} />
              </View>
            )}
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={[styles.username, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Username</Text>
            <Text style={[styles.companyName, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>{company.name}</Text>
            <Text style={[styles.location, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>{company.location}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
              activeOpacity={0.8}
            >
              <Icon name="pencil" size={18} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Edit profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.shareButton, { borderColor: isDarkMode ? '#333333' : '#DDDDDD' }]}
              onPress={handleShareProfile}
              activeOpacity={0.8}
            >
              <Icon name="share-variant" size={18} color={isDarkMode ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.shareButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Share profile</Text>
            </TouchableOpacity>
          </View>

          

         

          {/* Analytics Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Analytics</Text>
            
            <View style={[styles.analyticsItem, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5' }]}>
              <Icon name="eye-outline" size={20} color={isDarkMode ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.analyticsText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                {profileViews} Profile Views
              </Text>
            </View>

            <View style={[styles.analyticsItem, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5' }]}>
              <Icon name="file-document-outline" size={20} color={isDarkMode ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.analyticsText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                {dealsCount} Deals posted
              </Text>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>About</Text>
            <Text style={[styles.aboutText, { color: isDarkMode ? '#AAAAAA' : '#666666' }]}>
              {company.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.'}
            </Text>
          </View>

          {/* Previous Contracts Section */}
          {renderContractsSection()}

          {/* Add Contract Button */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: '#8A2BE2' }]}
            onPress={() => navigation.navigate('AddDeal')}
          >
            <Icon name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Bottom Navigation */}
          <View style={[styles.bottomNav, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5' }]}>
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => navigation.navigate('Home')}
            >
              <Icon name="home-outline" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Icon name="magnify" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Icon name="plus-box-outline" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Icon name="bell-outline" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => navigation.navigate('CompanyProfile', { company })}
            >
              <Icon name="account-outline" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(138, 43, 226, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    color: '#FF5252',
    maxWidth: '80%',
  },
  errorButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    width: '100%',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#8A2BE2',
    marginHorizontal: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  homeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
    marginHorizontal: 8,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  helpText: {
    marginTop: 24,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '90%',
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 16,
    position: 'relative',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8A2BE2',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: width / 2 - 40,
    backgroundColor: 'transparent',
  },
  verifiedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00C853',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  companyName: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#8A2BE2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    marginLeft: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  analyticsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  analyticsText: {
    color: '#FFFFFF',
    marginLeft: 12,
  },
  aboutText: {
    color: '#AAAAAA',
    lineHeight: 20,
  },
  contractsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contractCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  emptyContractCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  contractTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contractTime: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 8,
  },
  contractDescription: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  contractsLoadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  galleryContainer: {
    marginTop: 8,
    height: 350,
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 100,
  },
  infoValue: {
    flex: 1,
  },
  statsContainer: {
    marginTop: 24,
    padding: 16,
  },
});

export default CompanyProfile;