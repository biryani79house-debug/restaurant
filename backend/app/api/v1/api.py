from fastapi import APIRouter

from app.api.v1.endpoints import auth, menu, orders, payments, analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(menu.router, prefix="/menu", tags=["menu"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
