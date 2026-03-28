from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.super_admin import router as super_admin_router
from app.routes.company_admin import router as company_admin_router
from app.routes.employee import router as employee_router
from app.routes.document_routes import router as document_routes
from app.routes.chat_group_routes import router as chat_group_router
from app.routes.broadcast_routes import router as broadcast_router
from app.routes.conversation_routes import router as conversation_router
from app.routes.auth_google import router as google_auth_router
from app.routes.service_request import router as service_request_router
from app.routes.task_routes import router as task_router

from app.models.chat_groups import init_chat_group_indexes
from app.models.chat_group_member import init_chat_group_member_indexes
from app.models.chat_message import init_chat_message_indexes
from app.models.broadcast_message import init_broadcast_indexes
from app.models.message_read_receipt import init_read_receipt_indexes
from app.models.message_user_delete import init_message_user_delete_indexes

from app.core.database import user_collection

import asyncio
import re
from app.services.reminder_scheduler import check_and_send_reminders
from app.services.user_identity import allocate_unique_username


app = FastAPI(title="Intelligent Office Assistant")


async def _ensure_user_usernames_and_index():
    """Backfill missing usernames for legacy users and ensure a unique index."""
    query = {"$or": [{"username": {"$exists": False}}, {"username": None}, {"username": ""}]}
    async for u in user_collection.find(query):
        email = u.get("email") or "user"
        local = str(email).split("@", 1)[0]
        base = re.sub(r"[^a-z0-9_]", "", local.lower())[:20] or "user"
        oid = str(u["_id"])
        uname = await allocate_unique_username(f"{base}_{oid[-6:]}")
        await user_collection.update_one({"_id": u["_id"]}, {"$set": {"username": uname}})
    try:
        await user_collection.create_index("username", unique=True)
    except Exception as exc:
        print("username index (may already exist):", exc)


@app.on_event("startup")
async def startup_event():
    await _ensure_user_usernames_and_index()
    # Initialize indexes
    await init_chat_group_indexes()
    await init_chat_group_member_indexes()
    await init_chat_message_indexes()
    await init_broadcast_indexes()
    await init_read_receipt_indexes()
    await init_message_user_delete_indexes()

    # Start reminder loop
    async def loop():
        while True:
            await check_and_send_reminders()
            await asyncio.sleep(300)  # every 5 minutes

    asyncio.create_task(loop())


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include Routers
app.include_router(service_request_router)
app.include_router(document_routes, prefix="/documents", tags=["Documents"])
app.include_router(company_admin_router)
app.include_router(super_admin_router)
app.include_router(chat_group_router)
app.include_router(broadcast_router)
app.include_router(google_auth_router)
app.include_router(employee_router)
app.include_router(conversation_router)
app.include_router(task_router)


# Root Endpoint
@app.get("/")
async def root():
    return {"message": "IOA Backend is running! 🎉"}


# Health Check
@app.get("/health")
async def health_check():
    return {"status": "ok"}


print("✅ main.py loaded successfully")
