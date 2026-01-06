from fastapi import FastAPI
from app.super_admin.routes import router as super_admin_router
app = FastAPI(title="Intelligent Office Assistant")
app.include_router(super_admin_router)
@app.get("/health")
def health_check():
    return {"status": "ok"}