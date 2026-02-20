from pydoc import text
import re
from app.core.intents import Intent


def detect_intent(message: str) -> Intent:
    """
    Detects user intent from message using rule-based matching.
    """

    if not message:
        return Intent.UNKNOWN

    text = message.lower()

    # ================================
    # TASK CREATION
    # ================================
    if re.search(r"\b(add|create|make)\b", text) and re.search(
        r"\b(task|tasks|todo)\b", text
    ):
        return Intent.TASK_CREATE

    # ================================
    # TASK QUERY (all / pending / completed)
    # ================================
    if re.search(r"\b(task|tasks|todo)\b", text) and re.search(
        r"\b(list|show|my|pending|completed|done|all)\b", text
    ):
        return Intent.TASK_QUERY

    # ================================
    # MEETING CREATION
    # ================================
    if re.search(r"\b(meeting)\b", text):

        if re.search(r"\b(book|schedule|create|arrange|set|have)\b", text):
            return Intent.MEETING_CREATE

        if re.search(r"\b(today|tomorrow|next|after|\d{1,2}\s*(am|pm))\b", text):
            return Intent.MEETING_CREATE




    # ================================
    # MEETING QUERY
    # ================================
    if re.search(r"\b(meeting|meetings|calendar)\b", text) and \
    re.search(r"\b(show|list|my|past|upcoming|all)\b", text):
        return Intent.MEETING_QUERY



    # ================================
    # EMAIL SUMMARY
    # ================================
    if "email" in text and re.search(r"\b(summary|summarize)\b", text):
        return Intent.EMAIL_SUMMARY

    # ================================
    # DOCUMENT QA
    # ================================
    if re.search(r"\b(policy|document|leave)\b", text):
        return Intent.DOC_QA

    return Intent.UNKNOWN
