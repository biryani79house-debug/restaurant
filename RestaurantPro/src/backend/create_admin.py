#!/usr/bin/env python3

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User
from auth import get_password_hash

def create_admin():
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if admin exists
        admin_user = db.query(User).filter(User.username == "admin").first()
        if admin_user:
            print("Admin user already exists")
            return

        # Create admin user
        admin_user = User(
            email="admin@restaurantpro.com",
            username="admin",
            full_name="System Admin",
            phone="1234567890",
            hashed_password="admin123",
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print("Admin user created successfully!")

    except Exception as e:
        print(f"Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
