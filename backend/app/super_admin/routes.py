# app/super_admin/routes.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from app.auth.dependencies import require_super_admin
from app.super_admin.schema import (
    SuperAdminLoginRequest,
    CreateCompanyRequest,
    CreateCompanyResponse
)
from app.super_admin.service import login_super_admin, create_company_service

router = APIRouter(prefix="/super-admin", tags=["Super Admin"])

@router.get("/ping")
async def super_admin_ping():
    return {"message": "Super Admin routes are operational 🚀"}

@router.post("/login", response_model=dict)
async def super_admin_login(data: SuperAdminLoginRequest):
    cred = SuperAdminLoginRequest(email=data.email, password=data.password)
    token = await login_super_admin(cred)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return {"access_token": token, "token_type": "bearer"}

@router.post("/companies", response_model=CreateCompanyResponse)
async def create_company(
    request: CreateCompanyRequest,
    admin_id: str = Depends(require_super_admin),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Create a new company + default departments/roles + company admin user
    Returns temporary password for the new admin (show only once!)
    """
    result = await create_company_service(
        company_name=request.company_name,
        company_domain=request.company_domain,
        enabled_features=request.enabled_features,
        company_admin_email=request.company_admin_email,
        background_tasks=background_tasks
    )
    return result