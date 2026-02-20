from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.intent_detector import detect_intent
from app.core.intent_router import route_intent
from app.auth.dependencies import get_current_user

from app.services.conversation_memory import get_user_state
from app.core.intent_detector import detect_intent
from app.core.intents import Intent


router = APIRouter(prefix="/conversation", tags=["Conversation"])


class MessageRequest(BaseModel):
    message: str


@router.post("/message")
async def send_message(
    request: MessageRequest,
    user=Depends(get_current_user)
):
    user_id = user["user_id"]

    # 1️⃣ Load conversation memory
    state = get_user_state(user_id)

    # 2️⃣ Detect intent normally
    intent = detect_intent(request.message)

    # 🔥 3️⃣ MULTI-TURN INTENT OVERRIDE LOGIC

    # MEETING continuation
    if state and ("date" in state or "time" in state):
        intent = Intent.MEETING_CREATE

    # TASK continuation
    if state and state.get("pending_task"):
        intent = Intent.TASK_CREATE

    # 4️⃣ Route intent to handler
    response = await route_intent(
        intent=intent,
        message=request.message,
        user={
            "id": user_id,
            "company_id": user.get("company_id"),
        }
    )

    return response

from app.services.reminder_scheduler import check_and_send_reminders

@router.get("/test-reminder")
async def test_reminder():
    await check_and_send_reminders()
    return {"status": "Reminder check executed"}

