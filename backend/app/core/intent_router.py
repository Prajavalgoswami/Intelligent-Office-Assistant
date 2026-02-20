from app.core.intents import Intent

# Meeting handlers
from app.services.meeting_service import (
    handle_meeting_create,
    handle_meeting_query
)

# Task handler (intent-level, not Google API layer)
from app.services.task_handler import (
    handle_task_create,
    handle_task_query
)
# Other existing handlers
# from app.services.email_service import handle_email_summary
from app.services.document_service import handle_document_qa

from app.services.conversation_memory import get_user_state


async def route_intent(intent: Intent, message: str, user: dict):
    """
    Routes detected intent to the appropriate service handler.
    """
     # ================================
    # 🔥 MULTI-TURN MEETING CONTINUATION
    # ================================
    state = get_user_state(user["id"])

    if state.get("meeting_in_progress"):
        return await handle_meeting_create(message, user)

    if intent == Intent.MEETING_CREATE:
        return await handle_meeting_create(message, user)

    if intent == Intent.MEETING_QUERY:
        return await handle_meeting_query(message, user)

    if intent == Intent.TASK_CREATE:
        return await handle_task_create(message, user)

    if intent == Intent.TASK_QUERY:
        return await handle_task_query(message, user)

    # if intent == Intent.EMAIL_SUMMARY:
    #     return await handle_email_summary(user)

    if intent == Intent.DOC_QA:
        return await handle_document_qa(message, user)

    return {
        "type": "text",
        "response": "Sorry, I didn’t understand your request."
    }
