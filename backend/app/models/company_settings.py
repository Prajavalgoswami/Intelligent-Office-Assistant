from .base import MongoBaseModel
from typing import Optional, List
from pydantic import Field

class CompanySettings(MongoBaseModel):
    company_id: str = Field(..., unique=True)  
    services_description: Optional[str] = None 
    policies_text: Optional[str] = None 
    policies_file_path: Optional[str] = None 
    vector_store_id: Optional[str] = None  
    embedded_chunks: List[dict] = [] 