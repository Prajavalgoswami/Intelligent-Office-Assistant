from datetime import datetime, timezone
from typing import Literal, Optional
from pydantic import Field
from .base import MongoBaseModel
from app.core.database import chat_group_collection
from pymongo import ASCENDING

class ChatGroup(MongoBaseModel):
    company_id: str
    
    group_name: str
    
    group_category: Literal["organizational", "project"]
    
    created_by: str
    group_lead_id: Optional[str] = None
    
    is_archived: bool = False
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

async def init_chat_group_indexes():
    await chat_group_collection.create_index(
        [("company_id", ASCENDING)]
    )

    await chat_group_collection.create_index(
        [("company_id", ASCENDING), ("group_name", ASCENDING)],
        unique=True
    )