# app/api/v1/payments.py

from fastapi import APIRouter, Request, Header, Depends
from app.models.common import success
from app.services.payment_service import PaymentService
from app.repositories.order_repo import OrderRepository
from app.models.order import OrderStatus, PaymentStatus

router = APIRouter(prefix="/payments", tags=["Payments"])


# ── Dependencies ──────────────────────────────────────────────────────────────
def get_payment_svc() -> PaymentService:
    return PaymentService()

def get_order_repo() -> OrderRepository:
    return OrderRepository()


# ── Safepay Webhook ───────────────────────────────────────────────────────────
@router.post("/safepay/webhook")
async def safepay_webhook(
    request: Request,
    x_safepay_signature: str = Header(None, alias="x-sfpy-signature"),
    payment_svc: PaymentService = Depends(get_payment_svc),
    order_repo: OrderRepository = Depends(get_order_repo),
):
    """
    Safepay sends payment events here after customer completes payment.
    Covers: JazzCash, Easypaisa, and card payments.

    Event types we handle:
    - payment:created  → payment received, mark order as PAID
    - payment:failed   → payment failed, cancel order
    """
    payload = await request.body()

    # 1. Always verify signature first — reject unsigned requests
    try:
        event = payment_svc.verify_safepay_webhook(payload, x_safepay_signature or "")
    except Exception:
        return {"status": "ignored", "reason": "invalid signature"}

    event_type   = event.get("type")
    data         = event.get("data", {})
    tracker      = data.get("tracker")
    order_number = data.get("order_id")   # This is the orderNumber we sent

    if not order_number:
        return {"status": "ignored", "reason": "no order_id in event"}

    order = await order_repo.find_by_order_number(order_number)
    if not order:
        return {"status": "ignored", "reason": "order not found"}

    # 2. Handle payment success
    if event_type == "payment:created":
        if order["paymentStatus"] != PaymentStatus.PAID:
            await order_repo.update_status(
                order["id"],
                OrderStatus.CONFIRMED,
                {
                    "paymentStatus":  PaymentStatus.PAID,
                    "safepayTracker": tracker,
                    "paidAmount":     data.get("net_amount", 0) / 100,
                }
            )

    # 3. Handle payment failure
    elif event_type == "payment:failed":
        await order_repo.update_status(
            order["id"],
            OrderStatus.CANCELLED,
            {"paymentStatus": PaymentStatus.FAILED}
        )
        # TODO: restore stock here (call product_repo.update_stock for each item)

    return success(message="Webhook processed")


# ── Get available payment methods ─────────────────────────────────────────────
@router.get("/methods")
async def get_payment_methods():
    """
    Returns list of enabled payment methods.
    Frontend uses this to show payment options dynamically.
    """
    methods = [
        {
            "id":          "cod",
            "name":        "Cash on Delivery",
            "description": "Pay when your order arrives",
            "icon":        "💵",
            "enabled":     True,
        },
        {
            "id":          "jazzcash",
            "name":        "JazzCash",
            "description": "Pay with your JazzCash mobile account",
            "icon":        "📱",
            "enabled":     True,
        },
        {
            "id":          "easypaisa",
            "name":        "Easypaisa",
            "description": "Pay with your Easypaisa mobile account",
            "icon":        "📲",
            "enabled":     True,
        },
        {
            "id":          "safepay",
            "name":        "Credit / Debit Card",
            "description": "Visa, Mastercard via Safepay",
            "icon":        "💳",
            "enabled":     True,
        },
    ]
    return success(data=methods)