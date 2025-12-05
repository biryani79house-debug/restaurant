'use client';

import { useState, useEffect } from 'react';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryType: 'pickup' | 'delivery';
  createdAt: string;
  estimatedTime?: number; // in minutes
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: 'ORD001',
        customerName: 'John Doe',
        items: [
          { name: 'Spring Rolls', price: 500, quantity: 2 },
          { name: 'Grilled Salmon', price: 1500, quantity: 1 },
        ],
        total: 2500,
        status: 'pending',
        deliveryType: 'delivery',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      },
      {
        id: 'ORD002',
        customerName: 'Jane Smith',
        items: [
          { name: 'Chocolate Cake', price: 400, quantity: 1 },
          { name: 'Coffee', price: 150, quantity: 2 },
        ],
        total: 700,
        status: 'accepted',
        deliveryType: 'pickup',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        estimatedTime: 20,
      },
      {
        id: 'ORD003',
        customerName: 'Bob Wilson',
        items: [
          { name: 'Grilled Salmon', price: 1500, quantity: 1 },
        ],
        total: 1500,
        status: 'preparing',
        deliveryType: 'delivery',
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
        estimatedTime: 15,
      },
    ];
    setOrders(mockOrders);
  }, []);

  const acceptOrder = (orderId: string) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, status: 'accepted', estimatedTime: 30 }
        : order
    ));
  };

  const rejectOrder = (orderId: string) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, status: 'cancelled' }
        : order
    ));
  };

  const markAsReady = (orderId: string) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, status: 'ready' }
        : order
    ));
  };

  const markAsDelivered = (orderId: string) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, status: 'delivered' }
        : order
    ));
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'pending') return order.status === 'pending';
    if (filter === 'active') return ['accepted', 'preparing', 'ready'].includes(order.status);
    return true;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">Order Management</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Pending ({orders.filter(o => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Active ({orders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status)).length})
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                    Order #{order.id}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Customer: {order.customerName} • {order.deliveryType} • {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  {order.estimatedTime && (
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Est. {order.estimatedTime} min
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-black dark:text-zinc-50">Items:</h4>
                <div className="space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} (x{item.quantity})</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-2 pt-2 font-semibold">
                  Total: ₹{order.total}
                </div>
              </div>

              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => acceptOrder(order.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Accept Order
                    </button>
                    <button
                      onClick={() => rejectOrder(order.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Reject Order
                    </button>
                  </>
                )}
                {order.status === 'accepted' && (
                  <button
                    onClick={() => setOrders(prev => prev.map(o =>
                      o.id === order.id ? { ...o, status: 'preparing' } : o
                    ))}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => markAsReady(order.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Mark as Ready
                  </button>
                )}
                {order.status === 'ready' && order.deliveryType === 'pickup' && (
                  <button
                    onClick={() => markAsDelivered(order.id)}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    Mark as Picked Up
                  </button>
                )}
                {order.status === 'ready' && order.deliveryType === 'delivery' && (
                  <button
                    onClick={() => markAsDelivered(order.id)}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">No orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
