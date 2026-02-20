from bson import ObjectId
from datetime import datetime, timezone
from fastapi import HTTPException, status

from app.core.database import (
    chat_group_collection,
    chat_group_member_collection
)

async def create_group(company_id: str, creator_id: str, data):
    existing = await chat_group_collection.find_one({
        "company_id": company_id,
        "group_name": data.group_name
    })

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group with this name already exists"
        )

    group_doc = {
        "company_id": company_id,
        "group_name": data.group_name,
        "group_category": data.group_category,
        "created_by": creator_id,
        "group_lead_id": creator_id,
        "is_archived": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": None
    }

    result = await chat_group_collection.insert_one(group_doc)

    # Add creator as lead member
    await chat_group_member_collection.insert_one({
        "group_id": str(result.inserted_id),
        "user_id": creator_id,
        "role": "lead",
        "joined_at": datetime.now(timezone.utc),
        "is_active": True
    })

    return str(result.inserted_id)
async def add_member_to_group(group_id: str, data):
    exists = await chat_group_member_collection.find_one({
        "group_id": group_id,
        "user_id": data.user_id
    })

    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already in group"
        )

    await chat_group_member_collection.insert_one({
        "group_id": group_id,
        "user_id": data.user_id,
        "role": data.role,
        "joined_at": datetime.now(timezone.utc),
        "is_active": True
    })
