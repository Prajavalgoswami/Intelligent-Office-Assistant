from pydantic import BaseModel, Field # type: ignore
from typing import Optional
from datetime import datetime


class ServiceRequest(BaseModel):
    company_id: str
    department_id: Optional[str]=None
    raised_by: str

    title: str
    description: str

    category: str  # "hardware" | "software"

    status: str = "open"  # open | in_progress | completed | resolved
    assigned_to: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
