import hashlib
import re
import unicodedata


def normalize_for_hash(text: str) -> str:
    """
    Canonical normalization for cross-format documents (PDF, DOCX, OCR).
    This is FORMAT-AGNOSTIC and CONTENT-AGNOSTIC.
    """

    # 1️⃣ Unicode normalization (fix smart quotes, dashes, etc.)
    text = unicodedata.normalize("NFKD", text)

    # 2️⃣ Lowercase
    text = text.lower()

    # 3️⃣ Fix hyphenation across line breaks (PDF issue)
    # Example: "archi-\ntecture" → "architecture"
    text = re.sub(r"(\w)-\s+(\w)", r"\1\2", text)

    # 4️⃣ Remove all punctuation (keep words & numbers)
    text = re.sub(r"[^\w\s]", " ", text)

    # 5️⃣ Normalize all whitespace (spaces, tabs, newlines)
    text = re.sub(r"\s+", " ", text)

    # 6️⃣ Strip leading/trailing spaces
    return text.strip()


def generate_document_hash(text: str) -> str:
    """
    Generate a stable content hash for documents.
    Same logical content → same hash (PDF vs DOCX).
    """

    if not text or not text.strip():
        raise ValueError("Cannot generate hash from empty text")

    canonical_text = normalize_for_hash(text)

    return hashlib.sha256(
        canonical_text.encode("utf-8")
    ).hexdigest()
