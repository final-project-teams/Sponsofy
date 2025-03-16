export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  description?: string;
  website?: string;
  codeFiscal?: string;
  category?: string;
  email?: string;
  phone?: string;
  foundedYear?: number;
  employeeCount?: number;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
  };
  status?: 'active' | 'inactive' | 'pending';
  verified?: boolean;
  UserId?: string;
} 