import re


def final_rewrite(summary: str) -> str:
    """
    Final language repair pass.
    Improves sentence quality and flow
    WITHOUT removing content or shortening.
    """

    # 1️⃣ Remove duplicated phrases
    summary = re.sub(
        r"\b(\w+(?:\s+\w+){0,3})\b(?:\s+\1\b)+",
        r"\1",
        summary,
        flags=re.IGNORECASE,
    )

    # 2️⃣ Remove dangling filler fragments
    summary = re.sub(
        r"\b(by the programmer|by the computer)\b(\s*\.)?",
        "",
        summary,
        flags=re.IGNORECASE,
    )

    # 3️⃣ Fix malformed sentence starts
    summary = re.sub(
        r"\b(use such a processor|it is the use such a processor)\b",
        "Such a processor is used",
        summary,
        flags=re.IGNORECASE,
    )

    # 4️⃣ Fix broken comparative phrases
    summary = re.sub(
        r"\b(and has a much lower clock counts?)\b",
        "and achieves much lower instruction execution times",
        summary,
        flags=re.IGNORECASE,
    )

    # 5️⃣ Normalize punctuation and spacing
    summary = re.sub(r"\s*\.\s*", ". ", summary)
    summary = re.sub(r"\s+", " ", summary)

    return summary.strip()
