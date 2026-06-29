from bson import ObjectId
from datetime import datetime, timezone, timedelta
from app.db.mongodb import get_database
from typing import Optional


class CartRepository:
    def __init__(self):
        self.db = get_database()
        self.col = self.db.carts

    async def get_by_user(self, user_id: str) -> Optional[dict]:
        doc = await self.col.find_one({"userId": user_id})
        return self._serialize(doc)

    async def upsert(self, user_id: str, items: list) -> dict:
        expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        result = await self.col.find_one_and_update(
            {"userId": user_id},
            {
                "$set": {
                    "items": items,
                    "updatedAt": datetime.now(timezone.utc),
                    "expiresAt": expires_at,
                },
                "$setOnInsert": {"userId": user_id},
            },
            upsert=True,
            return_document=True,
        )
        return self._serialize(result)

    async def clear(self, user_id: str):
        await self.col.update_one(
            {"userId": user_id}, {"$set": {"items": [], "updatedAt": datetime.now(timezone.utc)}}
        )

    def _serialize(self, doc: Optional[dict]) -> Optional[dict]:
        if not doc:
            return None
        doc["id"] = str(doc.pop("_id"))
        return doc
