from app.db.mongodb import get_database
import asyncio


async def create_indexes():
    db = get_database()

    # Users
    await db.users.create_index("email", unique=True)
    await db.users.create_index("stripeCustomerId")

    # Products
    await db.products.create_index("slug", unique=True)
    await db.products.create_index("categoryId")
    await db.products.create_index("isActive")
    await db.products.create_index([("name", "text"), ("description", "text")])  # full-text search
    await db.products.create_index([("price", 1)])
    await db.products.create_index([("createdAt", -1)])

    # Categories
    await db.categories.create_index("slug", unique=True)
    await db.categories.create_index("parentId")

    # Cart
    await db.carts.create_index("userId", unique=True)
    await db.carts.create_index("expiresAt", expireAfterSeconds=0)  # TTL auto-delete

    # Orders
    await db.orders.create_index("orderNumber", unique=True)
    await db.orders.create_index("userId")
    await db.orders.create_index([("createdAt", -1)])
    await db.orders.create_index("status")
    await db.orders.create_index("paymentIntentId")

    print("✅ MongoDB indexes created")
