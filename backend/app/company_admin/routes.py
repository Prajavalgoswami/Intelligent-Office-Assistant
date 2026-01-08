from fastapi import APIRouter,Depends,HTTPException
from app.core.database import user_collection
from app.auth.google_auth import verify_google_token
from app.auth.jwt import create_company_admin_token
from app.auth.dependencies import require_company_admin
from app.company_admin.service import create_department, create_role_service, create_user_service, get_departments_service, get_roles_service
from app.company_admin.schema import RoleCreate, UserCreate
router = APIRouter(
    prefix="/company-admin",
    tags=["Company Admin"]
)

@router.post("/login/google")
async def company_admin_google_login(token: str):
    google_user = verify_google_token(token)

    email = google_user["email"]

    user = await user_collection.find_one({
        "email": email,
        "role": "company_admin",
        "is_active": True
    })

    if not user:
        raise HTTPException(status_code=403, detail="Not authorized")

    jwt_token = create_company_admin_token(
        user_id=str(user["_id"]),
        company_id=user["company_id"]
    )

    return {
        "access_token": jwt_token,
        "token_type": "bearer"
    }

@router.post("/departments")
async def create_department_api(
    data: dict,
    admin = Depends(require_company_admin)
):
    await create_department(
        company_id=admin["company_id"],
        name=data["name"],
        description=data.get("description")
    )
    return {"message": "Department created"}

@router.post("/roles", response_model=dict)
async def create_role(
    role_data: RoleCreate,
    current_admin: dict = Depends(require_company_admin)
):
    role_id = await create_role_service(current_admin["company_id"], role_data)
    return {"message": "Role created", "role_id": role_id}

@router.post("/users", response_model=dict)
async def create_user(
    user_data: UserCreate,
    current_admin: dict = Depends(require_company_admin)
):
    user_id = await create_user_service(current_admin["company_id"], user_data)
    return {"message": "User created successfully", "user_id": user_id}

@router.get("/roles")
async def list_roles(current_admin: dict = Depends(require_company_admin)):
    return await get_roles_service(current_admin["company_id"])

@router.get("/departments")
async def list_departments(current_admin: dict = Depends(require_company_admin)):
    return await get_departments_service(current_admin["company_id"])