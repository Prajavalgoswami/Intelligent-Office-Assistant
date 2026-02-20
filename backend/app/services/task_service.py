from googleapiclient.discovery import build
from app.auth.google_auth import load_user_credentials


class TaskService:
    """
    Service layer responsible for interacting with Google Tasks API
    using OAuth credentials.
    """

    def __init__(self, creds):
        if not creds:
            raise Exception("Google account not connected")

        self.service = build(
            "tasks",
            "v1",
            credentials=creds
        )

    def create_task(self, title: str, notes: str | None = None):
        task_body = {"title": title}

        if notes:
            task_body["notes"] = notes

        return self.service.tasks().insert(
            tasklist="@default",
            body=task_body
        ).execute()

    def list_tasks(self, max_results: int = 10):
        """
        Fetch tasks from the user's default Google Task list.
        """

        results = self.service.tasks().list(
            tasklist="@default",
            maxResults=max_results,
            showCompleted=False
        ).execute()

        return results.get("items", [])
