from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
class Document(BaseModel):
    company_id: ObjectId
    uploaded_by: ObjectId
    title: str
    file_path: str
    upload_date: datetime = datetime.utcnow()

class DocumentEmbedding(BaseModel):
    document_id: ObjectId
    vector_reference: str
