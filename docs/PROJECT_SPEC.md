# RainUSE Nexus — Project Specification

## Purpose

RainUSE Nexus is a multi-state building prospecting engine for rainwater reuse opportunities. The system identifies and ranks commercial and industrial buildings that are strong candidates for rainwater harvesting and reuse solutions.

This is a **hackathon prototype**, not a production system.

---

## Workflow

1. **Select / load candidate states** — define geography of interest
2. **Identify candidate buildings** — from building footprint datasets
3. **Enrich buildings** — with climate, visual, economic, policy, resilience, and sustainability signals
4. **Calculate feature scores** — normalize and compute individual feature scores
5. **Compute base viability score** — weighted sum of all feature scores
6. **Apply confidence adjustment** — cooling tower confidence multiplier
7. **Generate final viability score** — 0–100 integer
8. **Show ranked buildings and details in UI** — dashboard, tables, detail drawers

---

## State / Building Logic

- The system supports **multi-state** coverage
- Buildings are loaded from footprint datasets (Microsoft US Building Footprints, TWDB Texas, etc.)
- Each building gets a **viability score** based on physical, economic, resilience, and sustainability features
- Buildings are ranked and filterable by state, score, and opportunity type

---

## Pages in the App

| Page | Description |
|------|-------------|
| **Dashboard** | KPI cards, top states overview, summary stats, top buildings preview |
| **Top Buildings** | Filterable/sortable ranked table with detail drawer |
| **State Insights** | State-level summary: avg score, building count, rainfall/cooling stats |
| **Methodology** | Explains datasets, scoring logic, feature groups, opportunity types |

---

## Team Ownership

| Person | Responsibility |
|--------|---------------|
| **Person 1** | Data ingestion, climate joins, feature normalization, scoring pipeline, processed JSON export |
| **Person 2** | Enrichments: cooling tower likelihood, LEED/ENERGY STAR/SBTi/ESG, policy/incentives, flood/water stress, visual notes |
| **Person 3** | Frontend dashboard UI, ranked table, detail drawer, state insights, filters and polish |

---

## Locked Schema

All components must use the locked building record schema defined in `backend/app/models/schema.py` and `frontend/src/data/mockBuildings.json`. **Do not alter the schema without team agreement.**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Data | JSON files (no database) |
| Pipeline | Python scripts |
| Auth | None (hackathon) |
| Deployment | Local dev only |
