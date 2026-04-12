"""
RainUSE Nexus — Building Ingestion Script

Loads raw building footprint data and produces base building records.

DATA SOURCES:
  - Microsoft U.S. Building Footprints (GeoJSON)
  - TWDB Texas Building Dataset (CSV)

PRODUCES:
  - roof_area_sqft
  - roof_over_100k
  - building location (lat, lon, city, state)
  - building_type_score (from TWDB)
  - improvement_value_score (from TWDB)

TODO:
  - [ ] Download and filter Microsoft Building Footprints by state
  - [ ] Parse GeoJSON polygons to compute roof area
  - [ ] Load TWDB Texas dataset for enriched Texas records
  - [ ] Geocode/reverse-geocode building centroids for city assignment
  - [ ] Handle multi-state loading from a config file
"""

import json
import os
import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"


def load_microsoft_footprints(state: str) -> list[dict]:
    """
    Load building footprints from Microsoft U.S. Building Footprints dataset.

    Expected file: data/raw/building_footprints_{state}.geojson

    TODO:
      - Download from: https://github.com/microsoft/USBuildingFootprints
      - Filter by state
      - Extract polygon area as roof_area_sqft
      - Extract centroid as lat/lon
    """
    filepath = RAW_DATA_DIR / f"building_footprints_{state.lower()}.geojson"

    if not filepath.exists():
        print(f"[WARN] Building footprints file not found: {filepath}")
        print(f"[INFO] Using mock data instead. Place real data at: {filepath}")
        return []

    # TODO: Implement GeoJSON parsing
    # with open(filepath, "r") as f:
    #     geojson = json.load(f)
    # features = geojson.get("features", [])
    # buildings = []
    # for feature in features:
    #     area_sqm = compute_polygon_area(feature["geometry"])
    #     area_sqft = area_sqm * 10.764
    #     centroid = compute_centroid(feature["geometry"])
    #     buildings.append({
    #         "roof_area_sqft": area_sqft,
    #         "roof_over_100k": area_sqft >= 100000,
    #         "latitude": centroid[1],
    #         "longitude": centroid[0],
    #     })
    # return buildings

    return []


def load_twdb_buildings() -> list[dict]:
    """
    Load Texas building data from TWDB dataset.

    Expected file: data/raw/twdb_buildings.csv

    TODO:
      - Download TWDB data
      - Parse CSV
      - Extract building type and improvement value
      - Map to building_type_score and improvement_value_score
    """
    filepath = RAW_DATA_DIR / "twdb_buildings.csv"

    if not filepath.exists():
        print(f"[WARN] TWDB buildings file not found: {filepath}")
        return []

    # TODO: Implement CSV parsing
    # import csv
    # with open(filepath, "r") as f:
    #     reader = csv.DictReader(f)
    #     for row in reader:
    #         ...
    return []


def create_base_building_record(
    building_id: str,
    name: str = "",
    state: str = "",
    city: str = "",
    latitude: float = 0.0,
    longitude: float = 0.0,
    roof_area_sqft: float = 0.0,
) -> dict:
    """
    Create a base building record with default values.
    All feature scores start at 0 and are populated by feature scripts.
    """
    return {
        "id": building_id,
        "name": name,
        "state": state,
        "city": city,
        "latitude": latitude,
        "longitude": longitude,
        "roof_area_sqft": roof_area_sqft,
        "roof_over_100k": roof_area_sqft >= 100000,
        "annual_rain_inches": 0.0,
        "annual_capture_gallons": 0.0,
        "cooling_tower_score": 0.0,
        "cooling_confidence": 0.0,
        "cooling_degree_days_score": 0.0,
        "building_type_score": 0.0,
        "facility_score": 0.0,
        "water_cost_score": 0.0,
        "state_policy_score": 0.0,
        "local_incentive_score": 0.0,
        "improvement_value_score": 0.0,
        "flood_score": 0.0,
        "water_stress_score": 0.0,
        "esg_score": 0.0,
        "leed_score": 0.0,
        "energy_star_score": 0.0,
        "base_viability_score": 0.0,
        "final_viability_score": 0,
        "opportunity_type": "",
        "explanation": "",
        "visual_notes": "",
    }


def main():
    """Main ingestion entry point."""
    print("=" * 60)
    print("RainUSE Nexus — Building Ingestion")
    print("=" * 60)

    # Define target states
    # TODO: Make this configurable
    target_states = ["Texas", "Georgia", "Arizona", "Florida", "North Carolina", "Louisiana", "Colorado"]

    all_buildings = []

    for state in target_states:
        print(f"\n[INFO] Loading buildings for {state}...")
        footprints = load_microsoft_footprints(state)
        if footprints:
            all_buildings.extend(footprints)
        else:
            print(f"[INFO] No real footprint data for {state}. Skipping.")

    # Load TWDB for Texas enrichment
    twdb = load_twdb_buildings()
    if twdb:
        print(f"[INFO] Loaded {len(twdb)} TWDB Texas records for enrichment.")

    print(f"\n[RESULT] Total buildings ingested: {len(all_buildings)}")

    if not all_buildings:
        print("[INFO] No real data loaded. Use mock data in data/processed/buildings_scored.json")
        print("[INFO] Run scoring/score_buildings.py to process mock or real data.")

    return all_buildings


if __name__ == "__main__":
    main()
