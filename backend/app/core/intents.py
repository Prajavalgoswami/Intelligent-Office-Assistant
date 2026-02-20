# backend/app/core/intents.py

from enum import Enum


class Intent(str, Enum):
    MEETING_CREATE = "meeting_create"
    MEETING_QUERY = "meeting_query"
    TASK_CREATE = "task_create"
    TASK_QUERY = "task_query"
    EMAIL_SUMMARY = "email_summary"
    DOC_QA = "doc_qa"
    UNKNOWN = "unknown"
   
