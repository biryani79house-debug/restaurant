from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from routers import auth, customers, restaurants, admin, delivery, payments
from ws_handlers import order_updates_ws, driver_tracking_ws, restaurant_ws, admin_ws
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="RestaurantPro API", version="1.0.0")

# CORS middleware for frontend integration
# Default to localhost for development; set CORS_ORIGINS env var in production
default_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000")
origins = [origin.strip() for origin in default_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(customers.router, prefix="/api/customers", tags=["customers"])
app.include_router(restaurants.router, prefix="/api/restaurants", tags=["restaurants"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(delivery.router, prefix="/api/delivery", tags=["delivery"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])

# WebSocket endpoints
@app.websocket("/ws/orders")
async def order_updates_endpoint(websocket: WebSocket, token: str = None):
    await order_updates_ws(websocket, token)

@app.websocket("/ws/drivers")
async def driver_tracking_endpoint(websocket: WebSocket, token: str = None):
    await driver_tracking_ws(websocket, token)

@app.websocket("/ws/restaurants")
async def restaurant_endpoint(websocket: WebSocket, token: str = None):
    await restaurant_ws(websocket, token)

@app.websocket("/ws/admin")
async def admin_endpoint(websocket: WebSocket, token: str = None):
    await admin_ws(websocket, token)

@app.get("/")
async def root():
    return {"message": "Welcome to RestaurantPro API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
