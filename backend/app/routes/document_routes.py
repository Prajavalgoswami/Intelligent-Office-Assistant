from fastapi import APIRouter, UploadFile, File, HTTPException, Form

from app.utils.text_extractor import extract_text
from app.utils.text_cleaner import clean_text
from app.utils.technical_filter import filter_technical_noise
from app.utils.post_summary_cleaner import post_summary_cleaner
from app.utils.final_rewriter import final_rewrite
from app.utils.sentence_deduplicator import remove_repeated_sentences
from app.utils.hash_utils import generate_document_hash

from app.services.document_summarizer import summarize_text
from app.services.document_service import (
    get_cached_document,
    save_document,
    increment_usage
)

router = APIRouter()


@router.post("/summarize")
async def summarize_document(
    file: UploadFile = File(...),
    summary_type: str = Form("normal")
):
    # 1️⃣ Extract raw text (OCR handled internally)
    raw_text = extract_text(file)

    # 2️⃣ Clean extracted text
    cleaned = clean_text(raw_text)

    # 3️⃣ Remove technical noise
    filtered = filter_technical_noise(cleaned)

    if not filtered or not filtered.strip():
        raise HTTPException(
            status_code=400,
            detail="Unable to extract meaningful text from document"
        )

    # 4️⃣ Generate content-based document hash
    document_hash = generate_document_hash(filtered)

    # 5️⃣ CACHE CHECK (document_hash + summary_type)
    cached_doc = await get_cached_document(
        document_hash=document_hash,
        summary_type=summary_type
    )

    if cached_doc:
        await increment_usage(cached_doc["_id"])
        return {
            "filename": cached_doc["filename"],
            "summary_type": summary_type,
            "summary": cached_doc["summary_text"],
            "cached": True,
            "usage_count": cached_doc["usage_count"] + 1
        }

    # 6️⃣ Generate summary (CACHE MISS)
    summary = summarize_text(filtered, summary_type)

    # 7️⃣ Post-processing
    summary = post_summary_cleaner(summary)
    summary = final_rewrite(summary)
    summary = remove_repeated_sentences(summary)

    # 8️⃣ Save document + summary in DB
    await save_document(
        document_hash=document_hash,
        filename=file.filename,
        file_type=file.content_type,
        file_size=file.size,
        summary_type=summary_type,
        summary_text=summary
    )

    return {
        "filename": file.filename,
        "summary_type": summary_type,
        "summary": summary,
        "cached": False,
        "usage_count": 1
    }
