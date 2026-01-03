from fastapi import APIRouter,HTTPException, Depends
from app.super_admin.auth import require_super_admin
from app.super_admin.schema import SuperAdminLoginRequest,CreateCompanyRequest
from app.super_admin.service import login_super_admin,create_company
router = APIRouter(prefix="/super-admin", tags=["Super Admin"])

@router.get("/ping")
def super_admin_ping():
    return {"message": "Super Admin routes working"}

@router.post("/login")
async def super_admin_login(data: SuperAdminLoginRequest):
    token=await login_super_admin(data)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": token, "token_type": "bearer"}

@router.post("/companies")
async def create_company_api(
    data: CreateCompanyRequest,
    admin_id: str = Depends(require_super_admin)
):
    return await create_company(data)