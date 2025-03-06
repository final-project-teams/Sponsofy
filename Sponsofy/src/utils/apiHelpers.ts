/**
 * API Helper Functions
 * 
 * This file contains helper functions for API operations.
 */

import axios from 'axios';
import { BASE_URL, ENDPOINTS, OFFLINE_MODE } from '../services/api/config';
import { generateMockContracts, generateMockContract, Contract } from './mockData';

/**
 * Check if the server is available
 * @returns Promise<boolean> - True if server is available, false otherwise
 */
export const isServerAvailable = async (): Promise<boolean> => {
  if (OFFLINE_MODE) {
    console.log('Offline mode is enabled, skipping server check');
    return false;
  }
  
  try {
    await axios.get(`${BASE_URL}${ENDPOINTS.HEALTH}`, { timeout: 2000 });
    console.log('Server is available');
    return true;
  } catch (error) {
    console.log('Server is unavailable:', error);
    return false;
  }
};

/**
 * Get contracts with offline fallback
 * @param status - Status to filter contracts by
 * @returns Promise<Contract[]> - Array of contracts
 */
export const getContractsWithFallback = async (status?: string): Promise<Contract[]> => {
  try {
    // Check if server is available
    const serverAvailable = await isServerAvailable();
    
    if (!serverAvailable) {
      console.log('Using mock contracts (offline mode)');
      return generateMockContracts(status || 'all');
    }
    
    // Try to get real data from server
    const response = await axios.get(`${BASE_URL}${ENDPOINTS.CONTRACTS}`, { timeout: 3000 });
    
    if (response.data && Array.isArray(response.data)) {
      // Filter by status if provided
      if (status && status !== 'all') {
        return response.data.filter(
          (contract: Contract) => contract.status === status
        );
      }
      return response.data;
    }
    
    // Fallback to mock data if response format is unexpected
    console.log('Unexpected response format, using mock data');
    return generateMockContracts(status || 'all');
  } catch (error) {
    console.log('Error fetching contracts, using mock data:', error);
    return generateMockContracts(status || 'all');
  }
};

/**
 * Get contract by ID with offline fallback
 * @param id - Contract ID
 * @returns Promise<Contract | null> - Contract or null if not found
 */
export const getContractByIdWithFallback = async (id: number): Promise<Contract | null> => {
  try {
    // Check if server is available
    const serverAvailable = await isServerAvailable();
    
    if (!serverAvailable) {
      console.log('Using mock contract (offline mode)');
      const mockContracts = generateMockContracts('all');
      return mockContracts.find(contract => contract.id === id) || generateMockContract(id);
    }
    
    // Try to get real data from server
    const response = await axios.get(`${BASE_URL}${ENDPOINTS.CONTRACTS}/${id}`, { timeout: 3000 });
    
    if (response.data) {
      return response.data;
    }
    
    // Fallback to mock data if response format is unexpected
    console.log('Unexpected response format, using mock data');
    return generateMockContract(id);
  } catch (error) {
    console.log('Error fetching contract, using mock data:', error);
    return generateMockContract(id);
  }
}; 