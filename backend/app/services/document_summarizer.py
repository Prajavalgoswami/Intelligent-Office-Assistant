from transformers import pipeline
from typing import List, Literal

# 🔥 Load model once
summarizer = pipeline(
    "summarization",
    model="sshleifer/distilbart-cnn-12-6"
)

# -----------------------------
# Configuration by summary mode
# -----------------------------
SUMMARY_CONFIG = {
    "brief": {
        "chunk_words": 550,
        "group_words": 650,
        "min_len": 60,
        "max_len": 120,
    },
    "normal": {
        "chunk_words": 450,
        "group_words": 500,
        "min_len": 100,
        "max_len": 200,
    },
    "detailed": {
        "chunk_words": 350,
        "group_words": 450,
        "min_len": 150,
        "max_len": 280,
    },
}

# -----------------------------
# Helpers
# -----------------------------
def split_text(text: str, max_words: int) -> List[str]:
    words = text.split()
    return [
        " ".join(words[i:i + max_words])
        for i in range(0, len(words), max_words)
        if words[i:i + max_words]
    ]


def summarize_chunk(text: str, min_len: int, max_len: int) -> str:
    if not text.strip():
        return ""

    result = summarizer(
        text,
        max_length=max_len,
        min_length=min_len,
        do_sample=False
    )
    return result[0]["summary_text"]


# -----------------------------
# INTRO HANDLING (CRITICAL)
# -----------------------------
def extract_intro(text: str, max_words: int = 400) -> str:
    words = text.split()
    return " ".join(words[:max_words])


def remove_intro_from_text(text: str, intro_word_count: int = 400) -> str:
    """
    Prevent intro duplication in body summarization.
    """
    words = text.split()
    return " ".join(words[intro_word_count:])


def summarize_intro(intro_text: str) -> str:
    if not intro_text.strip():
        return ""

    result = summarizer(
        intro_text,
        max_length=140,
        min_length=70,
        do_sample=False
    )
    return result[0]["summary_text"]


# -----------------------------
# HIERARCHICAL SUMMARIZATION
# -----------------------------
def hierarchical_summarize(
    text: str,
    summary_type: Literal["brief", "normal", "detailed"] = "normal"
) -> str:
    config = SUMMARY_CONFIG[summary_type]

    words = text.split()
    if len(words) < 300:
        # 🔹 Short document → single-pass summary
        return summarize_chunk(
            text,
            config["min_len"],
            config["max_len"]
        )

    # 🔹 STEP 1: INTRO (ANCHOR CONTEXT)
    intro_text = extract_intro(text)
    intro_summary = summarize_intro(intro_text)

    # 🔹 STEP 2: MAIN BODY (WITHOUT INTRO)
    body_text = remove_intro_from_text(text)

    chunks = split_text(body_text, config["chunk_words"])
    level_1 = [
        summarize_chunk(chunk, config["min_len"], config["max_len"])
        for chunk in chunks
        if chunk.strip()
    ]

    grouped = split_text(" ".join(level_1), config["group_words"])
    level_2 = [
        summarize_chunk(group, config["min_len"], config["max_len"])
        for group in grouped
        if group.strip()
    ]

    body_summary = "\n\n".join(level_2)

    # 🔹 STEP 3: FINAL STRUCTURED SUMMARY
    return intro_summary + "\n\n" + body_summary


# -----------------------------
# PUBLIC API
# -----------------------------
def summarize_text(
    text: str,
    summary_type: Literal["brief", "normal", "detailed"] = "normal"
) -> str:
    return hierarchical_summarize(text, summary_type)
