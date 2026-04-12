import os
from pathlib import Path

# Project base directory
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

# API Metadata
API_TITLE = "RainUSE Nexus API"
API_VERSION = "0.2.0"
API_DESCRIPTION = "Multi-state building prospecting engine for rainwater reuse opportunities"

# Frontend URL handling
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# CORS specifications
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    FRONTEND_URL,
]
