from datetime import datetime, timezone
from fastapi import HTTPException, status
from bson import ObjectId

from app.core.database import (
    chat_group_collection,
    chat_group_member_collection,
    chat_message_collection
)

async def send_message_to_group(group_id: str, user_id: str, company_id: str, content: str):

    # 🔎 Validate group exists
    group = await chat_group_collection.find_one({
        "_id": ObjectId(group_id),
        "is_archived": False
    })

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )

    # 🔒 Ensure same company
    if group["company_id"] != company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to access this group"
        )

    # 🔎 Validate membership
    membership = await chat_group_member_collection.find_one({
        "group_id": group_id,
        "user_id": user_id,
        "is_active": True
    })

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group"
        )

    message_doc = {
        "company_id": company_id,
        "group_id": group_id,
        "sender_id": user_id,
        "content": content,
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": None
    }

    result = await chat_message_collection.insert_one(message_doc)

    return str(result.inserted_id)
