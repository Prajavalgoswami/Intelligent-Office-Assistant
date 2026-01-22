from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.utils.text_extractor import extract_text
from app.services.document_summarizer import summarize_text
from app.utils.text_cleaner import clean_text
from app.utils.technical_filter import filter_technical_noise
from app.utils.post_summary_cleaner import post_summary_cleaner
from app.utils.final_rewriter import final_rewrite
from app.utils.sentence_deduplicator import remove_repeated_sentences
router = APIRouter()

@router.post("/summarize")
async def summarize_document(
    file: UploadFile = File(...),
    summary_type: str = Form("normal")
):
    # 1️⃣ Extract raw text
    text = extract_text(file)

    # 2️⃣ Clean OCR / extracted text
    cleaned = clean_text(text)

    # 3️⃣ Remove low-level technical noise
    filtered = filter_technical_noise(cleaned)

    # 4️⃣ Generate summary (length-controlled + intro preserved)
    summary = summarize_text(filtered, summary_type)

    # 5️⃣ Post-summary cleanup (remove duplication, junk)
    summary = post_summary_cleaner(summary)

    # 6️⃣ FINAL rewrite pass (grammar & flow)
    summary = final_rewrite(summary)
    summary = remove_repeated_sentences(summary)

    return {
        "filename": file.filename,
        "summary_type": summary_type,
        "summary": summary
    }
