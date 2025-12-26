from typing import Dict, Any,Optional
from .base import MongoBaseModel
class CompanyConfig(MongoBaseModel):
    company_id: str
    enabled_features: Dict[str, Any] = {}
    ui_theme: str = "light"
    dashboard_layout: Optional[str] = None