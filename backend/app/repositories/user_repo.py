from bson import ObjectId
from datetime import datetime, timezone
from app.db.mongodb import get_database
from typing import Optional


class UserRepository:
    def __init__(self):
        self.db = get_database()
        self.col = self.db.users

    async def create(self, data: dict) -> dict:
        data["createdAt"] = datetime.now(timezone.utc)
        data["updatedAt"] = datetime.now(timezone.utc)
        result = await self.col.insert_one(data)
        return await self.find_by_id(str(result.inserted_id))

    async def find_by_email(self, email: str) -> Optional[dict]:
        doc = await self.col.find_one({"email": email.lower()})
        return self._serialize(doc)

    async def find_by_id(self, user_id: str) -> Optional[dict]:
        if not ObjectId.is_valid(user_id):
            return None
        doc = await self.col.find_one({"_id": ObjectId(user_id)})
        return self._serialize(doc)

    async def update(self, user_id: str, data: dict) -> Optional[dict]:
        data["updatedAt"] = datetime.now(timezone.utc)
        await self.col.update_one(
            {"_id": ObjectId(user_id)}, {"$set": data}
        )
        return await self.find_by_id(user_id)

    async def set_verified(self, user_id: str):
        await self.col.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"isVerified": True, "updatedAt": datetime.now(timezone.utc)}},
        )

    async def set_stripe_customer(self, user_id: str, stripe_customer_id: str):
        await self.col.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"stripeCustomerId": stripe_customer_id}},
        )

    def _serialize(self, doc: Optional[dict]) -> Optional[dict]:
        if not doc:
            return None
        doc["id"] = str(doc.pop("_id"))
        return doc
