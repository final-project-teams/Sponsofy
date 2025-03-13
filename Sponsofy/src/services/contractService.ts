import api from '../config/axios';

export interface Contract {
  id: string;
  title: string;
  description: string;
  start_date: Date;
  end_date: Date;
  status: 'active' | 'completed' | 'terminated';
  payment_terms: string;
  amount: number;
  rank: 'plat' | 'gold' | 'silver';
  CompanyId: string;
  criteria?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  Company?: {
    id: string;
    name: string;
    industry: string;
    location: string;
    description?: string;
    verified?: boolean;
    email?: string;
    phone?: string;
    website?: string;
  };
}

export const contractService = {
  getContracts: async (): Promise<Contract[]> => {
    try {
      console.log('Fetching real contracts from API...');
      const response = await api.get('/contract/current');
      
      if (response.data && response.data.success) {
        const contracts = response.data.contracts || [];
        console.log(`Successfully fetched ${contracts.length} real contracts`);
        return contracts;
      } else {
        throw new Error(response.data?.message || 'Failed to fetch contracts');
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  getContractById: async (id: string): Promise<Contract> => {
    try {
      // Since there's no specific endpoint for getting a contract by ID in the backend,
      // we'll fetch all contracts and find the one we need
      const response = await api.get('/contract/current');
      
      if (response.data && response.data.success) {
        const contract = response.data.contracts.find((c: Contract) => c.id === id);
        if (contract) return contract;
        throw new Error(`Contract with ID ${id} not found`);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch contract');
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  createContract: async (contractData: Partial<Contract>): Promise<Contract> => {
    try {
      const response = await api.post('/contract', contractData);
      
      if (response.data && response.data.success) {
        return response.data.contract;
      } else {
        throw new Error(response.data?.message || 'Failed to create contract');
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  updateContract: async (id: string, contractData: Partial<Contract>): Promise<Contract> => {
    try {
      // Since there's no specific endpoint for updating a contract in the backend,
      // we'll throw an error for now
      throw new Error('Update contract functionality not implemented in the backend');
    } catch (error) {
      console.error('Error updating contract:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }
}; 