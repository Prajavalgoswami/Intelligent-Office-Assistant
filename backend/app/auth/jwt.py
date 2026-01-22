import jwt
from datetime import datetime, timedelta, timezone
from app.core.config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRE_MINUTES

def get_token_expiration(minutes: int = JWT_EXPIRE_MINUTES):
    return datetime.now(timezone.utc) + timedelta(minutes=minutes)

def create_super_admin_token(admin_id: str) -> str:
    payload = {
        "user_id": admin_id,
        "scope": "super_admin",
        "exp": get_token_expiration()
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def create_company_admin_token(user_id: str, company_id: str, first_login: bool = False):
    payload = {
        "user_id": user_id,
        "company_id": company_id,
        "scope": "company_admin",
        "first_login": first_login,
        "exp": get_token_expiration(minutes=30)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def create_employee_token(
    user_id: str,
    company_id: str,
    role_names: list[str],
    priority : str
) -> str:
    payload = {
        "user_id": user_id,
        "company_id": company_id,
        "roles": role_names,
        "priority":priority,
        "type": "employee",
        "exp": get_token_expiration()
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise jwt.ExpiredSignatureError("Token has expired")
    except jwt.InvalidTokenError:
        raise jwt.InvalidTokenError("Invalid token")