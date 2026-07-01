import os
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "GlistenWorld"
    APP_ENV: str = "development"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CLOUDINARY_CLOUD_NAME: str 
    CLOUDINARY_API_KEY: str 
    CLOUDINARY_API_SECRET: str 
    # MongoDB
    MONGODB_URL: str
    DATABASE_NAME: str = "ecommerce_db"

   
    # Payment Methods
    PAYMENT_METHODS_ENABLED: list = ["cod", "safepay", "jazzcash", "easypaisa"]

    # Safepay
    SAFEPAY_API_KEY: str = ""
    SAFEPAY_WEBHOOK_SECRET: str = ""
    SAFEPAY_ENV: str = "sandbox"

    # URLs
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    ADMIN_URL: str = "http://localhost:3001"
    # COD
    COD_ENABLED: bool = True
    COD_MAX_ORDER_AMOUNT: float = 50000.0

    

    model_config = {
        "env_file": str(Path(__file__).resolve().parent.parent.parent / ".env"),
        "case_sensitive": True,
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()