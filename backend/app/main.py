from fastapi import FastAPI
from app.super_admin.routes import router as super_admin_router
from app.company_admin.routes import router as company_admin_router
from fastapi.middleware.cors import CORSMiddleware
from app.routes.document_routes import router as document_routes
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
app.include_router(
    document_routes,
    prefix="/documents",
    tags=["Documents"]
)
app.include_router(company_admin_router)
app.include_router(super_admin_router)
@app.get("/health")
def health_check():
    return {"status": "ok"}