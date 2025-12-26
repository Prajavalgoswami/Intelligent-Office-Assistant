from .base import MongoBaseModel

class SuperAdmin(MongoBaseModel):
    name: str
    email: str
    password: str