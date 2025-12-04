from fastapi import APIRouter

router = APIRouter()

@router.post("/login")
async def login():
    """User login endpoint"""
    return {"message": "Login endpoint - TODO: Implement JWT authentication"}

@router.post("/register")
async def register():
    """User registration endpoint"""
    return {"message": "Register endpoint - TODO: Implement user creation"}
