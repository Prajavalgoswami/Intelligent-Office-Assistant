from pydantic import BaseModel
from bson import ObjectId

class Email(BaseModel):
    user_id: ObjectId
    sender: str
    subject: str
    body: str
    category: str
    priority_score: float
    received_time: datetime