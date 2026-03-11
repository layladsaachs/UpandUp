''' 
Main app entry point for vybe backend

Creates the FastAPI application instance
Registers all route modules
Starts the backend server

'''


from fastapi import FastAPI
from routes.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():

    # confirm backend is running

    return {"status": "Backend Running"}

app.include_router(auth_router)