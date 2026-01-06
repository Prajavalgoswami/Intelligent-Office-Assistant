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
            "ai_assistant": True,
            "voice": False
        }
    )
    ui_theme: str = "light"
    dashboard_layout: Optional[str] = "default"