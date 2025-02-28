export interface Contract {
  id: number;
  title: string;
  description: string;
  start_date: string; // or Date if you prefer
  end_date: string; // or Date if you prefer
  status: 'active' | 'pending' | 'completed' | 'terminated';
  payment_terms: string;
  amount: number;
  payment_frequency: string;
  company_id: number;
  content_creator_id: number;
} 