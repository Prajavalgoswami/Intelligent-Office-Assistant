from .base import MongoBaseModel
from typing import List, Literal
from datetime import datetime, timezone
from pydantic import Field

class Company(MongoBaseModel):
    company_name: str = Field(..., min_length=1)
    company_domain: str = Field(..., pattern=r"^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    enabled_features: List[str] = [] 
    status: Literal["PENDING_ONBOARDING", "ACTIVE", "SUSPENDED"] = "PENDING_ONBOARDING"
    onboarding_completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))