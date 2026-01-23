from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth.dependencies import get_current_user
from ..auth.google_auth import verify_google_token
from ..auth.jwt import create_employee_token
from ..services.employee import resolve_roles
from app.core.database import user_collection
from app.auth.password import verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

class GoogleLoginRequest(BaseModel):
    id_token: str

class UserIdPasswordLogin(BaseModel):
    username: str
    password: str

@router.post("/employee/google-login")
async def employee_google_login(request: GoogleLoginRequest):
    google_payload = verify_google_token(request.id_token)
    if not google_payload or not (email := google_payload.get("email")):
        raise HTTPException(401, "Invalid Google token")
    local, domain = email.split("@", 1)
    local = local.split("+", 1)[0]
    pattern = f"^{local}(\\+.*)?@{domain}$"

    user = await user_collection.find_one({
        "email": {"$regex": pattern, "$options": "i"}
    })
    if not user:
        raise HTTPException(403, "No active account found")

    user_id = str(user["_id"])
    company_id = user["company_id"]

    role_data = await resolve_roles(user_id)
    if not role_data:
        raise HTTPException(403, "No roles assigned")

    access_token = create_employee_token(
        user_id=user_id,
        company_id=company_id,
        role_names=role_data["roles"],
        priority=role_data["max_priority"]
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/login/username-password")
async def login_with_username_and_password(request: UserIdPasswordLogin):
    if not request.username.startswith("user_"):
        raise HTTPException(401, "Invalid username or password")

    try:
        oid_str = request.username[5:]
        user_oid = ObjectId(oid_str)
    except:
        raise HTTPException(401, "Invalid username or password")

    user = await user_collection.find_one({"_id": user_oid, "status": "active"})
    if not user or not verify_password(request.password, user.get("password")):
        raise HTTPException(401, "Invalid username or password")

    user_id = str(user["_id"])
    company_id = user["company_id"]
    print(user_id)
    role_data = await resolve_roles(user_id)
    if not role_data:
        raise HTTPException(403, "No roles assigned")

    access_token = create_employee_token(
        user_id=user_id,
        company_id=company_id,
        role_names=role_data["roles"],
        priority=role_data["max_priority"]
    )

    print(role_data)
    if not role_data:
        raise HTTPException(403, "No roles assigned")

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me")
async def get_me(current_user = Depends(get_current_user)):

    return {
        "user_id": current_user["user_id"],
        "company_id": current_user.get("company_id"),
        "type": current_user.get("type"),
        "roles": current_user.get("roles", []),
        "priority": current_user.get("priority")
    }