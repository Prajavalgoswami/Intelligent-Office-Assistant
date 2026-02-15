import re
from app.core.intents import Intent


def detect_intent(message: str) -> Intent:
    if not message:
        return Intent.UNKNOWN

    text = message.lower()

    if re.search(r"\b(task|tasks|todo|pending)\b", text):
        return Intent.TASK_QUERY

    if "meeting" in text and re.search(r"\b(book|schedule|create|arrange)\b", text):
        return Intent.MEETING_CREATE

    if re.search(r"\b(next meeting|my meeting|calendar)\b", text):
        return Intent.MEETING_QUERY

    if "email" in text and re.search(r"\b(summary|summarize)\b", text):
        return Intent.EMAIL_SUMMARY

    if re.search(r"\b(policy|document|leave)\b", text):
        return Intent.DOC_QA

    return Intent.UNKNOWN
