from fastapi import APIRouter, Depends # pyright: ignore[reportMissingImports]
from app.schemas.service_request import *
from app.services.service_request import *
from app.auth.dependencies import get_current_user
from fastapi import HTTPException, status

router = APIRouter(prefix="/service-requests", tags=["Service Requests"])


@router.post("/")
async def create_request(data: ServiceRequestCreate,
                         user=Depends(get_current_user)):
    return await create_service_request(user, data)


@router.get("/")
async def get_requests(user=Depends(get_current_user)):
    return await get_service_requests(user)

@router.patch("/{request_id}/assign")
async def assign_request(
    request_id: str,
    user=Depends(get_current_user)
):
    return await assign_to_self(request_id, user)


@router.patch("/{request_id}/complete")
async def complete_service_request(
    request_id: str,
    user=Depends(get_current_user)
):
    try:
        return await complete_request(request_id, user)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/{request_id}/client-feedback")
async def client_feedback(
    request_id: str,
    data: ServiceRequestClientFeedback,
    user=Depends(get_current_user)
):
    try:
        return await record_client_feedback(request_id, user, data.satisfied)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

