from bson import ObjectId
from pydantic import Field
from .base import MongoBaseModel

class UserRole(MongoBaseModel):
    user_id: ObjectId = Field(alias="userId")
    role_id: ObjectId = Field(alias="roleId")

    class Config:
        arbitrary_types_allowed = True