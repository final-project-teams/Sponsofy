import api from '../config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const companyService = {

  getCompanyById: async (companyId) => {
    try {
      console.log(`Fetching company with ID ${companyId}`);
      
      // The baseURL already includes '/api', so we don't need to include it in the path
      const response = await api.get(`/companies/${companyId}`);
    
      // Check if the response has data in the expected format
      if (response.data && response.data.id) {
        console.log('Found company in direct format');
        return response.data;
      } else if (response.data && response.data.company && response.data.company.id) {
        console.log('Found company in nested format');
        return response.data.company;
      } else if (response.data) {
        console.log('Response data structure:', Object.keys(response.data));
        // Try to extract company from whatever structure we have
        return response.data;
      }
      
      console.error('Invalid company response format:', response.data);
      throw new Error(`Company with ID ${companyId} not found or invalid format`);
    } catch (error) {
      console.error(`Error fetching company with ID ${companyId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  createCompany: async (companyData) => {
    try {
      console.log('Creating new company:', companyData);
      
      // The baseURL already includes '/api', so we don't need to include it in the path
      const response = await api.post('/companies', companyData);
      
      if (!response.data) {
        throw new Error('Failed to create company');
      }
      
      console.log('Create company response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating company:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  updateCompany: async (id, companyData) => {
    try {
      console.log(`Updating company with ID ${id}:`, companyData);
      
      // Make sure we have a valid ID
      if (!id) {
        console.error('Cannot update company: No ID provided');
        throw new Error('Company ID is required for updates');
      }
      
      // The baseURL already includes '/api', so we don't need to include it in the path
      const response = await api.put(`/companies/${id}`, companyData);
      
      if (!response.data) {
        throw new Error(`Failed to update company with ID ${id}`);
      }
      
      console.log('Update company response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating company with ID ${id}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  getCompanyByUserId: async (userId) => {
    try {
      console.log(`Fetching company for user ID ${userId}`);
      
      // The baseURL already includes '/api', so we don't need to include it in the path
      // The correct endpoint is /companies/user/:userId
      const response = await api.get(`/companies/user/${userId}`);
      
      console.log(`Company for user ${userId} response status:`, response.status);
      
      // Check if the response has data in the expected format
      if (response.data && response.data.id) {
        console.log('Found company in direct format:', response.data.name);
        return response.data;
      } else if (response.data && response.data.company && response.data.company.id) {
        console.log('Found company in nested format:', response.data.company.name);
        return response.data.company;
      } else if (response.data) {
        console.log('Response data structure:', Object.keys(response.data));
        // Try to extract company from whatever structure we have
        return response.data;
      }
      
      console.error('Invalid company response format:', response.data);
      throw new Error(`No company found for user ID ${userId} or invalid format`);
    } catch (error) {
      console.error(`Error fetching company for user ID ${userId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Add a method to get all companies
  getAllCompanies: async () => {
    try {
      console.log('Fetching all companies');
      
      // The baseURL already includes '/api', so we don't need to include it in the path
      const response = await api.get('/companies');
      
      if (Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} companies`);
        return response.data;
      } else if (response.data && Array.isArray(response.data.companies)) {
        console.log(`Found ${response.data.companies.length} companies in nested format`);
        return response.data.companies;
      }
      
      console.error('Invalid companies response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching all companies:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }
};

export const contractService = {
  getContractsByCompanyId: async (companyId) => {
    try {
      console.log(`Fetching contracts for company ID ${companyId}`);
      
      // Make the API request
      const response = await api.get(`/contract/company/${companyId}`);
      
      console.log(`Contracts for company ${companyId} response status:`, response.status);
      
      if (response.data && response.data.success && response.data.contracts) {
        console.log(`Found ${response.data.contracts.length} contracts for company ${companyId}`);
        return response.data;
      }
      
      console.error('Invalid contracts response format:', response.data);
      return { success: false, contracts: [] };
    } catch (error) {
      console.error(`Error fetching contracts for company ID ${companyId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get contracts with a specific status
  getContractsByStatus: async (companyId, status) => {
    try {
      console.log(`Fetching contracts with status '${status}' for company ID ${companyId}`);
      
      // First get all contracts
      const response = await api.get(`/contract/company/${companyId}`);
      
      if (response.data && response.data.success && response.data.contracts) {
        // Get all contracts before filtering
        const allContracts = response.data.contracts;
        console.log(`Retrieved ${allContracts.length} total contracts before filtering`);
        
        // Log all the statuses present in the contracts for debugging
        const statusesInContracts = [...new Set(allContracts.map(c => c.status?.toLowerCase()))];
        console.log('Status values present in contracts:', statusesInContracts);
        
        // Normalize target status (lowercase and trim)
        const targetStatus = status?.toLowerCase()?.trim();
        console.log('Normalized target status for filtering:', targetStatus);
        
        // Filter contracts by status
        const filteredContracts = allContracts.filter(
          contract => {
            // Normalize contract status (lowercase and trim)
            const contractStatus = contract.status?.toLowerCase()?.trim();
            
            // Special case for terminated/cancelled (handle both)
            if (targetStatus === 'terminated' && contractStatus === 'cancelled') {
              return true;
            }
            
            if (targetStatus === 'cancelled' && contractStatus === 'terminated') {
              return true;
            }
            
            console.log(`Contract ID ${contract.id}: '${contractStatus}' vs target '${targetStatus}'`);
            
            return contractStatus === targetStatus;
          }
        );
        
        console.log(`Found ${filteredContracts.length} contracts with status '${status}' out of ${allContracts.length} total`);
        if (filteredContracts.length > 0) {
          console.log('Sample filtered contract IDs:', filteredContracts.slice(0, 3).map(c => c.id));
        }
        
        return {
          success: true,
          contracts: filteredContracts
        };
      }
      
      console.error('Invalid contracts response format:', response.data);
      return { success: false, contracts: [] };
    } catch (error) {
      console.error(`Error fetching contracts with status '${status}' for company ID ${companyId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  createContract: async (contractData) => {
    try {
      console.log('Creating new contract:', contractData);
      
      // The baseURL already includes '/api', so we don't need to include it in the path
      const response = await api.post('/contract', contractData);
      
      if (!response.data) {
        throw new Error('Failed to create contract');
      }
      
      console.log('Create contract response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating contract:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }
};