import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from './source';
import { Alert, Platform } from 'react-native';

if(!API_URL){
  throw new Error("API_URL is not defined");
}

// Create axios instance with improved configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increase timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Debug function to log token
const logToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log('Current token:', token ? `${token.substring(0, 15)}...` : 'No token');
    return token;
  } catch (error) {
    console.error('Error logging token:', error);
    return null;
  }
};

// Get auth token with better error handling
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Request interceptor with improved error handling
api.interceptors.request.use(
  async (config) => {
    try {
      // Log request details
      console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
      
      // Get fresh token for each request
      const token = await getAuthToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // For debugging
      if (config.data) {
        console.log('Request payload:', 
          typeof config.data === 'object' ? 
            JSON.stringify(config.data).substring(0, 200) + '...' : 
            'Non-JSON data');
      }
      
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request setup error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with improved error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}: ${response.status}`);
    return response;
  },
  async (error) => {
    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.message);
      
      // For user-facing operations, show an alert
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Connection Timeout',
          'The server is taking too long to respond. Please check your internet connection and try again later.',
          [{ text: 'OK' }]
        );
      }
    } 
    // Handle network errors
    else if (error.message && error.message.includes('Network Error')) {
      console.error('Network error:', error.message);
      
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Network Error',
          'Unable to connect to the server. Please check your internet connection.',
          [{ text: 'OK' }]
        );
      }
    }
    // Handle server errors
    else if (error.response) {
      console.error(`Error ${error.response.status} from ${error.config?.url}:`, 
        error.response.data ? JSON.stringify(error.response.data).substring(0, 200) : 'No response data');
      
      // Handle authentication errors
      if (error.response.status === 401) {
        console.log('Authentication error - token may be invalid or expired');
        
        // You might want to redirect to login here
      }
    } 
    // Handle other errors
    else {
      console.error('API error:', error.message || 'Unknown error');
    }
    
    return Promise.reject(error);
  }
);

// Function to check server connectivity
export const checkServerConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/test`, { 
      timeout: 5000 // Short timeout for connectivity check
    });
    console.log('Server connection successful');
    return true;
  } catch (error) {
    console.error('Server connection failed:', error.message);
    return false;
  }
};

// Function to retry failed requests
export const retryRequest = async (requestFn, maxRetries = 3) => {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}`);
      return await requestFn();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      // Don't retry for client errors (4xx)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

export default api;