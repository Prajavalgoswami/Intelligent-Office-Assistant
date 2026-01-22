from .base import MongoBaseModel
from typing import Optional
from datetime import datetime
from pydantic import Field


class DocumentSummary(MongoBaseModel):
    document_hash: str

    summary_type: str
    language: str = "en"

    summary_text: str

    original_length: int
    summary_length: int

    model_name: str
    model_version: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    usage_count: int = 1