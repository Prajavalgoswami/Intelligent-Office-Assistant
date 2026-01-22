from fastapi import APIRouter, HTTPException
from app.core.database import user_collection
from app.auth.google_auth import verify_google_token
from app.auth.jwt import create_user_token

router = APIRouter(
    prefix="/user",
    tags=["User"]
)

@router.post("/login/google")
async def user_google_login(token: str):
    google_user = verify_google_token(token)
    email = google_user["email"]

    user_doc = await user_collection.find_one({
        "email": email,
        "status": "active"
    })

    if not user_doc:
        raise HTTPException(status_code=403, detail="Not authorized")

    jwt_token = create_user_token(
        user_id=str(user_doc["_id"]),
        company_id=user_doc["company_id"],
    )

    return {
        "access_token": jwt_token,
        "token_type": "bearer"
    }
