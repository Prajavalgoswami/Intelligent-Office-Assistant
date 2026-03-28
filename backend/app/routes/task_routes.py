from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.auth.google_auth import load_user_credentials
from app.services.task_service import TaskService


router = APIRouter(prefix="/tasks", tags=["Tasks"])


def _normalize_task(task: Dict[str, Any]) -> Dict[str, Any]:
  """
  Convert a raw Google Tasks item into a simplified shape
  that is safe to return to the frontend.
  """
  return {
    "id": task.get("id"),
    "title": task.get("title"),
    "notes": task.get("notes"),
    "status": task.get("status"),
    "due": task.get("due"),
    "updated": task.get("updated"),
  }


@router.get("/today")
async def get_today_tasks(current_user=Depends(get_current_user)):
  """
  Return today's tasks for the current user using Google Tasks.

  - If a task has a `due` date, it is included when the date matches today.
  - Tasks without a `due` date are treated as pending and included as well.
  """
  user_id = current_user["user_id"]

  try:
    creds = await load_user_credentials(user_id)
    service = TaskService(creds)
    # Fetch up to 100 tasks from the default list, including completed ones
    raw = (
      service.service.tasks()
      .list(
        tasklist="@default",
        showCompleted=True,
        showHidden=True,
        maxResults=100,
      )
      .execute()
    )
    items: List[Dict[str, Any]] = raw.get("items", [])
  except Exception:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Google Tasks is not connected.",
    )

  today_str = datetime.now(timezone.utc).date().isoformat()

  today_tasks: List[Dict[str, Any]] = []
  completed_count = 0
  pending_count = 0

  for t in items:
    status = t.get("status", "")
    due = t.get("due")

    # Google Tasks `due` is an RFC3339 string; we only care about the date part.
    is_today = False
    if due:
      try:
        is_today = due[:10] == today_str
      except Exception:
        is_today = False
    else:
      # Tasks without a due date but not completed are treated as "today / pending"
      is_today = status != "completed"

    if not is_today:
      continue

    if status == "completed":
      completed_count += 1
    else:
      pending_count += 1

    today_tasks.append(_normalize_task(t))

  return {
    "tasks": today_tasks,
    "summary": {
      "total": len(today_tasks),
      "completed": completed_count,
      "pending": pending_count,
    },
  }
@router.post("/{task_id}/complete")
async def complete_task(task_id: str, current_user=Depends(get_current_user)):
  """
  Mark a task as completed in the user's default Google Task list.
  """
  user_id = current_user["user_id"]

  try:
    creds = await load_user_credentials(user_id)
    service = TaskService(creds)

    service.service.tasks().patch(
      tasklist="@default",
      task=task_id,
      body={"status": "completed"},
    ).execute()
  except Exception:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Unable to complete task. Please check your Google Tasks connection.",
    )

  return {"message": "Task marked as completed"}

