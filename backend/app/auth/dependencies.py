from typing import Dict
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.auth.jwt import decode_token

security = HTTPBearer()

def require_super_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = decode_token(token)

        admin_id = payload.get("sub")
        scope = payload.get("scope")

        if not admin_id or scope != "super_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized as super admin"
            )

        return admin_id

    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
async def require_company_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, str]:
    try:
        token = credentials.credentials
        payload = decode_token(token)

        scope = payload.get("scope")
        if scope != "company_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company admin access required"
            )

        user_id = payload.get("sub")
        company_id = payload.get("company_id")

        if not user_id or not company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token: missing user or company context"
            )

        return {"user_id": user_id, "company_id": company_id}

    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
