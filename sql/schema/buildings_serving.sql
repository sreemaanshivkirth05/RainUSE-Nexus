-- ==========================================================================
-- BigQuery DDL: serving.buildings_serving
-- ==========================================================================
-- The single denormalized table that the API queries.
-- One row per building with all identity, location, and metric columns.
--
-- Clustering: state, city, property_type  (most common filter predicates)
-- Partitioning: optional on updated_at — uncomment when date filtering
--               or incremental refresh is needed.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS `${PROJECT}.${SERVING_DATASET}.buildings_serving` (
  -- Identity
  building_id               STRING        NOT NULL,
  building_name             STRING,
  address                   STRING,
  city                      STRING,
  state                     STRING,
  zip_code                  STRING,
  property_type             STRING,

  -- Physical
  area_sqft                 FLOAT64,
  year_built                INT64,
  owner_name                STRING,
  latitude                  FLOAT64,
  longitude                 FLOAT64,
  stories                   INT64,
  roof_type                 STRING,
  parking_spaces            INT64,
  updated_at                DATE,

  -- Rainwater harvest metrics
  roof_area_sqft            FLOAT64,
  annual_rain_inches        FLOAT64,
  annual_capture_gallons    FLOAT64,

  -- Cooling / demand metrics
  cooling_tower_score       FLOAT64,
  cooling_confidence        FLOAT64,

  -- Economic metrics
  water_cost_per_kgal       FLOAT64,
  water_stress_index        FLOAT64,

  -- Resilience metrics
  flood_risk_score          FLOAT64,

  -- Sustainability metrics
  esg_commitment_score      FLOAT64,
  energy_star_rating        INT64,
  leed_certified            BOOL,

  -- Policy metrics
  state_policy_score        FLOAT64,
  stormwater_fee_eligible   BOOL,

  -- Derived flags
  large_roof                BOOL,

  -- Composite scores
  viability_score           INT64,
  opportunity_type          STRING
)
-- PARTITION BY updated_at  -- Uncomment for date-based partitioning
CLUSTER BY state, city, property_type;
