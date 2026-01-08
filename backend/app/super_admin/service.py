from app.super_admin.schema import SuperAdminLoginRequest, CreateCompanyRequest
from app.auth.password import generate_temp_password, verify_password,hash_password
from app.auth.jwt import create_super_admin_token
from app.core.database import (
    super_admin_collection,
    company_collection,
    company_config_collection,
    user_collection
)
from app.models.company_config import CompanyConfig
from datetime import datetime,timezone

async def login_super_admin(data: SuperAdminLoginRequest) -> bool:
    admin=await super_admin_collection.find_one(
        {"email":data.email})
    if not admin:
        return None

    if not admin.get("is_active", True):
        return None

    if not verify_password(data.password, admin["password_hash"]):
        return None
    return create_super_admin_token(str(admin["_id"]))

async def create_company(data: CreateCompanyRequest):
    company = {
        "company_name": data.company_name,
        "domain": data.domain,
        "status": "active",
        "created_at": datetime.now(timezone.utc)
    }

    result = await company_collection.insert_one(company)
    company_id = str(result.inserted_id)

    company_config = CompanyConfig(company_id=company_id)

    await company_config_collection.insert_one(
        company_config.dict()
    )
    temp_password = generate_temp_password()
    password_hash = hash_password(temp_password)

    admin_user = {
        "name": data.admin_name,
        "email": data.admin_email,
        "password_hash": password_hash,
        "company_id": company_id,
        "role": "company_admin",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    await user_collection.insert_one(admin_user)

    return {
        "company_id": company_id,
        "company_name": data.company_name,
        "admin_email": data.admin_email,
        "temporary_password": temp_password,
        "enabled_features": company_config.enabled_features
    }