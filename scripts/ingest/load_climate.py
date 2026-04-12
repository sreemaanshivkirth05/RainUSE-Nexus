"""
RainUSE Nexus — Climate Data Ingestion

Loads climate data and joins it to building records.

DATA SOURCES:
  - NOAA U.S. Climate Normals (annual precipitation)
  - NOAA Climate at a Glance (cooling degree days)

PRODUCES:
  - annual_rain_inches (joined by location/county)
  - cooling_degree_days_score (joined by state/county)

TODO:
  - [ ] Download NOAA Climate Normals precipitation data
  - [ ] Download NOAA Climate at a Glance CDD data
  - [ ] Implement spatial join (county/station to building location)
  - [ ] Handle missing data with state-level fallbacks
"""

import json
import csv
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"


def load_precipitation_normals() -> dict:
    """
    Load annual precipitation normals by county/station.

    Expected file: data/raw/climate_normals.csv
    Columns: station_id, county, state, annual_precip_inches

    Returns: dict mapping (state, county) -> annual_precip_inches

    TODO:
      - Download from: https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals
      - Parse the 1991–2020 normals dataset
      - Build a lookup by county/state
    """
    filepath = RAW_DATA_DIR / "climate_normals.csv"

    if not filepath.exists():
        print(f"[WARN] Climate normals file not found: {filepath}")
        # Return sample fallback data by state
        return {
            "Texas": 33.0,
            "Georgia": 50.0,
            "Arizona": 8.0,
            "Florida": 54.0,
            "North Carolina": 46.0,
            "Louisiana": 60.0,
            "Colorado": 16.0,
        }

    # TODO: Parse real CSV
    # lookup = {}
    # with open(filepath, "r") as f:
    #     reader = csv.DictReader(f)
    #     for row in reader:
    #         key = (row["state"], row["county"])
    #         lookup[key] = float(row["annual_precip_inches"])
    # return lookup

    return {}


def load_cooling_degree_days() -> dict:
    """
    Load cooling degree days data by state/county.

    Expected file: data/raw/cooling_degree_days.csv
    Columns: state, county, annual_cdd

    Returns: dict mapping state -> annual cooling degree days

    TODO:
      - Download from: https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/
      - Parse annual CDD by state or county
    """
    filepath = RAW_DATA_DIR / "cooling_degree_days.csv"

    if not filepath.exists():
        print(f"[WARN] Cooling degree days file not found: {filepath}")
        # Return sample fallback data by state
        return {
            "Texas": 2800,
            "Georgia": 1900,
            "Arizona": 4000,
            "Florida": 3500,
            "North Carolina": 1500,
            "Louisiana": 2700,
            "Colorado": 700,
        }

    # TODO: Parse real CSV
    return {}


def join_climate_to_building(building: dict, precip_data: dict, cdd_data: dict) -> dict:
    """
    Join climate data to a building record.

    Uses state-level lookup as fallback.
    TODO: Implement county-level or station-level spatial join.
    """
    state = building.get("state", "")

    # Join precipitation
    if isinstance(precip_data, dict):
        if state in precip_data:
            building["annual_rain_inches"] = precip_data[state]

    # CDD is used in feature computation, not directly stored as raw
    # See compute_climate_features.py for normalization

    return building


def main():
    """Test climate data loading."""
    print("Loading precipitation normals...")
    precip = load_precipitation_normals()
    print(f"  Loaded {len(precip)} entries")

    print("Loading cooling degree days...")
    cdd = load_cooling_degree_days()
    print(f"  Loaded {len(cdd)} entries")


if __name__ == "__main__":
    main()
