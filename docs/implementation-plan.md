# RainUSE Nexus — Implementation Plan

## Milestone 1: Foundation ✅
**Goal:** Monorepo structure, config, documentation, sample data, dev tooling.

- [x] Create `.agents/rules/project.md`
- [x] Create `docs/architecture.md`
- [x] Create `docs/implementation-plan.md` (this file)
- [x] Create full monorepo folder structure
- [x] Create root `README.md` with local setup steps
- [x] Create root `Makefile` with dev targets
- [x] Create `.env.example` files
- [x] Create sample seed CSV in `sample-data/`
- [x] Create `config/filters.yaml` — config-driven filter definitions
- [x] Create `config/sources.yaml` — config-driven CSV source registry

## Milestone 2: Backend API Core ✅
**Goal:** FastAPI backend serves filtered, sorted, paginated building data from local sample data.

- [x] Refactor `backend/app/core/config.py` to load from `config/` YAML files
- [x] Create `backend/app/services/query_service.py` — abstracted query interface
- [x] Create `backend/app/services/local_service.py` — sample-data fallback using pandas
- [x] Create `backend/app/services/bigquery_service.py` — BigQuery parameterized queries
- [x] Implement `POST /api/v1/buildings/search` with filter/sort/paginate
- [x] Implement `GET /api/v1/filters/options` returning dynamic filter metadata
- [x] Implement `GET /api/v1/buildings/{id}` for detail view
- [x] Add request/response Pydantic models for search API
- [x] Add integration tests for search endpoint

## Milestone 3: Frontend Filter UI ✅
**Goal:** Next.js app with left filters + right results + pagination.

- [x] Initialize Next.js + TypeScript + Tailwind in `frontend/`
- [x] Create API client module (`lib/api.ts`)
- [x] Create filter sidebar component with dynamic filter options
- [x] Create results table/grid component
- [x] Create pagination component
- [x] Wire filter changes → API call → results update
- [x] Add loading state, empty state, total count display
- [x] Add "Reset All Filters" button
- [x] Responsive layout

## Milestone 4: Data Pipeline & BigQuery Layer ✅
**Goal:** Config-driven raw → staging → serving pipeline with BigQuery support.

### SQL Schema Layer
- [x] `sql/schema/buildings_serving.sql` — DDL for serving table (clustered by state, city, property_type)
- [x] `sql/schema/raw_buildings_base.sql` — DDL for raw buildings table
- [x] `sql/schema/raw_building_metrics.sql` — DDL for raw metrics table
- [x] `sql/seed/seed_buildings_serving.sql` — insert all 20 sample buildings
- [x] `sql/transformations/raw_to_staging.sql` — join, clean, deduplicate
- [x] `sql/transformations/staging_to_serving.sql` — compute viability_score, opportunity_type

### Config Layer
- [x] `config/sources.yaml` — CSV source registry with BigQuery dataset config
- [x] `config/sources/buildings_base.yaml` — schema definition for base records
- [x] `config/sources/building_metrics.yaml` — schema definition for metrics
- [x] `config/metrics.yaml` — metric definitions with display/filter metadata

### Pipeline Scripts
- [x] `scripts/pipeline/config_loader.py` — YAML config loading
- [x] `scripts/pipeline/schema_validator.py` — CSV schema validation
- [x] `scripts/pipeline/local_pipeline.py` — local raw → staging → serving (pandas)
- [x] `scripts/pipeline/bq_pipeline.py` — BigQuery pipeline with:
  - `--create-datasets` — create raw/staging/serving datasets
  - `--create-tables` — create raw tables from DDL
  - `--load-samples` — load sample CSVs into raw tables
  - `--rebuild-serving` — run staging + serving SQL
  - `--seed` — seed serving table directly
  - `--full` — run everything
  - `--dry-run` — preview SQL without executing
  - `--verify` — run verification queries

### Sample Data
- [x] `sample-data/buildings_base.csv` — 20 buildings across 7 states
- [x] `sample-data/building_metrics.csv` — 20 rows of metric scores
- [x] `data/processed/buildings_serving.csv` — pipeline output (32 columns)

### Makefile Targets
- [x] `make seed` — run local pipeline
- [x] `make pipeline-bq-create` — create BigQuery datasets
- [x] `make pipeline-bq-load` — load sample data to BigQuery
- [x] `make pipeline-bq-rebuild` — rebuild serving table
- [x] `make pipeline-bq-full` — full BigQuery pipeline

### Serving Table Schema
The serving table includes all required columns:
- Identity: building_id, building_name, address, city, state, zip_code, property_type
- Physical: area_sqft, year_built, owner_name, latitude, longitude, stories, roof_type, parking_spaces, updated_at
- Metrics: roof_area_sqft, annual_rain_inches, annual_capture_gallons, cooling_tower_score, cooling_confidence, water_cost_per_kgal, water_stress_index, flood_risk_score, esg_commitment_score, energy_star_rating, leed_certified, state_policy_score, stormwater_fee_eligible
- Derived: large_roof, viability_score, opportunity_type

## Milestone 5: Cloud Run Deployment
**Goal:** Both services deployed to Cloud Run.

- [ ] Create `backend/Dockerfile`
- [ ] Create `frontend/Dockerfile`
- [ ] Create `infra/cloudbuild.yaml` or deploy scripts
- [ ] Create `infra/terraform/` stubs for GCS bucket, BQ dataset, Cloud Run services
- [ ] Document deployment in `docs/deployment.md`

## Out of Scope (Explicitly)
- Authentication / authorization
- Chatbot UI
- Real-time streaming
- Multi-tenant isolation
