from app.repositories.user_repo import UserRepository
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import ConflictException, UnauthorizedException, BadRequestException
from app.models.user import UserCreate, TokenResponse


class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()

    async def register(self, data: UserCreate) -> dict:
        # Check duplicate email
        existing = await self.user_repo.find_by_email(data.email)
        if existing:
            raise ConflictException("Email already registered")

        user_doc = {
            "name": data.name,
            "email": data.email.lower(),
            "passwordHash": hash_password(data.password),
            "role": "customer",
            "isVerified": True,  # Set False when email service is ready
            "address": None,
            "stripeCustomerId": None,
        }

        user = await self.user_repo.create(user_doc)
        return user

    async def login(self, email: str, password: str) -> dict:
        user = await self.user_repo.find_by_email(email)

        if not user or not verify_password(password, user.get("passwordHash", "")):
            raise UnauthorizedException("Invalid email or password")

        if not user.get("isVerified"):
            raise UnauthorizedException("Please verify your email first")

        access_token = create_access_token({"sub": user["id"]})
        refresh_token = create_refresh_token({"sub": user["id"]})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": self._format_user(user),
        }

    async def refresh(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)

        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid refresh token")

        user_id = payload.get("sub")
        user = await self.user_repo.find_by_id(user_id)

        if not user:
            raise UnauthorizedException("User not found")

        new_access_token = create_access_token({"sub": user_id})
        return {"access_token": new_access_token, "token_type": "bearer"}

    def _format_user(self, user: dict) -> dict:
        return {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "isVerified": user["isVerified"],
            "address": user.get("address"),
            "createdAt": user["createdAt"],
        }
