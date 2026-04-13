-- Staging: cleaned and typed buildings
-- Joins base records with metrics, casts types, deduplicates.

CREATE OR REPLACE TABLE `${PROJECT}.${STAGING_DATASET}.buildings_staged` AS

SELECT
  -- Identity
  b.building_id,
  TRIM(b.building_name)                             AS building_name,
  TRIM(b.address)                                   AS address,
  TRIM(b.city)                                      AS city,
  TRIM(b.state)                                     AS state,
  TRIM(b.zip_code)                                  AS zip_code,
  TRIM(b.property_type)                             AS property_type,

  -- Physical
  CAST(b.area_sqft AS FLOAT64)                      AS area_sqft,
  CAST(b.year_built AS INT64)                       AS year_built,
  TRIM(b.owner_name)                                AS owner_name,
  CAST(b.latitude AS FLOAT64)                       AS latitude,
  CAST(b.longitude AS FLOAT64)                      AS longitude,
  CAST(b.stories AS INT64)                          AS stories,
  TRIM(b.roof_type)                                 AS roof_type,
  CAST(b.parking_spaces AS INT64)                   AS parking_spaces,
  SAFE.PARSE_DATE('%Y-%m-%d', b.updated_at)         AS updated_at,

  -- Metrics (from joined table)
  COALESCE(m.roof_area_sqft, b.area_sqft)           AS roof_area_sqft,
  COALESCE(m.annual_rain_inches, 0.0)               AS annual_rain_inches,
  COALESCE(m.annual_capture_gallons, 0.0)           AS annual_capture_gallons,
  COALESCE(m.cooling_tower_score, 0.0)              AS cooling_tower_score,
  COALESCE(m.cooling_confidence, 0.0)               AS cooling_confidence,
  COALESCE(m.water_cost_per_kgal, 0.0)              AS water_cost_per_kgal,
  COALESCE(m.water_stress_index, 0.0)               AS water_stress_index,
  COALESCE(m.flood_risk_score, 0.0)                 AS flood_risk_score,
  COALESCE(m.esg_commitment_score, 0.0)             AS esg_commitment_score,
  COALESCE(m.energy_star_rating, 0)                 AS energy_star_rating,
  COALESCE(m.leed_certified, FALSE)                 AS leed_certified,
  COALESCE(m.state_policy_score, 0.0)               AS state_policy_score,
  COALESCE(m.stormwater_fee_eligible, FALSE)         AS stormwater_fee_eligible

FROM `${PROJECT}.${RAW_DATASET}.buildings_base` b
LEFT JOIN `${PROJECT}.${RAW_DATASET}.building_metrics` m
  ON b.building_id = m.building_id

-- Deduplicate: keep latest record per building_id
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY b.building_id
  ORDER BY b.updated_at DESC
) = 1;
