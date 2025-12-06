from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey, func, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100), nullable=False)
    customer_email = Column(String(100), nullable=True)
    customer_phone = Column(String(20), nullable=True)
    delivery_type = Column(String(20), nullable=False)  # 'pickup' or 'delivery'
    delivery_address = Column(Text, nullable=True)
    status = Column(String(20), default='pending', nullable=False)  # pending, accepted, preparing, ready, delivered, cancelled
    total_amount = Column(Integer, nullable=False)  # Total in paisa
    estimated_time = Column(Integer, nullable=True)  # Estimated time in minutes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    name = Column(String(100), nullable=False)  # Store name at time of order
    price = Column(Integer, nullable=False)  # Price at time of order
    quantity = Column(Integer, nullable=False)

    # Relationship
    order = relationship("Order", back_populates="items")
