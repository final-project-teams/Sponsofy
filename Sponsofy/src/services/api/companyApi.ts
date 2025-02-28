import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the base URL for your API
const API_BASE_URL = 'http://192.168.11.41:3304/api'; // Updated to match your server address

// Create API instance with better error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Auth functions
const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const setAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('authToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

const clearTokenAndLogin = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
    return await login();
  } catch (error) {
    console.error('Clear token and login error:', error);
    throw error;
  }
};

// Login function
const login = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`);
    const { token } = response.data;
    
    if (!token) {
      throw new Error('No token received from server');
    }

    await AsyncStorage.setItem('authToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return token;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Login failed');
  }
};

// Ensure authentication before making requests
const ensureAuth = async () => {
  let token = await getAuthToken();
  
  if (!token) {
    console.log('No token found, logging in...');
    token = await login();
  }
  
  return token;
};

// Add request interceptor
api.interceptors.request.use(
  async (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor with improved error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  async (error) => {
    console.error('Response error:', error.message);
    
    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out. Please check your server connection.');
    }
    
    return Promise.reject(error);
  }
);

// Define the Company interface based on your backend model
export interface Company {
  id?: number;
  name: string;
  industry: string;
  location: string;
  description?: string;
  verified?: boolean;
  isPremium?: boolean;
  codeFiscal?: string;
  website?: string;
  targetContentType?: string[];
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  collaborationPreferences?: {
    contentTypes: string[];
    duration: string;
    requirements: string;
  };
  profileViews?: number;
  dealsPosted?: number;
  previousContracts?: {
    title: string;
    date: string;
    description: string;
  }[];
  UserId?: number;
}

// API methods for company operations
export const companyApi = {
  // Get all companies
  getCompanies: async (): Promise<Company[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/companies`);
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  // Get a single company by ID
  getCompanyById: async (id: number): Promise<Company> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/companies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching company with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new company
  createCompany: async (companyData: Omit<Company, 'id'>): Promise<Company> => {
    try {
      const response = await api.post('/companies', companyData);
      return response.data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  // Update an existing company
  updateCompany: async (id: number, data: Partial<Company>): Promise<Company> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/companies/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating company with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a company
  deleteCompany: async (id: number): Promise<void> => {
    try {
      await api.delete(`/companies/${id}`);
    } catch (error) {
      console.error(`Error deleting company with ID ${id}:`, error);
      throw error;
    }
  },

  // Add a method to check server connectivity
  checkConnection: async (): Promise<boolean> => {
    try {
      await api.get('/companies/test', { timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Server connection check failed:', error);
      return false;
    }
  },
  
  // Get current user's company profile
  getCurrentCompany: async (): Promise<Company> => {
    try {
      await ensureAuth();
      const response = await api.get('/companies/current');
      return response.data;
    } catch (error) {
      console.error('Get current company error:', error);
      throw new Error('Failed to fetch company profile');
    }
  }
}; 