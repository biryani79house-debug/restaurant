from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    phone = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="customer")  # customer, staff, admin, driver
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    orders = relationship("Order", back_populates="customer")
    addresses = relationship("Address", back_populates="user")

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    address = Column(String)
    phone = Column(String)
    email = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    cuisine_type = Column(String)
    rating = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    operating_hours = Column(JSON)  # Store as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    menus = relationship("Menu", back_populates="restaurant")
    orders = relationship("Order", back_populates="restaurant")
    staff = relationship("RestaurantStaff", back_populates="restaurant")

class Menu(Base):
    __tablename__ = "menus"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    name = Column(String)
    description = Column(Text)
    price = Column(Float)
    category = Column(String)
    image_url = Column(String)
    is_available = Column(Boolean, default=True)
    ingredients = Column(JSON)
    allergens = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    restaurant = relationship("Restaurant", back_populates="menus")
    order_items = relationship("OrderItem", back_populates="menu")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"))
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    order_type = Column(String)  # dine_in, takeaway, delivery
    status = Column(String, default="pending")  # pending, confirmed, preparing, ready, delivered, cancelled
    total_amount = Column(Float)
    delivery_address = Column(String)
    special_instructions = Column(Text)
    payment_status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    customer = relationship("User", back_populates="orders")
    restaurant = relationship("Restaurant", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    menu_id = Column(Integer, ForeignKey("menus.id"))
    quantity = Column(Integer)
    price = Column(Float)
    special_instructions = Column(Text)

    # Relationships
    order = relationship("Order", back_populates="items")
    menu = relationship("Menu", back_populates="order_items")

class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    street = Column(String)
    city = Column(String)
    state = Column(String)
    zip_code = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    is_default = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="addresses")

class RestaurantStaff(Base):
    __tablename__ = "restaurant_staff"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    role = Column(String)  # manager, waiter, chef
    shift_start = Column(DateTime)
    shift_end = Column(DateTime)
    is_active = Column(Boolean, default=True)

    # Relationships
    user = relationship("User")
    restaurant = relationship("Restaurant", back_populates="staff")

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    license_number = Column(String, unique=True)
    vehicle_type = Column(String)  # car, motorcycle, bicycle
    vehicle_plate = Column(String)
    is_available = Column(Boolean, default=True)
    current_latitude = Column(Float)
    current_longitude = Column(Float)
    rating = Column(Float, default=5.0)
    total_deliveries = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User")
    deliveries = relationship("Delivery", back_populates="driver")

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    status = Column(String, default="assigned")  # assigned, picked_up, en_route, delivered
    estimated_delivery_time = Column(DateTime)
    actual_delivery_time = Column(DateTime)
    delivery_notes = Column(Text)
    delivery_fee = Column(Float, default=0.0)
    distance_km = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    order = relationship("Order")
    driver = relationship("Driver", back_populates="deliveries")
