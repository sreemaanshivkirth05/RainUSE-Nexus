# RainUSE Nexus

> **Find which commercial rooftops can pay for themselves in rainwater savings.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Dashboard-10b981?style=for-the-badge)](https://rainuse-nexus.vercel.app)
[![Backend API](https://img.shields.io/badge/API%20Docs-FastAPI-009688?style=for-the-badge)](https://rainuse-nexus-api.railway.app/docs)

---

## What It Does

RainUSE Nexus is a building prospecting engine that scores **every large commercial and industrial rooftop across 22 U.S. states** for rainwater harvesting viability — turning raw satellite data and open government datasets into a ranked, filterable shortlist a sustainability team can act on today. Each building receives a 0–100 viability score combining 17 physical, climate, economic, and regulatory signals, and an AI-assisted confidence rating for whether cooling tower infrastructure is present (the primary end-use for harvested water). The interactive dashboard lets judges explore top prospects on an interactive map, drill into per-building ROI projections, and see exactly which signal drove each recommendation.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                         │
│  Microsoft Building Footprints · NOAA Precipitation ·       │
│  EPA FRS · FEMA Flood Zones · WRI Aqueduct · EIA Water      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    PYTHON PIPELINE                          │
│  Ingest → Feature Engineering → 17-Factor Scoring →        │
│  GPT-4o AI Cooling-Tower Detection → Ranked Outputs         │
└────────────────────────┬────────────────────────────────────┘
                         │  data/processed/*.json
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND                           │
│  GET /buildings · /buildings/{id} · /summary · /states      │
│  Pydantic schemas · LRU-cached responses                    │
└────────────────────────┬────────────────────────────────────┘
                         │  REST JSON
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  REACT DASHBOARD                            │
│  Interactive Map (Leaflet) · Building Explorer ·            │
│  ROI Calculator · Score Breakdown · State Drilldowns        │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

- **AI Cooling-Tower Confidence** — GPT-4o analyzes building attributes to estimate whether a cooling tower is present, the primary driver of industrial water demand; result feeds directly into the final score.
- **17-Feature Viability Score** — a weighted composite spanning roof geometry, NOAA rainfall, WRI water stress, FEMA flood risk, EPA facility context, local water rates, state policy, and ESG signals; each dimension is transparent and auditable.
- **Per-Building ROI Calculator** — instantly shows estimated annual water-cost savings, payback period (assuming a $45K system), and CO₂ equivalent offset for any building on the platform.
- **Interactive National Map** — 500+ buildings plotted as color-coded pins (green ≥ 70, amber 50–69, red < 50) with click-to-inspect popups and state-level zoom filtering.
- **22-State Coverage** — scored candidate pool spanning the entire Sun Belt and Southeast, the regions with the highest combination of rainfall volume, cooling demand, and water-cost pressure.

---

## Quick Start

**Step 1 — Run the backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# API docs → http://localhost:8000/docs
```

**Step 2 — Run the frontend**
```bash
cd frontend
cp .env.example .env.local   # sets VITE_API_URL=http://localhost:8000
npm install && npm run dev
# Dashboard → http://localhost:5173
```

**Step 3 — (Optional) Rebuild scored data**
```bash
python scripts/scoring/score_buildings.py
python scripts/export/build_processed_outputs.py
```

> **No backend?** The frontend ships with bundled demo data and works fully offline. The navbar shows a `DEMO MODE` badge when the live API is unreachable.

---

## Data Sources

| Dataset | Provider | Used For |
|---|---|---|
| Building Footprints (BING) | Microsoft / OpenStreetMap | Roof area, geometry, coordinates |
| Climate Normals | NOAA | Annual precipitation per location |
| Cooling Degree Days | NOAA | Regional mechanical-cooling load |
| Facility Registry System | U.S. EPA | Industrial facility context score |
| Flood Hazard Layers | FEMA | Flood risk / resilience signal |
| Aqueduct Water Risk Atlas | WRI | Baseline water stress per watershed |
| Water Tariff Data | EIA / State Utilities | Local water cost ($/kgal) |
| State Policy Index | NCEL / NCSL | Rainwater harvesting legal framework |
| AI Roof Assessment | OpenAI GPT-4o | Cooling-tower confidence scoring |

---

## Project Structure

```
rainuse-nexus/
├── scripts/          # Data pipeline (ingest → features → scoring → export)
├── data/processed/   # Scored outputs consumed by the API
├── backend/          # FastAPI app (routes, services, Pydantic models)
└── frontend/         # React + Vite dashboard (Tailwind, Leaflet, Framer Motion)
```

---

## API Reference

| Endpoint | Description |
|---|---|
| `GET /buildings?state=Texas&limit=50` | Filtered building list |
| `GET /buildings/{id}` | Full building detail + scores |
| `GET /summary` | Dashboard KPIs |
| `GET /states` | Per-state aggregates |
