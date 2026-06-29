# app/services/payment_service.py

import httpx
import hmac
import hashlib
import json
from enum import Enum
from app.core.config import settings
from app.core.exceptions import PaymentException


class PaymentMethod(str, Enum):
    COD       = "cod"
    SAFEPAY   = "safepay"
    JAZZCASH  = "jazzcash"
    EASYPAISA = "easypaisa"


class PaymentService:

    # ── Cash on Delivery ────────────────────────────────────────────────────
    async def process_cod(self, order_id: str, amount: float) -> dict:
        return {
            "method":     "cod",
            "status":     "pending_delivery",
            "order_id":   order_id,
            "amount_pkr": amount,
            "message":    "Order confirmed. Pay cash on delivery.",
        }

    # ── Safepay ─────────────────────────────────────────────────────────────
    async def create_safepay_session(
        self,
        order_id: str,
        order_number: str,
        amount_pkr: float,
        customer_email: str,
        customer_name: str,
        payment_method: str = "safepay",
    ) -> dict:

        if not settings.SAFEPAY_API_KEY:
            raise PaymentException("Safepay API key not configured")

        amount_paisas = int(amount_pkr * 100)

        is_sandbox = settings.SAFEPAY_ENV == "sandbox"
        api_base_url      = "https://sandbox.api.getsafepay.com" if is_sandbox else "https://api.getsafepay.com"
        checkout_base_url = "https://sandbox.api.getsafepay.com" if is_sandbox else "https://api.getsafepay.com"

        
        payload = {
            "client":      settings.SAFEPAY_API_KEY,
            "environment": settings.SAFEPAY_ENV,
            "amount":      amount_paisas,
            "currency":    "PKR",
            "order_id":    order_number,
            "source":      payment_method,
            "cancel_url":  f"{settings.FRONTEND_URL}/checkout?cancelled=1",
            "success_url": f"{settings.FRONTEND_URL}/orders?payment=success&order={order_number}",
            "webhook_url": f"{settings.BACKEND_URL}/api/v1/payments/safepay/webhook",
            "customer": {
                "email": customer_email,
                "name":  customer_name,
            },
            "metadata": {
                "internal_order_id": order_id,
            },
        }

        headers = {
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{api_base_url}/order/v1/init",
                    json=payload,
                    headers=headers,
                )
                response.raise_for_status()
                data = response.json()
            tracker = data.get("data", {}).get("token")

# track_67f55d4b-7afb-4c22-9e31-2ee9b0e1ad7d  ← full token
# 67f55d4b-7afb-4c22-9e31-2ee9b0e1ad7d        ← sirf yeh chahiye

            #tracker_id = tracker.replace("track_", "") if tracker else None
            if is_sandbox:
                checkout_url = f"{checkout_base_url}/components?env=sandbox&beacon={tracker}"
            else:
                checkout_url = f"{checkout_base_url}/components?beacon={tracker}"

               
            return {
                "method":       payment_method,
                "tracker":      tracker,        # full token save rehne do
                "redirect_url": checkout_url,   # clean UUID wala URL
                "status":       "pending",
}

        except httpx.HTTPStatusError as e:
            raise PaymentException(f"Safepay error: {e.response.text}")
        except Exception as e:
            raise PaymentException(f"Payment session failed: {str(e)}")

    # ── Webhook Verification ─────────────────────────────────────────────────
    def verify_safepay_webhook(self, payload: bytes, signature: str) -> dict:
        if not settings.SAFEPAY_WEBHOOK_SECRET:
            raise PaymentException("Safepay webhook secret not configured")

        expected = hmac.new(
            key=settings.SAFEPAY_WEBHOOK_SECRET.encode(),
            msg=payload,
            digestmod=hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(expected, signature):
            raise PaymentException("Invalid webhook signature")

        return json.loads(payload)
    