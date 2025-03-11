import api from '../config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const companyService = {
  getAllCompanies: async () => {
    try {
      // Log the request for debugging
      console.log('Fetching companies from API...');
      
      // Get the authentication token for authorization
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('No authentication token found for getAllCompanies');
      }
      
      // The baseURL already includes '/api', so we don't need to include it in the path
      const response = await api.get('/companies', {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : undefined
      });
      
      console.log('Companies response status:', response.status);
      console.log('Companies raw response:', response);
      
      // Check if the response has data in the expected format
      if (response.data && Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} companies in array format`);
        return response.data;
      } else if (response.data && response.data.companies && Array.isArray(response.data.companies)) {
        console.log(`Found ${response.data.companies.length} companies in nested format`);
        return response.data.companies;
      } else if (response.data) {
        console.log('Response data structure:', Object.keys(response.data));
        // Try to extract companies from whatever structure we have
        return response.data;
      }
      
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error fetching companies:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  getCompanyById: async (id) => {
    try {
      console.log(`Fetching company with ID ${id}`);
      
      // Get the authentication token for authorization
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('No authentication token found for getCompanyById');
      }
      
      // The baseURL already includes '/api', so we don't need to include it in the path
      const response = await api.get(`/companies/${id}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : undefined
      });
      
      console.log(`Company ${id} response status:`, response.status);
      console.log(`Company ${id} raw response:`, response);
      
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
      throw new Error(`Company with ID ${id} not found or invalid format`);
    } catch (error) {
      console.error(`Error fetching company with ID ${id}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  createCompany: async (companyData) => {
    try {
      console.log('Creating new company:', companyData);
      
      // Get the authentication token for authorization
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // The baseURL already includes '/api', so we don't need to include it in the path
      const response = await api.post('/companies', companyData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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
      
      // Get the authentication token for authorization
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // The baseURL already includes '/api', so we don't need to include it in the path
      const response = await api.put(`/companies/${id}`, companyData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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
      
      // Get the authentication token for authorization
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('No authentication token found for getCompanyByUserId');
        throw new Error('Authentication token not found');
      }
      
      // The baseURL already includes '/api', so we don't need to include it in the path
      // The correct endpoint is /companies/user/:userId
      const response = await api.get(`/companies/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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
  }
};

export const contractService = {
  getContractsByCompanyId: async (companyId) => {
    try {
      console.log(`Fetching contracts for company ID ${companyId}`);
      
      // Get the authentication token for authorization
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('No authentication token found for getContractsByCompanyId');
        throw new Error('Authentication token not found');
      }
      
      // Make the API request with the token
      const response = await api.get(`/contract/company/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`Contracts for company ${companyId} response status:`, response.status);
      
      if (response.data && response.data.success && response.data.contracts) {
        console.log(`Found ${response.data.contracts.length} contracts for company ${companyId}`);
        return response.data.contracts;
      }
      
      console.error('Invalid contracts response format:', response.data);
      return [];
    } catch (error) {
      console.error(`Error fetching contracts for company ID ${companyId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }
};