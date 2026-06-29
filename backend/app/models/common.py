from pydantic import BaseModel, Field
from bson import ObjectId
from typing import Any, Optional, Generic, TypeVar, List

T = TypeVar("T")


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)


class PaginatedResponse(BaseModel):
    success: bool = True
    data: List[Any]
    pagination: dict


class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None


def success(data=None, message="Success"):
    return {"success": True, "message": message, "data": data}


def paginated(data: list, page: int, limit: int, total: int):
    return {
        "success": True,
        "data": data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": -(-total // limit),  # ceiling division
        },
    }
