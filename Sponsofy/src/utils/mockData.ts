/**
 * Mock Data Generator
 * 
 * This file contains functions to generate mock data for offline use.
 */

// Contract interface
export interface Contract {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'pending' | 'completed' | 'terminated';
  payment_terms: string;
  rank?: 'plat' | 'gold' | 'silver';
  company_id?: number;
  content_creator_id?: number;
  createdAt?: string;
  updatedAt?: string;
  contentCreator?: {
    first_name: string;
    last_name: string;
  };
}

/**
 * Generate mock contracts based on status filter
 * @param filterStatus - Status to filter contracts by ('all', 'active', 'pending', 'completed', 'terminated')
 * @returns Array of mock contracts
 */
export const generateMockContracts = (filterStatus: string): Contract[] => {
  const mockContracts: Contract[] = [];
  const statuses = ['active', 'pending', 'completed', 'terminated'];
  const ranks = ['plat', 'gold', 'silver'];
  
  // Create 10 mock contracts
  for (let i = 1; i <= 10; i++) {
    const contractStatus = filterStatus === 'all' ? 
      statuses[Math.floor(Math.random() * statuses.length)] : 
      filterStatus as 'active' | 'pending' | 'completed' | 'terminated';
    
    // Skip if the status doesn't match the filter (except for 'all')
    if (filterStatus !== 'all' && contractStatus !== filterStatus) {
      continue;
    }
    
    // Create start date (between 1-30 days in the past)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30) - 1);
    
    // Create end date (3-12 months after start date)
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + Math.floor(Math.random() * 10) + 3);
    
    mockContracts.push({
      id: i,
      title: `Contract ${i} - ${['Social Media Campaign', 'Product Promotion', 'Brand Ambassador', 'Content Creation'][Math.floor(Math.random() * 4)]}`,
      description: `This is a ${contractStatus} contract for ${['TikTok', 'Instagram', 'YouTube', 'Blog'][Math.floor(Math.random() * 4)]} content creation. The creator will produce content according to the brand guidelines and post it on their social media channels.`,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: contractStatus,
      payment_terms: `Payment of $${Math.floor(Math.random() * 5000) + 1000} ${['monthly', 'quarterly', 'annually'][Math.floor(Math.random() * 3)]}`,
      rank: ranks[Math.floor(Math.random() * ranks.length)] as 'plat' | 'gold' | 'silver',
      company_id: Math.floor(Math.random() * 10) + 1,
      content_creator_id: Math.floor(Math.random() * 20) + 1,
      createdAt: new Date(startDate).toISOString(),
      updatedAt: new Date().toISOString(),
      contentCreator: {
        first_name: ['John', 'Jane', 'Alex', 'Sarah', 'Michael'][Math.floor(Math.random() * 5)],
        last_name: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)]
      }
    });
  }
  
  return mockContracts;
};

/**
 * Generate a single mock contract
 * @param id - Contract ID
 * @param status - Contract status
 * @returns Mock contract
 */
export const generateMockContract = (id: number, status: 'active' | 'pending' | 'completed' | 'terminated' = 'active'): Contract => {
  const ranks = ['plat', 'gold', 'silver'];
  
  // Create start date (between 1-30 days in the past)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30) - 1);
  
  // Create end date (3-12 months after start date)
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + Math.floor(Math.random() * 10) + 3);
  
  return {
    id,
    title: `Contract ${id} - ${['Social Media Campaign', 'Product Promotion', 'Brand Ambassador', 'Content Creation'][Math.floor(Math.random() * 4)]}`,
    description: `This is a ${status} contract for ${['TikTok', 'Instagram', 'YouTube', 'Blog'][Math.floor(Math.random() * 4)]} content creation. The creator will produce content according to the brand guidelines and post it on their social media channels.`,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    status,
    payment_terms: `Payment of $${Math.floor(Math.random() * 5000) + 1000} ${['monthly', 'quarterly', 'annually'][Math.floor(Math.random() * 3)]}`,
    rank: ranks[Math.floor(Math.random() * ranks.length)] as 'plat' | 'gold' | 'silver',
    company_id: Math.floor(Math.random() * 10) + 1,
    content_creator_id: Math.floor(Math.random() * 20) + 1,
    createdAt: new Date(startDate).toISOString(),
    updatedAt: new Date().toISOString(),
    contentCreator: {
      first_name: ['John', 'Jane', 'Alex', 'Sarah', 'Michael'][Math.floor(Math.random() * 5)],
      last_name: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)]
    }
  };
}; 