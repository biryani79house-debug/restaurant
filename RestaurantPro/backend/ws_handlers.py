from fastapi import WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, Order, Driver, Delivery
from auth import get_current_user
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {
            "orders": [],      # For order status updates
            "drivers": [],     # For driver location updates
            "restaurants": [], # For restaurant staff
            "admin": []        # For admin dashboard
        }

    async def connect(self, websocket: WebSocket, room: str, user_id: int):
        await websocket.accept()
        if room not in self.active_connections:
            self.active_connections[room] = []
        self.active_connections[room].append({"websocket": websocket, "user_id": user_id})

    def disconnect(self, websocket: WebSocket, room: str):
        if room in self.active_connections:
            self.active_connections[room] = [
                conn for conn in self.active_connections[room]
                if conn["websocket"] != websocket
            ]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_room(self, message: str, room: str, exclude_user_id: int = None):
        if room in self.active_connections:
            for connection in self.active_connections[room]:
                if exclude_user_id and connection["user_id"] == exclude_user_id:
                    continue
                try:
                    await connection["websocket"].send_text(message)
                except:
                    # Remove broken connections
                    self.active_connections[room].remove(connection)

    async def send_to_user(self, message: str, user_id: int, room: str = None):
        """Send message to specific user in a room"""
        if room and room in self.active_connections:
            for connection in self.active_connections[room]:
                if connection["user_id"] == user_id:
                    try:
                        await connection["websocket"].send_text(message)
                    except:
                        self.active_connections[room].remove(connection)

manager = ConnectionManager()

async def websocket_endpoint(
    websocket: WebSocket,
    room: str,
    token: str = None,
    db: Session = Depends(get_db)
):
    # Authenticate user
    user = None
    if token:
        try:
            from auth import get_current_user
            user = await get_current_user(token, db)
        except:
            await websocket.close(code=1008)  # Policy violation
            return

    if not user:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, room, user.id)

    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            # Handle different message types
            if message_data.get("type") == "order_update":
                # Broadcast order updates to relevant parties
                order_id = message_data.get("order_id")
                order = db.query(Order).filter(Order.id == order_id).first()
                if order:
                    # Notify customer
                    await manager.send_to_user(
                        json.dumps({
                            "type": "order_status_update",
                            "order_id": order_id,
                            "status": order.status
                        }),
                        order.customer_id,
                        "orders"
                    )

                    # Notify restaurant staff
                    await manager.broadcast_to_room(
                        json.dumps({
                            "type": "order_update",
                            "order_id": order_id,
                            "status": order.status,
                            "restaurant_id": order.restaurant_id
                        }),
                        "restaurants"
                    )

            elif message_data.get("type") == "driver_location":
                # Update driver location and broadcast to relevant parties
                driver = db.query(Driver).filter(Driver.user_id == user.id).first()
                if driver:
                    latitude = message_data.get("latitude")
                    longitude = message_data.get("longitude")

                    # Update driver location in database
                    driver.current_latitude = latitude
                    driver.current_longitude = longitude
                    db.commit()

                    # Broadcast to admin and relevant deliveries
                    await manager.broadcast_to_room(
                        json.dumps({
                            "type": "driver_location_update",
                            "driver_id": driver.id,
                            "latitude": latitude,
                            "longitude": longitude
                        }),
                        "admin"
                    )

            elif message_data.get("type") == "subscribe_order":
                # Subscribe to specific order updates
                order_id = message_data.get("order_id")
                order = db.query(Order).filter(Order.id == order_id).first()
                if order and (order.customer_id == user.id or user.role in ["admin", "staff"]):
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "subscription_confirmed",
                            "order_id": order_id
                        }),
                        websocket
                    )

    except WebSocketDisconnect:
        manager.disconnect(websocket, room)

# WebSocket routes for different purposes
async def order_updates_ws(websocket: WebSocket, token: str = None, db: Session = Depends(get_db)):
    await websocket_endpoint(websocket, "orders", token, db)

async def driver_tracking_ws(websocket: WebSocket, token: str = None, db: Session = Depends(get_db)):
    await websocket_endpoint(websocket, "drivers", token, db)

async def restaurant_ws(websocket: WebSocket, token: str = None, db: Session = Depends(get_db)):
    await websocket_endpoint(websocket, "restaurants", token, db)

async def admin_ws(websocket: WebSocket, token: str = None, db: Session = Depends(get_db)):
    await websocket_endpoint(websocket, "admin", token, db)
