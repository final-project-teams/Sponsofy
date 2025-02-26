import React from 'react';
import { Users, UserCheck, AlertTriangle, DollarSign } from 'lucide-react';
import StatsCard from '../components/StatsCard';

const stats = [
  {
    title: 'Total Users',
    value: 2584,
    icon: Users,
    trend: { value: 12, isPositive: true }
  },
  {
    title: 'Pending Verifications',
    value: 45,
    icon: UserCheck,
    trend: { value: 8, isPositive: false }
  },
  {
    title: 'Active Disputes',
    value: 12,
    icon: AlertTriangle,
    trend: { value: 2, isPositive: false }
  },
  {
    title: 'Total Revenue',
    value: 854621,
    icon: DollarSign,
    trend: { value: 15, isPositive: true }
  }
];

// Remove or use 'data' in your component
// const data: YourSpecificType = fetchData(); // Replace 'YourSpecificType' with the actual type

export default function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Verifications</h2>
          {/* Add verification list component here */}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Latest Disputes</h2>
          {/* Add disputes list component here */}
        </div>
      </div>
    </div>
  );
}