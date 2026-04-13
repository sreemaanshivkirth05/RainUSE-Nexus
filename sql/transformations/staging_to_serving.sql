-- ==========================================================================
-- Transformation: staging → serving
-- ==========================================================================
-- Builds the final denormalized buildings_serving table from staged data.
-- Computes viability_score and opportunity_type classification.
--
-- Clustering: state, city, property_type
-- Partitioning: optional on updated_at (uncomment when needed)
--
-- To add a new metric:
--   1. Add it to the staging SQL (raw_to_staging.sql)
--   2. Reference it below in the SELECT and/or viability formula
--   3. Update config/metrics.yaml
-- ==========================================================================

CREATE OR REPLACE TABLE `${PROJECT}.${SERVING_DATASET}.buildings_serving`
CLUSTER BY state, city, property_type
-- PARTITION BY updated_at  -- Uncomment for date-based partitioning
AS

SELECT
  -- Identity
  s.building_id,
  s.building_name,
  s.address,
  s.city,
  s.state,
  s.zip_code,
  s.property_type,

  -- Physical
  s.area_sqft,
  s.year_built,
  s.owner_name,
  s.latitude,
  s.longitude,
  s.stories,
  s.roof_type,
  s.parking_spaces,
  s.updated_at,

  -- Metric columns (pass-through from staging)
  s.roof_area_sqft,
  s.annual_rain_inches,
  s.annual_capture_gallons,
  s.cooling_tower_score,
  s.cooling_confidence,
  s.water_cost_per_kgal,
  s.water_stress_index,
  s.flood_risk_score,
  s.esg_commitment_score,
  s.energy_star_rating,
  s.leed_certified,
  s.state_policy_score,
  s.stormwater_fee_eligible,

  -- Derived: large roof flag
  (s.roof_area_sqft >= 100000) AS large_roof,

  -- -----------------------------------------------------------------------
  -- Computed: viability_score (0–100)
  -- Weighted composite across key dimensions.
  -- Weights are tunable; update here and in local_pipeline.py in tandem.
  -- -----------------------------------------------------------------------
  CAST(ROUND(
    (
      -- Rainwater potential (30%)
      LEAST(s.annual_capture_gallons / 10000000.0, 1.0) * 30
      -- Cooling demand (20%)
      + s.cooling_tower_score * 20
      -- Economic pressure (15%)
      + LEAST(s.water_cost_per_kgal / 10.0, 1.0) * 8
      + s.water_stress_index * 7
      -- Resilience (15%)
      + s.flood_risk_score * 15
      -- Sustainability (10%)
      + s.esg_commitment_score * 5
      + (CASE WHEN s.leed_certified THEN 1.0 ELSE 0.0 END) * 3
      + LEAST(s.energy_star_rating / 100.0, 1.0) * 2
      -- Policy (10%)
      + s.state_policy_score * 7
      + (CASE WHEN s.stormwater_fee_eligible THEN 1.0 ELSE 0.0 END) * 3
    )
  ) AS INT64) AS viability_score,

  -- -----------------------------------------------------------------------
  -- Computed: opportunity_type classification
  -- -----------------------------------------------------------------------
  CASE
    WHEN s.cooling_tower_score >= 0.7 AND s.cooling_confidence >= 0.6
      THEN 'Cooling-Demand-Driven'
    WHEN s.flood_risk_score >= 0.8
      THEN 'Resilience-Driven'
    WHEN s.annual_capture_gallons >= 5000000
      THEN 'Rainfall-Driven'
    ELSE 'Balanced Opportunity'
  END AS opportunity_type

FROM `${PROJECT}.${STAGING_DATASET}.buildings_staged` s;
