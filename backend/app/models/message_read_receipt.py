from datetime import datetime, timezone
from app.core import database
from pydantic import Field
from .base import MongoBaseModel
from app.core.database import database
from pymongo import ASCENDING

class MessageReadReceipt(MongoBaseModel):
    message_id: str
    user_id: str
    read_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

read_receipt_collection = database.message_read_receipts

async def init_read_receipt_indexes():
    await read_receipt_collection.create_index(
        [("message_id", ASCENDING), ("user_id", ASCENDING)],
        unique=True
    )
