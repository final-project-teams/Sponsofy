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

  getContractById: async (contractId) => {
    try {
      console.log(`Fetching contract with ID ${contractId}`);
      
      // Try to fetch the contract directly using the contract ID
      const response = await api.get(`/contract/${contractId}`);
      
      if (response.data && response.data.contract) {
        console.log(`Successfully fetched contract with ID ${contractId} directly`);
        return response.data.contract;
      }
      
      // If direct fetch fails or not available, fall back to fetching from the contracts list
      console.log(`Direct contract fetch not available, trying to find contract in the contract list`);
      const allContractsResponse = await api.get(`/contract/current`);
      
      if (allContractsResponse.data && allContractsResponse.data.success && Array.isArray(allContractsResponse.data.contracts)) {
        console.log(`Searching for contract with ID ${contractId} in ${allContractsResponse.data.contracts.length} contracts`);
        
        const contract = allContractsResponse.data.contracts.find(c => c.id.toString() === contractId.toString());
        
        if (contract) {
          console.log(`Found contract with ID ${contractId} in contracts list`);
          return contract;
        } else {
          console.error(`Contract with ID ${contractId} not found in contracts list`);
          throw new Error(`Contract with ID ${contractId} not found`);
        }
      }
      
      console.error('Invalid contracts response format:', allContractsResponse.data);
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error(`Error fetching contract with ID ${contractId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get deals associated with a contract
  getDealsByContractId: async (contractId) => {
    try {
      console.log(`Fetching deals for contract ID ${contractId}`);
      
      // The endpoint should be /contract/:contractId/deals - remove any duplicate /api prefix
      // as the baseURL in axios.ts already includes it
      const response = await api.get(`/contract/${contractId}/deals`);
      
      console.log(`Deals for contract ${contractId} response status:`, response.status);
      
      if (response.data && response.data.success) {
        // Check for deals array and contract summary
        const deals = Array.isArray(response.data.deals) ? response.data.deals : [];
        const contractSummary = response.data.contractSummary || null;
        
        console.log(`Found ${deals.length} deals for contract ${contractId}`);
        
        if (contractSummary) {
          console.log('Contract summary included in response:', contractSummary.title);
        }
        
        return {
          success: true,
          deals,
          contractSummary
        };
      }
      
      console.error('Invalid deals response format:', response.data);
      return { success: false, deals: [], contractSummary: null };
    } catch (error) {
      console.error(`Error fetching deals for contract ID ${contractId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Throw the error to let the component handle it
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
  },

  // Add this method to get a contract with its deals in a single request
  getContractWithDeals: async (contractId) => {
    try {
      console.log(`Fetching contract with deals for ID ${contractId}`);
      
      const response = await api.get(`/contract/${contractId}/with-deals`);
      
      console.log(`Contract with deals for ID ${contractId} response status:`, response.status);
      
      if (response.data && response.data.success) {
        const contract = response.data.contract || null;
        const deals = Array.isArray(response.data.deals) ? response.data.deals : [];
        
        console.log(`Found contract with ${deals.length} deals for ID ${contractId}`);
        
        return {
          success: true,
          contract,
          deals
        };
      }
      
      console.error('Invalid contract with deals response format:', response.data);
      return { success: false, contract: null, deals: [] };
    } catch (error) {
      console.error(`Error fetching contract with deals for ID ${contractId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Add a deal service to work with the deal API
export const dealService = {
  // Get all deals for the current content creator
  getContentCreatorDeals: async () => {
    try {
      console.log('Fetching deals for current content creator');
      
      const response = await api.get('/addDeal/creator/deals');
      
      if (response.data && response.data.success && response.data.deals) {
        console.log(`Found ${response.data.deals.length} deals for content creator`);
        return {
          success: true,
          deals: response.data.deals
        };
      }
      
      console.error('Invalid deals response format:', response.data);
      return { success: false, deals: [] };
    } catch (error) {
      console.error('Error fetching content creator deals:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get all deals for the current company
  getCompanyDeals: async () => {
    try {
      console.log('Fetching deals for current company');
      
      const response = await api.get('/addDeal/company/deals');
      
      if (response.data && response.data.success && response.data.deals) {
        console.log(`Found ${response.data.deals.length} deals for company`);
        return {
          success: true,
          deals: response.data.deals
        };
      }
      
      console.error('Invalid deals response format:', response.data);
      return { success: false, deals: [] };
    } catch (error) {
      console.error('Error fetching company deals:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get deal by ID
  getDealById: async (dealId) => {
    try {
      console.log(`Fetching deal with ID ${dealId}`);
      
      const response = await api.get(`/addDeal/details/${dealId}`);
      
      if (response.data && response.data.success && response.data.deal) {
        console.log(`Found deal with ID ${dealId}`);
        return {
          success: true,
          deal: response.data.deal
        };
      }
      
      console.error('Invalid deal response format:', response.data);
      return { success: false, deal: null };
    } catch (error) {
      console.error(`Error fetching deal with ID ${dealId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Create a deal request (for content creator)
  createDealRequest: async (contractId, dealData) => {
    try {
      console.log(`Creating deal request for contract ID ${contractId}`);
      
      const response = await api.post('/addDeal/request', {
        contractId,
        ...dealData
      });
      
      if (response.data && response.data.success) {
        console.log('Deal request created successfully');
        return {
          success: true,
          deal: response.data.deal
        };
      }
      
      console.error('Invalid deal creation response:', response.data);
      return { success: false, message: response.data.message || 'Failed to create deal request' };
    } catch (error) {
      console.error(`Error creating deal request for contract ID ${contractId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Accept a deal (for company)
  acceptDeal: async (dealId) => {
    try {
      console.log(`Accepting deal with ID ${dealId}`);
      
      const response = await api.post('/addDeal/accept', { dealId });
      
      if (response.data && response.data.success) {
        console.log('Deal accepted successfully');
        return {
          success: true,
          deal: response.data.deal
        };
      }
      
      console.error('Invalid deal acceptance response:', response.data);
      return { success: false, message: response.data.message || 'Failed to accept deal' };
    } catch (error) {
      console.error(`Error accepting deal with ID ${dealId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Reject a deal (for company)
  rejectDeal: async (dealId, reason) => {
    try {
      console.log(`Rejecting deal with ID ${dealId}`);
      
      const response = await api.post('/addDeal/reject', { 
        dealId,
        reason
      });
      
      if (response.data && response.data.success) {
        console.log('Deal rejected successfully');
        return {
          success: true,
          deal: response.data.deal
        };
      }
      
      console.error('Invalid deal rejection response:', response.data);
      return { success: false, message: response.data.message || 'Failed to reject deal' };
    } catch (error) {
      console.error(`Error rejecting deal with ID ${dealId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }
};