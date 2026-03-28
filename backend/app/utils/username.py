import re
from typing import Optional


def normalize_username(raw: str) -> str:
    s = (raw or "").strip().lower()
    if not s:
        raise ValueError("Username is required")
    if not re.match(r"^[a-z0-9_]{3,32}$", s):
        raise ValueError(
            "Username must be 3–32 characters: lowercase letters, digits, and underscores only"
        )
    return s


def suggest_username_from_email(email: str) -> str:
    local = (email or "").split("@")[0].lower()
    base = re.sub(r"[^a-z0-9_]", "", local)[:24] or "user"
    return base
