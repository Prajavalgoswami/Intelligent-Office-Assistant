from .base import MongoBaseModel
class ChatGroup(MongoBaseModel):
    company_id: str
    group_name: str
    group_type: str 