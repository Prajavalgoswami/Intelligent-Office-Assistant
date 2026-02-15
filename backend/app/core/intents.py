# backend/app/core/intents.py

from enum import Enum


class Intent(str, Enum):
    TASK_QUERY = "TASK_QUERY"
    MEETING_QUERY = "MEETING_QUERY"
    MEETING_CREATE = "MEETING_CREATE"
    EMAIL_SUMMARY = "EMAIL_SUMMARY"
    DOC_QA = "DOC_QA"
    UNKNOWN = "UNKNOWN"
