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

  useEffect(() => {
    // Mock login for demo - in production, implement proper authentication
    setUser({ id: 1, role: 'staff', restaurant_id: 1 });
    loadOrders();
    loadMenu();
  }, [selectedRestaurant]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/restaurants/${selectedRestaurant}/orders`, {
        headers: {
          'Authorization': 'Bearer mock-token' // In production, get from auth
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
          'Authorization': 'Bearer mock-token'
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
          'Authorization': 'Bearer mock-token'
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

  return (
    <div className="App">
      <header className="dashboard-header">
        <h1>RestaurantPro - Staff Dashboard</h1>
        <div className="user-info">
          <span>Welcome, Staff Member</span>
        </div>
      </header>

      <nav className="dashboard-nav">
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
      </main>
    </div>
  );
}

export default App;
