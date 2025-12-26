from bson import ObjectId
from .base import MongoBaseModel

class UserRole(MongoBaseModel):
    user_id: ObjectId
    role_id: ObjectId
