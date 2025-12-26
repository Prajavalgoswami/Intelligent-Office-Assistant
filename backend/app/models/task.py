from .base import MongoBaseModel
from typing import Optional
from datetime import datetime

class Task(MongoBaseModel):
    user_id: str
    assigned_by: Optional[str] = None
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    status: str = "pending"
    priority: Optional[str] = None  # low, medium, high
