from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Restaurant, Menu, Order, OrderItem, User, RestaurantStaff
from schemas import RestaurantCreate, Restaurant as RestaurantSchema, MenuCreate, Menu as MenuSchema, Order as OrderSchema
from auth import get_current_active_user

router = APIRouter()

# Restaurant management endpoints
@router.post("/", response_model=RestaurantSchema)
def create_restaurant(
    restaurant: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Not authorized to create restaurants")

    db_restaurant = Restaurant(**restaurant.dict())
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

@router.get("/{restaurant_id}/orders", response_model=List[OrderSchema])
def get_restaurant_orders(
    restaurant_id: int,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if user has access to this restaurant
    if current_user.role == "staff":
        staff = db.query(RestaurantStaff).filter(
            RestaurantStaff.user_id == current_user.id,
            RestaurantStaff.restaurant_id == restaurant_id
        ).first()
        if not staff:
            raise HTTPException(status_code=403, detail="Not authorized for this restaurant")

    query = db.query(Order).filter(Order.restaurant_id == restaurant_id)
    if status:
        query = query.filter(Order.status == status)
    orders = query.all()
    return orders

@router.put("/{restaurant_id}/orders/{order_id}/status")
def update_order_status(
    restaurant_id: int,
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check authorization
    if current_user.role == "staff":
        staff = db.query(RestaurantStaff).filter(
            RestaurantStaff.user_id == current_user.id,
            RestaurantStaff.restaurant_id == restaurant_id
        ).first()
        if not staff:
            raise HTTPException(status_code=403, detail="Not authorized for this restaurant")

    order = db.query(Order).filter(
        Order.id == order_id,
        Order.restaurant_id == restaurant_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    valid_statuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    order.status = status
    db.commit()
    return {"message": "Order status updated"}

# Menu management
@router.post("/{restaurant_id}/menu", response_model=MenuSchema)
def create_menu_item(
    restaurant_id: int,
    menu: MenuCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check authorization
    if current_user.role == "staff":
        staff = db.query(RestaurantStaff).filter(
            RestaurantStaff.user_id == current_user.id,
            RestaurantStaff.restaurant_id == restaurant_id
        ).first()
        if not staff:
            raise HTTPException(status_code=403, detail="Not authorized for this restaurant")

    if menu.restaurant_id != restaurant_id:
        raise HTTPException(status_code=400, detail="Restaurant ID mismatch")

    db_menu = Menu(**menu.dict())
    db.add(db_menu)
    db.commit()
    db.refresh(db_menu)
    return db_menu

@router.get("/{restaurant_id}/menu", response_model=List[MenuSchema])
def get_restaurant_menu_admin(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check authorization
    if current_user.role == "staff":
        staff = db.query(RestaurantStaff).filter(
            RestaurantStaff.user_id == current_user.id,
            RestaurantStaff.restaurant_id == restaurant_id
        ).first()
        if not staff:
            raise HTTPException(status_code=403, detail="Not authorized for this restaurant")

    menus = db.query(Menu).filter(Menu.restaurant_id == restaurant_id).all()
    return menus

@router.put("/{restaurant_id}/menu/{menu_id}/availability")
def toggle_menu_availability(
    restaurant_id: int,
    menu_id: int,
    is_available: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check authorization
    if current_user.role == "staff":
        staff = db.query(RestaurantStaff).filter(
            RestaurantStaff.user_id == current_user.id,
            RestaurantStaff.restaurant_id == restaurant_id
        ).first()
        if not staff:
            raise HTTPException(status_code=403, detail="Not authorized for this restaurant")

    menu = db.query(Menu).filter(
        Menu.id == menu_id,
        Menu.restaurant_id == restaurant_id
    ).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu item not found")

    menu.is_available = is_available
    db.commit()
    return {"message": "Menu availability updated"}
