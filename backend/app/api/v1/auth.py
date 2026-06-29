from fastapi import APIRouter, Depends
from app.models.user import UserCreate, UserLogin, RefreshTokenRequest
from app.models.common import success
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=201)
async def register(data: UserCreate):
    service = AuthService()
    user = await service.register(data)
    return success(
        data={"id": user["id"], "name": user["name"], "email": user["email"]},
        message="Account created! Please check your email to verify.",
    )


@router.post("/login")
async def login(data: UserLogin):
    service = AuthService()
    result = await service.login(data.email, data.password)
    return success(data=result, message="Login successful")


@router.post("/refresh")
async def refresh_token(data: RefreshTokenRequest):
    service = AuthService()
    result = await service.refresh(data.refresh_token)
    return success(data=result, message="Token refreshed")


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    # Token blacklist (Redis) yahan implement hoga
    # Abhi ke liye frontend token delete kar deta hai
    return success(message="Logged out successfully")


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    current_user.pop("passwordHash", None)
    return success(data=current_user)
