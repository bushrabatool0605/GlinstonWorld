# app/services/order_service.py — REPLACE existing file

from app.repositories.order_repo import OrderRepository
from app.repositories.cart_repo import CartRepository
from app.repositories.product_repo import ProductRepository
from app.services.payment_service import PaymentService, PaymentMethod
from app.core.exceptions import BadRequestException, NotFoundException
from app.models.order import PlaceOrderRequest, OrderStatus, PaymentStatus


class OrderService:
    def __init__(self):
        self.order_repo    = OrderRepository()
        self.cart_repo     = CartRepository()
        self.product_repo  = ProductRepository()
        self.payment_svc   = PaymentService()

    async def place_order(self, user_id: str, user: dict, data: PlaceOrderRequest) -> dict:

    

        # 2. Get cart
        cart = await self.cart_repo.get_by_user(user_id)
        if not cart or not cart.get("items"):
            raise BadRequestException("Your cart is empty")

        # 3. Build order items — server-side price + per-product delivery charge
        order_items      = []
        subtotal         = 0.0
        total_delivery   = 0.0   # sum of each product's delivery charge

        for item in cart["items"]:
            product = await self.product_repo.find_by_id(item["productId"])
            if not product:
                raise BadRequestException("A product in your cart no longer exists")
            if not product.get("isActive"):
                raise BadRequestException(f"'{product['name']}' is no longer available")
            if product["stock"] < item["quantity"]:
                raise BadRequestException(
                    f"Only {product['stock']} units left for '{product['name']}'"
                )

            line_total = product["price"] * item["quantity"]
            subtotal  += line_total

            # Use product's own delivery charge
            # If product has no delivery charge set, fall back to store default
            product_delivery = product.get("deliveryCharge")
            if product_delivery is None:
                product_delivery = 200.0

            # Delivery charge is per-order not per-quantity
            # So we take the highest delivery charge across all products
            # (most common real-world approach for multi-product carts)
            total_delivery = max(total_delivery, product_delivery)

            order_items.append({
                "productId":      item["productId"],
                "productName":    product["name"],
                "productImage":   product["images"][0] if product.get("images") else None,
                "quantity":       item["quantity"],
                "unitPrice":      product["price"],
                "totalPrice":     line_total,
                "deliveryCharge": product_delivery,
            })

        # 4. Calculate totals
        tax   = 0
        total = round(subtotal + tax + total_delivery, 2)

        # 5. Lock stock
        for item in order_items:
            ok = await self.product_repo.update_stock(item["productId"], -item["quantity"])
            if not ok:
                raise BadRequestException(f"Stock unavailable for '{item['productName']}'")

        # 6. Set status
        payment_method = data.paymentMethod.value
        if payment_method == PaymentMethod.COD:
            order_status   = OrderStatus.CONFIRMED
            payment_status = PaymentStatus.PENDING
        else:
            order_status   = OrderStatus.PENDING
            payment_status = PaymentStatus.PENDING

        # 7. Create order
        order_doc = {
            "userId":          user_id,
            "status":          order_status,
            "paymentStatus":   payment_status,
            "paymentMethod":   payment_method,
            "items":           order_items,
            "shippingAddress": data.shippingAddress.model_dump(),
            "subtotal":        round(subtotal, 2),
            "tax":             tax,
            "shippingCost":    total_delivery,
            "total":           total,
            "notes":           data.notes,
        }

        order = await self.order_repo.create(order_doc)

        # 8. Process payment
        if payment_method == PaymentMethod.COD:
            await self.payment_svc.process_cod(order["id"], total)
        elif payment_method in [
            PaymentMethod.SAFEPAY,
            PaymentMethod.JAZZCASH,
            PaymentMethod.EASYPAISA,
        ]:
            result = await self.payment_svc.create_safepay_session(
                order_id=order["id"],
                order_number=order["orderNumber"],
                amount_pkr=total,
                customer_email=user.get("email", ""),
                customer_name=user.get("name", ""),
                payment_method=payment_method,
            )
            print("SAFEPAY RESULT:", result)  # yeh add karo
            await self.order_repo.update_payment_info(
                order["id"], tracker=result.get("tracker")
            )
            order["redirectUrl"]    = result.get("redirect_url")
            order["safepayTracker"] = result.get("tracker")

        # 9. Clear cart
        await self.cart_repo.clear(user_id)
        return order

    async def get_user_orders(self, user_id: str, page: int, limit: int):
        return await self.order_repo.find_by_user(user_id, page, limit)

    async def get_order_detail(self, order_number: str, user_id: str) -> dict:
        order = await self.order_repo.find_by_order_number(order_number)
        if not order:
            raise NotFoundException("Order not found")
        if order["userId"] != user_id:
            raise NotFoundException("Order not found")
        return order

    async def admin_get_all(self, page: int, limit: int, status: str = None):
        return await self.order_repo.find_all(page, limit, status)

    async def admin_update_status(self, order_id: str, status: str, tracking: str = None) -> dict:
        order = await self.order_repo.find_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")
        extra = {}
        if tracking:
            extra["trackingNumber"] = tracking
        if status == OrderStatus.DELIVERED and order.get("paymentMethod") == "cod":
            extra["paymentStatus"] = PaymentStatus.PAID
        return await self.order_repo.update_status(order_id, status, extra)
