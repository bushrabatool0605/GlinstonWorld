import os
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "GlistonWorld"
    APP_ENV: str = "development"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CLOUDINARY_CLOUD_NAME: str = "detujhlqu"
    CLOUDINARY_API_KEY: str = "952129498535329"
    CLOUDINARY_API_SECRET: str = "3GSehiQw-Ed4csekjt9zTTLTzAY"
    # MongoDB
    MONGODB_URL: str
    DATABASE_NAME: str = "ecommerce_db"

    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    STRIPE_PUBLISHABLE_KEY: str

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

    # Email
    MAIL_FROM: str = "noreply@store.com"
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    model_config = {
        "env_file": str(Path(__file__).resolve().parent.parent.parent / ".env"),
        "case_sensitive": True,
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()