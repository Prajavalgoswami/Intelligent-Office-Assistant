import re
from datetime import datetime, timedelta, date
import dateparser

WEEKDAYS = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6
}


def resolve_next_weekday(target_day: str) -> date:
    today = datetime.now().date()
    today_weekday = today.weekday()
    target_weekday = WEEKDAYS[target_day]

    diff = target_weekday - today_weekday

    if diff > 0:
        return today + timedelta(days=diff)
    else:
        return today + timedelta(days=7 + diff)


def extract_datetime(text: str):
    if not text:
        return None

    text = text.lower()
    today = datetime.now().date()

    # ---------- TIME ----------
    time_match = re.search(r"\b(\d{1,2})(:\d{2})?\s*(am|pm)\b", text)
    time_str = time_match.group(0) if time_match else None

    # ---------- DATE ----------
    date_obj = None

    # today / tomorrow (MANUAL — NO NLP)
    if "today" in text:
        date_obj = today
    elif "tomorrow" in text:
        date_obj = today + timedelta(days=1)

    # next <weekday>
    if not date_obj:
        for day in WEEKDAYS:
            if f"next {day}" in text:
                date_obj = resolve_next_weekday(day)
                break

    # explicit date (5 October)
    if not date_obj:
        match = re.search(r"\b\d{1,2}\s+\w+\b", text)
        if match:
            parsed = dateparser.parse(
                match.group(0),
                languages=["en"],
                settings={"PREFER_DATES_FROM": "future"}
            )
            if parsed:
                date_obj = parsed.date()

    if not date_obj:
        return None

    # ---------- MERGE DATE + TIME ----------
    if time_str:
        final_dt = dateparser.parse(
            f"{date_obj.isoformat()} {time_str}",
            settings={"PREFER_DATES_FROM": "future"}
        )
    else:
        final_dt = datetime.combine(date_obj, datetime.min.time())

    if not final_dt:
        return None

    return {
        "date": final_dt.date().isoformat(),
        "time": final_dt.strftime("%H:%M")
    }

import re
import dateparser

def extract_time_only(text: str):
    match = re.search(r"\b(\d{1,2})(:\d{2})?\s*(am|pm)\b", text.lower())
    if not match:
        return None

    parsed = dateparser.parse(match.group(0))
    if not parsed:
        return None

    return parsed.strftime("%H:%M")
