from datetime import datetime, timezone
from pydantic import Field
from .base import MongoBaseModel
from app.core.database import database
from pymongo import ASCENDING

class MessageUserDelete(MongoBaseModel):
    message_id: str
    user_id: str
    deleted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

user_delete_collection = database.message_user_deletes

async def init_message_user_delete_indexes():
    await user_delete_collection.create_index(
        [("message_id", ASCENDING), ("user_id", ASCENDING)],
        unique=True
    )
