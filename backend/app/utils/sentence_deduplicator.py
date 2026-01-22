import re


def normalize_sentence(sentence: str) -> str:
    """
    Normalize sentence for comparison:
    - lowercase
    - remove punctuation
    - normalize whitespace
    """
    sentence = sentence.lower()
    sentence = re.sub(r"[^\w\s]", "", sentence)
    sentence = re.sub(r"\s+", " ", sentence)
    return sentence.strip()


def remove_repeated_sentences(text: str) -> str:
    """
    Removes repeated or near-identical sentences.
    Keeps the first occurrence.
    Generic across all document types.
    """

    sentences = re.split(r"(?<=\.)\s+", text)
    seen = set()
    result = []

    for sentence in sentences:
        normalized = normalize_sentence(sentence)

        if not normalized:
            continue

        if normalized in seen:
            continue  # 🔥 drop repeated sentence

        seen.add(normalized)
        result.append(sentence.strip())

    return " ".join(result)
