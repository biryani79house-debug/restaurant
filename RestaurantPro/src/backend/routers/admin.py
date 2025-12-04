from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database import get_db
from models import User, Restaurant, Order, Menu, OrderItem
from schemas import User as UserSchema, UserCreate, UserUpdate, Restaurant as RestaurantSchema, RestaurantCreate, RestaurantUpdate
from auth import get_current_active_user, get_password_hash

router = APIRouter()

# Admin-only endpoints
def check_admin(current_user: User = Depends(get_current_active_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/users", response_model=List[UserSchema])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/restaurants", response_model=List[RestaurantSchema])
def get_all_restaurants(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin)
):
    restaurants = db.query(Restaurant).offset(skip).limit(limit).all()
    return restaurants

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin)
):
    if role not in ["customer", "staff", "admin", "driver"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role
    db.commit()
    return {"message": "User role updated"}

@router.get("/analytics/orders")
def get_order_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin)
):
    # Total orders
    total_orders = db.query(func.count(Order.id)).scalar()

    # Orders by status
    orders_by_status = db.query(
        Order.status,
        func.count(Order.id)
    ).group_by(Order.status).all()

    # Revenue
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0

    # Popular restaurants
    popular_restaurants = db.query(
        Restaurant.name,
        func.count(Order.id).label("order_count")
    ).join(Order).group_by(Restaurant.id).order_by(func.count(Order.id).desc()).limit(10).all()

    return {
        "total_orders": total_orders,
        "orders_by_status": dict(orders_by_status),
        "total_revenue": total_revenue,
        "popular_restaurants": [{"name": r[0], "orders": r[1]} for r in popular_restaurants]
    }

@router.get("/analytics/restaurants/{restaurant_id}")
def get_restaurant_analytics(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Order stats for this restaurant
    total_orders = db.query(func.count(Order.id)).filter(Order.restaurant_id == restaurant_id).scalar()
    total_revenue = db.query(func.sum(Order.total_amount)).filter(Order.restaurant_id == restaurant_id).scalar() or 0

    # Popular menu items
    popular_items = db.query(
        Menu.name,
        func.sum(OrderItem.quantity).label("total_quantity")
    ).join(OrderItem).filter(Menu.restaurant_id == restaurant_id).group_by(Menu.id).order_by(func.sum(OrderItem.quantity).desc()).limit(10).all()

    return {
        "restaurant_name": restaurant.name,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "popular_items": [{"name": i[0], "quantity": i[1]} for i in popular_items]
    }

@router.put("/restaurants/{restaurant_id}/activate")
def activate_restaurant(
    restaurant_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    restaurant.is_active = is_active
    db.commit()
    return {"message": f"Restaurant {'activated' if is_active else 'deactivated'}"}

# CRUD for users
@router.post("/users", response_model=UserSchema)
def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(check_admin)):
    db_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        phone=user.phone,
        hashed_password=hashed_password,
        role="staff"  # default role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/users/{user_id}", response_model=UserSchema)
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(check_admin)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in user.dict(exclude_unset=True).items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(check_admin)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    return {"message": "User deleted"}

# CRUD for restaurants
@router.post("/restaurants", response_model=RestaurantSchema)
def create_restaurant(restaurant: RestaurantCreate, db: Session = Depends(get_db), current_user: User = Depends(check_admin)):
    db_restaurant = Restaurant(**restaurant.dict(), rating=0.0, is_active=True)
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

@router.put("/restaurants/{restaurant_id}", response_model=RestaurantSchema)
def update_restaurant(restaurant_id: int, restaurant: RestaurantUpdate, db: Session = Depends(get_db), current_user: User = Depends(check_admin)):
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    for field, value in restaurant.dict(exclude_unset=True).items():
        setattr(db_restaurant, field, value)

    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

@router.delete("/restaurants/{restaurant_id}")
def delete_restaurant(restaurant_id: int, db: Session = Depends(get_db), current_user: User = Depends(check_admin)):
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    db.delete(db_restaurant)
    db.commit()
    return {"message": "Restaurant deleted"}
