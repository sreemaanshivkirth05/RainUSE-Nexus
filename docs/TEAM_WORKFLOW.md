# RainUSE Nexus — Team Workflow

## Overview

This project is structured for **3 people working in parallel**. Each person owns a distinct slice of the codebase. The locked schema ensures all work integrates cleanly.

---

## Person 1: Data + Scoring Pipeline

### Owns
- `scripts/ingest/` — all data ingestion scripts
- `scripts/features/` — all feature computation scripts
- `scripts/scoring/` — normalization, weights, scoring, classification
- `scripts/export/` — final JSON export
- `data/raw/` — raw data files
- `data/processed/` — output JSON files
- `backend/app/services/data_service.py` — data loading logic

### Key Tasks
1. Build or refine ingestion scripts to load building footprint data
2. Implement climate data joins (NOAA precipitation, cooling degree days)
3. Normalize all features to 0–1 range
4. Implement the weighted scoring formula
5. Implement confidence adjustment
6. Classify opportunity types
7. Export final `buildings_scored.json`

### Files to Edit
```
scripts/ingest/load_buildings.py
scripts/ingest/load_climate.py
scripts/features/compute_roof_features.py
scripts/features/compute_climate_features.py
scripts/scoring/normalize.py
scripts/scoring/weights.py
scripts/scoring/score_buildings.py
scripts/scoring/classify_opportunity.py
scripts/export/build_processed_outputs.py
data/processed/buildings_scored.json
data/processed/summary.json
```

---

## Person 2: Enrichments + Visual Signals

### Owns
- `scripts/ingest/load_enrichments.py` — enrichment data loaders
- `scripts/ingest/load_policy.py` — policy/incentive data
- `scripts/features/compute_cooling_features.py` — cooling tower scores
- `scripts/features/compute_economic_features.py` — water cost, incentives
- `scripts/features/compute_resilience_features.py` — flood, water stress
- `scripts/features/compute_adoption_features.py` — ESG, LEED, ENERGY STAR
- Enrichment data sources (FEMA, EPA ECHO, LEED, ENERGY STAR, SBTi, etc.)

### Key Tasks
1. Research and integrate cooling tower detection signals
2. Add LEED / ENERGY STAR / SBTi / ESG enrichment
3. Add policy and incentive scoring
4. Add flood risk and water stress data
5. Add facility context from EPA ECHO
6. Add visual notes from rooftop inspection
7. Validate enrichment scores are normalized 0–1

### Files to Edit
```
scripts/ingest/load_enrichments.py
scripts/ingest/load_policy.py
scripts/features/compute_cooling_features.py
scripts/features/compute_economic_features.py
scripts/features/compute_resilience_features.py
scripts/features/compute_adoption_features.py
```

---

## Person 3: Frontend + Integration

### Owns
- `frontend/` — entire frontend directory
- `backend/app/routes/` — API route refinements
- `backend/app/main.py` — API setup / CORS
- UI components, pages, styling, interactions

### Key Tasks
1. Build the dashboard layout (sidebar, header, content)
2. Implement KPI stats cards
3. Build the ranked building table with sorting/filtering
4. Build the building detail drawer with score breakdown
5. Build state insights page
6. Build methodology page
7. Polish UI with badges, animations, and responsive design
8. Connect frontend to backend API (replace mock data with fetch calls)

### Files to Edit
```
frontend/src/App.jsx
frontend/src/pages/*.jsx
frontend/src/components/**/*.jsx
frontend/src/utils/*.js
frontend/src/index.css
backend/app/routes/buildings.py
backend/app/routes/summary.py
```

---

## How to Merge Work

1. **Always pull before starting work**
2. **Stay in your own files** — the ownership boundaries above minimize conflicts
3. **Do not change the locked schema** — if you need a new field, discuss with the team first
4. **Person 1 exports** `buildings_scored.json` → Person 3 consumes it via the API
5. **Person 2 enriches** building records → Person 1 incorporates enrichments into scoring
6. **Person 3 reads** from the API → no direct dependency on Python scripts
7. **Test locally** before pushing — `npm run dev` for frontend, `uvicorn` for backend

---

## The Golden Rule

> **All work must preserve the locked building record schema.**

If a new field is needed, the team must agree and update:
- `backend/app/models/schema.py`
- `frontend/src/data/mockBuildings.json`
- All consuming components

---

## Communication

- Use clear commit messages: `[P1] Add climate normalization`, `[P2] Add LEED enrichment`, `[P3] Build detail drawer`
- Tag commits with your person number for easy tracking
- Keep a running TODO list in your section of the codebase

---

## Quick Start

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev

# Data Pipeline
cd scripts
python scoring/score_buildings.py
```
