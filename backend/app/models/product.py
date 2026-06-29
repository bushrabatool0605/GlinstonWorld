# app/models/product.py — REPLACE existing file

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List


class SEOSchema(BaseModel):
    metaTitle:       Optional[str] = None
    metaDescription: Optional[str] = None


class ProductCreate(BaseModel):
    name:            str   = Field(..., min_length=2, max_length=200)
    description:     str   = Field(..., min_length=5)
    price:           float = Field(..., gt=0)
    comparePrice:    Optional[float] = Field(None, gt=0)
    stock:           int   = Field(..., ge=0)
    categoryId:      str   = Field(default="general")
    deliveryCharge:  float = Field(default=200.0, ge=0,
                                   description="Per-product delivery charge in PKR")
    images:          List[str] = []
    tags:            List[str] = []
    isActive:        bool  = True
    seo:             Optional[SEOSchema] = None

    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Product name cannot be empty')
        return v.strip()

    @field_validator('description')
    @classmethod
    def description_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Description cannot be empty')
        return v.strip()


class ProductUpdate(BaseModel):
    name:           Optional[str]   = None
    description:    Optional[str]   = None
    price:          Optional[float] = Field(None, gt=0)
    comparePrice:   Optional[float] = Field(None, gt=0)
    stock:          Optional[int]   = Field(None, ge=0)
    categoryId:     Optional[str]   = None
    deliveryCharge: Optional[float] = Field(None, ge=0)
    images:         Optional[List[str]] = None
    tags:           Optional[List[str]] = None
    isActive:       Optional[bool]  = None


class ProductOut(BaseModel):
    id:             str
    name:           str
    slug:           str
    description:    str
    price:          float
    comparePrice:   Optional[float] = None
    stock:          int
    categoryId:     str
    deliveryCharge: float = 200.0
    images:         List[str]
    tags:           List[str]
    isActive:       bool
