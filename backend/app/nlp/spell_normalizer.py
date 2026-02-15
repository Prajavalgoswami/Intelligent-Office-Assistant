import re
from difflib import get_close_matches

# Words we care about correcting
KNOWN_WORDS = [
    "today", "tomorrow",
    "monday", "tuesday", "wednesday",
    "thursday", "friday", "saturday", "sunday"
]

def normalize_spelling(text: str) -> str:
    words = re.findall(r"\b\w+\b", text.lower())
    corrected_words = []

    for w in words:
        if w in KNOWN_WORDS:
            corrected_words.append(w)
            continue

        match = get_close_matches(w, KNOWN_WORDS, n=1, cutoff=0.8)
        if match:
            corrected_words.append(match[0])
        else:
            corrected_words.append(w)

    return " ".join(corrected_words)
