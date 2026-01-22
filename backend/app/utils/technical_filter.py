import re


def filter_technical_noise(text: str) -> str:
    """
    Removes low-level hardware / register / table noise
    that should NOT appear in summaries.
    """

    lines = text.split("\n")
    filtered_lines = []

    for line in lines:
        line = line.strip()

        # ❌ Drop empty or very short lines
        if len(line) < 6:
            continue

        # ❌ Drop register/bit-field definitions
        if re.search(r"\b(0\s*=\s*|1\s*=\s*)", line):
            continue

        # ❌ Drop lines dominated by numbers/symbols
        if re.match(r"^[\d\s\W_]+$", line):
            continue

        # ❌ Drop flag/control/table style lines
        if re.search(
            r"\b(bit|flag|register|status|control|opcode|mask|reserved)\b",
            line,
            re.IGNORECASE,
        ):
            continue

        # ❌ Drop OCR table artifacts
        if re.search(r"\b(TT|ii|Ti|PE|QS[01]|ADO|AD\d)\b", line):
            continue

        # ❌ Drop lines with excessive punctuation
        if sum(1 for c in line if c in "=:/|") > 3:
            continue

        filtered_lines.append(line)

    return "\n".join(filtered_lines)
