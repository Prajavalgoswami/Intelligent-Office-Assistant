from pydantic import BaseModel
from typing import Optional

class Department(BaseModel):
    id: str
    company_id: str
    department_name: str
    description: Optional[str] = None
    is_default: bool
    member_count: int = 0   # 👈 ADD THIS