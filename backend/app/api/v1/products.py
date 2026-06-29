# app/api/v1/products.py — REPLACE existing file

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.exceptions import RequestValidationError
from typing import Optional
from app.models.product import ProductCreate, ProductUpdate
from app.models.common import success, paginated
from app.services.product_service import ProductService
from app.core.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("")
async def list_products(
    page:      int            = Query(1, ge=1),
    limit:     int            = Query(20, ge=1, le=100),
    category:  Optional[str]  = None,
    search:    Optional[str]  = None,
    sort:      Optional[str]  = Query("createdAt"),
    order:     Optional[int]  = Query(-1),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
):
    service = ProductService()
    products, total = await service.list_products(
        page, limit, category, search, sort, order, min_price, max_price
    )
    return paginated(products, page, limit, total)


@router.get("/{slug}")
async def get_product(slug: str):
    service = ProductService()
    product = await service.get_by_slug(slug)
    return success(data=product)


@router.post("", status_code=201, dependencies=[Depends(require_admin)])
async def create_product(data: ProductCreate):
    """
    Create a new product.
    Returns clear field-level error messages on validation failure.
    """
    service = ProductService()
    product = await service.create(data)
    return success(data=product, message="Product created successfully")


@router.put("/{product_id}", dependencies=[Depends(require_admin)])
async def update_product(product_id: str, data: ProductUpdate):
    service = ProductService()
    product = await service.update(product_id, data)
    return success(data=product, message="Product updated successfully")


@router.delete("/{product_id}", dependencies=[Depends(require_admin)])
async def delete_product(product_id: str):
    service = ProductService()
    await service.delete(product_id)
    return success(message="Product deleted successfully")
