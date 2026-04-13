-- ==========================================================================
-- BigQuery DDL: raw.buildings_base
-- ==========================================================================
-- Mirrors the CSV schema exactly. No transformations.
-- Loaded directly from GCS or local CSV upload.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS `${PROJECT}.${RAW_DATASET}.buildings_base` (
  building_id       STRING,
  building_name     STRING,
  address           STRING,
  city              STRING,
  state             STRING,
  zip_code          STRING,
  property_type     STRING,
  area_sqft         FLOAT64,
  year_built        INT64,
  owner_name        STRING,
  latitude          FLOAT64,
  longitude         FLOAT64,
  stories           INT64,
  roof_type         STRING,
  parking_spaces    INT64,
  updated_at        STRING    -- kept as STRING in raw; cast to DATE in staging
);
