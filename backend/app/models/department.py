from datetime import datetime, timezone
from typing import Literal

from pydantic import Field
from .base import MongoBaseModel
from bson import ObjectId

class Department(MongoBaseModel):
    company_id: str
    department_name: str
    description : str=""
    joined_date: datetime = Field(default_factory=lambda:datetime.now(timezone.utc))
    is_active: bool = True