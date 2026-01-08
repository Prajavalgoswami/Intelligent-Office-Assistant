from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException, status
from app.core.config import GOOGLE_CLIENT_ID

def verify_google_token(token: str) -> dict:
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )
        if idinfo.get("iss") not in [
            "accounts.google.com",
            "https://accounts.google.com"
        ]:
            raise ValueError("Wrong issuer")

        return idinfo

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )
