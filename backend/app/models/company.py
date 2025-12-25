from pydantic import BaseModel
from datetime import datetime

class Company(BaseModel):
    company_name: str
    domain: str | None = None
    status: str = "active"
    created_at: datetime = datetime.utcnow()
