import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './source';

if (!API_URL) {
  throw new Error("API_URL is not defined");
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log('Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken(); // Await the token retrieval
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.log('Unauthorized request detected');
      
      // Clear token from storage on auth errors
      try {
        await AsyncStorage.removeItem('userToken');
        console.log('Cleared invalid token from storage');
        
        // You could redirect to login screen here if needed
        // For example, using a navigation service or event emitter
      } catch (storageError) {
        console.error('Error clearing token:', storageError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;