import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the base URL for your API
// Make sure this IP address is correct and accessible from your device
const API_BASE_URL = 'http://192.168.110.131:3304/api'; // Updated to match current network configuration

// Create API instance with better error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increase timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Debug function to log token
const logToken = async () => {
  const token = await AsyncStorage.getItem('userToken');
  console.log('Current token:', token ? `${token.substring(0, 15)}...` : 'No token');
  return token;
};

// Auth functions
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log('Retrieved token:', token ? `${token.substring(0, 15)}...` : 'No token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('userToken', token);
    console.log('Token saved successfully');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

const clearTokenAndLogin = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
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
    const { token } = response.data as { token: string };
    
    if (!token) {
      throw new Error('No token received from server');
    }

    await AsyncStorage.setItem('userToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return token;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Login failed');
  }
};

// Add request interceptor with better error handling
api.interceptors.request.use(
  async (config) => {
    try {
      // Get a fresh token for each request
      const token = await AsyncStorage.getItem('userToken');
      
      console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
      
      if (token) {
        console.log('Using token for request:', `${token.substring(0, 15)}...`);
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('No token available for request');
      }
      
      // Log the full request for debugging
      console.log('Request headers:', JSON.stringify(config.headers));
      if (config.data) {
        console.log('Request data:', JSON.stringify(config.data));
      }
      
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling and token refresh
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    
    // Check if we received a new token in the headers
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      console.log('Received new token from server');
      // Save the new token
      AsyncStorage.setItem('userToken', newToken)
        .then(() => {
          console.log('Token refreshed successfully');
          // Update the Authorization header for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        })
        .catch(error => {
          console.error('Error saving refreshed token:', error);
        });
    }
    
    return response;
  },
  (error) => {
    console.log('Response error:', error.message);
    
    if (error.response) {
      console.log('Error status:', error.response.status);
      console.log('Error data:', JSON.stringify(error.response.data));
      
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        console.log('Authentication error - redirecting to login');
        
        // You might want to navigate to login screen here
        // or trigger a global event that the app can listen to
        
        // For now, just log the error
        console.error('Authentication failed. Please log in again.');
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Ensure authentication before making requests
const ensureAuth = async () => {
  const token = await logToken();
  if (!token) {
    throw new Error('Authentication required');
  }
  
  // Make sure the token is set in the API headers
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  return token;
};

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

// Add a flag to control API behavior
const USE_MOCK_DATA = true; // Set to false when your backend is ready

// Add a function to detect if we should use mock data
const shouldUseMockData = async () => {
  // Always use mock data if the flag is set
  if (USE_MOCK_DATA) return true;
  
  // Otherwise, try a quick connection test
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    await axios.get(`${API_BASE_URL}/health`, {
      // @ts-ignore - Signal property may not be in older Axios type definitions
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return false; // Connection successful, use real data
  } catch (error) {
    return true; // Connection failed, use mock data
  }
};

// Add mock companies data based on your seed.js structure
export const MOCK_COMPANIES: Company[] = [
  {
    id: 1,
    name: "Innovative Solutions Ltd",
    industry: "Technology",
    location: "Tunis, Tunisia",
    description: "Leveraging cutting-edge technology to drive business transformation",
    verified: true,
    isPremium: true,
    codeFiscal: "TN12345678",
    website: "https://innovativesolutions.tn",
    targetContentType: ["Video", "Social Media", "Blog"],
    budget: {
      min: 1500,
      max: 8000,
      currency: "TND"
    },
    collaborationPreferences: {
      contentTypes: ["Video", "Social Media", "Blog"],
      duration: "6 months",
      requirements: "High-quality content showcasing our technology solutions"
    },
    profileViews: 325,
    dealsPosted: 7,
    previousContracts: [
      {
        title: "Digital Transformation Campaign",
        date: "2 months ago",
        description: "Series of videos explaining digital transformation"
      },
      {
        title: "Product Launch",
        date: "4 months ago",
        description: "Social media campaign for new software launch"
      }
    ]
  },
  {
    id: 2,
    name: "MedTech Tunisia",
    industry: "Health",
    location: "Sfax, Tunisia",
    description: "Revolutionizing healthcare through innovative medical technologies",
    verified: true,
    isPremium: false,
    codeFiscal: "TN87654321",
    website: "https://medtech.tn",
    targetContentType: ["Video", "Photo"],
    budget: {
      min: 1000,
      max: 5000,
      currency: "TND"
    },
    collaborationPreferences: {
      contentTypes: ["Video", "Photo"],
      duration: "3 months",
      requirements: "Educational content about health technology innovations"
    },
    profileViews: 210,
    dealsPosted: 4,
    previousContracts: [
      {
        title: "Health Awareness Series",
        date: "1 month ago",
        description: "Educational video series on preventive healthcare"
      }
    ]
  },
  {
    id: 3,
    name: "EcoGreen Solutions",
    industry: "Environment",
    location: "Sousse, Tunisia",
    description: "Sustainable environmental solutions for a greener future",
    verified: false,
    isPremium: true,
    codeFiscal: "TN98765432",
    website: "https://ecogreen.tn",
    targetContentType: ["Blog", "Podcast"],
    budget: {
      min: 800,
      max: 3000,
      currency: "TND"
    },
    collaborationPreferences: {
      contentTypes: ["Blog", "Podcast"],
      duration: "1 year",
      requirements: "Content focused on sustainability and environmental awareness"
    },
    profileViews: 175,
    dealsPosted: 3,
    previousContracts: [
      {
        title: "Sustainability Podcast Series",
        date: "3 months ago",
        description: "Weekly podcast discussing environmental issues"
      },
      {
        title: "Green Living Blog Campaign",
        date: "5 months ago",
        description: "Series of blog posts about sustainable living"
      }
    ]
  },
  {
    id: 4,
    name: "FinTech Innovations",
    industry: "Finance",
    location: "Tunis, Tunisia",
    description: "Transforming financial services through technology",
    verified: true,
    isPremium: true,
    codeFiscal: "TN45678901",
    website: "https://fintechinnovations.tn",
    targetContentType: ["Video", "Social Media"],
    budget: {
      min: 2000,
      max: 10000,
      currency: "TND"
    },
    collaborationPreferences: {
      contentTypes: ["Video", "Social Media"],
      duration: "6 months",
      requirements: "Educational content about financial technology"
    },
    profileViews: 290,
    dealsPosted: 6,
    previousContracts: [
      {
        title: "Financial Literacy Campaign",
        date: "2 months ago",
        description: "Video series explaining financial concepts"
      }
    ]
  },
  {
    id: 5,
    name: "EduTech Tunisia",
    industry: "Education",
    location: "Monastir, Tunisia",
    description: "Revolutionizing education through innovative learning technologies",
    verified: false,
    isPremium: false,
    codeFiscal: "TN23456789",
    website: "https://edutech.tn",
    targetContentType: ["Video", "Blog"],
    budget: {
      min: 1200,
      max: 4500,
      currency: "TND"
    },
    collaborationPreferences: {
      contentTypes: ["Video", "Blog"],
      duration: "3 months",
      requirements: "Educational content for students and teachers"
    },
    profileViews: 230,
    dealsPosted: 5,
    previousContracts: [
      {
        title: "E-Learning Platform Launch",
        date: "4 months ago",
        description: "Content promoting new online learning platform"
      },
      {
        title: "Educational Video Series",
        date: "6 months ago",
        description: "Tutorial videos for students"
      }
    ]
  }
];

// API methods for company operations
export const companyApi = {
  // Get all companies
  getAllCompanies: async (): Promise<Company[]> => {
    try {
      console.log('Fetching all companies...');
      const response = await api.get('/companies', { timeout: 10000 });
      return response.data as Company[];
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  // Get a single company by ID
  getCompanyById: async (id: number): Promise<Company> => {
    console.log(`Fetching company with ID ${id}...`);
    
    // Check if we should use mock data
    const useMock = await shouldUseMockData();
    
    if (useMock) {
      console.log('Using mock data for getCompanyById');
      // Return mock data immediately without trying the API
      const mockCompany = MOCK_COMPANIES.find(c => c.id === id);
      
      if (mockCompany) {
        return mockCompany;
      } else {
        // If no company with that ID exists, return the first one but with the requested ID
        return {
          ...MOCK_COMPANIES[0],
          id: id
        };
      }
    }
    
    // Only try the API if we're not using mock data
    try {
      const response = await api.get(`/companies/${id}`);
      return response.data as Company;
    } catch (error) {
      console.error(`Error fetching company with ID ${id}:`, error);
      // Fall back to mock data if API fails
      const mockCompany = MOCK_COMPANIES.find(c => c.id === id);
      return mockCompany || {
        ...MOCK_COMPANIES[0],
        id: id
      };
    }
  },

  // Create a new company
  createCompany: async (data: Partial<Company>): Promise<Company> => {
    try {
      console.log('Creating new company...');
      await ensureAuth();
      const response = await api.post('/companies', data, { timeout: 15000 });
      return response.data as Company;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  // Update an existing company
  updateCompany: async (id: number, data: Partial<Company>): Promise<Company> => {
    console.log(`Updating company with ID ${id}:`, data);
    
    // Check if we should use mock data
    const useMock = await shouldUseMockData();
    
    if (useMock) {
      console.log('Using mock data for updateCompany');
      // Simulate a successful update with mock data
      const mockCompany = MOCK_COMPANIES.find(c => c.id === id) || MOCK_COMPANIES[0];
      const updatedCompany = {
        ...mockCompany,
        ...data,
        id: id
      };
      
      // Update the mock company in the array for consistency
      const index = MOCK_COMPANIES.findIndex(c => c.id === id);
      if (index !== -1) {
        MOCK_COMPANIES[index] = updatedCompany;
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return updatedCompany;
    }
    
    // Only try the API if we're not using mock data
    try {
      const response = await api.put(`/companies/${id}`, data);
      return response.data as Company;
    } catch (error) {
      console.error('Error updating company:', error);
      // Fall back to mock data if API fails
      const mockCompany = MOCK_COMPANIES.find(c => c.id === id) || MOCK_COMPANIES[0];
      return {
        ...mockCompany,
        ...data,
        id: id
      };
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

  // Check server connectivity with a short timeout
  checkConnection: async (): Promise<boolean> => {
    try {
      await api.get('/test', { timeout: 5000 });
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
      return response.data as Company;
    } catch (error) {
      console.error('Get current company error:', error);
      throw new Error('Failed to fetch company profile');
    }
  },

  // Force token refresh - call this after login
  refreshToken: async (token: string): Promise<void> => {
    try {
      await setAuthToken(token);
      console.log('Token refreshed manually');
    } catch (error) {
      console.error('Manual token refresh failed:', error);
      throw error;
    }
  },

  // Add or fix the login function
  login: async (email: string, password: string): Promise<string> => {
    try {
      console.log('Attempting login with:', email);
      
      // Check if we should use mock data
      const useMock = await shouldUseMockData();
      
      if (useMock) {
        console.log('Using mock login');
        // Simulate successful login with mock token
        const mockToken = 'mock_token_' + Math.random().toString(36).substring(2);
        await setAuthToken(mockToken);
        return mockToken;
      }
      
      // Real API login
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data as { token: string };
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      await setAuthToken(token);
      return token;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed: ' + (error.response?.data?.message || error.message));
    }
  }
};

export default api; 