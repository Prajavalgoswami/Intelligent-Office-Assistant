from bson import ObjectId
from fastapi import HTTPException,status
from app.core.database import user_role_collection, role_collection,user_collection
from bson import ObjectId

async def resolve_roles(user_id: str):
    assignments = await user_role_collection.find({
        "user_id": ObjectId(user_id)
    }).to_list(100)

    if not assignments:
        return None

    role_ids = [a["role_id"] for a in assignments]

    roles = await role_collection.find(
        {"_id": {"$in": role_ids}},
        {"role_name": 1, "priority": 1}
    ).to_list(100)
    for r in roles :
        if(r["role_name"]=="Company Admin" and len(roles)==1) :
            
            raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please Login as Company Admin"
        )
    if not roles:
        return None

    priority_map = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
    max_priority = max(
        (r.get("priority", "LOW") for r in roles),
        key=lambda p: priority_map[p]
    )

    return {
        "roles": [r["role_name"] for r in roles],
        "max_priority": max_priority
    }

async def get_user_and_roles(user_id:str) :
    assignments = await user_role_collection.find({
        "user_id": ObjectId(user_id)
    }).to_list(100)

    if not assignments:
        return None

    role_ids = [a["role_id"] for a in assignments]

    roles = await role_collection.find(
        {"_id": {"$in": role_ids}},
        {"role_name": 1, "priority": 1}
    ).to_list(100)

    if not roles:
        return None

    return {
        "roles": [r["role_name"] for r in roles],
        "user_id":user_id,
        "role_ids":role_ids
    }