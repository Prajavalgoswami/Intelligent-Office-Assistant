from datetime import datetime, timezone
from typing import Optional
from pydantic import Field
from .base import MongoBaseModel
from app.core.database import chat_message_collection
from pymongo import ASCENDING
class ChatMessage(MongoBaseModel):
    company_id: str
    group_id: str
    
    sender_id: str
    
    content: str
    
    is_deleted: bool = False
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

async def init_chat_message_indexes():
    await chat_message_collection.create_index(
        [("group_id", ASCENDING)]
    )

    await chat_message_collection.create_index(
        [("group_id", ASCENDING), ("created_at", ASCENDING)]
    )