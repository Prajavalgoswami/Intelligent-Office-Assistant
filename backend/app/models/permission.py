from .base import MongoBaseModel

class Permission(MongoBaseModel):
    permission_name: str