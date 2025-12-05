from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MenuItemBase(BaseModel):
    name: str
    price: int  # Price in paisa
    category: str
    description: Optional[str] = None
    available: bool = True

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[int] = None
    category: Optional[str] = None
    description: Optional[str] = None
    available: Optional[bool] = None

class MenuItem(MenuItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
