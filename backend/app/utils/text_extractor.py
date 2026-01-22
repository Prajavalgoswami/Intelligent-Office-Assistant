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
    """
    Run OCR on a PIL image and return extracted text.
    """
    text = pytesseract.image_to_string(image, lang="eng")
    return text.strip()


# -----------------------------
# TXT extractor
# -----------------------------
def extract_txt(file: UploadFile) -> str:
    content = file.file.read()
    text = content.decode("utf-8", errors="ignore").strip()

    if not text:
        raise ValueError("TXT file is empty")

    return text


# -----------------------------
# PDF extractor (text + images + OCR)
# -----------------------------
def extract_pdf(file: UploadFile) -> str:
    all_text: List[str] = []

    with pdfplumber.open(file.file) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            # 1️⃣ Extract normal text
            page_text = page.extract_text()
            if page_text:
                all_text.append(page_text)

            # 2️⃣ Extract images and OCR them
            images = page.images
            for img_index, img in enumerate(images):
                try:
                    # Crop image from PDF page
                    bbox = (img["x0"], img["top"], img["x1"], img["bottom"])
                    cropped = page.crop(bbox).to_image(resolution=300)

                    pil_image = cropped.original
                    ocr_text = ocr_image(pil_image)

                    if ocr_text:
                        all_text.append(ocr_text)

                except Exception:
                    # Ignore individual image OCR failures
                    continue

    final_text = "\n".join(all_text).strip()

    if not final_text:
        raise ValueError("Unable to extract text from PDF (including OCR)")

    return final_text


# -----------------------------
# DOCX extractor (text + images + OCR)
# -----------------------------
def extract_docx(file: UploadFile) -> str:
    all_text: List[str] = []

    # python-docx needs a seekable stream
    content = file.file.read()
    doc = DocxDocument(io.BytesIO(content))

    # 1️⃣ Extract paragraph text
    for para in doc.paragraphs:
        if para.text.strip():
            all_text.append(para.text.strip())

    # 2️⃣ Extract images and OCR them
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
        raise ValueError("Unable to extract text from DOCX (including OCR)")

    return final_text


# -----------------------------
# MAIN DISPATCH FUNCTION
# -----------------------------
def extract_text(file: UploadFile) -> str:
    """
    Detect file type and extract text + OCR images.
    Supported: .txt, .pdf, .docx
    """

    suffix = Path(file.filename).suffix.lower()

    if suffix == ".txt":
        return extract_txt(file)

    if suffix == ".pdf":
        return extract_pdf(file)

    if suffix == ".docx":
        return extract_docx(file)

    raise ValueError("Unsupported file type. Only TXT, PDF, and DOCX are supported.")
