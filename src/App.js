import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('orders');
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
        loadData();
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const [adminData, setAdminData] = useState({ users: [], restaurants: [], analytics: {} });

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
    if (isLoggedIn) {
      loadData();
    }
  }, [selectedRestaurant, isLoggedIn, loadData]);

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
            <div className="users-list">
              {adminData.users.map(user => (
                <div key={user.id} className="user-card">
                  <h3>{user.username}</h3>
                  <p>Email: {user.email}</p>
                  <p>Role: {user.role}</p>
                  <p>Active: {user.is_active ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'restaurants' && user?.role === 'admin' && (
          <div className="restaurants-section">
            <h2>Restaurant Management</h2>
            <div className="restaurants-list">
              {adminData.restaurants.map(restaurant => (
                <div key={restaurant.id} className="restaurant-card">
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.description}</p>
                  <p>Address: {restaurant.address}</p>
                  <p>Cuisine: {restaurant.cuisine_type}</p>
                  <p>Active: {restaurant.is_active ? 'Yes' : 'No'}</p>
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
