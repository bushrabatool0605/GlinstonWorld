from fastapi import APIRouter, Depends
from app.core.dependencies import require_admin
from app.db.mongodb import get_database
from app.models.common import success

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", dependencies=[Depends(require_admin)])
async def get_all_users():
    db = get_database()
    cursor = db.users.find({}, {"passwordHash": 0}).sort("createdAt", -1).limit(200)
    users = await cursor.to_list(length=200)
    for u in users:
        u["id"] = str(u.pop("_id"))
    return success(data=users)
