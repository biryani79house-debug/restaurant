from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    role: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None

# Driver schemas
class DriverBase(BaseModel):
    license_number: str
    vehicle_type: str
    vehicle_plate: str
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None

class DriverCreate(DriverBase):
    user_id: int

class Driver(DriverBase):
    id: int
    user_id: int
    is_available: bool
    rating: float
    total_deliveries: int
    created_at: datetime

    class Config:
        from_attributes = True

# Delivery schemas
class DeliveryBase(BaseModel):
    order_id: int
    driver_id: int
    estimated_delivery_time: Optional[datetime] = None
    delivery_notes: Optional[str] = None
    delivery_fee: float = 0.0
    distance_km: Optional[float] = None

class DeliveryCreate(DeliveryBase):
    pass

class Delivery(DeliveryBase):
    id: int
    status: str
    actual_delivery_time: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Restaurant schemas
class RestaurantBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    cuisine_type: str
    operating_hours: Optional[dict] = None

class RestaurantCreate(RestaurantBase):
    pass

class Restaurant(RestaurantBase):
    id: int
    rating: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    cuisine_type: Optional[str] = None
    operating_hours: Optional[dict] = None
    is_active: Optional[bool] = None

# Menu schemas
class MenuBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: str
    image_url: Optional[str] = None
    ingredients: Optional[List[str]] = None
    allergens: Optional[List[str]] = None

class MenuCreate(MenuBase):
    restaurant_id: int

class Menu(MenuBase):
    id: int
    restaurant_id: int
    is_available: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Order schemas
class OrderItemBase(BaseModel):
    menu_id: int
    quantity: int
    special_instructions: Optional[str] = None

class OrderCreate(BaseModel):
    restaurant_id: int
    order_type: str  # dine_in, takeaway, delivery
    items: List[OrderItemBase]
    delivery_address: Optional[str] = None
    special_instructions: Optional[str] = None

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    price: float

    class Config:
        from_attributes = True

class Order(BaseModel):
    id: int
    customer_id: int
    restaurant_id: int
    order_type: str
    status: str
    total_amount: float
    delivery_address: Optional[str] = None
    special_instructions: Optional[str] = None
    payment_status: str
    created_at: datetime
    updated_at: Optional[datetime]
    items: List[OrderItem]

    class Config:
        from_attributes = True
