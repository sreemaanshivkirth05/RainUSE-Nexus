"""
RainUSE Nexus — App Configuration
"""

import os
from pathlib import Path

# Project root is two levels up from this file (backend/app/core/config.py -> project root)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent

# Data paths
DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"

# Processed data files
BUILDINGS_SCORED_PATH = PROCESSED_DATA_DIR / "buildings_scored.json"
SUMMARY_PATH = PROCESSED_DATA_DIR / "summary.json"

# API settings
API_TITLE = "RainUSE Nexus API"
API_VERSION = "0.1.0"
API_DESCRIPTION = "Multi-state building prospecting engine for rainwater reuse opportunities"

# CORS settings (allow frontend dev server)
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
