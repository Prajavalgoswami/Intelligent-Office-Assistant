print("🔥 main.py start")
from fastapi import FastAPI
from app.routes.super_admin import router as super_admin_router
from app.routes.company_admin import router as company_admin_router
from app.routes.employee import router as employee_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="Intelligent Office Assistant")
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
app.include_router(employee_router)
app.include_router(company_admin_router)
app.include_router(super_admin_router)

@app.get("/")
def root():
    return {"status": "OK", "message": "Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

print("✅ main.py end")
