import re


def post_summary_cleaner(text: str) -> str:
    """
    Final cleanup of generated summaries.
    Removes OCR duplication, assembly snippets,
    exaggerated phrases, and malformed words.
    """

    # 1️⃣ Fix repeated characters (e.g. CCoopprroocceessssoorr)
    text = re.sub(r"(.)\1{2,}", r"\1", text)

    # 2️⃣ Remove duplicated adjacent words (e.g. program program)
    text = re.sub(r"\b(\w+)(\s+\1\b)+", r"\1", text, flags=re.IGNORECASE)

    # 3️⃣ Remove assembly / code-like lines
    code_keywords = r"\b(fld|fadd|fst|finit|mov|add|sub|mul|div)\b"
    lines = text.split("\n")
    cleaned_lines = []
    for line in lines:
        if re.search(code_keywords, line, re.IGNORECASE):
            continue
        cleaned_lines.append(line)

    text = "\n".join(cleaned_lines)

    # 4️⃣ Remove exaggerated / hallucination-style phrases
    exaggerations = [
        r"most powerful in the world",
        r"first time .* able to",
        r"never seen before",
        r"revolutionary",
        r"unprecedented",
    ]
    for phrase in exaggerations:
        text = re.sub(phrase, "", text, flags=re.IGNORECASE)

    # 5️⃣ Normalize spacing and punctuation
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([.,])", r"\1", text)

    return text.strip()
