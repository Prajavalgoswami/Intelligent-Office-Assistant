import jwt
from datetime import datetime, timedelta, timezone
from app.core.config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRE_MINUTES

def create_super_admin_token(admin_id: str) -> str:
    payload = {
        "sub": admin_id,
        "scope": "super_admin",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def create_company_admin_token(user_id: str, company_id: str) -> str:
    payload = {
        "sub": user_id,
        "scope": "company_admin",
        "company_id": company_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
