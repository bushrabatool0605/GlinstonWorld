# app/api/v1/orders.py  — REPLACE your existing file

from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.models.order import PlaceOrderRequest, UpdateOrderStatus
from app.models.common import success, paginated
from app.services.order_service import OrderService
from app.core.dependencies import get_current_user, require_admin

router = APIRouter(tags=["Orders"])


# ── Customer routes ───────────────────────────────────────────────────────────

@router.post("/orders", status_code=201)
async def place_order(
    data: PlaceOrderRequest,
    current_user: dict = Depends(get_current_user),
):
    service = OrderService()
    order   = await service.place_order(current_user["id"], current_user, data)

    # COD vs online payment — different messages
    if data.paymentMethod == "cod":
        message = "Order confirmed! We will deliver to your address."
    else:
        message = "Order created! Complete payment to confirm."

    return success(data=order, message=message)


@router.get("/orders")
async def my_orders(
    page:  int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
):
    service = OrderService()
    orders, total = await service.get_user_orders(current_user["id"], page, limit)
    return paginated(orders, page, limit, total)


@router.get("/orders/{order_number}")
async def get_order(
    order_number: str,
    current_user: dict = Depends(get_current_user),
):
    service = OrderService()
    order   = await service.get_order_detail(order_number, current_user["id"])
    return success(data=order)


# ── Admin routes ──────────────────────────────────────────────────────────────

@router.get("/admin/orders", dependencies=[Depends(require_admin)])
async def admin_list_orders(
    page:   int = Query(1, ge=1),
    limit:  int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
):
    service = OrderService()
    orders, total = await service.admin_get_all(page, limit, status)
    return paginated(orders, page, limit, total)


@router.patch("/admin/orders/{order_id}/status", dependencies=[Depends(require_admin)])
async def update_order_status(order_id: str, data: UpdateOrderStatus):
    service = OrderService()
    order   = await service.admin_update_status(order_id, data.status, data.trackingNumber)
    return success(data=order, message="Order status updated")
