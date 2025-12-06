from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..dependencies import get_db
from app.models import MenuItem as MenuItemModel
from app.schemas import MenuItem, MenuItemCreate, MenuItemUpdate

router = APIRouter()

@router.get("/", response_model=List[MenuItem])
async def get_menu(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    available_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get menu items with optional filters"""
    query = db.query(MenuItemModel)

    if category:
        query = query.filter(MenuItemModel.category == category)

    if available_only:
        query = query.filter(MenuItemModel.available == True)

    menu_items = query.offset(skip).limit(limit).all()
    return menu_items

@router.get("/{item_id}", response_model=MenuItem)
async def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Get specific menu item"""
    menu_item = db.query(MenuItemModel).filter(MenuItemModel.id == item_id).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return menu_item

@router.post("/", response_model=MenuItem)
async def create_menu_item(menu_item: MenuItemCreate, db: Session = Depends(get_db)):
    """Create new menu item (admin only)"""
    db_menu_item = MenuItemModel(
        name=menu_item.name,
        price=menu_item.price,
        category=menu_item.category,
        description=menu_item.description,
        available=menu_item.available
    )
    db.add(db_menu_item)
    db.commit()
    db.refresh(db_menu_item)
    return db_menu_item

@router.put("/{item_id}", response_model=MenuItem)
async def update_menu_item(
    item_id: int,
    menu_item_update: MenuItemUpdate,
    db: Session = Depends(get_db)
):
    """Update menu item (admin only)"""
    db_menu_item = db.query(MenuItemModel).filter(MenuItemModel.id == item_id).first()
    if not db_menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    update_data = menu_item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_menu_item, field, value)

    db.commit()
    db.refresh(db_menu_item)
    return db_menu_item

@router.delete("/{item_id}")
async def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Delete menu item (admin only)"""
    db_menu_item = db.query(MenuItemModel).filter(MenuItemModel.id == item_id).first()
    if not db_menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    db.delete(db_menu_item)
    db.commit()
    return {"message": "Menu item deleted successfully"}
