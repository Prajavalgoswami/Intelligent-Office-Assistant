from fastapi import (
    APIRouter, Depends, HTTPException, status,
    UploadFile, File, Form, BackgroundTasks
)
from typing import Optional
from bson import ObjectId
from pydantic import BaseModel

from app.auth.dependencies import require_company_admin
from app.auth.jwt import create_company_admin_token
from app.auth.google_auth import verify_google_token

from app.auth.password import verify_password
from app.schemas.company_admin import (
    RoleCreate, UserCreate, DepartmentCreate
)
from app.services.company_admin import (
    create_department, create_role_service, create_user_service,
    get_departments_service, get_roles_service,
    complete_onboarding_service
)

from app.core.database import (
    user_collection, user_role_collection, role_collection
)

router = APIRouter(prefix="/company-admin", tags=["Company Admin"])
class AdminIdPasswordLogin(BaseModel):
    username: str
    password: str


@router.post("/login/admin-username-password")
async def login_company_admin_with_username_and_password(
    request: AdminIdPasswordLogin
):
    if not request.username.startswith("admin_"):
        raise HTTPException(401, "Invalid username or password")

    try:
        oid_str = request.username[6:]
        admin_oid = ObjectId(oid_str)
    except:
        raise HTTPException(401, "Invalid username or password")

    admin = await user_collection.find_one({
        "_id": admin_oid,
        "status": "active"
    })

    if not admin or not verify_password(request.password, admin.get("password")):
        raise HTTPException(401, "Invalid username or password")

    admin_id = str(admin["_id"])
    company_id = admin["company_id"]

    # Company admin has fixed role
    access_token = create_company_admin_token(
        user_id=admin_id,
        company_id=company_id
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
class GoogleLoginRequest(BaseModel):
    token: str
@router.post("/login/google")
async def company_admin_google_login(payload: GoogleLoginRequest):
    token=payload.token
    google_user = verify_google_token(token)
    email = google_user["email"]

    user_doc = await user_collection.find_one({
        "email": email,
        "status": "active"
    })

    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not found or inactive"
        )

    admin_role = await role_collection.find_one({
        "role_name": "Company Admin",
        "scope": "SYSTEM"
    })

    if not admin_role:
        raise HTTPException(500, "Company Admin role not configured")

    has_role = await user_role_collection.find_one({
        "user_id": ObjectId(user_doc["_id"]),
        "role_id": admin_role["_id"]
    })

    if not has_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as Company Admin"
        )

    jwt_token = create_company_admin_token(
        user_id=str(user_doc["_id"]),
        company_id=str(user_doc["company_id"]),
        first_login=user_doc.get("first_login", True)
    )

    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "first_login": user_doc.get("first_login", True)
    }
@router.get("/me")
async def get_current_admin(
    admin=Depends(require_company_admin)
):
    user = await user_collection.find_one(
        {"_id": ObjectId(admin["user_id"])},
        {"password": 0}
    )

    return {
        "user_id": admin["user_id"],
        "company_id": admin["company_id"],
        "email": user["email"],
        "name": user["name"],
        "first_login": user.get("first_login", False)
    }

# DEPARTMENTS
@router.post("/departments")
async def create_department_api(
    request: DepartmentCreate,
    admin=Depends(require_company_admin)
):
    dept_id = await create_department(
        company_id=admin["company_id"],
        name=request.department_name,
        description=request.description
    )
    return {"message": "Department created", "department_id": dept_id}


@router.get("/departments")
async def list_departments(
    admin=Depends(require_company_admin)
):
    return await get_departments_service(admin["company_id"])

# ROLES
@router.post("/roles")
async def create_role(
    role_data: RoleCreate,
    admin=Depends(require_company_admin)
):
    role_id = await create_role_service(admin["company_id"], role_data)
    return {"message": "Role created", "role_id": role_id}


@router.get("/roles")
async def list_roles(
    admin=Depends(require_company_admin)
):
    return await get_roles_service(admin["company_id"])

#OnBOARDING
@router.post("/onboarding")
async def complete_onboarding(
    services: str = Form(...),
    policies_text: Optional[str] = Form(None),
    policies_file: Optional[UploadFile] = File(None),
    admin=Depends(require_company_admin),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    user_doc = await user_collection.find_one(
        {"_id": ObjectId(admin["user_id"])},
        {"first_login": 1}
    )

    if not user_doc or not user_doc.get("first_login", False):
        raise HTTPException(
            status_code=403,
            detail="Onboarding already completed"
        )

    await complete_onboarding_service(
        user_id=admin["user_id"],
        company_id=admin["company_id"],
        services=services,
        policies_text=policies_text,
        policies_file=policies_file,
        background_tasks=background_tasks
    )

    return {"message": "Onboarding completed successfully"}

@router.post("/users")
async def create_user(
    user_data: UserCreate,
    admin = Depends(require_company_admin)
):
    try:
        result = await create_user_service(
            company_id=admin["company_id"],
            user_data=user_data
        )
        return result
    except HTTPException as e:
        raise e  # Let FastAPI handle known exceptions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )