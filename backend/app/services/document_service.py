from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)

db = client["office_ai_db"]
documents = db["documents"]


# -------------------------
# FETCH CACHED SUMMARY
# -------------------------
async def get_cached_document(document_hash: str, summary_type: str):
    return await documents.find_one({
        "document_hash": document_hash,
        "summary_type": summary_type
    })


# -------------------------
# SAVE NEW DOCUMENT
# -------------------------
async def save_document(
    *,
    document_hash: str,
    filename: str,
    file_type: str,
    file_size: int,
    summary_type: str,
    summary_text: str
):
    doc = {
        "document_hash": document_hash,
        "filename": filename,
        "file_type": file_type,
        "file_size": file_size,
        "summary_type": summary_type,
        "summary_text": summary_text,
        "usage_count": 1,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    await documents.insert_one(doc)
    return doc


# -------------------------
# INCREMENT USAGE COUNT
# -------------------------
async def increment_usage(document_id):
    await documents.update_one(
        {"_id": document_id},
        {
            "$inc": {"usage_count": 1},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
