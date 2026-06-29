from pydantic import BaseModel, Field
from typing import List, Optional


class CartItemAdd(BaseModel):
    productId: str
    quantity: int = Field(..., ge=1, le=100)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=0, le=100)  # 0 = remove


class CartItemOut(BaseModel):
    productId: str
    productName: str
    productImage: Optional[str] = None
    price: float
    quantity: int
    subtotal: float


class CartOut(BaseModel):
    id: str
    userId: str
    items: List[CartItemOut]
    totalItems: int
    totalAmount: float
