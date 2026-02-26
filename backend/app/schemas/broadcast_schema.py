from pydantic import BaseModel, Field
from typing import Literal, Optional

class CreateBroadcastRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=1, max_length=5000)
    target_type: Literal["all", "group"]
    target_id: Optional[str] = None
    priority: Literal["normal", "important", "urgent"] = "normal"
