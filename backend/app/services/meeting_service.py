from datetime import datetime, timedelta, timezone

from app.core.datetime_extractor import extract_datetime, extract_time_only
from app.nlp.datetime_nlp import nlp_extract_datetime
from app.services.conversation_memory import (
    get_user_state,
    update_user_state,
    clear_user_state
)
from app.services.calendar_service import CalendarService
from app.models import user
from app.auth.google_auth import load_user_credentials


# ================================
# CREATE MEETING
# ================================
async def handle_meeting_create(message: str, user: dict):

    user_id = user["id"]
    state = get_user_state(user_id)

    # 🔥 Always attempt extraction
    dt = extract_datetime(message)

    # Time only input
    if not dt:
        time_only = extract_time_only(message)
        if time_only:
            dt = {"time": time_only}

    # NLP fallback
    if not dt or dt.get("time") == "00:00":
        nlp_dt = nlp_extract_datetime(message)
        if nlp_dt:
            if "weekday_phrase" in nlp_dt:
                dt = extract_datetime(nlp_dt["weekday_phrase"])
            else:
                dt = nlp_dt

    # 🔥 Merge with previous state
    if dt:
        if "date" in dt:
            state["date"] = dt["date"]
        if "time" in dt:
            state["time"] = dt["time"]

        update_user_state(user_id, state)

    # 🔥 If no date yet
    if "date" not in state:
        state["meeting_in_progress"] = True
        update_user_state(user_id, state)

        return {
            "type": "clarification",
            "response": "Sure 🙂 Which date should I schedule the meeting?"
        }

    # 🔥 If no time yet
    if "time" not in state or state["time"] == "00:00":
        state["meeting_in_progress"] = True
        update_user_state(user_id, state)

        return {
            "type": "clarification",
            "response": f"I got the date ({state['date']}). What time works for you?"
        }
    

    # 🔥 Now both available → create meeting
    try:
        start_dt = datetime.strptime(
            f"{state['date']} {state['time']}",
            "%Y-%m-%d %H:%M"
        )
        end_dt = start_dt + timedelta(minutes=30)

        meeting_title = extract_meeting_title(message)

        creds = await load_user_credentials(user["id"])
        calendar_service = CalendarService(creds)

        calendar_service.create_event(
            title=meeting_title,
            start_dt=start_dt,
            end_dt=end_dt
        )

    except Exception:
        return {
            "type": "error",
            "response": "⚠️ Google Calendar is not connected."
        }

    clear_user_state(user_id)

    return {
        "type": "meeting_confirmation",
        "response": f"✅ Meeting scheduled on {state['date']} at {state['time']}",
        "data": {
            "date": state["date"],
            "time": state["time"]
        }
    }

import re

def extract_meeting_title(message: str) -> str:

    text = message.lower()

    # Pattern 1: meeting with someone
    match = re.search(
        r"meeting with ([a-zA-Z\s]+?)(?:\s+(today|tomorrow|next|at|on|after)\b|$)",
        text
    )

    if match:
        return f"Meeting with {match.group(1).title()}"

    # Pattern 2: meeting <topic> with <team>
    match = re.search(
        r"meeting ([a-zA-Z\s]+?) with ([a-zA-Z\s]+?)(?:\s+(today|tomorrow|next|at|on|after)\b|$)",
        text
    )

    if match:
        topic = match.group(1).strip()
        group = match.group(2).strip()
        return f"{topic.title()} with {group.title()}"

    # Pattern 3: generic topic
    match = re.search(
        r"(strategy|discussion|review|planning|sync|standup|demo)",
        text
    )

    if match:
        return f"{match.group(1).title()} Meeting"

    return "Meeting"




# ================================
# QUERY MEETINGS
# ================================
from datetime import datetime
from app.auth.google_auth import load_user_credentials


async def handle_meeting_query(message: str, user: dict):

    text = message.lower()

    try:
        creds = await load_user_credentials(user["id"])
        calendar_service = CalendarService(creds)

        events = calendar_service.service.events().list(
            calendarId="primary",
            singleEvents=True,
            orderBy="startTime"
        ).execute().get("items", [])

    except Exception:
        return {
            "type": "error",
            "response": "⚠️ Google Calendar is not connected."
        }

    if not events:
        return {
            "type": "info",
            "response": "📭 No meetings found."
        }

    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    filtered_events = []

    for event in events:
        start = event["start"].get("dateTime") or event["start"].get("date")

        try:
            start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
        except Exception:
            continue

        # 🔥 FILTER LOGIC
        if "upcoming" in text or "next" in text:
            if start_dt >= now:
                filtered_events.append((event, start_dt))

        elif "past" in text:
            if start_dt < now:
                filtered_events.append((event, start_dt))

        elif "today" in text:
            if start_dt.date() == now.date():
                filtered_events.append((event, start_dt))

        else:
            # default → upcoming only
            if start_dt >= now:
                filtered_events.append((event, start_dt))

    if not filtered_events:
        return {
            "type": "info",
            "response": "📭 No matching meetings found."
        }

    # Title based on query
    if "past" in text:
        title = "📅 Past Meetings"
    elif "today" in text:
        title = "📅 Today's Meetings"
    elif "all" in text:
        title = "📅 All Meetings"
    else:
        title = "📅 Upcoming Meetings"

    lines = [title]

    for event, start_dt in filtered_events:
        formatted_time = start_dt.strftime("%d %b %Y, %I:%M %p")
        summary = event.get("summary", "No Title")
        lines.append(f"- {summary} at {formatted_time}")

    return {
        "type": "info",
        "response": "\n".join(lines)
    }
