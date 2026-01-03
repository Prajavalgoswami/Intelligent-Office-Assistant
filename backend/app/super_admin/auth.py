from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
security = HTTPBearer()
from passlib.context import CryptContext
from datetime import datetime, timedelta,timezone
import jwt
from app.core.config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRE_MINUTES
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def create_super_admin_token(admin_id: str) -> str:
    payload = {
        "sub": admin_id,
        "scope": "super_admin",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])


#bleeding edge of python 3.13 BCrypt, thus using 3.12 argon2 for hashing
def hash_password(password: str) -> str:
    hshpwd=pwd_context.hash(password)
    return hshpwd

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)

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