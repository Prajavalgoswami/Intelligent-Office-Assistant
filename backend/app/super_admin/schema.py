from pydantic import BaseModel, EmailStr
from typing import Optional
class SuperAdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class CreateCompanyRequest(BaseModel):
    company_name: str
    domain: Optional[str] = None

    admin_name: str
    admin_email: EmailStr