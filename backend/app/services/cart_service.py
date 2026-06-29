# app/services/cart_service.py — REPLACE

from app.repositories.cart_repo import CartRepository
from app.repositories.product_repo import ProductRepository
from app.core.exceptions import NotFoundException, BadRequestException
from app.models.cart import CartItemAdd, CartItemUpdate


class CartService:
    def __init__(self):
        self.cart_repo    = CartRepository()
        self.product_repo = ProductRepository()

    async def get_cart(self, user_id: str) -> dict:
        cart = await self.cart_repo.get_by_user(user_id)
        if not cart:
            return self._empty_cart(user_id)
        return await self._enrich_cart(cart)

    async def add_item(self, user_id: str, data: CartItemAdd) -> dict:
        product = await self.product_repo.find_by_id(data.productId)
        if not product:
            raise NotFoundException("Product not found")
        if not product.get("isActive"):
            raise BadRequestException("This product is not available")
        if product["stock"] < data.quantity:
            raise BadRequestException(f"Only {product['stock']} units available")

        cart  = await self.cart_repo.get_by_user(user_id)
        items = cart["items"] if cart else []

        found = False
        for item in items:
            if item["productId"] == data.productId:
                new_qty = item["quantity"] + data.quantity
                if new_qty > product["stock"]:
                    raise BadRequestException(f"Maximum available stock: {product['stock']}")
                item["quantity"]     = new_qty
                item["priceAtTime"]  = product["price"]
                found = True
                break

        if not found:
            items.append({
                "productId":      data.productId,
                "quantity":       data.quantity,
                "priceAtTime":    product["price"],
            })

        cart = await self.cart_repo.upsert(user_id, items)
        return await self._enrich_cart(cart)

    async def update_item(self, user_id: str, product_id: str, data: CartItemUpdate) -> dict:
        cart = await self.cart_repo.get_by_user(user_id)
        if not cart:
            raise NotFoundException("Cart is empty")

        items = cart["items"]

        if data.quantity == 0:
            items = [i for i in items if i["productId"] != product_id]
        else:
            product = await self.product_repo.find_by_id(product_id)
            if not product:
                raise NotFoundException("Product not found")
            if data.quantity > product["stock"]:
                raise BadRequestException(f"Only {product['stock']} units available")

            found = False
            for item in items:
                if item["productId"] == product_id:
                    item["quantity"]    = data.quantity
                    item["priceAtTime"] = product["price"]
                    found = True
                    break
            if not found:
                raise NotFoundException("Item not in cart")

        cart = await self.cart_repo.upsert(user_id, items)
        return await self._enrich_cart(cart)

    async def clear_cart(self, user_id: str):
        await self.cart_repo.clear(user_id)

    async def _enrich_cart(self, cart: dict) -> dict:
        """
        Attach product details to each cart item.
        Includes deliveryCharge so frontend can show
        accurate delivery cost at checkout.
        """
        enriched_items = []
        total_amount   = 0.0

        for item in cart.get("items", []):
            product = await self.product_repo.find_by_id(item["productId"])
            if product and product.get("isActive"):
                subtotal     = item["priceAtTime"] * item["quantity"]
                total_amount += subtotal
                enriched_items.append({
                    "productId":      item["productId"],
                    "productName":    product["name"],
                    "productImage":   product["images"][0] if product.get("images") else None,
                    "price":          item["priceAtTime"],
                    "quantity":       item["quantity"],
                    "subtotal":       round(subtotal, 2),
                    # deliveryCharge included so Checkout.js can calculate
                    # the exact delivery cost matching what backend will charge
                    "deliveryCharge": product.get("deliveryCharge", 200.0),
                })

        return {
            "id":          cart["id"],
            "userId":      cart["userId"],
            "items":       enriched_items,
            "totalItems":  sum(i["quantity"] for i in enriched_items),
            "totalAmount": round(total_amount, 2),
        }

    def _empty_cart(self, user_id: str) -> dict:
        return {
            "id":          None,
            "userId":      user_id,
            "items":       [],
            "totalItems":  0,
            "totalAmount": 0.0,
        }
