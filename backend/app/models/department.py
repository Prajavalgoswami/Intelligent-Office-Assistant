from .base import MongoBaseModel
from pydantic import Field

class Department(MongoBaseModel):
    company_id: str
    department_name: str = Field(..., min_length=1)
    description: str = ""
    is_default: bool = False 