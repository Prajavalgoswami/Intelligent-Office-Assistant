import re


def clean_text(text: str) -> str:
    """
    Cleans OCR / extracted text to improve summarization quality.
    """

    # 1️⃣ Normalize newlines
    text = text.replace("\r", "\n")

    # 2️⃣ Remove excessive blank lines
    text = re.sub(r"\n\s*\n+", "\n\n", text)

    # 3️⃣ Fix broken words split across lines (hyphenation)
    # Example: "micro-\nprocessor" -> "microprocessor"
    text = re.sub(r"(\w+)-\n(\w+)", r"\1\2", text)

    # 4️⃣ Merge lines that are broken mid-sentence
    text = re.sub(r"(?<!\.)\n(?!\n)", " ", text)

    # 5️⃣ Remove excessive whitespace
    text = re.sub(r"[ \t]+", " ", text)

    # 6️⃣ Remove OCR garbage characters (safe set)
    text = re.sub(r"[•■◆◦▶◼]", " ", text)

    # 7️⃣ Remove repeated punctuation
    text = re.sub(r"([.,!?])\1+", r"\1", text)

    # 8️⃣ Trim
    text = text.strip()

    return text
