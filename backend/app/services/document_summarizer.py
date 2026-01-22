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
    ]


def summarize_chunk(text: str, min_len: int, max_len: int) -> str:
    result = summarizer(
        text,
        max_length=max_len,
        min_length=min_len,
        do_sample=False
    )
    return result[0]["summary_text"]


# -----------------------------
# INTRO HANDLING (CRITICAL FIX)
# -----------------------------
def extract_intro(text: str, max_words: int = 400) -> str:
    """
    Extract the introductory portion of the document.
    Ensures context is never lost.
    """
    words = text.split()
    return " ".join(words[:max_words])


def summarize_intro(intro_text: str) -> str:
    """
    Summarize the introduction separately to anchor context.
    """
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

    # 🔹 STEP 1: INTRO (ALWAYS PRESERVED)
    intro_text = extract_intro(text)
    intro_summary = summarize_intro(intro_text)

    # 🔹 STEP 2: MAIN BODY (hierarchical)
    chunks = split_text(text, config["chunk_words"])
    level_1 = [
        summarize_chunk(chunk, config["min_len"], config["max_len"])
        for chunk in chunks
    ]

    grouped = split_text(" ".join(level_1), config["group_words"])
    level_2 = [
        summarize_chunk(group, config["min_len"], config["max_len"])
        for group in grouped
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
