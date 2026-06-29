from bson import ObjectId
from datetime import datetime, timezone
from app.db.mongodb import get_database
from typing import Optional, List


class ProductRepository:
    def __init__(self):
        self.db = get_database()
        self.col = self.db.products

    async def create(self, data: dict) -> dict:
        data["createdAt"] = datetime.now(timezone.utc)
        data["updatedAt"] = datetime.now(timezone.utc)
        result = await self.col.insert_one(data)
        return await self.find_by_id(str(result.inserted_id))

    async def find_by_id(self, product_id: str) -> Optional[dict]:
        if not ObjectId.is_valid(product_id):
            return None
        doc = await self.col.find_one({"_id": ObjectId(product_id)})
        return self._serialize(doc)

    async def find_by_slug(self, slug: str) -> Optional[dict]:
        doc = await self.col.find_one({"slug": slug, "isActive": True})
        return self._serialize(doc)

    async def find_many(
        self,
        page: int = 1,
        limit: int = 20,
        category_id: str = None,
        search: str = None,
        sort: str = "createdAt",
        order: int = -1,
        min_price: float = None,
        max_price: float = None,
    ):
        query = {"isActive": True}

        if category_id:
            query["categoryId"] = category_id

        if search:
            query["$text"] = {"$search": search}

        if min_price is not None or max_price is not None:
            query["price"] = {}
            if min_price is not None:
                query["price"]["$gte"] = min_price
            if max_price is not None:
                query["price"]["$lte"] = max_price

        skip = (page - 1) * limit
        total = await self.col.count_documents(query)
        cursor = self.col.find(query).sort(sort, order).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [self._serialize(d) for d in docs], total

    async def update(self, product_id: str, data: dict) -> Optional[dict]:
        data["updatedAt"] = datetime.now(timezone.utc)
        await self.col.update_one({"_id": ObjectId(product_id)}, {"$set": data})
        return await self.find_by_id(product_id)

    async def update_stock(self, product_id: str, quantity_change: int):
        """Atomic stock decrement — safe for concurrent orders"""
        result = await self.col.update_one(
            {"_id": ObjectId(product_id), "stock": {"$gte": abs(quantity_change)}},
            {"$inc": {"stock": quantity_change}},
        )
        return result.modified_count > 0

    async def delete(self, product_id: str):
        await self.col.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": {"isActive": False}},
        )

    def _serialize(self, doc: Optional[dict]) -> Optional[dict]:
        if not doc:
            return None
        doc["id"] = str(doc.pop("_id"))
        if "categoryId" in doc and isinstance(doc["categoryId"], ObjectId):
            doc["categoryId"] = str(doc["categoryId"])
        return doc
