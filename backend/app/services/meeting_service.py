from datetime import datetime, timedelta

from app.core.datetime_extractor import extract_datetime, extract_time_only
from app.nlp.datetime_nlp import nlp_extract_datetime
from app.services.conversation_memory import (
    get_user_state,
    update_user_state,
    clear_user_state
)
from app.services.calendar_service import CalendarService


# ================================
# CREATE MEETING
# ================================
async def handle_meeting_create(message: str, user: dict):
    user_id = user["id"]

    # 1️⃣ Load conversation memory
    state = get_user_state(user_id)

    # 2️⃣ Rule-based extraction
    dt = extract_datetime(message)

    # # 🔹 Handle time-only input ("4 pm")
    if not dt:
        time_only = extract_time_only(message)
        if time_only:
            dt = {"time": time_only}

    # 3️⃣ NLP fallback
    if not dt or dt.get("time") == "00:00":
        nlp_dt = nlp_extract_datetime(message)
        if nlp_dt:
            if "weekday_phrase" in nlp_dt:
                dt = extract_datetime(nlp_dt["weekday_phrase"])
            else:
                dt = nlp_dt

    # 4️⃣ Merge extracted slots into memory
    if dt:
        if "date" in dt:
            state["date"] = dt["date"]
        if "time" in dt:
            state["time"] = dt["time"]

        update_user_state(user_id, state)

    # 5️⃣ Ask for missing date
    if "date" not in state:
        return {
            "type": "clarification",
            "response": "Sure 🙂 Which date should I schedule the meeting?"
        }

    # 6️⃣ Ask for missing time
    if "time" not in state or state["time"] == "00:00":
        return {
            "type": "clarification",
            "response": f"I got the date ({state['date']}). What time works for you?"
        }

    # ================================
    # 7️⃣ All slots filled → create event
    # ================================
    try:
        start_dt = datetime.strptime(
            f"{state['date']} {state['time']}",
            "%Y-%m-%d %H:%M"
        )
        end_dt = start_dt + timedelta(minutes=30)

        calendar_service = CalendarService()
        calendar_service.create_event(
            title="Meeting",
            start_dt=start_dt,
            end_dt=end_dt
        )

    except Exception as e:
        return {
            "type": "error",
            "response": "⚠️ Google Calendar is not connected. Please connect it first."
        }

    # 8️⃣ Clear memory after success
    clear_user_state(user_id)

    return {
        "type": "meeting_confirmation",
        "response": f"✅ Meeting scheduled on {state['date']} at {state['time']}",
        "data": {
            "date": state["date"],
            "time": state["time"]
        }
    }


# ================================
# QUERY MEETINGS
# ================================
async def handle_meeting_query(message: str, user: dict):
    """
    Fetch meetings from Google Calendar based on user query.
    """

    text = message.lower()

    # 🔹 Decide response tone based on user words
    if any(word in text for word in ["all", "every"]):
        header = "📅 Here are all your meetings:"
    elif any(word in text for word in ["next", "upcoming"]):
        header = "📅 Here are your upcoming meetings:"
    else:
        header = "📅 Here are your meetings:"

    try:
        calendar_service = CalendarService()
        events = calendar_service.list_upcoming_events(max_results=10)
    except Exception:
        return {
            "type": "error",
            "response": "⚠️ Google Calendar is not connected."
        }

    if not events:
        return {
            "type": "info",
            "response": "📭 You have no meetings."
        }

    response_lines = [header]

    for event in events:
        start = event["start"].get("dateTime") or event["start"].get("date")

        try:
            start_dt = datetime.fromisoformat(start.replace("Z", ""))
            start_str = start_dt.strftime("%d %b %Y, %I:%M %p")
        except Exception:
            start_str = start

        title = event.get("summary", "Meeting")
        response_lines.append(f"- {title} at {start_str}")

    return {
        "type": "info",
        "response": "\n".join(response_lines)
    }
