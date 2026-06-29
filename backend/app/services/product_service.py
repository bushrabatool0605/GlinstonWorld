from app.repositories.product_repo import ProductRepository
from app.core.exceptions import NotFoundException, ConflictException
from app.models.product import ProductCreate, ProductUpdate
import re


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text


class ProductService:
    def __init__(self):
        self.repo = ProductRepository()

    async def create(self, data: ProductCreate) -> dict:
        slug = slugify(data.name)

        # Check slug uniqueness
        existing = await self.repo.find_by_slug(slug)
        if existing:
            slug = f"{slug}-{__import__('time').time_ns() % 10000}"

        doc = data.model_dump()
        doc["slug"] = slug

        return await self.repo.create(doc)

    async def get_by_slug(self, slug: str) -> dict:
        product = await self.repo.find_by_slug(slug)
        if not product:
            raise NotFoundException("Product not found")
        return product

    async def get_by_id(self, product_id: str) -> dict:
        product = await self.repo.find_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")
        return product

    async def list_products(self, page, limit, category_id, search, sort, order, min_price, max_price):
        products, total = await self.repo.find_many(
            page=page,
            limit=limit,
            category_id=category_id,
            search=search,
            sort=sort,
            order=order,
            min_price=min_price,
            max_price=max_price,
        )
        return products, total

    async def update(self, product_id: str, data: ProductUpdate) -> dict:
        product = await self.repo.find_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")

        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        return await self.repo.update(product_id, update_data)

    async def delete(self, product_id: str):
        product = await self.repo.find_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")
        await self.repo.delete(product_id)
