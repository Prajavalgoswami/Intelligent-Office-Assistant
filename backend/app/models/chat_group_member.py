from .base import MongoBaseModel
class ChatGroupMember(MongoBaseModel):
    group_id: str
    user_id: str