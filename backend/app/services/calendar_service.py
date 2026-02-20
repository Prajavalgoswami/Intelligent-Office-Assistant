from googleapiclient.discovery import build
from app.auth.google_auth import load_user_credentials


class CalendarService:
    """
    Service layer responsible for interacting with Google Calendar API
    using OAuth credentials.
    """

    def __init__(self, creds):
        if not creds:
            raise Exception("Google account not connected")

        self.service = build(
            "calendar",
            "v3",
            credentials=creds
        )

    def create_event(self, title, start_dt, end_dt):
        """
        Creates a Google Calendar event.
        """

        event = {
            "summary": title,
            "start": {
                "dateTime": start_dt.isoformat(),
                "timeZone": "Asia/Kolkata",
            },
            "end": {
                "dateTime": end_dt.isoformat(),
                "timeZone": "Asia/Kolkata",
            }
        }

        return self.service.events().insert(
            calendarId="primary",
            body=event
        ).execute()

    def list_upcoming_events(self, max_results=5):
        """
        Fetches upcoming events from Google Calendar.
        """

        events = self.service.events().list(
            calendarId="primary",
            maxResults=max_results,
            singleEvents=True,
            orderBy="startTime"
        ).execute()

        return events.get("items", [])
