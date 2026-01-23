from typing import List
from bson import ObjectId
from fastapi import BackgroundTasks, UploadFile
from app.auth.password import generate_temp_password, hash_password, verify_password
from app.models.company import Company
from app.models.department import Department
from app.models.role import Role
from app.models.user import User
from app.models.company_config import CompanyConfig
from app.models.user_role import UserRole
from app.core.database import company_config_collection,super_admin_collection,company_collection, department_collection, role_collection, user_collection, user_role_collection
from app.super_admin.schema import SuperAdminLoginRequest
from app.auth.jwt import create_super_admin_token

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


DEFAULT_DEPARTMENTS = ["Engineering", "HR", "Sales", "Marketing", "Finance", "Operations", "Support"]
DEFAULT_ROLES = [
    ("Company Admin", "HIGH"), ("HR Manager", "HIGH"), ("Engineering Manager", "HIGH"),
    ("Team Lead", "MEDIUM"), ("Employee", "LOW"), ("Intern", "LOW")
]

async def create_company_service(
    company_name: str,
    company_domain: str,
    enabled_features: List[str],
    company_admin_email: str,
    background_tasks: BackgroundTasks
):
    #  Create company
    company = Company(
        company_name=company_name,
        company_domain=company_domain
    )
    result = await company_collection.insert_one(company.model_dump(by_alias=True))
    company_id = str(result.inserted_id)

    #  Create default company config
    config = CompanyConfig(
    company_id=company_id,
    enabled_features={feature: True for feature in enabled_features}
    )
    await company_config_collection.insert_one(
        config.model_dump(by_alias=True)
    )

    #  Ensure SYSTEM Company Admin role exists
    await role_collection.update_one(
        {"role_name": "Company Admin", "scope": "SYSTEM"},
        {
            "$setOnInsert": {
                "role_name": "Company Admin",
                "priority": "HIGH",
                "scope": "SYSTEM"
            }
        },
        upsert=True
    )

    admin_role = await role_collection.find_one({
        "role_name": "Company Admin",
        "scope": "SYSTEM"
    })

    if not admin_role:
        raise RuntimeError("Company Admin role not seeded")

    #  Create company admin user
    temp_pw = generate_temp_password()
    hashed_pw = hash_password(temp_pw)

    admin_user = User(
        company_id=company_id,
        name="Company Admin",
        email=company_admin_email,
        password=hashed_pw,
        status="active",
        first_login=True
    )

    user_result = await user_collection.insert_one(
        admin_user.model_dump(by_alias=True)
    )
    user_id = str(user_result.inserted_id)

    #  Assign SYSTEM Company Admin role to user
    await user_role_collection.insert_one(
        UserRole(
            user_id=ObjectId(user_id),
            role_id=ObjectId(admin_role["_id"]),
            company_id=ObjectId(company_id)
        ).model_dump(by_alias=True)
    )

    #  Background tasks
    background_tasks.add_task(create_default_departments, company_id)
    background_tasks.add_task(create_default_roles, company_id)

    return {
        "company_id": company_id,
        "company_admin_email": company_admin_email,
        "temporary_password": temp_pw
    }

async def create_default_departments(company_id: str):
    for name in DEFAULT_DEPARTMENTS:
        dept = Department(company_id=company_id, department_name=name, is_default=True)
        await department_collection.insert_one(dept.model_dump(by_alias=True))

async def create_default_roles(company_id: str):
    for name, priority in DEFAULT_ROLES:
        role = Role(company_id=company_id, role_name=name, priority=priority, is_default=True)
        await role_collection.insert_one(role.model_dump(by_alias=True))