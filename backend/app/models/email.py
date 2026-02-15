from .base import MongoBaseModel
from typing import Optional
from datetime import datetime
from pydantic import Field


class ClassifiedEmail(MongoBaseModel):
    user_id: str
    message_id: str
    thread_id: Optional[str] = None
    subject: Optional[str] = None
<<<<<<< Updated upstream
    body: Optional[str] = None
    category: Optional[str] = None
    priority_score: Optional[float] = None
    received_time: datetime = Field(default_factory=datetime.utcnow)
=======
    sender: Optional[str] = None
    category: str
    label_applied: bool = True
    gmail_history_id: Optional[str] = None
    classified_at: datetime = Field(default_factory=datetime.utcnow)
>>>>>>> Stashed changes
