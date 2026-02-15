from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from app.auth.google_auth import get_auth_flow, save_credentials


router = APIRouter(prefix="/auth/google", tags=["Google Auth"])

# “Connect Google Calendar”
from fastapi import Depends
from app.auth.dependencies import require_company_admin

@router.get("/login")
async def google_login():

    flow = get_auth_flow()

    auth_url, _ = flow.authorization_url(
        access_type="offline",
        prompt="consent",
        include_granted_scopes="false"
    )

    return RedirectResponse(auth_url)


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
from bson import ObjectId

@router.get("/callback")
async def google_callback(code: str):

    flow = get_auth_flow()
    flow.fetch_token(code=code)

    credentials = flow.credentials

    # 🔥 Hardcode for now (from screenshot)
    user_id = "698daace91856fb969c3c443"

    result = await user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token,
                "token_expiry": credentials.expiry
            }
        }
    )

    print("Modified count:", result.modified_count)

    return {"message": "Tokens saved"}
