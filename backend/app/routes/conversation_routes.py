from fastapi import APIRouter
from app.core.intent_detector import detect_intent
from app.core.intent_router import route_intent

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.post("/message")
async def send_message(payload: dict):
    message = payload.get("message", "")
    user = payload.get("user", {"id": "demo_user"})

    intent = detect_intent(message)
    response = await route_intent(intent, message, user)

    return {
        "intent": intent,
        "response": response
    }
