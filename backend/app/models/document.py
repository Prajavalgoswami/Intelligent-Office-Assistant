from .base import MongoBaseModel
from typing import Optional
from datetime import datetime
from pydantic import Field
class Document(MongoBaseModel):
    company_id: str
    uploaded_by: str
    title: str
    file_path: str
    upload_date: datetime = Field(default_factory=datetime.now)

class DocumentEmbedding(MongoBaseModel):
    document_id: str
    vector_reference: Optional[str] = None