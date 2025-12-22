from fastapi import FastAPI

app = FastAPI(title="Intelligent Office Assistant")

@app.get("/")
def root():
    return {"status": "Backend running"}
