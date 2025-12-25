from fastapi import FastAPI
from app.routes import user_role_routes
app = FastAPI(title="Intelligent Office Assistant")
@app.get("/")
def root():
    app.include_router(
    user_role_routes.router,
    prefix="/user-role",
    tags=["User Role"]
    )
    return {"status": "Backend running"}
