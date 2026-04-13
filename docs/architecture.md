# RainUSE Nexus — System Architecture

## Overview

RainUSE Nexus is a B2B prospecting engine that ranks commercial/industrial buildings across 22 U.S. states for rainwater harvesting viability. The system ingests multiple CSV datasets, scores buildings on physical, economic, resilience, and sustainability dimensions, and exposes the results through a filterable, paginated web UI.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS / BROWSER                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Next.js Frontend (Cloud Run / Vercel)               │    │
│  │  - Filter sidebar        - Results table             │    │
│  │  - Pagination             - Loading/empty states     │    │
│  │  - Total count display    - Reset filters            │    │
│  └───────────────────────────┬──────────────────────────┘    │
│                              │ HTTP (JSON)                    │
│                              ▼                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  FastAPI Backend (Cloud Run)                         │    │
│  │  - POST /api/v1/buildings/search                     │    │
│  │  - GET  /api/v1/buildings/{id}                       │    │
│  │  - GET  /api/v1/filters/options                      │    │
│  │  - GET  /health                                      │    │
│  │                                                      │    │
│  │  Query Builder: parameterized SQL only               │    │
│  │  Data Source:   BigQuery or local fallback            │    │
│  └───────────────────────────┬──────────────────────────┘    │
│                              │                                │
│              ┌───────────────┴───────────────┐                │
│              ▼                               ▼                │
│  ┌──────────────────┐           ┌──────────────────────┐     │
│  │  BigQuery         │           │  Local Fallback      │     │
│  │  (Production)     │           │  (Development)       │     │
│  │                   │           │                      │     │
│  │  buildings_serving│           │  sample-data/*.csv   │     │
│  │  (denormalized)   │           │  → in-memory filter  │     │
│  └────────┬─────────┘           └──────────────────────┘     │
│           │                                                   │
│           ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Google Cloud Storage                                │    │
│  │  Raw CSV uploads → BigQuery load jobs                │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Data Model: Raw → Staging → Serving

### Layer 1: Raw
- One BigQuery table per CSV source (e.g., `raw.building_footprints`, `raw.noaa_precipitation`)
- Schema matches CSV headers exactly
- No transformations

### Layer 2: Staging
- Cleaned, typed, deduplicated tables (e.g., `staging.buildings_base`, `staging.precipitation`)
- Consistent column naming conventions
- Foreign keys established via `building_id`

### Layer 3: Serving
- Single wide denormalized table: `serving.buildings_serving`
- One row per building, all metrics as columns
- Clustered by: `state`, `city`, `opportunity_type`, `roof_over_100k`
- This is the ONLY table the API queries

### Serving Table Schema

| Column | Type | Description |
|--------|------|-------------|
| `building_id` | STRING | Primary key |
| `name` | STRING | Building name |
| `state` | STRING | U.S. state |
| `city` | STRING | City |
| `latitude` | FLOAT64 | Lat |
| `longitude` | FLOAT64 | Lon |
| `roof_area_sqft` | FLOAT64 | Roof catchment area |
| `roof_over_100k` | BOOL | Flag: roof > 100k sqft |
| `annual_rain_inches` | FLOAT64 | Annual precipitation |
| `annual_capture_gallons` | FLOAT64 | Estimated harvest volume |
| `cooling_tower_score` | FLOAT64 | Cooling tower presence (0-1) |
| `cooling_confidence` | FLOAT64 | Detection confidence (0-1) |
| `water_cost_score` | FLOAT64 | Local water cost factor (0-1) |
| `state_policy_score` | FLOAT64 | Policy favorability (0-1) |
| `flood_score` | FLOAT64 | Flood risk factor (0-1) |
| `water_stress_score` | FLOAT64 | Water scarcity (0-1) |
| `esg_score` | FLOAT64 | ESG commitment (0-1) |
| `leed_score` | FLOAT64 | LEED certification (0-1) |
| `energy_star_score` | FLOAT64 | Energy Star (0-1) |
| `final_viability_score` | INT64 | Overall score (0-100) |
| `opportunity_type` | STRING | Classification label |
| `explanation` | STRING | Why this building scores well |

## API Contract

### `POST /api/v1/buildings/search`

**Request:**
```json
{
  "filters": {
    "states": ["Texas", "Arizona"],
    "min_roof_area_sqft": 100000,
    "min_viability_score": 60,
    "opportunity_types": ["Cooling-Demand-Driven"],
    "roof_over_100k": true
  },
  "sort": {
    "field": "final_viability_score",
    "direction": "desc"
  },
  "page": 1,
  "page_size": 25
}
```

**Response:**
```json
{
  "total": 142,
  "page": 1,
  "page_size": 25,
  "total_pages": 6,
  "items": [...]
}
```

### `GET /api/v1/filters/options`

Returns available filter values with counts:
```json
{
  "states": [{"value": "Texas", "count": 45}, ...],
  "opportunity_types": [{"value": "Cooling-Demand-Driven", "count": 32}, ...],
  "score_range": {"min": 12, "max": 94},
  "roof_area_range": {"min": 5200, "max": 420000}
}
```

## Technology Decisions

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js + TypeScript + Tailwind CSS | Rich UI, SSR capability, strong ecosystem |
| Backend | Python 3.12 + FastAPI | Type-safe, async, auto-generated OpenAPI docs |
| Database | BigQuery | Built for analytical queries on large CSVs |
| Storage | Google Cloud Storage | CSV staging area, BigQuery native integration |
| Hosting | Cloud Run | Serverless, scales to zero, Docker-native |
| Dev fallback | In-memory CSV | Works without GCP credentials for local dev |

## Security Boundaries

1. Frontend → Backend: CORS-restricted HTTP only
2. Backend → BigQuery: Service account with `bigquery.dataViewer` + `bigquery.jobUser`
3. No credentials in code: `GOOGLE_APPLICATION_CREDENTIALS` env var or workload identity
4. All SQL is parameterized: no string concatenation of user input
