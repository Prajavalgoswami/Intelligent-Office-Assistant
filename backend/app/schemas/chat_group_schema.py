from pydantic import BaseModel
from typing import Literal

class CreateGroupRequest(BaseModel):
    group_name: str
    group_category: Literal["organizational", "project"]

class AddMemberRequest(BaseModel):
    user_id: str
    role: Literal["member", "lead"] = "member"
