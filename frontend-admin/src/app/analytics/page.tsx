'use client';

import { useState, useEffect } from 'react';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface PopularItem {
  name: string;
  orders: number;
  revenue: number;
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock sales data
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topItem: '',
  });

  useEffect(() => {
    // Generate mock data based on time range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const mockSales: SalesData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      mockSales.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 10000) + 2000,
        orders: Math.floor(Math.random() * 20) + 5,
      });
    }

    setSalesData(mockSales);

    // Mock popular items
    const mockPopular: PopularItem[] = [
      { name: 'Grilled Salmon', orders: 45, revenue: 67500 },
      { name: 'Spring Rolls', orders: 38, revenue: 19000 },
      { name: 'Chocolate Cake', orders: 32, revenue: 12800 },
      { name: 'Coffee', orders: 28, revenue: 4200 },
      { name: 'Pasta Carbonara', orders: 22, revenue: 22000 },
    ];

    setPopularItems(mockPopular);

    // Calculate total stats
    const totalRevenue = mockSales.reduce((sum, day) => sum + day.revenue, 0);
    const totalOrders = mockSales.reduce((sum, day) => sum + day.orders, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    setTotalStats({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      topItem: mockPopular[0]?.name || '',
    });
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const maxRevenue = Math.max(...salesData.map(d => d.revenue));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">Analytics Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded ${timeRange === '7d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded ${timeRange === '30d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300'}`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-4 py-2 rounded ${timeRange === '90d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300'}`}
            >
              90 Days
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalStats.totalRevenue)}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">{totalStats.totalOrders}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">Avg Order Value</h3>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(totalStats.avgOrderValue)}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">Top Item</h3>
            <p className="text-lg font-bold text-orange-600">{totalStats.topItem}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Chart */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">Revenue Trend</h2>
            <div className="h-64 flex items-end justify-between gap-1">
              {salesData.map((data, index) => (
                <div key={data.date} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-blue-500 hover:bg-blue-600 rounded-t w-full transition-all"
                    style={{
                      height: `${(data.revenue / maxRevenue) * 200}px`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 rotate-45 origin-top-left">
                    {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Daily revenue in {formatCurrency(0).split('0')[0]} (bars represent revenue amount)
            </div>
          </div>

          {/* Popular Items */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">Popular Items</h2>
            <div className="space-y-4">
              {popularItems.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-black dark:text-zinc-50">{item.name}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.orders} orders</p>
                    </div>
                  </div>
                  <p className="font-bold text-green-600">{formatCurrency(item.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Sales Table */}
        <div className="mt-8 bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-100 dark:bg-zinc-800">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Daily Sales Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Avg Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                {salesData.map((data) => (
                  <tr key={data.date} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-zinc-50">
                      {new Date(data.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-zinc-50">{data.orders}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                      {formatCurrency(data.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-zinc-50">
                      {formatCurrency(Math.round(data.revenue / data.orders))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
