from fastapi import FastAPI
from app.routes.super_admin import router as super_admin_router
from app.routes.company_admin import router as company_admin_router
from app.routes.employee import router as employee_router
from fastapi.middleware.cors import CORSMiddleware
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
app.include_router(
    document_routes,
    prefix="/documents",
    tags=["Documents"]
)
app.include_router(company_admin_router)
app.include_router(super_admin_router)
app.include_router(chat_group_router)
app.include_router(chat_socket_router)
app.include_router(broadcast_router)

@app.get("/")
def root():
    return {"status": "OK", "message": "Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

print("✅ main.py end")
