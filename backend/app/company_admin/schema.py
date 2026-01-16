# app/company_admin/schema.py
from pydantic import BaseModel, Field
from typing import Optional, List

class DepartmentCreate(BaseModel):
    department_name: str = Field(..., min_length=2)
    description: Optional[str] = None

class RoleCreate(BaseModel):
    role_name: str = Field(..., min_length=2)
    description: Optional[str] = None
    priority: str = Field("LOW", pattern="^(HIGH|MEDIUM|LOW)$")

class UserCreate(BaseModel):
    name: str
    email: str
    department_id: str
    role_ids: List[str] = []
    password: Optional[str] = None  # If null → temp password

class OnboardingRequest(BaseModel):
    services: str
    policies_text: Optional[str] = None