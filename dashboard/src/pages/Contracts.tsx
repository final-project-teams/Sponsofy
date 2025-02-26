import React, { useState } from 'react';
import { Contract } from '../types';

const mockContracts: Contract[] = [
  {
    id: '1',
    creatorId: 'creator1',
    companyId: 'company1',
    status: 'active',
    value: 5000,
    startDate: '2024-02-01',
    endDate: '2024-03-01'
  },
  {
    id: '2',
    creatorId: 'creator2',
    companyId: 'company2',
    status: 'completed',
    value: 3000,
    startDate: '2024-01-15',
    endDate: '2024-02-15'
  },
  {
    id: '3',
    creatorId: 'creator3',
    companyId: 'company3',
    status: 'disputed',
    value: 7500,
    startDate: '2024-02-10',
    endDate: '2024-04-10'
  }
];

const Contracts = () => {
  const [contracts] = useState<Contract[]>(mockContracts);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Contract Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage all platform contracts</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                All Contracts
              </button>
              <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50">
                Active
              </button>
              <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50">
                Disputed
              </button>
            </div>
          </div>

          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map((contract) => (
                <tr key={contract.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {contract.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      Creator: {contract.creatorId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      contract.status === 'active' ? 'bg-green-100 text-green-800' :
                      contract.status === 'disputed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${contract.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                      View Details
                    </button>
                    {contract.status === 'active' && (
                      <button className="text-red-600 hover:text-red-900">
                        Mark Disputed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Contracts;