from fastapi import UploadFile
from pathlib import Path
from typing import List
import io

import pdfplumber
from docx import Document as DocxDocument
from PIL import Image
import pytesseract


# -----------------------------
# OCR helper
# -----------------------------
def ocr_image(image: Image.Image) -> str:
    text = pytesseract.image_to_string(image, lang="eng")
    return text.strip()


# -----------------------------
# TXT extractor
# -----------------------------
def extract_txt(file: UploadFile) -> str:
    file.file.seek(0)
    content = file.file.read()
    text = content.decode("utf-8", errors="ignore").strip()

    if not text:
        raise ValueError("TXT file is empty")

    return text


# -----------------------------
# PDF extractor (optimized)
# -----------------------------
def extract_pdf(file: UploadFile) -> str:
    file.file.seek(0)
    all_text: List[str] = []

    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:

            # 1️⃣ Extract normal text
            page_text = page.extract_text()

            if page_text and len(page_text.strip()) > 50:
                # If sufficient text found, skip OCR for performance
                all_text.append(page_text)
                continue

            # 2️⃣ OCR fallback only if little/no text
            try:
                page_image = page.to_image(resolution=200)  # 🔥 reduced resolution
                pil_image = page_image.original
                ocr_text = ocr_image(pil_image)

                if ocr_text:
                    all_text.append(ocr_text)

            except Exception:
                continue

    final_text = "\n".join(all_text).strip()

    if not final_text:
        raise ValueError("Unable to extract text from PDF")

    return final_text


# -----------------------------
# DOCX extractor (optimized)
# -----------------------------
def extract_docx(file: UploadFile) -> str:
    file.file.seek(0)
    all_text: List[str] = []

    content = file.file.read()
    doc = DocxDocument(io.BytesIO(content))

    # 1️⃣ Extract paragraph text
    for para in doc.paragraphs:
        if para.text.strip():
            all_text.append(para.text.strip())

    # 2️⃣ OCR only if document has very little text
    if len(" ".join(all_text)) < 50:
        for rel in doc.part._rels.values():
            if "image" in rel.target_ref:
                try:
                    image_bytes = rel.target_part.blob
                    image = Image.open(io.BytesIO(image_bytes))
                    ocr_text = ocr_image(image)

                    if ocr_text:
                        all_text.append(ocr_text)

                except Exception:
                    continue

    final_text = "\n".join(all_text).strip()

    if not final_text:
        raise ValueError("Unable to extract text from DOCX")

    return final_text


# -----------------------------
# MAIN DISPATCH FUNCTION
# -----------------------------
def extract_text(file: UploadFile) -> str:
    suffix = Path(file.filename).suffix.lower()

    if suffix == ".txt":
        return extract_txt(file)

    if suffix == ".pdf":
        return extract_pdf(file)

    if suffix == ".docx":
        return extract_docx(file)

    raise ValueError("Unsupported file type. Only TXT, PDF, and DOCX are supported.")