from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Restaurant, Menu, Order, OrderItem, User
from schemas import Restaurant as RestaurantSchema, Menu as MenuSchema, OrderCreate, Order as OrderSchema
from auth import get_current_active_user

router = APIRouter()

@router.get("/restaurants", response_model=List[RestaurantSchema])
def get_restaurants(
    skip: int = 0,
    limit: int = 100,
    cuisine_type: str = None,
    latitude: float = None,
    longitude: float = None,
    db: Session = Depends(get_db)
):
    query = db.query(Restaurant).filter(Restaurant.is_active == True)
    if cuisine_type:
        query = query.filter(Restaurant.cuisine_type == cuisine_type)
    # Add location-based filtering if coordinates provided
    restaurants = query.offset(skip).limit(limit).all()
    return restaurants

@router.get("/restaurants/{restaurant_id}", response_model=RestaurantSchema)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@router.get("/restaurants/{restaurant_id}/menu", response_model=List[MenuSchema])
def get_restaurant_menu(restaurant_id: int, db: Session = Depends(get_db)):
    menus = db.query(Menu).filter(
        Menu.restaurant_id == restaurant_id,
        Menu.is_available == True
    ).all()
    return menus

@router.post("/orders", response_model=OrderSchema)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Calculate total amount
    total_amount = 0
    order_items = []
    for item in order.items:
        menu_item = db.query(Menu).filter(Menu.id == item.menu_id).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item.menu_id} not found")
        if not menu_item.is_available:
            raise HTTPException(status_code=400, detail=f"Menu item {menu_item.name} is not available")
        item_total = menu_item.price * item.quantity
        total_amount += item_total
        order_items.append({
            "menu_id": item.menu_id,
            "quantity": item.quantity,
            "price": menu_item.price,
            "special_instructions": item.special_instructions
        })

    # Create order
    db_order = Order(
        customer_id=current_user.id,
        restaurant_id=order.restaurant_id,
        order_type=order.order_type,
        total_amount=total_amount,
        delivery_address=order.delivery_address,
        special_instructions=order.special_instructions
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Create order items
    for item_data in order_items:
        db_item = OrderItem(
            order_id=db_order.id,
            **item_data
        )
        db.add(db_item)
    db.commit()

    # Return order with items
    db.refresh(db_order)
    return db_order

@router.get("/orders", response_model=List[OrderSchema])
def get_user_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    orders = db.query(Order).filter(Order.customer_id == current_user.id).all()
    return orders

@router.get("/orders/{order_id}", response_model=OrderSchema)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.customer_id == current_user.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
