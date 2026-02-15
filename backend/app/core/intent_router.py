from app.core.intents import Intent
from app.services.task_service import handle_task_query
from app.services.meeting_service import (
    handle_meeting_query,
    handle_meeting_create
)
from app.services.email_service import handle_email_summary
from app.services.document_service import handle_document_qa


async def route_intent(intent: Intent, message: str, user: dict):
    """
    Routes intent to the correct service handler.
    """
    if intent == Intent.TASK_QUERY:
        return await handle_task_query(user)

    if intent == Intent.MEETING_QUERY:
        return await handle_meeting_query(user)

    if intent == Intent.MEETING_CREATE:
        return await handle_meeting_create(message, user)

    if intent == Intent.EMAIL_SUMMARY:
        return await handle_email_summary(user)

    if intent == Intent.DOC_QA:
        return await handle_document_qa(message, user)

    return {
        "type": "text",
        "response": "Sorry, I didn’t understand your request."
    }
