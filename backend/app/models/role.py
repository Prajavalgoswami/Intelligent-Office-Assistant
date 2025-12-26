from .base import MongoBaseModel

class Role(MongoBaseModel):
    company_id: str
    role_name: str  # Admin, Manager, Employee