export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'creator' | 'company';
    status: 'active' | 'pending' | 'suspended' | 'banned';
    isVerified: boolean;
    createdAt: string;
    socialMedia: {
      instagram?: string;
      twitter?: string;
      youtube?: string;
    };
    profileImage: string;
  }
  
  export interface Stats {
    totalCreators: number;
    totalCompanies: number;
    pendingVerifications: number;
    activeDisputes: number;
  }
  
  export interface Dispute {
    id: string;
    title: string;
    status: 'open' | 'resolved' | 'pending';
    createdAt: string;
    parties: {
      creator: string;
      company: string;
    };
  }
  
  export interface Contract {
    id: string;
    creatorId: string;
    companyId: string;
    status: 'active' | 'completed' | 'disputed';
    value: number;
    startDate: string;
    endDate: string;
  }