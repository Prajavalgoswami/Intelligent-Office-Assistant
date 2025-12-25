from pydantic import BaseModel
from bson import ObjectId

class Role(BaseModel):
    company_id: ObjectId
    role_name: str
