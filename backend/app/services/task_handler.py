from app.services.conversation_memory import (
    get_user_state,
    update_user_state,
    clear_user_state
)

from app.services.task_service import TaskService
from app.auth.google_auth import load_user_credentials


# ==========================
# CREATE TASK
# ==========================
async def handle_task_create(message: str, user: dict):
    user_id = user["id"]
    state = get_user_state(user_id)

    task_name = (
        message.lower()
        .replace("add task", "")
        .replace("create task", "")
        .replace("todo", "")
        .strip()
    )

    if not task_name:
        state["pending_task"] = True
        update_user_state(user_id, state)

        return {
            "type": "clarification",
            "response": "What task would you like me to add?"
        }

    try:
        # ✅ LOAD USER CREDS FROM DB
        creds = await load_user_credentials(user_id)

        # ✅ PASS CREDS TO SERVICE
        service = TaskService(creds)

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
