from fastapi import APIRouter
from app.core.database import db
from app.models.user_role import UserRole

router = APIRouter()

@router.post("/assign-role")
def assign_role(data: UserRole):
    result = db.user_roles.insert_one(data.dict())
    return {
        "message": "Role assigned",
        "id": str(result.inserted_id)
    }
