'use client';

import { useState, useEffect } from 'react';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string | null;
  available: boolean;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const API_BASE_URL = 'http://192.168.1.6:8000/api/v1';

export default function Order() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryType: 'pickup' as 'pickup' | 'delivery',
    address: ''
  });

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/menu`);
        if (response.ok) {
          const data = await response.json();
          setMenuItems(data);
        } else {
          console.error('Failed to fetch menu items');
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      } else {
        return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
      }
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert('Please fill in your customer information!');
      return;
    }

    if (customerInfo.deliveryType === 'delivery' && !customerInfo.address) {
      alert('Please provide delivery address!');
      return;
    }

    try {
      const orderData = {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        delivery_type: customerInfo.deliveryType,
        delivery_address: customerInfo.deliveryType === 'delivery' ? customerInfo.address : '',
        status: 'pending',
        total_amount: total,
        items: cart.map(item => ({
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        alert('Order placed successfully!');
        setCart([]);
        setCustomerInfo({
          name: '',
          email: '',
          phone: '',
          deliveryType: 'pickup',
          address: ''
        });
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
            Order Online
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Place your order for pickup or delivery.
          </p>
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl font-semibold mb-4">Select Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map(item => (
                <div key={item.name} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-zinc-600">₹{item.price}</p>
                  <button onClick={() => addToCart(item)} className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Add to Cart</button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="mt-6 w-full">
                <h3 className="text-xl font-semibold">Your Cart</h3>
                <ul className="mt-2">
                  {cart.map(item => (
                    <li key={item.name} className="flex justify-between">
                      <span>{item.name} (x{item.quantity})</span>
                      <span>₹{item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-bold">Total: ₹{total}</p>
              </div>
            )}
            <div className="mt-6">
              <h3 className="text-xl font-semibold">Customer Information</h3>
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-semibold">Delivery Options</h3>
              <div className="mt-2">
                <label className="mr-4">
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={customerInfo.deliveryType === 'pickup'}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, deliveryType: e.target.value as 'pickup' }))}
                    className="mr-2"
                  /> Pickup
                </label>
                <label>
                  <input
                    type="radio"
                    name="delivery"
                    value="delivery"
                    checked={customerInfo.deliveryType === 'delivery'}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, deliveryType: e.target.value as 'delivery' }))}
                    className="mr-2"
                  /> Delivery
                </label>
              </div>
              {customerInfo.deliveryType === 'delivery' && (
                <textarea
                  placeholder="Delivery Address"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-2 border rounded mt-2"
                  rows={3}
                />
              )}
            </div>
            <button onClick={handleCheckout} className="mt-6 w-full bg-green-600 text-white py-2 rounded-full hover:bg-green-700">
              Proceed to Checkout
            </button>
          </div>
          <a href="/" className="text-blue-600 hover:text-blue-800">Back to Home</a>
        </div>
      </main>
    </div>
  );
}
