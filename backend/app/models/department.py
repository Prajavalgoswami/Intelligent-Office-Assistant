from pydantic import BaseModel
from bson import ObjectId

class Department(BaseModel):
    company_id: ObjectId
    department_name: str
