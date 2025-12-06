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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [bellRinging, setBellRinging] = useState(false);
  const [pendingOrderIds, setPendingOrderIds] = useState<Set<string>>(new Set());
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);
  const bellIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing orders from API on mount
  useEffect(() => {
    const loadExistingOrders = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/orders');
        if (response.ok) {
          const ordersData = await response.json();
          const formattedOrders: Order[] = ordersData.map((order: any) => ({
            id: order.id.toString(),
            customerName: order.customer_name,
            items: order.items.map((item: any) => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            total: order.total_amount,
            status: order.status,
            deliveryType: order.delivery_type,
            createdAt: order.created_at,
            estimatedTime: order.estimated_time,
          }));
          setOrders(formattedOrders);

          // Initialize pending orders
          const pendingIds = new Set(formattedOrders.filter(o => o.status === 'pending').map(o => o.id));
          setPendingOrderIds(pendingIds);
          setBellRinging(pendingIds.size > 0);
        }
      } catch (error) {
        console.error('Failed to load existing orders:', error);
      }
    };

    loadExistingOrders();
  }, []);

  // Set mounted after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load audio enabled state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAudioEnabled = localStorage.getItem('audioEnabled');
      if (savedAudioEnabled) {
        setAudioEnabled(savedAudioEnabled === 'true');
      }
    }
  }, []);

  // Save audio enabled state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('audioEnabled', audioEnabled.toString());
    }
  }, [audioEnabled]);

  // Function to create a bell sound using Web Audio API
  const createBellSound = () => {
    try {
      // Create audio context if not exists
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      // Create oscillator for bell sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure bell sound
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      
      // Create a "tring-tring" pattern
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(1.0, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      // Play the sound
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      
      // Clean up
      setTimeout(() => {
        oscillator.disconnect();
        gainNode.disconnect();
        audioContext.close();
      }, 400);
      
    } catch (error) {
      console.error('Error creating bell sound:', error);
    }
  };

  // Function to play bell sound repeatedly
  const startBellSound = () => {
    if (!audioEnabled) return;
    
    // Play immediately
    createBellSound();
    
    // Then repeat every 2 seconds
    bellIntervalRef.current = setInterval(() => {
      if (audioEnabled) {
        createBellSound();
      }
    }, 2000);
  };

  // Function to stop bell sound
  const stopBellSound = () => {
    if (bellIntervalRef.current) {
      clearInterval(bellIntervalRef.current);
      bellIntervalRef.current = null;
    }
  };

  // Start/stop bell based on bellRinging state
  useEffect(() => {
    if (bellRinging && audioEnabled) {
      startBellSound();
    } else {
      stopBellSound();
    }
    
    // Cleanup on unmount
    return () => {
      stopBellSound();
    };
  }, [bellRinging, audioEnabled]);

  const enableAudio = async () => {
    try {
      // First, get user interaction by playing a test sound
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      // Resume audio context (required by browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Create and play a test sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Clean up
      setTimeout(() => {
        oscillator.disconnect();
        gainNode.disconnect();
        audioContext.close();
      }, 600);
      
      setAudioEnabled(true);
      alert('Audio enabled! You will now hear bell sounds for new orders.');
      
    } catch (error) {
      console.log('Failed to enable audio:', error);
      alert('Audio could not be enabled. Please try again.');
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
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);

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
            
            // This will trigger the bell sound through the useEffect
            setBellRinging(true);

            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('New Order!', {
                body: `Order #${newOrder.id} from ${newOrder.customerName}`,
                icon: '/favicon.ico'
              });
            }

          } else if (message.type === 'order_status_change') {
            const { order_id, status } = message.data;

            // Update order status
            setOrders(prev => prev.map(order =>
              order.id === order_id.toString()
                ? { ...order, status }
                : order
            ));

            // If order is accepted or cancelled, remove from pending
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
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
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
      stopBellSound();
    };
  }, []);

  // ... rest of your component code remains the same ...

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
          
          // Check if we should stop the bell
          if (newSet.size === 0) {
            setBellRinging(false);
          }
          
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
          
          // Check if we should stop the bell
          if (newSet.size === 0) {
            setBellRinging(false);
          }
          
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to reject order:', error);
    }
  };

  // ... rest of your component (markAsReady, markAsDelivered, etc.) ...

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
            {!audioEnabled ? (
              <button
                onClick={enableAudio}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Enable Audio Alerts
              </button>
            ) : (
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded">
                Audio Alerts Enabled
              </div>
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

        {/* ... rest of your JSX remains the same ... */}
      </div>
    </div>
  );
}
