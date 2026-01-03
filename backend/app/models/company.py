from .base import MongoBaseModel
from typing import Optional
from pydantic import Field
from datetime import datetime,timezone

class Company(MongoBaseModel):
    company_name: str
    domain: Optional[str] = None
    status: str = "active"  # active / inactive
    created_at: datetime = Field(default_factory=datetime.now(timezone.now))