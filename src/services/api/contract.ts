import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.110.131:3304/api';

export interface Contract {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'terminated';
  payment_terms: string;
  rank: 'plat' | 'gold' | 'silver';
  company_id?: number;
  content_creator_id?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Mock data for contracts
const mockContracts: Contract[] = [
  {
    id: 1,
    title: 'Social Media Campaign',
    description: 'Instagram and TikTok content creation for summer collection',
    start_date: '2024-03-01',
    end_date: '2024-06-01',
    status: 'active',
    payment_terms: 'Monthly payments',
    rank: 'plat',
    company_id: 1,
    content_creator_id: 1,
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15'
  },
  {
    id: 2,
    title: 'Product Review Series',
    description: 'Detailed product reviews for tech gadgets',
    start_date: '2024-01-01',
    end_date: '2024-02-28',
    status: 'completed',
    payment_terms: 'Per video',
    rank: 'gold',
    company_id: 1,
    content_creator_id: 1,
    createdAt: '2023-12-15',
    updatedAt: '2024-02-28'
  },
  {
    id: 3,
    title: 'Holiday Special Campaign',
    description: 'End of year promotional content',
    start_date: '2024-12-01',
    end_date: '2024-12-31',
    status: 'terminated',
    payment_terms: 'One-time payment',
    rank: 'silver',
    company_id: 1,
    content_creator_id: 1,
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15'
  }
];

// Create API instance with reduced timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Reduced timeout to 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class ContractAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = api;
  }

  // Get all contracts
  getAllContracts = async (): Promise<Contract[]> => {
    try {
      console.log('Fetching all contracts...');
      const response = await this.api.get('/contract');
      return response.data;
    } catch (error) {
      console.error('Error fetching contracts:', error);
      console.log('Using mock data for getAllContracts');
      return mockContracts;
    }
  };

  // Get contracts by company ID
  getContractsByCompanyId = async (companyId: number): Promise<Contract[]> => {
    try {
      console.log(`Fetching contracts for company ${companyId}...`);
      const response = await this.api.get(`/contract?company_id=${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company contracts:', error);
      console.log('Using mock data for getContractsByCompanyId');
      return mockContracts.filter(contract => contract.company_id === companyId);
    }
  };

  // Get a contract by ID
  getContractById = async (id: number): Promise<Contract> => {
    try {
      console.log(`Fetching contract ${id}...`);
      const response = await this.api.get(`/contract/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contract:', error);
      console.log('Using mock data for getContractById');
      const mockContract = mockContracts.find(c => c.id === id);
      if (!mockContract) {
        throw new Error('Contract not found');
      }
      return mockContract;
    }
  };

  // Create a new contract
  createContract = async (data: Omit<Contract, 'id'>): Promise<Contract> => {
    try {
      const response = await this.api.post('/contract', data);
      return response.data;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  };

  // Update a contract
  updateContract = async (id: number, data: Partial<Contract>): Promise<Contract> => {
    try {
      const response = await this.api.put(`/contract/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  };

  // Delete a contract
  deleteContract = async (id: number): Promise<void> => {
    try {
      await this.api.delete(`/contract/${id}`);
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  };
}

export const contractApi = new ContractAPI(); 