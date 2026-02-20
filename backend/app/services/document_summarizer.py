from transformers import pipeline
from typing import List
from concurrent.futures import ThreadPoolExecutor
import torch
torch.set_num_threads(6)    
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
        "chunk_words": 650,
        "min_len": 60,
        "max_len": 120,
    },
    "normal": {
        "chunk_words": 650,
        "min_len": 100,
        "max_len": 200,
    },
    "detailed": {
        "chunk_words": 550,
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

    try:
        with torch.inference_mode():
            result = summarizer(
                text,
                max_length=max_len,
                min_length=min_len,
                do_sample=False,
                truncation=True  # 🔥 IMPORTANT
            )

        if not result or "summary_text" not in result[0]:
            return ""

        return result[0]["summary_text"]

    except Exception:
        return ""


# -----------------------------
# 🔥 Parallel chunk processing
# -----------------------------
def parallel_summarize_chunks(
    chunks: List[str],
    min_len: int,
    max_len: int,
    max_workers: int = 4
) -> List[str]:

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(
            executor.map(
                lambda chunk: summarize_chunk(chunk, min_len, max_len),
                chunks
            )
        )

    return results


# -----------------------------
# Intro handling
# -----------------------------
def extract_intro(text: str, max_words: int = 400) -> str:
    words = text.split()
    return " ".join(words[:max_words])


def remove_intro_from_text(text: str, intro_word_count: int = 400) -> str:
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
# Hierarchical summarization
# -----------------------------
def hierarchical_summarize(text: str, summary_type: str = "normal") -> str:

    config = SUMMARY_CONFIG.get(summary_type, SUMMARY_CONFIG["normal"])
    words = text.split()

    # Short document → single pass
    if len(words) < 400:
        return summarize_chunk(
            text,
            config["min_len"],
            config["max_len"]
        )

    # STEP 1: Intro
    intro_text = extract_intro(text)
    intro_summary = summarize_intro(intro_text)

    # STEP 2: Body
    body_text = remove_intro_from_text(text)
    chunks = split_text(body_text, config["chunk_words"])
    chunks = [c for c in chunks if c.strip()]

    # 🔥 Parallel level 1 summarization
    level_1 = parallel_summarize_chunks(
        chunks,
        config["min_len"],
        config["max_len"]
    )

    body_summary = "\n\n".join(level_1)

    return intro_summary + "\n\n" + body_summary


# -----------------------------
# Public API
# -----------------------------
def summarize_text(text: str, summary_type: str = "normal") -> str:
    return hierarchical_summarize(text, summary_type)