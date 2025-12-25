from pydantic import BaseModel
from bson import ObjectId

class UserRole(BaseModel):
    user_id: ObjectId
    role_id: ObjectId
