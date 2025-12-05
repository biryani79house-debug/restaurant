'use client';

import { useState } from 'react';

interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

export default function Order() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: { name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(c => c.name === item.name);
      if (existing) {
        return prev.map(c => c.name === item.name ? { ...c, quantity: c.quantity + 1 } : c);
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const menuItems = [
    { name: 'Spring Rolls', price: 500 },
    { name: 'Grilled Salmon', price: 1500 },
    { name: 'Chocolate Cake', price: 400 },
    { name: 'Coffee', price: 150 },
  ];

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    alert(`Order placed! Total: ₹${total}`);
    setCart([]);
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
              <h3 className="text-xl font-semibold">Delivery Options</h3>
              <div className="mt-2">
                <label className="mr-4">
                  <input type="radio" name="delivery" value="pickup" className="mr-2" /> Pickup
                </label>
                <label>
                  <input type="radio" name="delivery" value="delivery" className="mr-2" /> Delivery
                </label>
              </div>
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
