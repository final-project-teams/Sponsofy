import React, { useState } from 'react';
import { Dispute } from '../types';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const mockDisputes: Dispute[] = [
  {
    id: 'D1',
    title: 'Payment Delay Issue',
    status: 'open',
    createdAt: '2024-02-15',
    parties: {
      creator: 'John Doe',
      company: 'Tech Corp'
    }
  },
  {
    id: 'D2',
    title: 'Contract Terms Violation',
    status: 'resolved',
    createdAt: '2024-02-10',
    parties: {
      creator: 'Jane Smith',
      company: 'Media Inc'
    }
  },
  {
    id: 'D3',
    title: 'Deliverable Quality Dispute',
    status: 'pending',
    createdAt: '2024-02-20',
    parties: {
      creator: 'Mike Johnson',
      company: 'Brand Co'
    }
  }
];

export default function Disputes() {
  const [disputes] = useState<Dispute[]>(mockDisputes);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Disputes</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Disputes content goes here...</p>
      </div>
    </div>
  );
}