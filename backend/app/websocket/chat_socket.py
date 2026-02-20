from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from bson import ObjectId
from datetime import datetime, timezone

from app.websocket.connection_manager import manager
from app.auth.jwt import decode_token
from app.core.database import (
    chat_group_collection,
    chat_group_member_collection,
    chat_message_collection
)

router = APIRouter()
@router.websocket("/ws/chat/{group_id}")
async def websocket_chat(websocket: WebSocket, group_id: str):

    # 🔑 Get token from query parameter
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        return

    try:
        payload = decode_token(token)
    except Exception:
        await websocket.close(code=1008)
        return

    user_id = payload.get("user_id")
    company_id = payload.get("company_id")

    # 🔎 Validate group
    group = await chat_group_collection.find_one({
        "_id": ObjectId(group_id),
        "is_archived": False
    })

    if not group or group["company_id"] != company_id:
        await websocket.close(code=1008)
        return

    # 🔎 Validate membership
    membership = await chat_group_member_collection.find_one({
        "group_id": group_id,
        "user_id": user_id,
        "is_active": True
    })

    if not membership:
        await websocket.close(code=1008)
        return

    # ✅ Accept connection
    await manager.connect(group_id, user_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()

            content = data.get("content")

            if not content:
                continue

            # Save to DB
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

            # Broadcast
            await manager.broadcast_to_group(group_id, {
                "message_id": str(result.inserted_id),
                "group_id": group_id,
                "sender_id": user_id,
                "content": content,
                "created_at": message_doc["created_at"].isoformat()
            })

    except WebSocketDisconnect:
        manager.disconnect(group_id, user_id, websocket)
