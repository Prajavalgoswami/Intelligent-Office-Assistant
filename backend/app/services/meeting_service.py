from app.core.datetime_extractor import extract_datetime
from app.core.datetime_extractor import extract_time_only
from app.nlp.datetime_nlp import nlp_extract_datetime
from app.services.conversation_memory import (
    get_user_state,
    update_user_state,
    clear_user_state
)


async def handle_meeting_create(message: str, user: dict):
    user_id = user["id"]

    # 1️⃣ Get previous memory
    state = get_user_state(user_id)

    # 2️⃣ Rule-based extraction first
    dt = extract_datetime(message)

    # 🔹 TIME-ONLY INPUT HANDLING
    if not dt:
        time_only = extract_time_only(message)
        if time_only:
            dt = {"time": time_only}

    # 3️⃣ NLP fallback
    if not dt or dt.get("time") == "00:00":
        nlp_dt = nlp_extract_datetime(message)

        if nlp_dt:
            # 🔹 NLP detected weekday phrase
            if "weekday_phrase" in nlp_dt:
                dt = extract_datetime(nlp_dt["weekday_phrase"])
            else:
                dt = nlp_dt

    # 4️⃣ Merge extracted data into memory
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

    # 7️⃣ All slots filled → confirm
    clear_user_state(user_id)

    return {
        "type": "meeting_confirmation",
        "response": f"Meeting scheduled on {state['date']} at {state['time']}",
        "data": state
    }


async def handle_meeting_query(message: str, user: dict):
    """
    Temporary stub.
    Will be implemented after Calendar integration.
    """
    return {
        "type": "info",
        "response": "Meeting query feature is under development."
    }
