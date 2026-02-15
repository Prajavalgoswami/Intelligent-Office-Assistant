import re
import spacy
import dateparser
from datetime import datetime
from app.nlp.spell_normalizer import normalize_spelling

# Load spaCy model once (IMPORTANT: do NOT load inside function)
nlp = spacy.load("en_core_web_sm")

# Weekdays for NLP detection (NOT date calculation)
WEEKDAYS = [
    "monday", "tuesday", "wednesday",
    "thursday", "friday", "saturday", "sunday"
]


def detect_weekday_phrase(text: str):
    """
    Detects phrases like:
    - next friday
    - this monday
    Returns the phrase if found, else None
    """
    for day in WEEKDAYS:
        if f"next {day}" in text:
            return f"next {day}"
        if f"this {day}" in text:
            return f"this {day}"
    return None


def nlp_extract_datetime(text: str):
    """
    NLP-based fallback datetime extraction.
    Used ONLY if rule-based extraction fails.

    Returns:
    - {"date": ..., "time": ...}
    - {"weekday_phrase": "next friday"}
    - None (if confidence is low)
    """
    if not text:
        return None

    # 🔹 STEP 1: Normalize spelling (SAFE)
    text = normalize_spelling(text.lower())

    # 🔹 STEP 2: Detect weekday phrase (NLP assist only)
    weekday_phrase = detect_weekday_phrase(text)
    if weekday_phrase:
        return {"weekday_phrase": weekday_phrase}

    # 🔹 STEP 3: spaCy NER
    doc = nlp(text)

    date_text = None
    time_text = None

    for ent in doc.ents:
        if ent.label_ == "DATE":
            date_text = ent.text
        elif ent.label_ == "TIME":
            time_text = ent.text

    if not date_text and not time_text:
        return None  # nothing meaningful detected

    # 🔹 STEP 4: Parse DATE
    date_obj = None
    if date_text:
        parsed_date = dateparser.parse(
            date_text,
            settings={"PREFER_DATES_FROM": "future"}
        )
        if parsed_date:
            date_obj = parsed_date.date()

    if not date_obj:
        return None

    # 🔹 STEP 5: Parse TIME
    time_str = None
    if time_text:
        time_match = re.search(r"\d{1,2}(:\d{2})?\s*(am|pm)", time_text)
        if time_match:
            time_str = time_match.group(0)

    # 🔹 STEP 6: If time missing, return date only
    if not time_str:
        return {
            "date": date_obj.isoformat(),
            "time": "00:00"
        }

    # 🔹 STEP 7: Merge date + time
    final_dt = dateparser.parse(
        f"{date_obj.isoformat()} {time_str}",
        settings={"PREFER_DATES_FROM": "future"}
    )

    if not final_dt:
        return None

    return {
        "date": final_dt.date().isoformat(),
        "time": final_dt.strftime("%H:%M")
    }
