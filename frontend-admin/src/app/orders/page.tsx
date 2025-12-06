'use client';

import { useState, useEffect, useRef } from 'react';

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
  const [bellRinging, setBellRinging] = useState(false);
  const [pendingOrderIds, setPendingOrderIds] = useState<Set<string>>(new Set());
  const [audioEnabled, setAudioEnabled] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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

    // Initialize pending orders from mock data
    const pendingIds = new Set(mockOrders.filter(o => o.status === 'pending').map(o => o.id));
    setPendingOrderIds(pendingIds);
    setBellRinging(pendingIds.size > 0);
  }, []);

  const enableAudio = async () => {
    try {
      // Create audio context on user interaction
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      // Resume audio context (required by browsers)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      // Test the audio by playing a short beep
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(440, context.currentTime); // A4 note
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.2);

      setAudioEnabled(true);
      alert('Audio enabled! You will now hear bell sounds for new orders.');
    } catch (error) {
      console.log('Failed to enable audio:', error);
      alert('Audio could not be enabled.');
    }
  };

  // Function to play bell sound using Web Audio API
  const playBellSound = async () => {
    if (!audioEnabled) return; // Don't play if audio not enabled

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const context = audioContextRef.current;

      // Ensure context is running
      if (context.state === 'suspended') {
        await context.resume();
      }

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Bell-like sound: multiple frequencies
      const frequencies = [800, 600, 400]; // Bell harmonics
      let currentFreqIndex = 0;

      const playNextFrequency = () => {
        if (currentFreqIndex < frequencies.length) {
          oscillator.frequency.setValueAtTime(frequencies[currentFreqIndex], context.currentTime);
          gainNode.gain.setValueAtTime(0.3, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

          setTimeout(() => {
            currentFreqIndex++;
            playNextFrequency();
          }, 200);
        } else {
          oscillator.stop();
        }
      };

      oscillator.start();
      playNextFrequency();

      // Repeat every 2 seconds while bell is ringing
      if (bellRinging) {
        setTimeout(() => {
          if (bellRinging) playBellSound();
        }, 2000);
      }
    } catch (error) {
      console.log('Web Audio API not supported, using fallback beep');
      alert('Web Audio API failed, trying fallback...');
      // Fallback: simple beep sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQcBzaO1fLNfCsE');
      audio.play().catch(() => {
        console.log('Audio play failed');
        alert('Audio playback failed. Check browser permissions.');
      });
    }
  };

  // WebSocket connection and bell handling
  useEffect(() => {
    // Connect to WebSocket
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:8000/ws/admin');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to admin WebSocket');
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);
        alert(`Received ${message.type} message`);

        if (message.type === 'new_order') {
          // Add new order to the list
          const newOrder: Order = {
            id: message.data.id.toString(),
            customerName: message.data.customer_name,
            items: message.data.items.map((item: any) => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            total: message.data.total_amount,
            status: 'pending',
            deliveryType: message.data.delivery_type,
            createdAt: message.data.created_at,
          };

          setOrders(prev => [newOrder, ...prev]);

          // Add to pending orders and start bell
          setPendingOrderIds(prev => {
            const newSet = new Set(prev);
            newSet.add(newOrder.id);
            return newSet;
          });
          setBellRinging(true);

          // Play bell sound
          playBellSound();
        } else if (message.type === 'order_status_change') {
          const { order_id, status } = message.data;

          // Update order status
          setOrders(prev => prev.map(order =>
            order.id === order_id.toString()
              ? { ...order, status }
              : order
          ));

          // If order is accepted or rejected, remove from pending
          if (status === 'accepted' || status === 'cancelled') {
            setPendingOrderIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(order_id.toString());

              // Stop bell if no more pending orders
              if (newSet.size === 0) {
                setBellRinging(false);
              }

              return newSet;
            });
          }
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        setTimeout(connectWebSocket, 1000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);



  const acceptOrder = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'accepted', estimated_time: 30 }),
      });

      if (response.ok) {
        setOrders(prev => prev.map(order =>
          order.id === orderId
            ? { ...order, status: 'accepted', estimatedTime: 30 }
            : order
        ));

        // Remove from pending orders
        setPendingOrderIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to accept order:', error);
    }
  };

  const rejectOrder = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (response.ok) {
        setOrders(prev => prev.map(order =>
          order.id === orderId
            ? { ...order, status: 'cancelled' }
            : order
        ));

        // Remove from pending orders
        setPendingOrderIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to reject order:', error);
    }
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
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-black dark:text-zinc-50">Order Management</h1>
            {bellRinging && (
              <div className="flex items-center gap-2 text-red-600 animate-pulse">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                </svg>
                <span className="text-lg font-semibold">New Order!</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {!audioEnabled && (
              <button
                onClick={enableAudio}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Enable Audio Alerts
              </button>
            )}
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
