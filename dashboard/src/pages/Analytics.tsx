export default function Analytics() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform performance and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold">{mockData.totalUsers.toLocaleString()}</h3>
              <p className="text-sm text-green-500">+{mockData.userGrowth}% vs last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold">${mockData.totalRevenue.toLocaleString()}</h3>
              <p className="text-sm text-green-500">+{mockData.revenueGrowth}% vs last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Active Contracts</p>
              <h3 className="text-2xl font-bold">{mockData.activeContracts}</h3>
              <p className="text-sm text-green-500">+{mockData.monthlyGrowth}% vs last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Avg Contract Value</p>
              <h3 className="text-2xl font-bold">${mockData.averageContractValue.toLocaleString()}</h3>
              <p className="text-sm text-gray-500">Per contract</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h2>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500">Revenue chart will be implemented here</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Top Performing Creators</h2>
            <div className="space-y-4">
              {mockData.topCreators.map((creator, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{creator.name}</p>
                    <p className="text-sm text-gray-500">{creator.contracts} active contracts</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${creator.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">User Growth</h2>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500">User growth chart will be implemented here</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Contract Distribution</h2>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500">Contract distribution chart will be implemented here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}