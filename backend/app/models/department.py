from .base import MongoBaseModel
from bson import ObjectId

class Department(MongoBaseModel):
    company_id: str
    department_name: str