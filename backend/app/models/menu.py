from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, func
from app.core.database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    price = Column(Integer, nullable=False)  # Price in paisa (1 INR = 100 paisa)
    category = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    available = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
