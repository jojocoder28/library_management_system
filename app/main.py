from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, users, books, transactions
from app.models import * # Import all models to ensure they are registered
import logging.config
from app.core.logging import setup_logging
import time

# Setup Logging
setup_logging()
logger = logging.getLogger("app")

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Library Management System API",
    description="Industry-level backend API for a Library Management System using FastAPI, SQLAlchemy, and SQLite.",
    version="1.0.0",
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        formatted_process_time = "{0:.2f}".format(process_time)
        logger.info(f"path={request.url.path} method={request.method} status={response.status_code} duration={formatted_process_time}ms")
        return response
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        logger.error(f"Request failed: path={request.url.path} method={request.method} duration={process_time:.2f}ms error={str(e)}")
        logger.critical(f"Unhandled Exception: {str(e)}", exc_info=True)
        raise e

import os
from dotenv import load_dotenv

load_dotenv()

# CORS Middleware
origins = [
    "http://localhost",
    "http://localhost:5173", # Common frontend port
    "http://localhost:8080",
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/auth")
app.include_router(users.router)
app.include_router(books.router)
app.include_router(transactions.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Library Management System API request /docs for swagger"}
