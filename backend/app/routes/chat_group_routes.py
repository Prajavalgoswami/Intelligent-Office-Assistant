from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from app.auth.dependencies import get_current_user
from app.schemas.chat_group_schema import CreateGroupRequest, AddMemberRequest
from app.services.group_service import create_group, add_member_to_group
from app.core.database import (
    chat_group_collection,
    chat_group_member_collection,
    user_collection,
    chat_message_collection,
    database
)
from app.schemas.chat_message_schema import SendMessageRequest
from app.services.message_service import send_message_to_group
from app.core.database import chat_message_collection
from datetime import datetime, timezone

read_receipt_collection = database.message_read_receipts
user_delete_collection = database.message_user_deletes

router = APIRouter(prefix="/messages", tags=["Chat Messages"])
router = APIRouter(prefix="/groups", tags=["Chat Groups"])
@router.post("/")
async def create_new_group(
    request: CreateGroupRequest,
    current_user=Depends(get_current_user)
):
    user_scope = current_user.get("scope")
    user_type = current_user.get("type")

    # 🔒 Rule 1: Organizational groups → only admins
    if request.group_category == "organizational":
        if user_scope not in ["super_admin", "company_admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can create organizational groups"
            )

    # 🤝 Rule 2: Project groups → employees allowed
    if request.group_category == "project":
        if user_type != "employee" and user_scope not in ["super_admin", "company_admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to create project groups"
            )

    group_id = await create_group(
        company_id=current_user["company_id"],
        creator_id=current_user["user_id"],
        data=request
    )

    return {
        "message": "Group created successfully",
        "group_id": group_id
    }
@router.post("/{group_id}/members")
async def add_member(
    group_id: str,
    request: AddMemberRequest,
    current_user=Depends(get_current_user)
):
    # 🔎 Check group exists
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
    if group["company_id"] != current_user["company_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to modify this group"
        )

    # 🔎 Check if current user is group lead
    membership = await chat_group_member_collection.find_one({
        "group_id": group_id,
        "user_id": current_user["user_id"],
        "role": "lead",
        "is_active": True
    })

    if not membership and current_user.get("scope") not in ["super_admin", "company_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only group lead or admin can add members"
        )

    # 🔎 Validate target user belongs to same company
    target_user = await user_collection.find_one({
        "_id": ObjectId(request.user_id)
    })

    if not target_user or target_user["company_id"] != group["company_id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not belong to this company"
        )

    await add_member_to_group(group_id, request)

    return {"message": "Member added successfully"}
@router.post("/{group_id}")
async def send_message(
    group_id: str,
    request: SendMessageRequest,
    current_user=Depends(get_current_user)
):
    message_id = await send_message_to_group(
        group_id=group_id,
        user_id=current_user["user_id"],
        company_id=current_user["company_id"],
        content=request.content
    )

    return {
        "message": "Message sent successfully",
        "message_id": message_id
    }
@router.get("/{group_id}")
async def get_group_messages(
    group_id: str,
    current_user=Depends(get_current_user)
):
    user_id = current_user["user_id"]

    # Get messages deleted by user
    deleted_cursor = user_delete_collection.find({
        "user_id": user_id
    })

    deleted_ids = []
    async for d in deleted_cursor:
        deleted_ids.append(ObjectId(d["message_id"]))

    messages_cursor = chat_message_collection.find({
        "group_id": group_id,
        "is_deleted": False,
        "_id": {"$nin": deleted_ids}
    }).sort("created_at", -1)

    messages = []
    async for msg in messages_cursor:
        msg["_id"] = str(msg["_id"])
        messages.append(msg)

    return messages
@router.post("/{message_id}/read")
async def mark_message_as_read(
    message_id: str,
    current_user=Depends(get_current_user)
):
    user_id = current_user["user_id"]

    existing = await read_receipt_collection.find_one({
        "message_id": message_id,
        "user_id": user_id
    })

    if not existing:
        await read_receipt_collection.insert_one({
            "message_id": message_id,
            "user_id": user_id,
            "read_at": datetime.now(timezone.utc)
        })

    return {"message": "Read receipt recorded"}
@router.delete("/{message_id}")
async def delete_message(
    message_id: str,
    delete_type: str = Query(..., pattern="^(everyone|me)$"),
    current_user=Depends(get_current_user)
):
    user_id = current_user["user_id"]
    company_id = current_user["company_id"]
    user_scope = current_user.get("scope")

    message = await chat_message_collection.find_one({
        "_id": ObjectId(message_id),
        "is_deleted": False
    })

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if message["company_id"] != company_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    # -------------------
    # DELETE FOR ME
    # -------------------
    if delete_type == "me":

        existing = await user_delete_collection.find_one({
            "message_id": message_id,
            "user_id": user_id
        })

        if not existing:
            await user_delete_collection.insert_one({
                "message_id": message_id,
                "user_id": user_id,
                "deleted_at": datetime.now(timezone.utc)
            })

        return {"message": "Message deleted for you"}

    # -------------------
    # DELETE FOR EVERYONE
    # -------------------
    if delete_type == "everyone":

        # Permission check
        if message["sender_id"] != user_id:
            membership = await chat_group_member_collection.find_one({
                "group_id": message["group_id"],
                "user_id": user_id,
                "role": "lead",
                "is_active": True
            })

            if not membership and user_scope not in ["super_admin", "company_admin"]:
                raise HTTPException(status_code=403, detail="Not authorized")

        # Count total active members
        total_members = await chat_group_member_collection.count_documents({
            "group_id": message["group_id"],
            "is_active": True
        })

        # Count read receipts
        read_count = await read_receipt_collection.count_documents({
            "message_id": message_id
        })

        if read_count >= total_members:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete. All members have already read this message."
            )

        await chat_message_collection.update_one(
            {"_id": ObjectId(message_id)},
            {
                "$set": {
                    "is_deleted": True,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )

        return {"message": "Message deleted for everyone"}
