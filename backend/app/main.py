from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.super_admin import router as super_admin_router
from app.routes.company_admin import router as company_admin_router
from app.routes.employee import router as employee_router
from app.routes.document_routes import router as document_routes
from app.models.chat_groups import init_chat_group_indexes
from app.models.chat_group_member import init_chat_group_member_indexes
from app.models.chat_message import init_chat_message_indexes
from app.models.broadcast_message import init_broadcast_indexes
from app.routes.chat_group_routes import router as chat_group_router
from app.websocket.chat_socket import router as chat_socket_router
from app.routes.broadcast_routes import router as broadcast_router
from app.models.message_read_receipt import init_read_receipt_indexes
from app.models.message_user_delete import init_message_user_delete_indexes


app = FastAPI(title="Intelligent Office Assistant")
@app.on_event("startup")
async def startup_event():
    await init_chat_group_indexes()
    await init_chat_group_member_indexes()
    await init_chat_message_indexes()
    await init_broadcast_indexes()
@app.on_event("startup")
async def startup_event():
    await init_chat_group_indexes()
    await init_chat_group_member_indexes()
    await init_chat_message_indexes()
    await init_broadcast_indexes()
    await init_read_receipt_indexes()
    await init_message_user_delete_indexes()

from app.routes.conversation_routes import router as conversation_router

from app.routes.auth_google import router as google_auth_router


from app.core.database import ping_server


app = FastAPI(title="Intelligent Office Assistant")

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
app.include_router(document_routes, prefix="/documents", tags=["Documents"])
app.include_router(company_admin_router)
app.include_router(super_admin_router)
app.include_router(chat_group_router)
app.include_router(chat_socket_router)
app.include_router(broadcast_router)
app.include_router(google_auth_router)

app.include_router(employee_router)
app.include_router(conversation_router)

import asyncio
from app.services.reminder_scheduler import check_and_send_reminders
from app.scheduler.reminder_scheduler import start_scheduler




# Root Endpoint
@app.get("/")
async def root():
    return {"message": "IOA Backend is running! 🎉"}


# Health Check
@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.on_event("startup")
async def start_scheduler():

    async def loop():
        while True:
            await check_and_send_reminders()
            await asyncio.sleep(300)  # every 5 minutes

    asyncio.create_task(loop())



print("✅ main.py loaded successfully")
