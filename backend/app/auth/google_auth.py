
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException, status
from app.core.config import GOOGLE_CLIENT_ID


from fastapi.security import HTTPBearer

bearer_scheme = HTTPBearer(auto_error=True)

def verify_google_token(token: str) -> dict:
    """
    Verifies Google ID token sent from frontend (JWT-based auth).
    Used for user authentication.
    """

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



# ======================================
# NEW CODE (OAuth for Calendar & Tasks)
# ======================================

from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import os

# OAuth files
CLIENT_SECRETS_FILE = "credentials/oauth_client.json"
TOKEN_FILE = "credentials/token.json"

# Scopes for Google Calendar + Tasks
SCOPES = [
     "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/tasks",
    "https://www.googleapis.com/auth/gmail.modify",
      "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
]

def get_auth_flow():
    """
    Creates OAuth flow object for Google Calendar & Tasks access.
    """
    return Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri="http://localhost:8000/auth/google/callback"
    )

def save_credentials(credentials: Credentials):
    """
    Saves OAuth access & refresh tokens to token.json
    """
    with open(TOKEN_FILE, "w") as token:
        token.write(credentials.to_json())

def load_credentials():
    """
    Loads OAuth credentials from token.json if available.
    Used by CalendarService and TaskService.
    """
    if os.path.exists(TOKEN_FILE):
        return Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    return None
