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

const API_BASE_URL = 'http://192.168.1.6:8000/api/v1'; // Backend API URL

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/menu`);
        if (response.ok) {
          const data = await response.json();
          setMenuItems(data);
        } else {
          console.error('Failed to fetch menu items');
          setError('Failed to load menu');
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setError('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const categories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages'];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-xl text-black dark:text-zinc-50">Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-4">
            Our Menu
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Enjoy our delicious selection of dishes.
          </p>
        </div>

        <div className="space-y-8">
          {categories.map(category => {
            const categoryItems = menuItems.filter(item =>
              item.category === category && item.available
            );

            if (categoryItems.length === 0) return null;

            return (
              <div key={category} className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-100 dark:bg-zinc-800 px-6 py-4">
                  <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">{category}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {categoryItems.map(item => (
                    <div key={item.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-xl font-semibold text-black dark:text-zinc-50 mb-2">{item.name}</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                        {item.description || 'No description available'}
                      </p>
                      <p className="text-2xl font-bold text-green-600">₹{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {menuItems.filter(item => item.available).length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">No menu items available at the moment.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <a href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
