from .base import MongoBaseModel
from typing import Optional
from datetime import datetime,timezone
from pydantic import Field
class User(MongoBaseModel):
    company_id: str
    name: str
    email: str
    password: Optional[str] = None
    oauth_id: Optional[str] = None
    department_id: Optional[str] = None
    joined_date: datetime = Field(default_factory=datetime.now(timezone.utc))
    status: str = "active"

class UserRole(MongoBaseModel):
    user_id: str
    role_id: str