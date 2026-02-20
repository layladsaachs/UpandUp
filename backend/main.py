''' 
Main app entry point for vybe backend

Creates the FastAPI application instance
Registers all route modules
Starts the backend server

'''


from fastapi import FastAPI
from routes.auth import router as auth_router

app = FastAPI()
@app.get("/")
def root():

    # confirm backend is running

    return {"status": "Backend Running"}

app.include_router(auth_router)