from .base import MongoBaseModel
from datetime import datetime, timezone
from pydantic import Field

class SuperAdmin(MongoBaseModel):
    name: str
    email: str
    password_hash: str
    is_active: bool = True
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
