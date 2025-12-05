'use client';

import { useState, useEffect } from 'react';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string | null;
  available: boolean;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = 'http://localhost:8000/api/v1'; // Backend API URL

export default function MenuAdmin() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Load menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/menu?available_only=false`);
        if (response.ok) {
          const data = await response.json();
          setMenuItems(data);
        } else {
          console.error('Failed to fetch menu items');
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setError('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const [newItem, setNewItem] = useState({
    name: '',
    price: 0,
    category: 'Main Course',
    description: '',
    available: true,
  });

  const categories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages'];

  const handleAddItem = async () => {
    if (newItem.name && newItem.price && newItem.category) {
      try {
        const response = await fetch(`${API_BASE_URL}/menu`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newItem.name,
            price: newItem.price * 100, // Convert to paisa
            category: newItem.category,
            description: newItem.description || null,
            available: newItem.available,
          }),
        });

        if (response.ok) {
          const createdItem = await response.json();
          setMenuItems([...menuItems, createdItem]);
          setNewItem({
            name: '',
            price: 0,
            category: 'Main Course',
            description: '',
            available: true,
          });
          setIsAddingNew(false);
        } else {
          console.error('Failed to create menu item');
        }
      } catch (error) {
        console.error('Error creating menu item:', error);
      }
    }
  };

  const handleUpdateItem = async (updatedItem: MenuItem) => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu/${updatedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedItem.name,
          price: updatedItem.price,
          category: updatedItem.category,
          description: updatedItem.description,
          available: updatedItem.available,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setMenuItems(menuItems.map(item =>
          item.id === updated.id ? updated : item
        ));
        setEditingItem(null);
      } else {
        console.error('Failed to update menu item');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMenuItems(menuItems.filter(item => item.id !== id));
        } else {
          console.error('Failed to delete menu item');
        }
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  const toggleAvailability = async (id: number) => {
    const item = menuItems.find(item => item.id === id);
    if (item) {
      await handleUpdateItem({ ...item, available: !item.available });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">Menu Management</h1>
          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isAddingNew ? 'Cancel' : 'Add New Item'}
          </button>
        </div>

        {/* Add New Item Form */}
        {isAddingNew && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">Add New Menu Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black dark:text-zinc-50">Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-50"
                  placeholder="Item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black dark:text-zinc-50">Price (₹)</label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                  className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-50"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black dark:text-zinc-50">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-50"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black dark:text-zinc-50">Available</label>
                <input
                  type="checkbox"
                  checked={newItem.available}
                  onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1 text-black dark:text-zinc-50">Description</label>
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-50"
                rows={3}
                placeholder="Item description"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAddItem}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Item
              </button>
              <button
                onClick={() => setIsAddingNew(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Menu Items List */}
        <div className="space-y-4">
          {categories.map(category => {
            const categoryItems = menuItems.filter(item => item.category === category);
            if (categoryItems.length === 0) return null;

            return (
              <div key={category} className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-100 dark:bg-zinc-800 px-6 py-3">
                  <h3 className="text-lg font-semibold text-black dark:text-zinc-50">{category}</h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-zinc-700">
                  {categoryItems.map(item => (
                    <div key={item.id} className="p-6">
                      {editingItem?.id === item.id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1 text-black dark:text-zinc-50">Name</label>
                              <input
                                type="text"
                                value={editingItem.name}
                                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-50"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1 text-black dark:text-zinc-50">Price (₹)</label>
                              <input
                                type="number"
                                value={editingItem.price}
                                onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-50"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-black dark:text-zinc-50">Description</label>
                            <textarea
                              value={editingItem.description}
                              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                              className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-50"
                              rows={2}
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-black dark:text-zinc-50">
                              <input
                                type="checkbox"
                                checked={editingItem.available}
                                onChange={(e) => setEditingItem({ ...editingItem, available: e.target.checked })}
                              />
                              Available
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateItem(editingItem)}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-black dark:text-zinc-50">{item.name}</h4>
                              <span className={`px-2 py-1 rounded text-xs ${
                                item.available
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {item.available ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-2">{item.description || 'No description'}</p>
                            <p className="text-xl font-bold text-black dark:text-zinc-50">₹{item.price}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => toggleAvailability(item.id)}
                              className={`px-3 py-1 rounded text-sm ${
                                item.available
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {item.available ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {menuItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">No menu items found. Add your first item above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
