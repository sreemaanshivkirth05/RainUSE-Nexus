# RainUSE Nexus

**Multi-state building prospecting engine for rainwater reuse opportunities.**

RainUSE Nexus identifies and ranks commercial and industrial buildings that are strong candidates for rainwater harvesting and reuse solutions. Each building receives a viability score from 0 to 100 based on physical, climate, cooling-demand, economic, and adoption-readiness signals.

---

## Quick Start

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Visit: http://localhost:8000/docs

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:5173

---

## Data Pipeline

Use the real scripts in `scripts/` below for teammate handoff and challenge workflow refreshes.

### Core scoring outputs

```bash
# Score stage-2b candidate buildings and write the ranked outputs
python scripts/scoring/score_buildings.py

# Rebuild the API summary JSON from scored buildings
python scripts/export/build_processed_outputs.py
```

These commands produce or refresh the main processed outputs used by the app and scoring workflow:

- `data/processed/buildings_scored.csv`
- `data/processed/buildings_scored.json`
- `data/processed/top_500_buildings.csv`
- `data/processed/top_500_buildings.json`
- `data/processed/top_100_by_state.csv`
- `data/processed/top_100_by_state.json`
- `data/processed/summary.json`

### Imagery review queue

```bash
# Build review queues for imagery validation
python scripts/imagery/create_imagery_review_queue.py
```

This supports the imagery review artifacts used by the team:

- `data/processed/imagery_review_demo_shortlist.csv`
- `data/processed/imagery_review_top_500.csv`
- `data/processed/imagery_review_top_100_by_state.csv`

### Upstream regeneration

When teammates need to rebuild earlier stages, use:

- `scripts/ingest/` for raw-source loading
- `scripts/features/` for feature computation
- `scripts/scoring/` for ranking and shortlist generation
- `scripts/export/` for final API-facing summaries

---

## Data Policy

- `data/raw/` is excluded from Git and should remain local-only.
- `data/processed/` is included in Git for team collaboration and challenge delivery.
- Processed CSV and JSON outputs are committed so teammates can run the app, review imagery queues, and reproduce demos without needing every raw source file locally.

---

## Project Structure

```text
rainuse-nexus/
|-- docs/                    # Project documentation
|-- data/
|   |-- raw/                 # Raw dataset files (not committed)
|   `-- processed/           # Processed CSV and JSON outputs used by the app and team workflow
|-- scripts/
|   |-- ingest/              # Data loading scripts
|   |-- features/            # Feature computation
|   |-- scoring/             # Scoring and ranking pipeline
|   |-- imagery/             # Imagery review queue generation
|   `-- export/              # Output generation for API/dashboard use
|-- backend/
|   `-- app/                 # FastAPI application
|       |-- routes/          # API endpoints
|       |-- services/        # Data access layer
|       |-- models/          # Pydantic schemas
|       `-- core/            # Configuration
`-- frontend/
    `-- src/
        |-- components/      # React components
        |-- pages/           # Route pages
        |-- data/            # Mock data
        `-- utils/           # Utilities
```

---

## Team Ownership

| Person | Area | Key Files |
|--------|------|-----------|
| **Person 1** | Data + Scoring | `scripts/`, `data/` |
| **Person 2** | Enrichments + Signals | `scripts/ingest/load_enrichments.py`, `scripts/features/compute_*` |
| **Person 3** | Frontend + Integration | `frontend/`, `backend/app/routes/` |

See `docs/TEAM_WORKFLOW.md` for full details.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/buildings` | List all buildings with filters |
| GET | `/buildings/{id}` | Get building details |
| GET | `/summary` | Dashboard summary data |
| GET | `/states` | State-level summaries |

---

## Processed Files Verified On GitHub

Verified on `origin/main`:

- `data/processed/buildings_stage2b.csv`
- `data/processed/buildings_scored.csv`
- `data/processed/top_500_buildings.csv`
- `data/processed/top_100_by_state.csv`
- `data/processed/imagery_review_demo_shortlist.csv`
- `data/processed/imagery_review_top_500.csv`
- `data/processed/imagery_review_top_100_by_state.csv`

---

## Documentation

- [Project Spec](docs/PROJECT_SPEC.md)
- [Datasets](docs/DATASETS.md)
- [Scoring](docs/SCORING.md)
- [Team Workflow](docs/TEAM_WORKFLOW.md)
