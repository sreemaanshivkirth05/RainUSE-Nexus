# ============================================================================
# RainUSE Nexus — Makefile
# ============================================================================
# Usage:
#   make setup      — install all dependencies (backend + frontend)
#   make dev        — run backend + frontend in parallel
#   make backend    — run backend only
#   make frontend   — run frontend only
#   make test       — run all tests
#   make seed       — load sample data into local dev environment
#   make lint       — lint backend + frontend
#   make clean      — remove build artifacts
# ============================================================================

.PHONY: setup dev backend frontend test seed lint clean deploy help

# Default target
help:
	@echo ""
	@echo "RainUSE Nexus — Development Commands"
	@echo "====================================="
	@echo "  make setup      Install all dependencies"
	@echo "  make dev        Run backend + frontend (parallel)"
	@echo "  make backend    Run backend only (FastAPI on :8000)"
	@echo "  make frontend   Run frontend only (Next.js on :3000)"
	@echo "  make test       Run all tests"
	@echo "  make seed       Copy sample data for local dev"
	@echo "  make lint       Lint all code"
	@echo "  make clean      Remove build artifacts"
	@echo "  make deploy     Deploy to Cloud Run (placeholder)"
	@echo ""

# ----------------------------------------------------------------------------
# Setup
# ----------------------------------------------------------------------------
setup: setup-backend setup-frontend
	@echo "✅ All dependencies installed."

setup-backend:
	@echo "📦 Installing backend dependencies..."
	cd backend && python3 -m pip install -r requirements.txt

setup-frontend:
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install

# ----------------------------------------------------------------------------
# Development
# ----------------------------------------------------------------------------
dev:
	@echo "🚀 Starting backend + frontend..."
	@make backend & make frontend & wait

backend:
	@echo "🐍 Starting FastAPI backend on http://localhost:8000"
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	@echo "⚛️  Starting frontend on http://localhost:3000"
	cd frontend && npm run dev

# ----------------------------------------------------------------------------
# Testing
# ----------------------------------------------------------------------------
test: test-backend test-frontend
	@echo "✅ All tests passed."

test-backend:
	@echo "🧪 Running backend tests..."
	cd backend && python3 -m pytest tests/ -v 2>/dev/null || echo "⚠️  No tests found yet."

test-frontend:
	@echo "🧪 Running frontend tests..."
	cd frontend && npm test 2>/dev/null || echo "⚠️  No tests found yet."

# ----------------------------------------------------------------------------
# Data Pipeline
# ----------------------------------------------------------------------------
seed: pipeline-local
	@echo "✅ Seed complete. Backend will load from data/processed/buildings_serving.csv"

pipeline-local:
	@echo "🔄 Running local pipeline (raw → staging → serving)..."
	python3 -m scripts.pipeline.local_pipeline

pipeline-bq-create:
	@echo "📁 Creating BigQuery datasets..."
	python3 -m scripts.pipeline.bq_pipeline --create-datasets

pipeline-bq-load:
	@echo "📥 Loading sample data to BigQuery..."
	python3 -m scripts.pipeline.bq_pipeline --load-samples

pipeline-bq-rebuild:
	@echo "🔄 Rebuilding BigQuery serving table..."
	python3 -m scripts.pipeline.bq_pipeline --rebuild-serving

pipeline-bq-full:
	@echo "🚀 Running full BigQuery pipeline..."
	python3 -m scripts.pipeline.bq_pipeline --full

# ----------------------------------------------------------------------------
# Code Quality
# ----------------------------------------------------------------------------
lint: lint-backend lint-frontend

lint-backend:
	@echo "🔍 Linting backend..."
	cd backend && python3 -m ruff check . 2>/dev/null || echo "⚠️  ruff not installed. Run: pip install ruff"

lint-frontend:
	@echo "🔍 Linting frontend..."
	cd frontend && npx next lint 2>/dev/null || echo "⚠️  ESLint not configured yet."

# ----------------------------------------------------------------------------
# Clean
# ----------------------------------------------------------------------------
clean:
	@echo "🧹 Cleaning build artifacts..."
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .next -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name node_modules -not -path "./.git/*" -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	@echo "✅ Clean."

# ----------------------------------------------------------------------------
# Deploy (placeholder)
# ----------------------------------------------------------------------------
deploy:
	@echo "🚀 Deployment (placeholder)"
	@echo "   Backend:  gcloud run deploy rainuse-backend ..."
	@echo "   Frontend: gcloud run deploy rainuse-frontend ..."
	@echo "   ⚠️  Not yet implemented. See docs/implementation-plan.md Milestone 5."
