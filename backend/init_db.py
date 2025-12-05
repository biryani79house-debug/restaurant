#!/usr/bin/env python3

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from decouple import config
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models import Base, MenuItem

def init_database():
    """Initialize the database with tables and sample data"""
    DATABASE_URL = config('DATABASE_URL', default='postgresql://restaurant_user:restaurant_password@localhost/restaurant_db')

    print(f"Connecting to database: {DATABASE_URL}")

    # Create engine
    engine = create_engine(DATABASE_URL)

    try:
        # Create all tables
        print("Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully!")

        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()

        try:
            # Check if sample data already exists
            existing_items = db.query(MenuItem).count()
            if existing_items > 0:
                print("Sample data already exists, skipping...")
            else:
                # Add sample menu items
                sample_items = [
                    MenuItem(
                        name='Spring Rolls',
                        price=50000,  # 500 INR in paisa
                        category='Appetizers',
                        description='Crispy vegetable spring rolls with sweet chili sauce',
                        available=True
                    ),
                    MenuItem(
                        name='Grilled Salmon',
                        price=150000,  # 1500 INR in paisa
                        category='Main Course',
                        description='Fresh salmon fillet grilled to perfection with herbs',
                        available=True
                    ),
                    MenuItem(
                        name='Chocolate Cake',
                        price=40000,  # 400 INR in paisa
                        category='Desserts',
                        description='Rich chocolate cake with vanilla frosting',
                        available=True
                    ),
                    MenuItem(
                        name='Coffee',
                        price=15000,  # 150 INR in paisa
                        category='Beverages',
                        description='Freshly brewed Arabica coffee',
                        available=True
                    ),
                ]

                for item in sample_items:
                    db.add(item)

                db.commit()
                print("Sample menu items added successfully!")

        except Exception as e:
            print(f"Error adding sample data: {e}")
            db.rollback()
        finally:
            db.close()

    except Exception as e:
        print(f"Error initializing database: {e}")
        return False

    return True

if __name__ == "__main__":
    print("Initializing restaurant database...")
    success = init_database()
    if success:
        print("Database initialization completed successfully!")
    else:
        print("Database initialization failed!")
        sys.exit(1)
