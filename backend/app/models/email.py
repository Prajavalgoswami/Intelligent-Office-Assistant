from .base import MongoBaseModel
from typing import Optional
from datetime import datetime,timezone
from pydantic import Field
class Email(MongoBaseModel):
    user_id: str
    sender: str
    subject: Optional[str] = None
    body: Optional[str] = None
    category: Optional[str] = None
    priority_score: Optional[float] = None
    received_time: datetime = Field(default_factory=datetime.now(timezone.utc))