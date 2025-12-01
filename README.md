# RestaurantPro - Complete Restaurant Management Platform

A comprehensive restaurant ecosystem with customer mobile app, staff dashboard, and admin management portal.

## 🚀 Features

### Customer Experience
- **Discovery**: Browse restaurants with filters and location-based search
- **Ordering**: Seamless ordering with real-time tracking
- **Payments**: Secure payment processing with split payments
- **Loyalty**: Rewards system and personalized offers

### Restaurant Management
- **Order Management**: Real-time order dashboard with status updates
- **Menu Control**: Dynamic menu management and availability toggles
- **Staff Management**: Multi-role access control
- **Analytics**: Performance metrics and reporting

### Delivery System
- **Driver Management**: GPS tracking and route optimization
- **Real-time Updates**: Live delivery tracking for customers
- **Assignment Logic**: Smart driver assignment based on proximity

### Admin Portal
- **Multi-Restaurant**: Centralized management for chains
- **Financial Reports**: Revenue tracking and commission management
- **User Management**: Role-based permissions and access control

## 🏗️ Architecture

```
RestaurantPro/
├── backend/                 # FastAPI Backend
│   ├── main.py             # Main application
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── auth.py             # Authentication
│   ├── database.py         # Database config
│   ├── routers/            # API endpoints
│   ├── websockets.py       # Real-time features
│   └── alembic/            # Database migrations
├── frontend-web-dashboard/ # React Staff Dashboard
├── frontend-admin-portal/  # Admin Management Portal
├── frontend-mobile/        # Mobile App (React Native planned)
├── docs/                   # Documentation
└── tests/                  # Test suites
```

## 🛠️ Tech Stack

### Backend
- **FastAPI**: High-performance async API framework
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL/SQLite**: Database (configurable)
- **Alembic**: Database migrations
- **WebSockets**: Real-time communication

### Frontend
- **React**: Modern UI framework
- **CSS3**: Responsive styling
- **Axios**: HTTP client

### Infrastructure
- **Docker**: Containerization
- **JWT**: Authentication tokens
- **WebSockets**: Real-time features

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd RestaurantPro/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   # On Windows: venv\Scripts\activate
   # On macOS/Linux: source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

5. **Populate sample data:**
   ```bash
   python populate_sample_data.py
   ```

6. **Start the server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to dashboard directory:**
   ```bash
   cd RestaurantPro/frontend-web-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

## 📡 API Documentation

Once the backend is running, visit:
- **API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 🔐 Authentication

### Default Admin Account
- **Username**: admin
- **Password**: admin123

### API Authentication
All protected endpoints require JWT tokens:
```bash
# Get token
POST /auth/token
Content-Type: application/x-www-form-urlencoded

username=admin&password=admin123

# Use token in requests
Authorization: Bearer <your-jwt-token>
```

## 🎯 Key Endpoints

### Customer APIs
- `GET /api/customers/restaurants` - Browse restaurants
- `POST /api/customers/orders` - Place orders
- `GET /api/customers/orders` - View order history

### Restaurant APIs
- `GET /api/restaurants/{id}/orders` - View restaurant orders
- `PUT /api/restaurants/{id}/orders/{order_id}/status` - Update order status
- `GET /api/restaurants/{id}/menu` - Get menu items

### Admin APIs
- `GET /api/admin/users` - Manage users
- `GET /api/admin/analytics/orders` - System analytics
- `PUT /api/admin/users/{id}/role` - Change user roles

### Delivery APIs
- `POST /api/delivery/drivers` - Register drivers
- `GET /api/delivery/drivers/available` - Get available drivers
- `PUT /api/delivery/deliveries/{id}/status` - Update delivery status

## 🌐 WebSocket Endpoints

Real-time features available at:
- `ws://localhost:8000/ws/orders` - Order updates
- `ws://localhost:8000/ws/drivers` - Driver tracking
- `ws://localhost:8000/ws/restaurants` - Restaurant notifications
- `ws://localhost:8000/ws/admin` - Admin dashboard

## 🧪 Testing

### Backend Tests
```bash
cd RestaurantPro/backend
python -m pytest
```

### Frontend Tests
```bash
cd RestaurantPro/frontend-web-dashboard
npm test
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run
docker-compose up --build
```

### Production Deployment
1. Set environment variables
2. Use production WSGI server (Gunicorn)
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Configure database backups

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Granular permissions
- **Input Validation**: Pydantic schema validation
- **CORS Protection**: Configurable cross-origin policies
- **Password Hashing**: bcrypt encryption
- **Rate Limiting**: API rate limiting (configurable)

## 📊 Performance

- **Async Operations**: FastAPI async support
- **Database Optimization**: Indexed queries
- **Caching**: Redis integration (planned)
- **CDN**: Static asset optimization
- **Load Balancing**: Horizontal scaling ready

## 🔄 CI/CD Pipeline

- **Automated Testing**: GitHub Actions
- **Code Quality**: ESLint, Black, Flake8
- **Security Scanning**: Dependabot, Snyk
- **Deployment**: Automated deployment scripts

## 📝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: See `/docs` directory
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## 🎉 Success Metrics

- **Order Processing**: < 2 minutes average
- **App Rating**: Target 4.5+ stars
- **System Uptime**: 99.9% availability
- **Support Response**: < 15 minutes

---

**RestaurantPro** - Revolutionizing restaurant management with modern technology! 🍽️✨
