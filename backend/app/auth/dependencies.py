from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.database import user_role_collection, role_collection
from app.auth.jwt import decode_token

bearer_scheme = HTTPBearer(auto_error=True)


# =========================
# Base auth dependency
# =========================
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    token = credentials.credentials   # ✅ THIS IS THE FIX

    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user_id = payload.get("sub")
    company_id = payload.get("company_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    return {
        "user_id": user_id,
        "company_id": company_id,
        "scope": payload.get("scope")
    }


# =========================
# Super Admin guard
# =========================
async def require_super_admin(
    current_user=Depends(get_current_user)
):
    if current_user["scope"] != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )

    return current_user["user_id"]


# =========================
# Company Admin guard
# =========================
async def require_company_admin(
    current_user=Depends(get_current_user)
):
    admin_role = await role_collection.find_one({
        "role_name": "Company Admin",
        "scope": "SYSTEM"
    })

    if not admin_role:
        raise HTTPException(
            status_code=500,
            detail="Company Admin role not configured"
        )

    has_role = await user_role_collection.find_one({
        "user_id": ObjectId(current_user["user_id"]),
        "role_id": admin_role["_id"]
    })

    if not has_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company Admin access required"
        )

    return current_user