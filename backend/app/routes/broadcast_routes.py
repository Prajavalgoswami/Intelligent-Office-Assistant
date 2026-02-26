from fastapi import APIRouter, Depends, Query
from app.auth.dependencies import get_current_user
from app.schemas.broadcast_schema import CreateBroadcastRequest
from app.services.broadcast_service import create_broadcast
from app.core.database import database
from bson import ObjectId

router = APIRouter(prefix="/broadcasts", tags=["Broadcasts"])

broadcast_collection = database.broadcasts
@router.post("/")
async def create_new_broadcast(
    request: CreateBroadcastRequest,
    current_user=Depends(get_current_user)
):
    broadcast_id = await create_broadcast(current_user, request)

    return {
        "message": "Broadcast created successfully",
        "broadcast_id": broadcast_id
    }
@router.get("/")
async def get_my_broadcasts(current_user=Depends(get_current_user)):
    company_id = current_user["company_id"]
    user_id = current_user["user_id"]

    # Get user's groups
    from app.core.database import chat_group_member_collection

    memberships = chat_group_member_collection.find({
        "user_id": user_id,
        "is_active": True
    })

    group_ids = []
    async for m in memberships:
        group_ids.append(m["group_id"])

    broadcasts_cursor = broadcast_collection.find({
        "company_id": company_id,
        "$or": [
            {"target_type": "all"},
            {"target_type": "group", "target_id": {"$in": group_ids}}
        ],
        "is_active": True
    }).sort("created_at", -1)

    broadcasts = []
    async for b in broadcasts_cursor:
        b["_id"] = str(b["_id"])
        broadcasts.append(b)

    return broadcasts
