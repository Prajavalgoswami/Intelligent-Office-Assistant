from pydantic import BaseModel, EmailStr
from typing import List, Optional
class CompanyAdminLoginRequest(BaseModel):
    email: EmailStr
    password: str
class RoleCreate(BaseModel):
    role_name: str

class RoleResponse(BaseModel):
    id: str
    role_name: str

class DepartmentResponse(BaseModel):
    id: str
    department_name: str

class UserCreate(BaseModel):
    name: str
    email: str
    department_id: str
    role_ids: Optional[List[str]] = []  
    password: Optional[str] = None 

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    department_id: str
    status: str