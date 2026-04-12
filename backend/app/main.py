"""
RainUSE Nexus — FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import API_TITLE, API_VERSION, API_DESCRIPTION, CORS_ORIGINS
from app.routes import buildings, summary

# Initialize FastAPI app
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION,
)

# Configure CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(buildings.router)
app.include_router(summary.router)


@app.get("/health", tags=["system"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": API_TITLE,
        "version": API_VERSION,
    }


@app.get("/", tags=["system"])
def root():
    """API root — redirect to docs."""
    return {
        "message": f"Welcome to {API_TITLE}",
        "docs": "/docs",
        "health": "/health",
    }
