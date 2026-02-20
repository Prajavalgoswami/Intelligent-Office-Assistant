from .base import MongoBaseModel
from typing import Optional, Literal
from datetime import datetime, timezone
from pydantic import EmailStr, Field

class User(MongoBaseModel):
    company_id: str
    name: str
    email: EmailStr
    password: Optional[str] = None
    oauth_id: Optional[str] = None

    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expiry: Optional[datetime] = None

    department_id: Optional[str] = None
    joined_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: Literal["active", "inactive", "suspended"] = "active"
    first_login: bool = True