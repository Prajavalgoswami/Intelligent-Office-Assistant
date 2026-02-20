from datetime import datetime, timezone
from typing import Optional, Literal
from pydantic import Field
from .base import MongoBaseModel
from app.core.database import database
from pymongo import ASCENDING
class BroadcastMessage(MongoBaseModel):
    company_id: str
    
    sender_id: str
    
    title: str
    content: str
    
    target_type: Literal["all", "group"]
    target_id: Optional[str] = None
    
    priority: Literal["normal", "important", "urgent"] = "normal"
    
    is_active: bool = True
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

broadcast_collection = database.broadcasts

async def init_broadcast_indexes():
    await broadcast_collection.create_index(
        [("company_id", ASCENDING)]
    )

    await broadcast_collection.create_index(
        [("target_type", ASCENDING)]
    )