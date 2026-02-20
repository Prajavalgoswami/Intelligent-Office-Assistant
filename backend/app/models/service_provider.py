from pydantic import BaseModel, Field # pyright: ignore[reportMissingImports]
from datetime import datetime


class ServiceProvider(BaseModel):
    company_id: str
    name: str
    provider_type: str  # hardware | software
    contact_email: str
    contact_phone: str

    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
