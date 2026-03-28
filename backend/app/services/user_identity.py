import re
import secrets

from app.core.database import user_collection


async def allocate_unique_username(base: str) -> str:
    """Return a globally unique username (lowercase, 3–32 chars)."""
    clean = re.sub(r"[^a-z0-9_]", "", (base or "").lower())[:24] or "user"
    if len(clean) < 3:
        clean = f"usr{secrets.token_hex(2)}"
    candidate = clean[:32]
    i = 0
    while await user_collection.find_one({"username": candidate}):
        i += 1
        suffix = f"_{i}"
        candidate = (clean[: 32 - len(suffix)] + suffix)[:32]
    return candidate
