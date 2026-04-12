
# RainUSE Nexus — Dataset Reference

## Dataset-to-Feature Pipeline

Each dataset feeds specific features in the building record. All features contribute to the final viability score.

---

## Dataset Table

| # | Dataset | Purpose | Feature(s) Produced | Used in Formula? | Priority |
|---|---------|---------|---------------------|------------------|----------|
| 1 | Microsoft U.S. Building Footprints | Building geometry & roof area | `roof_area_sqft`, `roof_over_100k`, location | Yes | **P0** |
| 2 | TWDB Texas Building Dataset | Richer Texas attributes | `building_type_score`, `improvement_value_score` | Yes | P1 |
| 3 | NOAA U.S. Climate Normals | Annual precipitation | `annual_rain_inches` | Yes | **P0** |
| 4 | DOE / FEMP Rainwater Methodology | Annual capture calc | `annual_capture_gallons` | Yes | **P0** |
| 5 | NOAA Climate at a Glance | Cooling demand proxy | `cooling_degree_days_score` | Yes | P1 |
| 6 | Google Imagery / Rooftop Inspection | Roof layout & cooling structures | `cooling_tower_score`, `cooling_confidence`, `visual_notes` | Yes | P1 |
| 7 | OpenStreetMap Cooling Tower Tags | Validate cooling tower likelihood | `cooling_tower_score` (support) | Indirect | P2 |
| 8 | Water Cost Dataset | Economic pressure | `water_cost_score` | Yes | P1 |
| 9 | State Rainwater Policy / TX Policy | Policy readiness | `state_policy_score` | Yes | P1 |
| 10 | Local Incentive Sources | Rebates, stormwater fee discounts, grants | `local_incentive_score` | Yes | P2 |
| 11 | FEMA Risk Data | Flood / resilience | `flood_score` | Yes | P1 |
| 12 | Water Stress / Drought Source | Scarcity pressure | `water_stress_score` | Yes | P1 |
| 13 | EPA ECHO / Facility Context | Industrial facility signal | `facility_score` | Yes | P2 |
| 14 | SBTi / ESG | Sustainability commitment | `esg_score` | Yes | P2 |
| 15 | LEED | Green building signal | `leed_score` | Yes | P2 |
| 16 | ENERGY STAR | Efficiency signal | `energy_star_score` | Yes | P2 |

---

## Priority Levels

- **P0** — Required for MVP. Must have data (even mocked) to produce scores.
- **P1** — High value. Should be integrated during hackathon if time permits.
- **P2** — Nice to have. Stub data is acceptable for demo.

---

## Data Flow

```
Raw datasets → scripts/ingest/ → scripts/features/ → scripts/scoring/ → scripts/export/ → data/processed/
```

Each ingestion script loads raw data and produces intermediate feature values.
Feature scripts normalize and compute scores.
Scoring scripts combine features into base and final viability scores.
Export scripts write the final `buildings_scored.json`.

---

## Adding a New Dataset

1. Add raw data file to `data/raw/`
2. Create or modify an ingest script in `scripts/ingest/`
3. Create or modify a feature script in `scripts/features/`
4. Update the scoring weights if needed in `scripts/scoring/weights.py`
5. Run the pipeline to regenerate processed output
6. Verify the schema is preserved

---

## Notes

- All datasets are used in read-only mode
- No live API calls in the demo — use cached/downloaded files
- Document any data transformations in code comments
