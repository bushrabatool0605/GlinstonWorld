# app/models/order.py  — REPLACE your existing file with this

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class OrderStatus(str, Enum):
    PENDING           = "pending"
    CONFIRMED         = "confirmed"       # COD orders start here
    PAID              = "paid"            # Online payment received
    PROCESSING        = "processing"
    SHIPPED           = "shipped"
    OUT_FOR_DELIVERY  = "out_for_delivery"
    DELIVERED         = "delivered"
    CANCELLED         = "cancelled"
    REFUNDED          = "refunded"


class PaymentMethod(str, Enum):
    COD       = "cod"
    SAFEPAY   = "safepay"
    JAZZCASH  = "jazzcash"
    EASYPAISA = "easypaisa"


class PaymentStatus(str, Enum):
    PENDING  = "pending"
    PAID     = "paid"
    FAILED   = "failed"
    REFUNDED = "refunded"


class ShippingAddressSchema(BaseModel):
    name:       str
    phone:      str
    street:     str
    city:       str
    province:   str
    postalCode: str
    country:    str = "Pakistan"


class PlaceOrderRequest(BaseModel):
    shippingAddress: ShippingAddressSchema
    paymentMethod:   PaymentMethod = PaymentMethod.COD
    notes:           Optional[str] = None


class OrderItemOut(BaseModel):
    productId:    str
    productName:  str
    productImage: Optional[str] = None
    quantity:     int
    unitPrice:    float
    totalPrice:   float


class OrderOut(BaseModel):
    id:              str
    orderNumber:     str
    userId:          str
    status:          OrderStatus
    paymentStatus:   PaymentStatus
    paymentMethod:   PaymentMethod
    items:           List[OrderItemOut]
    shippingAddress: ShippingAddressSchema
    subtotal:        float
    tax:             float
    shippingCost:    float
    total:           float

    # For online payments — Safepay redirect URL
    redirectUrl:     Optional[str] = None
    safepayTracker:  Optional[str] = None

    notes:           Optional[str] = None
    trackingNumber:  Optional[str] = None
    createdAt:       datetime


class UpdateOrderStatus(BaseModel):
    status:         OrderStatus
    trackingNumber: Optional[str] = None
