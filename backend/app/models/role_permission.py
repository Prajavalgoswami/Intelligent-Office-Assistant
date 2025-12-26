from .base import MongoBaseModel
class RolePermission(MongoBaseModel):
    role_id: str
    permission_id: str