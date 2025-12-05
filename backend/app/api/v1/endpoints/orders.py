from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..dependencies import get_db
from ...core.websocket import manager
from ...models import Order as OrderModel, OrderItem as OrderItemModel, MenuItem
from ...schemas import OrderCreate, OrderUpdate, Order, OrderItem

router = APIRouter()

@router.post("/", response_model=Order)
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Create new order and notify admins"""
    # Validate menu items exist and are available
    for item in order.items:
        menu_item = db.query(MenuItem).filter(
            MenuItem.id == item.menu_item_id,
            MenuItem.available == True
        ).first()
        if not menu_item:
            raise HTTPException(
                status_code=400,
                detail=f"Menu item {item.menu_item_id} not found or unavailable"
            )

    # Create order
    db_order = OrderModel(
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        customer_phone=order.customer_phone,
        delivery_type=order.delivery_type,
        delivery_address=order.delivery_address,
        status=order.status,
        total_amount=order.total_amount,
    )
    db.add(db_order)
    db.flush()  # Get the order ID

    # Create order items
    for item in order.items:
        db_order_item = OrderItemModel(
            order_id=db_order.id,
            menu_item_id=item.menu_item_id,
            name=item.name,
            price=item.price,
            quantity=item.quantity,
        )
        db.add(db_order_item)

    db.commit()
    db.refresh(db_order)

    # Notify admins of new order
    order_data = {
        "id": db_order.id,
        "customer_name": db_order.customer_name,
        "delivery_type": db_order.delivery_type,
        "total_amount": db_order.total_amount,
        "created_at": db_order.created_at.isoformat(),
        "items": [
            {
                "name": item.name,
                "quantity": item.quantity,
                "price": item.price
            } for item in db_order.items
        ]
    }
    await manager.notify_new_order(order_data)

    return db_order

@router.get("/", response_model=List[Order])
async def get_orders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get orders with optional filters"""
    query = db.query(OrderModel)

    if status:
        query = query.filter(OrderModel.status == status)

    orders = query.offset(skip).limit(limit).all()
    return orders

@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get specific order"""
    order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{order_id}/status", response_model=Order)
async def update_order_status(
    order_id: int,
    status_update: dict,  # Simple dict for status update
    db: Session = Depends(get_db)
):
    """Update order status and notify admins"""
    order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    new_status = status_update.get("status")
    if new_status:
        order.status = new_status
        if new_status in ["accepted", "preparing"]:
            order.estimated_time = status_update.get("estimated_time", 30)

        db.commit()
        db.refresh(order)

        # Notify admins of status change
        await manager.notify_order_status_change(order_id, new_status)

    return order
