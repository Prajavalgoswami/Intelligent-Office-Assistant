from .base import MongoBaseModel
from typing import Optional
from datetime import datetime
from pydantic import Field


class DocumentEmbedding(MongoBaseModel):
    document_hash: str

    vector_reference: Optional[str] = None
    embedding_model: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
