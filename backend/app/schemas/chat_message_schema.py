from pydantic import BaseModel, Field
from typing import Optional

class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
