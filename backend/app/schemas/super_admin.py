from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class SuperAdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class CreateCompanyRequest(BaseModel):
    company_name: str = Field(..., min_length=3, max_length=100)
    company_domain: str = Field(..., pattern=r"^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    enabled_features: List[str] = []
    company_admin_email: EmailStr

class CreateCompanyResponse(BaseModel):
    company_id: str
    company_admin_email: EmailStr
    temporary_password: str  # Shown only once — warn in production!
    message: str = "Company created successfully. Admin credentials provided."