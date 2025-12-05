from fastapi import APIRouter

from app.api.v1.endpoints import auth, menu, orders, payments, analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(menu.router, prefix="/menu", tags=["menu"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

# WebSocket endpoint for real-time notifications
from fastapi import WebSocket, Depends
from app.core.websocket import manager

@api_router.websocket("/ws/admin")
async def admin_websocket(websocket: WebSocket):
    await manager.connect(websocket, is_admin=True)
    try:
        while True:
            # Keep connection alive and handle any incoming messages
            data = await websocket.receive_text()
            # For now, we just keep the connection open
    except Exception:
        manager.disconnect(websocket, is_admin=True)
