import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'admin123' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: loginForm.username,
          password: loginForm.password
        })
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setToken(data.access_token);
        setIsLoggedIn(true);
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const [adminData, setAdminData] = useState({ users: [], restaurants: [], analytics: {} });
  const [createUserForm, setCreateUserForm] = useState({ username: '', password: '', email: '', full_name: '', phone: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({});
  const [createRestaurantForm, setCreateRestaurantForm] = useState({ name: '', description: '', address: '', phone: '', email: '', cuisine_type: '' });
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [editRestaurantForm, setEditRestaurantForm] = useState({});

  const loadData = () => {
    if (user?.role === 'admin') {
      loadAdminData();
    } else {
      loadOrders();
      loadMenu();
    }
  };

  const loadAdminData = async () => {
    try {
      const [usersRes, restaurantsRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/restaurants`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/analytics/orders`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const users = await usersRes.json();
      const restaurants = await restaurantsRes.json();
      const analytics = await analyticsRes.json();
      setAdminData({ users, restaurants, analytics });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user) {
      if (!activeTab) {
        setActiveTab(user.role === 'admin' ? 'users' : 'orders');
      }
      loadData();
    }
  }, [selectedRestaurant, isLoggedIn, user, loadData, activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/restaurants/${selectedRestaurant}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
    setLoading(false);
  };

  const loadMenu = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/restaurants/${selectedRestaurant}/menu`);
      const data = await response.json();
      setMenu(data);
    } catch (error) {
      console.error('Error loading menu:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_BASE}/api/restaurants/${selectedRestaurant}/orders/${orderId}/status?status=${status}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        loadOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const toggleMenuItem = async (menuId, isAvailable) => {
    try {
      const response = await fetch(`${API_BASE}/api/restaurants/${selectedRestaurant}/menu/${menuId}/availability?is_available=${!isAvailable}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        loadMenu(); // Refresh menu
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      confirmed: 'blue',
      preparing: 'orange',
      ready: 'green',
      delivered: 'gray',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  // CRUD functions for users
  const createUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(createUserForm)
      });
      if (response.ok) {
        loadAdminData();
        setCreateUserForm({ username: '', password: '', email: '', full_name: '', phone: '' });
      } else {
        alert('Failed to create user');
      }
    } catch (error) {
      console.error('Create user error:', error);
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user.id);
    setEditUserForm({
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      is_active: user.is_active,
      role: user.role
    });
  };

  const updateUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editUserForm)
      });
      if (response.ok) {
        loadAdminData();
        setEditingUser(null);
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        loadAdminData();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
    }
  };

  // CRUD functions for restaurants
  const createRestaurant = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(createRestaurantForm)
      });
      if (response.ok) {
        loadAdminData();
        setCreateRestaurantForm({ name: '', description: '', address: '', phone: '', email: '', cuisine_type: '' });
      } else {
        alert('Failed to create restaurant');
      }
    } catch (error) {
      console.error('Create restaurant error:', error);
    }
  };

  const startEditRestaurant = (restaurant) => {
    setEditingRestaurant(restaurant.id);
    setEditRestaurantForm({
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      cuisine_type: restaurant.cuisine_type,
      is_active: restaurant.is_active
    });
  };

  const updateRestaurant = async (restaurantId) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/restaurants/${restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editRestaurantForm)
      });
      if (response.ok) {
        loadAdminData();
        setEditingRestaurant(null);
      } else {
        alert('Failed to update restaurant');
      }
    } catch (error) {
      console.error('Update restaurant error:', error);
    }
  };

  const deleteRestaurant = async (restaurantId) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/admin/restaurants/${restaurantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        loadAdminData();
      } else {
        alert('Failed to delete restaurant');
      }
    } catch (error) {
      console.error('Delete restaurant error:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="App">
        <div className="login-container">
          <h1>RestaurantPro Login</h1>
          <form onSubmit={handleLogin}>
            <div>
              <label>Username:</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="dashboard-header">
        <h1>RestaurantPro - {user?.role === 'admin' ? 'Admin' : 'Staff'} Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.full_name || user?.username}</span>
          <button onClick={() => { setIsLoggedIn(false); setUser(null); setToken(null); }}>Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        {user?.role === 'admin' ? (
          <>
            <button
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
            <button
              className={activeTab === 'restaurants' ? 'active' : ''}
              onClick={() => setActiveTab('restaurants')}
            >
              Restaurants
            </button>
            <button
              className={activeTab === 'admin-analytics' ? 'active' : ''}
              onClick={() => setActiveTab('admin-analytics')}
            >
              Analytics
            </button>
          </>
        ) : (
          <>
            <button
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
            <button
              className={activeTab === 'menu' ? 'active' : ''}
              onClick={() => setActiveTab('menu')}
            >
              Menu Management
            </button>
            <button
              className={activeTab === 'analytics' ? 'active' : ''}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </>
        )}
      </nav>

      <main className="dashboard-content">
        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>Order Management</h2>
            {loading ? (
              <p>Loading orders...</p>
            ) : (
              <div className="orders-grid">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <h3>Order #{order.id}</h3>
                      <span className={`status ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-details">
                      <p><strong>Customer:</strong> User #{order.customer_id}</p>
                      <p><strong>Type:</strong> {order.order_type}</p>
                      <p><strong>Total:</strong> ${order.total_amount}</p>
                      <p><strong>Items:</strong> {order.items?.length || 0}</p>
                    </div>
                    <div className="order-actions">
                      {order.status === 'pending' && (
                        <button onClick={() => updateOrderStatus(order.id, 'confirmed')}>
                          Confirm
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button onClick={() => updateOrderStatus(order.id, 'preparing')}>
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button onClick={() => updateOrderStatus(order.id, 'ready')}>
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && order.order_type === 'delivery' && (
                        <button onClick={() => updateOrderStatus(order.id, 'delivered')}>
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="menu-section">
            <h2>Menu Management</h2>
            <div className="menu-grid">
              {menu.map(item => (
                <div key={item.id} className="menu-card">
                  <div className="menu-header">
                    <h3>{item.name}</h3>
                    <span className={`availability ${item.is_available ? 'available' : 'unavailable'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <p>{item.description}</p>
                  <p className="price">${item.price}</p>
                  <p className="category">{item.category}</p>
                  <button
                    onClick={() => toggleMenuItem(item.id, item.is_available)}
                    className={item.is_available ? 'disable-btn' : 'enable-btn'}
                  >
                    {item.is_available ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>Analytics Dashboard</h2>
            <div className="analytics-grid">
              <div className="metric-card">
                <h3>Total Orders Today</h3>
                <p className="metric-value">{orders.length}</p>
              </div>
              <div className="metric-card">
                <h3>Pending Orders</h3>
                <p className="metric-value">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <div className="metric-card">
                <h3>Completed Orders</h3>
                <p className="metric-value">
                  {orders.filter(o => ['delivered', 'ready'].includes(o.status)).length}
                </p>
              </div>
              <div className="metric-card">
                <h3>Total Revenue</h3>
                <p className="metric-value">
                  ${orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && user?.role === 'admin' && (
          <div className="users-section">
            <h2>User Management</h2>
            <div className="create-form">
              <h3>Create New User</h3>
              <input
                type="text"
                placeholder="Username"
                value={createUserForm.username}
                onChange={(e) => setCreateUserForm({ ...createUserForm, username: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                value={createUserForm.password}
                onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={createUserForm.email}
                onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Full Name"
                value={createUserForm.full_name}
                onChange={(e) => setCreateUserForm({ ...createUserForm, full_name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Phone"
                value={createUserForm.phone}
                onChange={(e) => setCreateUserForm({ ...createUserForm, phone: e.target.value })}
              />
              <button onClick={createUser}>Create User</button>
            </div>
            <div className="users-list">
              {adminData.users.map(user => (
                <div key={user.id} className="user-card">
                  {editingUser === user.id ? (
                    <div className="edit-form">
                      <input
                        type="email"
                        placeholder="Email"
                        value={editUserForm.email}
                        onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={editUserForm.full_name}
                        onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={editUserForm.phone}
                        onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                      />
                      <select
                        value={editUserForm.role}
                        onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                      >
                        <option value="customer">Customer</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                        <option value="driver">Driver</option>
                      </select>
                      <label>
                        <input
                          type="checkbox"
                          checked={editUserForm.is_active}
                          onChange={(e) => setEditUserForm({ ...editUserForm, is_active: e.target.checked })}
                        />
                        Active
                      </label>
                      <button onClick={() => updateUser(user.id)}>Save</button>
                      <button onClick={() => setEditingUser(null)}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <h3>{user.username}</h3>
                      <p>Email: {user.email}</p>
                      <p>Role: {user.role}</p>
                      <p>Active: {user.is_active ? 'Yes' : 'No'}</p>
                      <div className="card-actions">
                        <button onClick={() => startEditUser(user)}>Edit</button>
                        <button onClick={() => deleteUser(user.id)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'restaurants' && user?.role === 'admin' && (
          <div className="restaurants-section">
            <h2>Restaurant Management</h2>
            <div className="create-form">
              <h3>Create New Restaurant</h3>
              <input
                type="text"
                placeholder="Name"
                value={createRestaurantForm.name}
                onChange={(e) => setCreateRestaurantForm({ ...createRestaurantForm, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Description"
                value={createRestaurantForm.description}
                onChange={(e) => setCreateRestaurantForm({ ...createRestaurantForm, description: e.target.value })}
              />
              <input
                type="text"
                placeholder="Address"
                value={createRestaurantForm.address}
                onChange={(e) => setCreateRestaurantForm({ ...createRestaurantForm, address: e.target.value })}
              />
              <input
                type="text"
                placeholder="Phone"
                value={createRestaurantForm.phone}
                onChange={(e) => setCreateRestaurantForm({ ...createRestaurantForm, phone: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={createRestaurantForm.email}
                onChange={(e) => setCreateRestaurantForm({ ...createRestaurantForm, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Cuisine Type"
                value={createRestaurantForm.cuisine_type}
                onChange={(e) => setCreateRestaurantForm({ ...createRestaurantForm, cuisine_type: e.target.value })}
              />
              <button onClick={createRestaurant}>Create Restaurant</button>
            </div>
            <div className="restaurants-list">
              {adminData.restaurants.map(restaurant => (
                <div key={restaurant.id} className="restaurant-card">
                  {editingRestaurant === restaurant.id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        placeholder="Name"
                        value={editRestaurantForm.name}
                        onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, name: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={editRestaurantForm.description}
                        onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, description: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        value={editRestaurantForm.address}
                        onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, address: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={editRestaurantForm.phone}
                        onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, phone: e.target.value })}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={editRestaurantForm.email}
                        onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, email: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Cuisine Type"
                        value={editRestaurantForm.cuisine_type}
                        onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, cuisine_type: e.target.value })}
                      />
                      <label>
                        <input
                          type="checkbox"
                          checked={editRestaurantForm.is_active}
                          onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, is_active: e.target.checked })}
                        />
                        Active
                      </label>
                      <button onClick={() => updateRestaurant(restaurant.id)}>Save</button>
                      <button onClick={() => setEditingRestaurant(null)}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <h3>{restaurant.name}</h3>
                      <p>{restaurant.description}</p>
                      <p>Address: {restaurant.address}</p>
                      <p>Cuisine: {restaurant.cuisine_type}</p>
                      <p>Active: {restaurant.is_active ? 'Yes' : 'No'}</p>
                      <div className="card-actions">
                        <button onClick={() => startEditRestaurant(restaurant)}>Edit</button>
                        <button onClick={() => deleteRestaurant(restaurant.id)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admin-analytics' && user?.role === 'admin' && (
          <div className="analytics-section">
            <h2>System Analytics</h2>
            <div className="analytics-grid">
              <div className="metric-card">
                <h3>Total Orders</h3>
                <p className="metric-value">{adminData.analytics.total_orders || 0}</p>
              </div>
              <div className="metric-card">
                <h3>Total Revenue</h3>
                <p className="metric-value">${adminData.analytics.total_revenue || 0}</p>
              </div>
              <div className="metric-card">
                <h3>Popular Restaurants</h3>
                <ul>
                  {adminData.analytics.popular_restaurants?.slice(0, 5).map(r => (
                    <li key={r.name}>{r.name}: {r.orders} orders</li>
                  )) || []}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
