import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Make sure this IP and port match your backend server
const API_URL = 'http://192.168.11.214:3304/api';

// Create API instance with adjusted timeout and better error handling
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Reduced timeout to 15 seconds
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
    const response = await axios.post(`${API_URL}/login`);
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
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const newToken = await clearTokenAndLogin();
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios(error.config);
      } catch (refreshError) {
        throw new Error('Authentication failed. Please try again.');
      }
    }
    return Promise.reject(error);
  }
);

// Updated Company interface to match business requirements
export interface Company {
  id?: number;
  name: string;
  industry: string;
  location: string;
  website: string;
  description?: string;
  codeFiscal: string;
  targetContentType: string[];
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  collaborationPreferences: {
    contentTypes: string[];
    duration: string;
    requirements: string;
  };
  verified?: boolean;
  profileViews?: number;
  dealsPosted?: number;
  previousContracts?: Array<{
    title: string;
    date: string;
    description: string;
  }>;
}

export const companyApi = {
  create: async (data: Omit<Company, 'id'>): Promise<Company> => {
    try {
      await ensureAuth();
      const response = await api.post('/companies', data);
      return response.data;
    } catch (error) {
      console.error('Create company error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create company: ${error.message}`);
      }
      throw new Error('Failed to create company');
    }
  },

  getAll: async (searchParams?: {
    industry?: string;
    contentType?: string;
    budgetRange?: string;
  }): Promise<Company[]> => {
    try {
      await ensureAuth();
      const response = await api.get('/companies', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Get companies error:', error);
      throw new Error('Failed to fetch companies');
    }
  },

  update: async (id: number, data: Partial<Company>): Promise<Company> => {
    try {
      await ensureAuth();
      const response = await api.put(`/companies/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update company error:', error);
      throw new Error('Failed to update company');
    }
  },

  getById: async (id: number): Promise<Company> => {
    try {
      await ensureAuth();
      const response = await api.get(`/companies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get company ${id} error:`, error);
      throw new Error('Failed to fetch company profile');
    }
  }
}; 