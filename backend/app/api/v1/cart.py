from fastapi import APIRouter, Depends
from app.models.cart import CartItemAdd, CartItemUpdate
from app.models.common import success
from app.services.cart_service import CartService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("")
async def get_cart(current_user: dict = Depends(get_current_user)):
    service = CartService()
    cart = await service.get_cart(current_user["id"])
    return success(data=cart)


@router.post("/items", status_code=201)
async def add_item(data: CartItemAdd, current_user: dict = Depends(get_current_user)):
    service = CartService()
    cart = await service.add_item(current_user["id"], data)
    return success(data=cart, message="Item added to cart")


@router.patch("/items/{product_id}")
async def update_item(
    product_id: str,
    data: CartItemUpdate,
    current_user: dict = Depends(get_current_user),
):
    service = CartService()
    cart = await service.update_item(current_user["id"], product_id, data)
    return success(data=cart, message="Cart updated")


@router.delete("")
async def clear_cart(current_user: dict = Depends(get_current_user)):
    service = CartService()
    await service.clear_cart(current_user["id"])
    return success(message="Cart cleared")
