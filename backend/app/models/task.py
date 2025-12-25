from pydantic import BaseModel
from bson import ObjectId

class Task(BaseModel):
    user_id: ObjectId
    assigned_by: ObjectId
    title: str
    deadline: datetime
    status: str = "pending"
    priority: str
