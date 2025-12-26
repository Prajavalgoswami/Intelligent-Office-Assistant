from .base import MongoBaseModel
from typing import List
from datetime import datetime
class Meeting(MongoBaseModel):
    company_id: str
    created_by: str
    meeting_title: str
    start_time: datetime
    end_time: datetime
    participants: List[str] = [] 