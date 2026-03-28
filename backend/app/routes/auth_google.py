import os
from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse

from app.auth.google_auth import get_auth_flow
from app.auth.dependencies import get_current_user
from app.core.database import user_collection
from bson import ObjectId

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


router = APIRouter(prefix="/auth/google", tags=["Google Auth"])

# “Connect Google Calendar”
from app.auth.dependencies import get_current_user, require_company_admin

# admin=Depends(require_company_admin)
# @router.get("/login")
# async def google_login(admin=Depends(require_company_admin)):
  #  # 🔥 TEMPORARY HARD-CODE USER ID
    # user_id = "6992f786373717c9cf9f3613"

    # auth_url, state = flow.authorization_url(
    #     access_type="offline",
    #     prompt="consent",
    #     include_granted_scopes="false",
    #     state=user_id   # ✅ PASS HERE
    # )

# @router.get("/login")
# async def google_login(current_user = Depends(get_current_user)):


#     flow = get_auth_flow()

#     auth_url, _ = flow.authorization_url(
#         access_type="offline",
#         prompt="consent",
#         include_granted_scopes="false",
#         state=current_user["user_id"]   # ✅ PASS HERE
#     )

#     return RedirectResponse(auth_url)

@router.get("/login")
async def google_login(current_user = Depends(get_current_user)):

    flow = get_auth_flow()

    auth_url, _ = flow.authorization_url(
        access_type="offline",
        prompt="consent",
        include_granted_scopes="false",
        state=current_user["user_id"]
    )

    return {"auth_url": auth_url}



# @router.get("/login")
# async def google_login(admin=Depends(require_company_admin)):

#     flow = get_auth_flow()

#     auth_url, state = flow.authorization_url(
#         access_type="offline",
#         prompt="consent",
#         include_granted_scopes="false"
#     )

#     # Pass user_id in state
#     auth_url += f"&state={admin['user_id']}"

#     return RedirectResponse(auth_url)



# from bson import ObjectId
# from app.core.database import user_collection

# @router.get("/callback")
# async def google_callback(code: str, state: str):

#     flow = get_auth_flow()
#     flow.fetch_token(code=code)

#     credentials = flow.credentials

#     # state contains user_id
#     user_id = state

#     await user_collection.update_one(
#         {"_id": ObjectId(user_id)},
#         {
#             "$set": {
#                 "access_token": credentials.token,
#                 "refresh_token": credentials.refresh_token,
#                 "token_expiry": credentials.expiry
#             }
#         }
#     )

#     return {
#         "message": "Google account connected successfully and tokens saved."
#     }



from bson import ObjectId
from app.core.database import user_collection

@router.get("/callback")
async def google_callback(code: str, state: str):
    try:
        flow = get_auth_flow()
        flow.fetch_token(code=code)

        credentials = flow.credentials
        user_id = state

        await user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "access_token": credentials.token,
                    "refresh_token": credentials.refresh_token,
                    "token_expiry": credentials.expiry,
                }
            },
        )

        return RedirectResponse(
            url=f"{FRONTEND_URL}/app/gmail?google_connected=1",
            status_code=302,
        )
    except Exception:
        return RedirectResponse(
            url=f"{FRONTEND_URL}/app/gmail?google_error=1",
            status_code=302,
        )

   

    
