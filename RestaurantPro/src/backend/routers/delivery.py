from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Driver, Delivery, Order, User
from schemas import Driver as DriverSchema, DriverCreate, Delivery as DeliverySchema, DeliveryCreate
from auth import get_current_active_user

router = APIRouter()

# Driver management
@router.post("/drivers", response_model=DriverSchema)
def create_driver(
    driver: DriverCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role not in ["admin", "driver"]:
        raise HTTPException(status_code=403, detail="Not authorized to create drivers")

    # Check if user already has a driver profile
    existing_driver = db.query(Driver).filter(Driver.user_id == driver.user_id).first()
    if existing_driver:
        raise HTTPException(status_code=400, detail="Driver profile already exists for this user")

    # Check if license number is unique
    existing_license = db.query(Driver).filter(Driver.license_number == driver.license_number).first()
    if existing_license:
        raise HTTPException(status_code=400, detail="License number already registered")

    db_driver = Driver(**driver.dict())
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver

@router.get("/drivers/me", response_model=DriverSchema)
def get_my_driver_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    return driver

@router.put("/drivers/me/location")
def update_driver_location(
    latitude: float,
    longitude: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")

    driver.current_latitude = latitude
    driver.current_longitude = longitude
    db.commit()
    return {"message": "Location updated"}

@router.put("/drivers/me/availability")
def update_driver_availability(
    is_available: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")

    driver.is_available = is_available
    db.commit()
    return {"message": f"Availability set to {is_available}"}

@router.get("/drivers/available", response_model=List[DriverSchema])
def get_available_drivers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Not authorized to view drivers")

    drivers = db.query(Driver).filter(Driver.is_available == True).all()
    return drivers

# Delivery management
@router.post("/deliveries", response_model=DeliverySchema)
def create_delivery(
    delivery: DeliveryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Not authorized to create deliveries")

    # Verify order exists and needs delivery
    order = db.query(Order).filter(Order.id == delivery.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.order_type != "delivery":
        raise HTTPException(status_code=400, detail="Order does not require delivery")

    # Verify driver exists and is available
    driver = db.query(Driver).filter(Driver.id == delivery.driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    if not driver.is_available:
        raise HTTPException(status_code=400, detail="Driver is not available")

    db_delivery = Delivery(**delivery.dict())
    db.add(db_delivery)
    db.commit()
    db.refresh(db_delivery)

    # Update driver availability
    driver.is_available = False
    db.commit()

    return db_delivery

@router.get("/deliveries/driver/me", response_model=List[DeliverySchema])
def get_my_deliveries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")

    deliveries = db.query(Delivery).filter(Delivery.driver_id == driver.id).all()
    return deliveries

@router.put("/deliveries/{delivery_id}/status")
def update_delivery_status(
    delivery_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")

    delivery = db.query(Delivery).filter(
        Delivery.id == delivery_id,
        Delivery.driver_id == driver.id
    ).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    valid_statuses = ["assigned", "picked_up", "en_route", "delivered"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    delivery.status = status
    if status == "delivered":
        from datetime import datetime
        delivery.actual_delivery_time = datetime.utcnow()
        # Make driver available again
        driver.is_available = True
        # Update driver stats
        driver.total_deliveries += 1

    db.commit()
    return {"message": f"Delivery status updated to {status}"}

@router.get("/deliveries/{delivery_id}", response_model=DeliverySchema)
def get_delivery(
    delivery_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    # Check authorization (admin, staff, or assigned driver)
    if current_user.role not in ["admin", "staff"]:
        driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
        if not driver or driver.id != delivery.driver_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this delivery")

    return delivery
