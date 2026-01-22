from bson import ObjectId
from pydantic import Field
from .base import MongoBaseModel

class UserRole(MongoBaseModel):
    user_id: ObjectId = Field(alias="user_id")
    role_id: ObjectId = Field(alias="role_id")

    class Config:
        arbitrary_types_allowed = True