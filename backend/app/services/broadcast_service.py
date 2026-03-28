from datetime import datetime, timezone
from fastapi import HTTPException, status
from bson import ObjectId
from app.websocket.connection_manager import manager
from app.core.database import chat_group_member_collection


from app.core.database import (
    chat_group_collection,
    chat_group_member_collection,
    database
)

broadcast_collection = database.broadcasts

async def create_broadcast(current_user: dict, data):

    user_scope = current_user.get("scope")
    user_id = current_user.get("user_id")
    company_id = current_user.get("company_id")

    # 🔒 Rule 1: Company-wide broadcast (admins or employees with Manager role)
    if data.target_type == "all":
        roles = current_user.get("roles", [])
        is_manager = any("manager" in str(r).lower() for r in roles)
        if user_scope not in ["super_admin", "company_admin"] and not is_manager:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins or Managers can broadcast to entire company"
            )

    # 🔒 Rule 2: Group broadcast
    if data.target_type == "group":
        if not data.target_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="target_id is required for group broadcast"
            )

        group = await chat_group_collection.find_one({
            "_id": ObjectId(data.target_id),
            "is_archived": False
        })

        if not group or group["company_id"] != company_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found"
            )

        # Check if user is group lead
        membership = await chat_group_member_collection.find_one({
            "group_id": data.target_id,
            "user_id": user_id,
            "role": "lead",
            "is_active": True
        })

        if not membership and user_scope not in ["super_admin", "company_admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only group lead or admin can broadcast to group"
            )

    broadcast_doc = {
        "company_id": company_id,
        "sender_id": user_id,
        "title": data.title,
        "content": data.content,
        "target_type": data.target_type,
        "target_id": data.target_id,
        "priority": data.priority,
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }

    result = await broadcast_collection.insert_one(broadcast_doc)

    broadcast_payload = {
        "type": "broadcast",
        "broadcast_id": str(result.inserted_id),
        "title": data.title,
        "content": data.content,
        "priority": data.priority,
        "created_at": broadcast_doc["created_at"].isoformat()
    }

    # 🔥 Real-time delivery
    if data.target_type == "all":
        # Send to all connected users
        for uid in manager.user_connections.keys():
            await manager.send_to_user(uid, broadcast_payload)

    if data.target_type == "group":
        members_cursor = chat_group_member_collection.find({
            "group_id": data.target_id,
            "is_active": True
        })

        async for member in members_cursor:
            await manager.send_to_user(member["user_id"], broadcast_payload)

    return str(result.inserted_id)
