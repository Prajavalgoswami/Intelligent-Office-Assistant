from pydantic import BaseModel
from bson import ObjectId

class RolePermission(BaseModel):
    role_id: ObjectId
    permission_id: ObjectId
