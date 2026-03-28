from app.services.conversation_memory import (
    get_user_state,
    update_user_state,
    clear_user_state
)

from app.services.task_service import TaskService
from app.auth.google_auth import load_user_credentials

import os
import json
import re
from google import genai


# ==========================
# GEMINI CLIENT
# ==========================

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# ==========================
# FALLBACK CLEANER
# ==========================

def clean_task_text(text: str) -> str:
    """
    Remove command words if Gemini fails
    """

    text = text.lower()

    remove_phrases = [
        "add task",
        "create task",
        "todo",
        "remind me to",
        "i want to",
        "i need to",
        "please"
    ]

    for phrase in remove_phrases:
        text = text.replace(phrase, "")

    # remove time expressions like "at 7pm"
    text = re.sub(r"\bat\s*\d{1,2}(:\d{2})?\s*(am|pm)?\b", "", text)

    return text.strip()


# ==========================
# GEMINI TASK PARSER
# ==========================

async def extract_task_with_gemini(message: str) -> str:

    prompt = f"""
Extract the task title from the message.

Remove phrases like:
add task
create task
todo
remind me to
i want to
i need to
please
and summarize the task in a meaningful manner and in proper grammar.
Return ONLY JSON.

Format:
{{"title":"task title"}}

Message:
{message}
"""

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )

        text = response.text.strip()

        # remove markdown if Gemini adds it
        text = re.sub(r"```json|```", "", text).strip()

        data = json.loads(text)

        title = data.get("title", message)

    except Exception as e:
        print("Gemini parsing failed:", e)
        title = message

    # FINAL CLEANING (always applied)
    title = clean_task_text(title)

    return title


# ==========================
# CREATE TASK
# ==========================

async def handle_task_create(message: str, user: dict):

    user_id = user["id"]
    state = get_user_state(user_id)

    # Extract task title using Gemini
    task_name = await extract_task_with_gemini(message)

    if not task_name:
        state["pending_task"] = True
        update_user_state(user_id, state)

        return {
            "type": "clarification",
            "response": "What task would you like me to add?"
        }

    try:
        # Load user Google credentials
        creds = await load_user_credentials(user_id)

        # Initialize Task Service
        service = TaskService(creds)

        # Create Google Task
        service.create_task(task_name)

    except Exception:
        return {
            "type": "error",
            "response": "⚠️ Google Tasks is not connected."
        }

    clear_user_state(user_id)

    return {
        "type": "success",
        "response": f"✅ Task added: {task_name}"
    }

# ==========================
# QUERY TASKS
# ==========================
async def handle_task_query(message: str, user: dict):

    text = message.lower()

    try:
        creds = await load_user_credentials(user["id"])
        service = TaskService(creds)

        # Always fetch all tasks first
        tasks = service.service.tasks().list(
            tasklist="@default",
            showCompleted=True,
            showHidden=True
        ).execute().get("items", [])

        # 🔥 FILTERING LOGIC
        if "completed" in text or "done" in text:
            tasks = [t for t in tasks if t.get("status") == "completed"]
            title = "✅ Completed Tasks"

        elif "all" in text:
            title = "📋 All Tasks"

        else:
            # Default → Pending only
            tasks = [t for t in tasks if t.get("status") != "completed"]
            title = "📌 Pending Tasks"

    except Exception:
        return {
            "type": "error",
            "response": "⚠️ Google Tasks is not connected."
        }

    if not tasks:
        return {
            "type": "info",
            "response": "📭 No tasks found."
        }

    lines = [title]
    for t in tasks:
        lines.append(f"- {t.get('title')}")

    return {
        "type": "info",
        "response": "\n".join(lines)
    }