from fastapi import FastAPI
from routes.auth import router as auth_router

app = FastAPI()
@app.get("/")
def root():
    return {"status": "Backend Running"}

app.include_router(auth_router)