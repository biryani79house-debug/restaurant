from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItemBase(BaseModel):
    menu_item_id: int
    name: str
    price: int  # Price in paisa at time of order
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    customer_name: str
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    delivery_type: str  # 'pickup' or 'delivery'
    delivery_address: Optional[str] = None
    status: str = 'pending'
    estimated_time: Optional[int] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]
    total_amount: int  # Total in paisa

class OrderUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    delivery_type: Optional[str] = None
    delivery_address: Optional[str] = None
    status: Optional[str] = None
    estimated_time: Optional[int] = None

class Order(OrderBase):
    id: int
    total_amount: int
    items: List[OrderItem]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
