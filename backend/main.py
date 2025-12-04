from fastapi import FastAPI
from app.api.v1.api import api_router

app = FastAPI(
    title="Restaurant Management API",
    description="A comprehensive API for restaurant management including customer ordering and admin dashboard",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.include_router(api_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
