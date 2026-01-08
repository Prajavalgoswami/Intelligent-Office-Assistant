from pydantic import Field
from typing import Dict,Optional
from .base import MongoBaseModel
class CompanyConfig(MongoBaseModel):
    company_id: str
    enabled_features: Dict[str, bool] = Field(
        default_factory=lambda: {
            "email": True,
            "calendar": True,
            "tasks": True,
            "chat": True,
            "documents": True,
            "analytics": True,
            "collaboration": True,
            "office_chatbot": True,
            # ENTERPRISE FEATURES
            "broadcast": True,
            "service_requests": True
        }
    )
    ui_theme: str = "light"
    dashboard_layout: Optional[str] = "default"
