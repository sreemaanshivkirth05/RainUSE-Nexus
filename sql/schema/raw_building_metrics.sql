-- ==========================================================================
-- BigQuery DDL: raw.building_metrics
-- ==========================================================================
-- Mirrors the metrics CSV schema exactly.
-- Loaded directly from GCS or local CSV upload.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS `${PROJECT}.${RAW_DATASET}.building_metrics` (
  building_id              STRING,
  roof_area_sqft           FLOAT64,
  annual_rain_inches       FLOAT64,
  annual_capture_gallons   FLOAT64,
  cooling_tower_score      FLOAT64,
  cooling_confidence       FLOAT64,
  water_cost_per_kgal      FLOAT64,
  water_stress_index       FLOAT64,
  flood_risk_score         FLOAT64,
  esg_commitment_score     FLOAT64,
  energy_star_rating       INT64,
  leed_certified           BOOL,
  state_policy_score       FLOAT64,
  stormwater_fee_eligible  BOOL
);
