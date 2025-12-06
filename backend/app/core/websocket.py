from fastapi import WebSocket, APIRouter
from typing import List, Dict
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.admin_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, is_admin: bool = False):
        await websocket.accept()
        if is_admin:
            self.admin_connections.append(websocket)
        else:
            self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket, is_admin: bool = False):
        if is_admin:
            self.admin_connections.remove(websocket)
        else:
            self.active_connections.remove(websocket)

    async def broadcast_to_admins(self, message: Dict):
        """Send message to all admin connections"""
        for connection in self.admin_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending to admin: {e}")
                self.admin_connections.remove(connection)

    async def notify_new_order(self, order_data: Dict):
        """Notify admins of new order"""
        message = {
            "type": "new_order",
            "data": order_data
        }
        await self.broadcast_to_admins(message)

    async def notify_order_status_change(self, order_id: int, status: str):
        """Notify admins of order status change"""
        message = {
            "type": "order_status_change",
            "data": {
                "order_id": order_id,
                "status": status
            }
        }
        await self.broadcast_to_admins(message)

@router.websocket("/ws/admin")
async def admin_websocket(websocket: WebSocket):
    await manager.connect(websocket, is_admin=True)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
    except Exception as e:
        print(f"Admin websocket error: {e}")
    finally:
        manager.disconnect(websocket, is_admin=True)

# Global connection manager instance
manager = ConnectionManager()
