# main.py
from fastapi import FastAPI
from app.core.database import ping_server
from app.routes.conversation_routes import router as conversation_router

# from app.super_admin.routes import router as super_admin_router
# from app.company_admin.routes import router as company_admin_router


# app.include_router(company_admin_router)
# app.include_router(super_admin_router)

app = FastAPI(title="Intelligent Office Assistant")

@app.on_event("startup")
async def startup():
    await ping_server()

@app.get("/")
async def root():
    return {"message": "IOA Backend is running! 🎉"}

   

app.include_router(conversation_router)
