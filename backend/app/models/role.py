from .base import MongoBaseModel
from typing import Literal
from pydantic import Field

class Role(MongoBaseModel):
    company_id: str
    role_name: str = Field(..., min_length=1)
    description: str = ""
    scope: Literal["SYSTEM", "COMPANY"] = "COMPANY"
    priority: Literal["HIGH", "MEDIUM", "LOW"] = "LOW"
    is_default: bool = False 