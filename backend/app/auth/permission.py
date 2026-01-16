from bson import ObjectId
from fastapi import Depends, HTTPException
from app.auth.dependencies import get_current_user
from app.core.database import role_collection, user_role_collection, company_collection

async def require_admin_onboarding_complete(current=Depends(get_current_user)):
    admin_role = await role_collection.find_one({
        "role_name": "Company Admin",
        "scope": "SYSTEM"
    })

    has_admin_role = await user_role_collection.find_one({
        "user_id": ObjectId(current["user_id"]),
        "role_id": ObjectId(admin_role["_id"])
    })
    if not has_admin_role:
        return current

    company = await company_collection.find_one({
        "_id": ObjectId(current["company_id"])
    })

    if not company.get("onboarding_completed", False):
        raise HTTPException(
            status_code=403,
            detail="Company onboarding not completed"
        )

    return current
