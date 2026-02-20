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


def resolve_next_weekday(target_day: str, include_today=False) -> date:
    today = datetime.now().date()
    today_weekday = today.weekday()
    target_weekday = WEEKDAYS[target_day]

    diff = target_weekday - today_weekday

    if diff > 0:
        return today + timedelta(days=diff)
    elif diff == 0 and include_today:
        return today
    else:
        return today + timedelta(days=7 + diff)


def extract_datetime(text: str):
    if not text:
        return None

    text = text.lower()
    now = datetime.now()
    today = now.date()

    # -------------------------
    # TIME
    # -------------------------
    time_match = re.search(r"\b(\d{1,2})(:\d{2})?\s*(am|pm)\b", text)
    time_str = time_match.group(0) if time_match else None

    date_obj = None

    # -------------------------
    # TODAY / TOMORROW
    # -------------------------
    if "today" in text:
        date_obj = today

    elif "tomorrow" in text:
        date_obj = today + timedelta(days=1)

    # -------------------------
    # AFTER X DAYS
    # -------------------------
    if not date_obj:
        match = re.search(r"after\s+(\d+)\s+days?", text)
        if match:
            days = int(match.group(1))
            date_obj = today + timedelta(days=days)

    # -------------------------
    # IN X DAYS
    # -------------------------
    if not date_obj:
        match = re.search(r"in\s+(\d+)\s+days?", text)
        if match:
            days = int(match.group(1))
            date_obj = today + timedelta(days=days)

    # -------------------------
    # AFTER X WEEKS
    # -------------------------
    if not date_obj:
        match = re.search(r"after\s+(\d+)\s+weeks?", text)
        if match:
            weeks = int(match.group(1))
            date_obj = today + timedelta(weeks=weeks)

    
     # after X days  (NEW LOGIC)
    if not date_obj:
        match = re.search(r"after\s+(\d+)\s+day", text)
        if match:
            days = int(match.group(1))
            date_obj = today + timedelta(days=days)


    # -------------------------
    # IN X HOURS
    # -------------------------
    if not date_obj:
        match = re.search(r"in\s+(\d+)\s+hours?", text)
        if match:
            hours = int(match.group(1))
            future_dt = now + timedelta(hours=hours)
            return {
                "date": future_dt.date().isoformat(),
                "time": future_dt.strftime("%H:%M")
            }

    # -------------------------
    # THIS / COMING WEEKDAY
    # -------------------------
    if not date_obj:
        for day in WEEKDAYS:
            if f"this {day}" in text or f"coming {day}" in text:
                date_obj = resolve_next_weekday(day, include_today=True)
                break

    # -------------------------
    # NEXT WEEKDAY
    # -------------------------
    if not date_obj:
        for day in WEEKDAYS:
            if f"next {day}" in text:
                date_obj = resolve_next_weekday(day)
                break

    # -------------------------
    # EXPLICIT DATE (12 January)
    # -------------------------
    if not date_obj:
        match = re.search(r"\b\d{1,2}\s+\w+\b", text)
        if match:
            parsed = dateparser.parse(
                match.group(0),
                settings={"PREFER_DATES_FROM": "future"}
            )
            if parsed:
                date_obj = parsed.date()

    # -------------------------
    # FINAL FALLBACK (dateparser full parse)
    # -------------------------
    if not date_obj:
        parsed = dateparser.parse(
            text,
            settings={"PREFER_DATES_FROM": "future"}
        )
        if parsed:
            return {
                "date": parsed.date().isoformat(),
                "time": parsed.strftime("%H:%M")
            }

    if not date_obj:
        return None

    # -------------------------
    # MERGE DATE + TIME
    # -------------------------
    if time_str:
        final_dt = dateparser.parse(
            f"{date_obj.isoformat()} {time_str}",
            settings={"PREFER_DATES_FROM": "future"}
        )
    else:
        final_dt = datetime.combine(date_obj, datetime.min.time())

    return {
        "date": final_dt.date().isoformat(),
        "time": final_dt.strftime("%H:%M")
    }


def extract_time_only(text: str):
    match = re.search(r"\b(\d{1,2})(:\d{2})?\s*(am|pm)\b", text.lower())
    if not match:
        return None

    parsed = dateparser.parse(match.group(0))
    if not parsed:
        return None

    return parsed.strftime("%H:%M")
