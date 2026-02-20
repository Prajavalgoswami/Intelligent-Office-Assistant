from datetime import datetime
from app.core.database import service_request_collection
from app.models.service_request import ServiceRequest
from bson import ObjectId # pyright: ignore[reportMissingImports]

async def create_service_request(user, data):
    request = ServiceRequest(
        company_id=user["company_id"],
        department_id=user["department_id"],
        raised_by=user["user_id"],
        title=data.title,
        description=data.description,
        category=data.category,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    result = await service_request_collection.insert_one(
        request.model_dump(by_alias=True)
    )

    return {"message": "Service request created successfully"}

async def get_service_requests(user):

    roles = user.get("roles", [])
    company_id = user.get("company_id")
    user_id = user.get("user_id")

    if "Employee" in roles:
        requests = await service_request_collection.find(
            {"raised_by": user_id}
        ).to_list(100)

    elif "Technical Support" in roles:
        requests = await service_request_collection.find(
            {"company_id": company_id}
        ).to_list(100)

    elif any("Manager" in role for role in roles):
        requests = await service_request_collection.find(
            {
                "company_id": company_id,
                "department_id": user.get("department_id")
            }
        ).to_list(100)

    elif "Company Admin" in roles:
        requests = await service_request_collection.find(
            {"company_id": company_id}
        ).to_list(100)

    else:
        requests = []

    # 🔥 IMPORTANT FIX
    for req in requests:
        req["_id"] = str(req["_id"])

    return requests

async def update_service_status(request_id, status):
    await service_request_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {
            "status": status,
            "updated_at": datetime.utcnow()
        }}
    )

    return {"message": "Status updated successfully"}
from bson.errors import InvalidId # pyright: ignore[reportMissingImports]

async def assign_to_self(request_id: str, user: dict):

    try:
        object_id = ObjectId(request_id)
    except InvalidId:
        raise Exception("Invalid service request ID")

    if "Technical Support" not in user.get("roles", []):
        raise Exception("Only Technical Support can assign requests")

    result = await service_request_collection.update_one(
        {
            "_id": object_id,
            "company_id": user["company_id"]
        },
        {
            "$set": {
                "assigned_to": user["user_id"],
                "status": "in_progress"
            }
        }
    )

    if result.modified_count == 0:
        raise Exception("Service request not found")

    return {"message": "Assigned successfully"}
