#!/usr/bin/env python3

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, Restaurant, Menu
from auth import get_password_hash

def populate_sample_data():
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Create admin user
        admin_user = User(
            email="admin@restaurantpro.com",
            username="admin",
            full_name="System Admin",
            hashed_password=get_password_hash("admin"),
            role="admin"
        )
        db.add(admin_user)
        db.commit()

        # Create sample restaurants
        restaurants_data = [
            {
                "name": "Bella Italia",
                "description": "Authentic Italian cuisine",
                "address": "123 Main St, City",
                "phone": "+1-555-0123",
                "email": "info@bellaitalia.com",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "cuisine_type": "Italian",
                "operating_hours": {
                    "monday": "11:00-22:00",
                    "tuesday": "11:00-22:00",
                    "wednesday": "11:00-22:00",
                    "thursday": "11:00-22:00",
                    "friday": "11:00-23:00",
                    "saturday": "12:00-23:00",
                    "sunday": "12:00-21:00"
                }
            },
            {
                "name": "Dragon Palace",
                "description": "Traditional Chinese cuisine",
                "address": "456 Oak Ave, City",
                "phone": "+1-555-0456",
                "email": "contact@dragonpalace.com",
                "latitude": 40.7589,
                "longitude": -73.9851,
                "cuisine_type": "Chinese",
                "operating_hours": {
                    "monday": "11:30-21:30",
                    "tuesday": "11:30-21:30",
                    "wednesday": "11:30-21:30",
                    "thursday": "11:30-21:30",
                    "friday": "11:30-22:30",
                    "saturday": "12:00-22:30",
                    "sunday": "12:00-21:00"
                }
            }
        ]

        restaurants = []
        for restaurant_data in restaurants_data:
            restaurant = Restaurant(**restaurant_data)
            db.add(restaurant)
            db.commit()
            db.refresh(restaurant)
            restaurants.append(restaurant)

        # Create sample menu items
        menu_data = [
            # Bella Italia menu
            {
                "restaurant_id": restaurants[0].id,
                "name": "Margherita Pizza",
                "description": "Fresh mozzarella, tomato sauce, basil",
                "price": 12.99,
                "category": "Pizza",
                "ingredients": ["mozzarella", "tomato sauce", "basil", "olive oil"],
                "allergens": ["dairy"]
            },
            {
                "restaurant_id": restaurants[0].id,
                "name": "Spaghetti Carbonara",
                "description": "Creamy pasta with pancetta and parmesan",
                "price": 14.99,
                "category": "Pasta",
                "ingredients": ["spaghetti", "pancetta", "eggs", "parmesan", "cream"],
                "allergens": ["eggs", "dairy", "gluten"]
            },
            # Dragon Palace menu
            {
                "restaurant_id": restaurants[1].id,
                "name": "Sweet and Sour Chicken",
                "description": "Crispy chicken with sweet and sour sauce",
                "price": 11.99,
                "category": "Main Course",
                "ingredients": ["chicken", "pineapple", "bell peppers", "onions"],
                "allergens": []
            },
            {
                "restaurant_id": restaurants[1].id,
                "name": "Vegetable Fried Rice",
                "description": "Rice stir-fried with mixed vegetables",
                "price": 8.99,
                "category": "Rice",
                "ingredients": ["rice", "carrots", "peas", "corn", "soy sauce"],
                "allergens": ["soy"]
            }
        ]

        for item_data in menu_data:
            menu_item = Menu(**item_data)
            db.add(menu_item)

        db.commit()

        print("Sample data populated successfully!")
        print(f"Created admin user: {admin_user.username}")
        print(f"Created {len(restaurants)} restaurants")
        print(f"Created {len(menu_data)} menu items")

    except Exception as e:
        print(f"Error populating data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_sample_data()
