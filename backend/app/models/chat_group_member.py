from datetime import datetime, timezone
from typing import Literal
from pydantic import Field
from .base import MongoBaseModel
from app.core.database import chat_group_member_collection
from pymongo import ASCENDING
class ChatGroupMember(MongoBaseModel):
    group_id: str
    user_id: str
    
    role: Literal["member", "lead"] = "member"
    
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

async def init_chat_group_member_indexes():
    await chat_group_member_collection.create_index(
        [("group_id", ASCENDING)]
    )

    await chat_group_member_collection.create_index(
        [("user_id", ASCENDING)]
    )

    await chat_group_member_collection.create_index(
        [("group_id", ASCENDING), ("user_id", ASCENDING)],
        unique=True
    )