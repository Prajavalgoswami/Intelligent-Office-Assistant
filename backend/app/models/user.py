from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime

class User(BaseModel):
    company_id: ObjectId
    department_id: ObjectId
    name: str
    email: str
    oauth_id: str | None = None
    joined_date: datetime = datetime.utcnow()
    status: str = "active"
