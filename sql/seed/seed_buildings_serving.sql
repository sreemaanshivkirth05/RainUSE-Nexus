-- ==========================================================================
-- Seed: buildings_serving (demo / development)
-- ==========================================================================
-- Inserts 20 sample buildings that match sample-data/buildings_base.csv
-- and sample-data/building_metrics.csv.
--
-- This is an alternative to running the full pipeline when you just need
-- data in the serving table quickly (e.g., for CI or demos).
-- ==========================================================================

-- Truncate existing data first
DELETE FROM `${PROJECT}.${SERVING_DATASET}.buildings_serving` WHERE TRUE;

INSERT INTO `${PROJECT}.${SERVING_DATASET}.buildings_serving`
  (building_id, building_name, address, city, state, zip_code, property_type,
   area_sqft, year_built, owner_name, latitude, longitude, stories, roof_type,
   parking_spaces, updated_at,
   roof_area_sqft, annual_rain_inches, annual_capture_gallons,
   cooling_tower_score, cooling_confidence,
   water_cost_per_kgal, water_stress_index, flood_risk_score,
   esg_commitment_score, energy_star_rating, leed_certified,
   state_policy_score, stormwater_fee_eligible,
   large_roof, viability_score, opportunity_type)
VALUES
  ('BLDG-TX-001', 'Texas Medical Center West Pavilion', '6431 Fannin St', 'Houston', 'Texas', '77030', 'Healthcare', 185000, 1978, 'Texas Medical Center Inc', 29.7069, -95.3985, 12, 'flat', 450, DATE '2024-11-15', 185000, 49.8, 5724510, 0.92, 0.88, 4.85, 0.60, 0.90, 0.75, 82, TRUE, 0.72, TRUE, TRUE, 74, 'Cooling-Demand-Driven'),
  ('BLDG-TX-002', 'Lone Star Industrial Park Building A', '9100 Tradeway Blvd', 'San Antonio', 'Texas', '78233', 'Industrial', 220000, 2001, 'Prologis LP', 29.4241, -98.4936, 1, 'flat', 120, DATE '2024-11-15', 220000, 33.5, 4578600, 0.45, 0.35, 5.10, 0.88, 0.40, 0.30, 0, FALSE, 0.72, FALSE, TRUE, 46, 'Balanced Opportunity'),
  ('BLDG-TX-003', 'Austin Tech Campus Main', '11501 Domain Dr', 'Austin', 'Texas', '78758', 'Office', 130000, 2015, 'Kilroy Realty Corp', 30.2672, -97.7431, 8, 'flat', 600, DATE '2024-11-15', 130000, 34.2, 2762460, 0.75, 0.70, 5.10, 0.78, 0.60, 0.88, 91, TRUE, 0.72, TRUE, TRUE, 59, 'Cooling-Demand-Driven'),
  ('BLDG-TX-004', 'Silicon Hills Office Park', '3900 N Capital of Texas Hwy', 'Austin', 'Texas', '78746', 'Office', 105000, 2018, 'Brandywine Realty Trust', 30.35, -97.75, 5, 'flat', 350, DATE '2024-11-15', 105000, 34.2, 2231010, 0.65, 0.58, 5.10, 0.78, 0.55, 0.92, 95, TRUE, 0.72, TRUE, TRUE, 55, 'Balanced Opportunity'),
  ('BLDG-TX-005', 'Dallas Distribution Hub', '4500 Singleton Blvd', 'Dallas', 'Texas', '75212', 'Warehouse', 340000, 1995, 'Duke Realty Corp', 32.7767, -96.797, 1, 'flat', 80, DATE '2024-11-15', 340000, 37.6, 7937760, 0.60, 0.55, 4.50, 0.75, 0.50, 0.42, 35, FALSE, 0.72, FALSE, TRUE, 60, 'Rainfall-Driven'),
  ('BLDG-TX-006', 'FortisBio Research Campus', '7000 N MoPac Expy', 'Austin', 'Texas', '78731', 'Laboratory', 98000, 2020, 'FortisBio Inc', 30.38, -97.76, 4, 'flat', 280, DATE '2024-11-15', 98000, 34.2, 2081556, 0.55, 0.50, 5.10, 0.78, 0.52, 0.82, 85, TRUE, 0.72, TRUE, FALSE, 51, 'Balanced Opportunity'),
  ('BLDG-TX-007', 'Houston Ship Channel Terminal', '16502 Market St', 'Houston', 'Texas', '77029', 'Industrial', 510000, 1992, 'Enterprise Products LP', 29.7341, -95.2103, 1, 'flat', 200, DATE '2024-11-15', 510000, 49.8, 15772740, 0.88, 0.85, 4.85, 0.60, 0.85, 0.35, 20, FALSE, 0.72, TRUE, TRUE, 79, 'Cooling-Demand-Driven'),
  ('BLDG-GA-001', 'Georgia-Pacific Plaza', '133 Peachtree St NE', 'Atlanta', 'Georgia', '30303', 'Office', 95000, 1982, 'Brookfield Asset Mgmt', 33.7588, -84.388, 52, 'flat', 800, DATE '2024-11-15', 95000, 50.2, 2962310, 0.88, 0.92, 6.20, 0.65, 0.55, 0.85, 88, TRUE, 0.45, FALSE, FALSE, 56, 'Cooling-Demand-Driven'),
  ('BLDG-GA-002', 'Savannah Port Warehouse', '301 W River St', 'Savannah', 'Georgia', '31401', 'Warehouse', 280000, 1998, 'Savannah Port Authority', 32.0809, -81.0912, 1, 'flat', 60, DATE '2024-11-15', 280000, 49.6, 8626880, 0.42, 0.38, 5.80, 0.48, 0.85, 0.28, 0, FALSE, 0.45, FALSE, TRUE, 60, 'Resilience-Driven'),
  ('BLDG-GA-003', 'Hartsfield Cargo Facility B', '2500 Sullivan Rd', 'Atlanta', 'Georgia', '30337', 'Warehouse', 420000, 2008, 'City of Atlanta DOA', 33.6367, -84.4278, 1, 'flat', 150, DATE '2024-11-15', 420000, 50.2, 13092840, 0.35, 0.30, 6.20, 0.65, 0.60, 0.20, 15, FALSE, 0.45, FALSE, TRUE, 60, 'Rainfall-Driven'),
  ('BLDG-AZ-001', 'Phoenix Semiconductor Fab', '5000 W Chandler Blvd', 'Chandler', 'Arizona', '85226', 'Manufacturing', 310000, 2010, 'Intel Corporation', 33.3062, -111.8413, 2, 'flat', 1200, DATE '2024-11-15', 310000, 8.2, 1578920, 0.95, 0.95, 7.90, 0.95, 0.20, 0.65, 72, FALSE, 0.35, FALSE, TRUE, 47, 'Cooling-Demand-Driven'),
  ('BLDG-AZ-002', 'Tucson Solar Manufacturing Plant', '2800 S Kolb Rd', 'Tucson', 'Arizona', '85710', 'Manufacturing', 240000, 2012, 'First Solar Inc', 32.2226, -110.9747, 1, 'flat', 400, DATE '2024-11-15', 240000, 12.0, 1789200, 0.90, 0.88, 7.50, 0.97, 0.15, 0.70, 68, FALSE, 0.35, FALSE, TRUE, 46, 'Cooling-Demand-Driven'),
  ('BLDG-AZ-003', 'Mesa Medical Center', '1601 W Southern Ave', 'Mesa', 'Arizona', '85202', 'Healthcare', 160000, 2003, 'Banner Health', 33.3922, -111.855, 6, 'flat', 900, DATE '2024-11-15', 160000, 8.2, 814720, 0.85, 0.82, 7.90, 0.95, 0.18, 0.72, 80, TRUE, 0.35, FALSE, TRUE, 46, 'Cooling-Demand-Driven'),
  ('BLDG-FL-001', 'Miami Convention Center', '1901 Convention Center Dr', 'Miami Beach', 'Florida', '33139', 'Convention', 145000, 2018, 'City of Miami Beach', 25.7953, -80.134, 3, 'flat', 2500, DATE '2024-11-15', 145000, 61.9, 5576050, 0.70, 0.62, 4.20, 0.45, 0.95, 0.50, 76, TRUE, 0.55, TRUE, TRUE, 65, 'Cooling-Demand-Driven'),
  ('BLDG-FL-002', 'Tampa Bay Industrial Complex', '5200 W Cypress St', 'Tampa', 'Florida', '33607', 'Industrial', 210000, 2005, 'Tampa Bay Industrial LLC', 27.9506, -82.4572, 2, 'flat', 300, DATE '2024-11-15', 210000, 46.3, 6039930, 0.78, 0.72, 4.10, 0.40, 0.88, 0.55, 58, FALSE, 0.55, TRUE, TRUE, 64, 'Cooling-Demand-Driven'),
  ('BLDG-FL-003', 'Orlando Distribution Center', '8200 Presidents Dr', 'Orlando', 'Florida', '32809', 'Warehouse', 375000, 2014, 'Prologis LP', 28.458, -81.405, 1, 'flat', 180, DATE '2024-11-15', 375000, 50.8, 11834250, 0.30, 0.25, 4.30, 0.42, 0.78, 0.38, 28, FALSE, 0.55, TRUE, TRUE, 63, 'Rainfall-Driven'),
  ('BLDG-NC-001', 'Raleigh Data Center Campus', '4700 Falls of Neuse Rd', 'Raleigh', 'North Carolina', '27609', 'Data Center', 175000, 2016, 'QTS Realty Trust', 35.7796, -78.6382, 2, 'flat', 200, DATE '2024-11-15', 175000, 46.1, 5012175, 0.98, 0.96, 5.40, 0.50, 0.45, 0.90, 90, TRUE, 0.50, FALSE, TRUE, 62, 'Cooling-Demand-Driven'),
  ('BLDG-NC-002', 'Carolina Textile Mill Warehouse', '900 N Davidson St', 'Charlotte', 'North Carolina', '28206', 'Warehouse', 195000, 1965, 'Lincoln Harris LLC', 35.2271, -80.8431, 1, 'flat', 90, DATE '2024-11-15', 195000, 43.3, 5247015, 0.55, 0.50, 5.20, 0.55, 0.70, 0.35, 22, FALSE, 0.50, FALSE, TRUE, 51, 'Rainfall-Driven'),
  ('BLDG-CO-001', 'Denver Federal Center Bldg 67', '6th Ave & Kipling St', 'Lakewood', 'Colorado', '80225', 'Government', 88000, 1970, 'US General Services Admin', 39.7162, -105.1139, 3, 'flat', 500, DATE '2024-11-15', 88000, 15.6, 852720, 0.40, 0.45, 6.80, 0.82, 0.35, 0.60, 55, FALSE, 0.80, TRUE, FALSE, 40, 'Balanced Opportunity'),
  ('BLDG-LA-001', 'Gulf Coast Refinery Support Complex', '2600 Scenic Hwy', 'Baton Rouge', 'Louisiana', '70805', 'Industrial', 260000, 1988, 'ExxonMobil Corp', 30.4515, -91.1871, 2, 'flat', 350, DATE '2024-11-15', 260000, 60.1, 9704260, 0.82, 0.78, 3.90, 0.35, 0.92, 0.40, 30, FALSE, 0.30, FALSE, TRUE, 70, 'Cooling-Demand-Driven');
