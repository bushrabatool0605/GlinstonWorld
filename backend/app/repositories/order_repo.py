from bson import ObjectId
from datetime import datetime, timezone
from app.db.mongodb import get_database
from typing import Optional
import random
import string


def generate_order_number() -> str:
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=8))
    return f"ORD-{suffix}"


class OrderRepository:
    def __init__(self):
        self.db = get_database()
        self.col = self.db.orders

    async def create(self, data: dict) -> dict:
        data["orderNumber"] = generate_order_number()
        data["createdAt"] = datetime.now(timezone.utc)
        data["updatedAt"] = datetime.now(timezone.utc)
        result = await self.col.insert_one(data)
        return await self.find_by_id(str(result.inserted_id))

    async def find_by_id(self, order_id: str) -> Optional[dict]:
        if not ObjectId.is_valid(order_id):
            return None
        doc = await self.col.find_one({"_id": ObjectId(order_id)})
        return self._serialize(doc)

    async def find_by_order_number(self, order_number: str) -> Optional[dict]:
        doc = await self.col.find_one({"orderNumber": order_number})
        return self._serialize(doc)

    async def find_by_payment_intent(self, payment_intent_id: str) -> Optional[dict]:
        doc = await self.col.find_one({"paymentIntentId": payment_intent_id})
        return self._serialize(doc)
    async def update_payment_info(self, order_id: str, tracker: str = None, intent_id: str = None):
        update = {"updatedAt": datetime.now(timezone.utc)}
        if tracker:
            update["safepayTracker"] = tracker
        if intent_id:
            update["paymentIntentId"] = intent_id
        await self.col.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": update}
        )
    async def update_status(self, order_id: str, status: str, extra: dict = None):
        update = {
        "status":    status,
        "updatedAt": datetime.now(timezone.utc),
        }
        if extra:
            update.update(extra)
        await self.col.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": update}
        )
        return await self.find_by_id(order_id)
    async def find_by_user(self, user_id: str, page: int = 1, limit: int = 10):
        skip = (page - 1) * limit
        total = await self.col.count_documents({"userId": user_id})
        cursor = (
            self.col.find({"userId": user_id})
            .sort("createdAt", -1)
            .skip(skip)
            .limit(limit)
        )
        docs = await cursor.to_list(length=limit)
        return [self._serialize(d) for d in docs], total

    async def find_all(self, page: int = 1, limit: int = 20, status: str = None):
        query = {}
        if status:
            query["status"] = status
        skip = (page - 1) * limit
        total = await self.col.count_documents(query)
        cursor = self.col.find(query).sort("createdAt", -1).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [self._serialize(d) for d in docs], total

    async def update_status(self, order_id: str, status: str, extra: dict = None):
        update = {"status": status, "updatedAt": datetime.now(timezone.utc)}
        if extra:
            update.update(extra)
        await self.col.update_one({"_id": ObjectId(order_id)}, {"$set": update})
        return await self.find_by_id(order_id)

    def _serialize(self, doc: Optional[dict]) -> Optional[dict]:
        if not doc:
            return None
        doc["id"] = str(doc.pop("_id"))
        return doc
