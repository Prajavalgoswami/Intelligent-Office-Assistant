from datetime import datetime, timedelta, timezone
from bson import ObjectId
import base64
from email.mime.text import MIMEText

from app.core.database import (
    user_collection,
    calendar_reminder_collection,
    gmail_labels_collection
)
from app.services.calendar_service import CalendarService
from app.services.gmail_service import GmailService
from app.auth.google_auth import load_user_credentials


# =====================================
# MAIN REMINDER CHECKER
# =====================================
async def check_and_send_reminders():

    users = user_collection.find({
        "access_token": {"$exists": True}
    })

    async for user in users:

        try:
            creds = await load_user_credentials(str(user["_id"]))
            calendar_service = CalendarService(creds)

            now = datetime.now(timezone.utc)
            future = now + timedelta(minutes=20)

            events = calendar_service.service.events().list(
                calendarId="primary",
                timeMin=now.isoformat(),
                timeMax=future.isoformat(),
                singleEvents=True,
                orderBy="startTime"
            ).execute().get("items", [])

        except Exception:
            continue  # Skip if calendar not connected

        # =====================================
        # CHECK EACH EVENT
        # =====================================
        for event in events:

            start_str = event["start"].get("dateTime")
            if not start_str:
                continue

            start_dt = datetime.fromisoformat(
                start_str.replace("Z", "+00:00")
            )

            time_diff = start_dt - now

            # 🔥 10–15 minute reminder window
            if not (timedelta(minutes=10) <= time_diff <= timedelta(minutes=15)):
                continue

            event_id = event["id"]

            # 🔥 DUPLICATE CHECK
            existing = await calendar_reminder_collection.find_one({
                "user_id": user["_id"],
                "event_id": event_id
            })

            if existing:
                continue

            summary = event.get("summary", "Meeting")

            # 🔥 SEND REMINDER
            await send_reminder_email(user, summary, start_str)

            # 🔥 SAVE REMINDER RECORD
            await calendar_reminder_collection.insert_one({
                "user_id": user["_id"],
                "event_id": event_id,
                "reminded_at": datetime.utcnow()
            })


# =====================================
# SEND EMAIL REMINDER
# =====================================
from datetime import datetime

async def send_reminder_email(user, summary, start_time):

    gmail_service = GmailService(user)
    await gmail_service.create_service()

    # 🔥 Convert ISO string → formatted time
    try:
        start_dt = datetime.fromisoformat(
            start_time.replace("Z", "+00:00")
        )

        formatted_time = start_dt.strftime("%d %b %Y, %I:%M %p")
    except Exception:
        formatted_time = start_time  # fallback if error

    message_text = f"""
Reminder 🚨

You have an upcoming meeting:

{summary}

Start Time: {formatted_time}

Please prepare accordingly.
"""

    message = MIMEText(message_text)
    message["to"] = user["email"]
    message["subject"] = f"Reminder: {summary}"

    raw = base64.urlsafe_b64encode(
        message.as_bytes()
    ).decode()

    sent_msg = gmail_service.service.users().messages().send(
        userId="me",
        body={"raw": raw}
    ).execute()

    message_id = sent_msg["id"]

    # Apply URGENT label
    label_doc = await gmail_labels_collection.find_one({
        "user_id": user["_id"],
        "label_name": "Urgent"
    })

    if label_doc:
        gmail_service.service.users().messages().modify(
            userId="me",
            id=message_id,
            body={"addLabelIds": [label_doc["label_id"]]}
        ).execute()
