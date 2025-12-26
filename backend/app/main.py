# main.py
from fastapi import FastAPI
from core.database import ping_server

app = FastAPI(title="Intelligent Office Assistant")

@app.on_event("startup")
async def startup():
    await ping_server()

@app.get("/")
async def root():
    return {"message": "IOA Backend is running! 🎉"}