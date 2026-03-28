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

    # Technical Support sees ALL company requests
    if "Technical Support" in roles:
        requests = await service_request_collection.find(
            {"company_id": company_id}
        ).to_list(100)
    # Company Admin sees  all
    elif "Company Admin" in roles:
        requests = await service_request_collection.find(
            {"company_id": company_id}
        ).to_list(100)
    # Engineering Manager sees department requests
    elif any("Engineering Manager" in role for role in roles):
        requests = await service_request_collection.find(
            {
                "company_id": company_id,
                "department_id": user.get("department_id"),
            }
        ).to_list(100)
    # Everyone else sees only their own requests (hide resolved ones once satisfied)
    else:
        requests = await service_request_collection.find(
            {"raised_by": user_id, "status": {"$ne": "resolved"}}
        ).to_list(100)

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


async def complete_request(request_id: str, user: dict):
    """
    Technician marks a request as completed after providing the service.
    Allowed for Technical Support assigned to the request.
    """
    if "Technical Support" not in user.get("roles", []):
        raise Exception("Only Technical Support can complete requests")

    req = await service_request_collection.find_one({"_id": ObjectId(request_id)})
    if not req:
        raise Exception("Service request not found")

    if req.get("company_id") != user.get("company_id"):
        raise Exception("Not allowed")

    if req.get("assigned_to") != user.get("user_id"):
        raise Exception("Only the assigned technician can complete this request")

    await service_request_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "completed", "updated_at": datetime.utcnow()}},
    )

    return {"message": "Request marked as completed"}


async def record_client_feedback(request_id: str, user: dict, satisfied: bool):
    """
    Client approves (satisfied) or rejects (not satisfied) a completed service.
    - satisfied=True  -> status resolved (removed from client list)
    - satisfied=False -> status open again (kept in list)
    """
    req = await service_request_collection.find_one({"_id": ObjectId(request_id)})
    if not req:
        raise Exception("Service request not found")

    if req.get("company_id") != user.get("company_id"):
        raise Exception("Not allowed")

    if req.get("raised_by") != user.get("user_id"):
        raise Exception("Only the client who raised the request can confirm it")

    if req.get("status") != "completed":
        raise Exception("Request is not ready for client confirmation")

    if satisfied:
        await service_request_collection.update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"status": "resolved", "updated_at": datetime.utcnow()}},
        )
        return {"message": "Thanks for confirming. Request resolved."}

    # Not satisfied -> reopen and allow reassignment/redo
    await service_request_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "open", "assigned_to": None, "updated_at": datetime.utcnow()}},
    )
    return {"message": "Request reopened. Support team will follow up."}
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
