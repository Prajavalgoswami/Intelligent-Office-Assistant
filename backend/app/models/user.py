from .base import MongoBaseModel
from typing import Literal, Optional
from datetime import datetime,timezone
from pydantic import EmailStr, Field
class User(MongoBaseModel):
    company_id: str
    name: str
    email: EmailStr
    password: Optional[str] = None
    oauth_id: Optional[str] = None
    department_id: Optional[str] = None
    joined_date: datetime = Field(default_factory=lambda:datetime.now(timezone.utc))
    status: Literal["active", "inactive", "suspended"] = "active"