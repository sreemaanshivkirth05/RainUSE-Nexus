# RainUSE Nexus 💧

**Multi-state building prospecting engine for rainwater reuse opportunities.**

RainUSE Nexus identifies and ranks commercial and industrial buildings that are strong candidates for rainwater harvesting and reuse solutions. Each building receives a viability score (0–100) based on physical, economic, resilience, and sustainability features.

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

### Data Pipeline

```bash
# Score buildings
python scripts/scoring/score_buildings.py

# Build summary
python scripts/export/build_processed_outputs.py
```

---

## Project Structure

```
rainuse-nexus/
├── docs/                    # Project documentation
├── data/
│   ├── raw/                 # Raw dataset files (not committed)
│   └── processed/           # Processed JSON outputs
├── scripts/
│   ├── ingest/              # Data loading scripts
│   ├── features/            # Feature computation
│   ├── scoring/             # Scoring pipeline
│   └── export/              # Output generation
├── backend/
│   └── app/                 # FastAPI application
│       ├── routes/          # API endpoints
│       ├── services/        # Data access layer
│       ├── models/          # Pydantic schemas
│       └── core/            # Configuration
└── frontend/
    └── src/
        ├── components/      # React components
        ├── pages/           # Route pages
        ├── data/            # Mock data
        └── utils/           # Utilities
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
| GET | `/buildings` | List all buildings (with filters) |
| GET | `/buildings/{id}` | Get building details |
| GET | `/summary` | Dashboard summary data |
| GET | `/states` | State-level summaries |

---

## Documentation

- [Project Spec](docs/PROJECT_SPEC.md)
- [Datasets](docs/DATASETS.md)
- [Scoring](docs/SCORING.md)
- [Team Workflow](docs/TEAM_WORKFLOW.md)
