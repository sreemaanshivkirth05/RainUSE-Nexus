"""
RainUSE Nexus — Reverse Geocoding Enrichment

Reads top_1000_buildings.csv (or buildings_scored.csv if it exists),
calls the Nominatim reverse geocoding API for buildings with generic names,
and saves enriched data to buildings_geocoded.csv / buildings_geocoded.json.

Usage:
    python scripts/enrich/reverse_geocode_buildings.py

Notes:
    - Only geocodes buildings where name contains "Candidate" or name is empty.
    - Processes the top 200 buildings by viability score to stay within
      Nominatim's rate limits for a hackathon run.
    - Adds 1-second delay between each call per Nominatim ToS.
    - On any failure, keeps the original name and moves on.
"""

from __future__ import annotations

import csv
import json
import shutil
import time
from pathlib import Path
from typing import Any

import urllib.request
import urllib.parse

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

# Prefer buildings_scored.csv if it exists; fall back to top_1000_buildings.csv
INPUT_CSV = (
    PROCESSED_DIR / "buildings_scored.csv"
    if (PROCESSED_DIR / "buildings_scored.csv").exists()
    else PROCESSED_DIR / "top_1000_buildings.csv"
)
INPUT_JSON = (
    PROCESSED_DIR / "buildings_scored.json"
    if (PROCESSED_DIR / "buildings_scored.json").exists()
    else PROCESSED_DIR / "top_1000_buildings.json"
)

GEOCODED_CSV  = PROCESSED_DIR / "buildings_geocoded.csv"
GEOCODED_JSON = PROCESSED_DIR / "buildings_geocoded.json"

# How many buildings to geocode (top N by viability score)
GEOCODE_LIMIT = 200

# Nominatim endpoint
NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"
USER_AGENT    = "RainUSE-Nexus-Hackathon/1.0"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def is_generic_name(name: str | None) -> bool:
    """Return True if the building name is a placeholder that should be replaced."""
    if not name:
        return True
    name = name.strip()
    if not name:
        return True
    if "Candidate" in name or "candidate" in name:
        return True
    if "Unknown" in name:
        return True
    return False


def nominatim_reverse(lat: float, lng: float) -> dict[str, Any]:
    """
    Call Nominatim reverse geocoding API and return the parsed JSON response.
    Raises on network error or non-200 status.
    """
    params = urllib.parse.urlencode({
        "lat": lat,
        "lon": lng,
        "format": "json",
        "addressdetails": 1,
    })
    url = f"{NOMINATIM_URL}?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def extract_building_name(addr: dict[str, str]) -> str:
    """
    Extract the best available building name from a Nominatim address dict.
    Priority: building > amenity > office > industrial > tourism
    """
    for key in ("building", "amenity", "office", "industrial", "tourism", "shop"):
        val = addr.get(key, "").strip()
        if val:
            return val
    return ""


def extract_city(addr: dict[str, str]) -> str:
    """Extract city from Nominatim address, trying multiple keys."""
    for key in ("city", "town", "village", "county", "suburb", "municipality"):
        val = addr.get(key, "").strip()
        if val:
            return val
    return ""


def build_display_name(addr: dict[str, str], fallback_name: str) -> str:
    """
    Construct a clean building_name string.
    Uses building/amenity if available, else street address.
    """
    # Try named place first
    named = extract_building_name(addr)
    if named:
        return named

    # Fall back to street address
    parts = []
    house = addr.get("house_number", "").strip()
    road  = addr.get("road", "").strip()
    if house and road:
        parts.append(f"{house} {road}")
    elif road:
        parts.append(road)

    city = extract_city(addr)
    if city:
        parts.append(city)

    if parts:
        return ", ".join(parts)

    return fallback_name  # last resort: keep original


def build_short_address(addr: dict[str, str]) -> str:
    """Construct a short address: '{road}, {city}, {state} {postcode}'"""
    parts = []
    road     = addr.get("road", "").strip()
    city     = extract_city(addr)
    state    = addr.get("state", "").strip()
    postcode = addr.get("postcode", "").strip()

    if road:
        parts.append(road)
    if city:
        parts.append(city)

    state_zip = " ".join(filter(None, [state, postcode]))
    if state_zip:
        parts.append(state_zip)

    return ", ".join(parts)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("=" * 60)
    print("RainUSE Nexus — Reverse Geocoding Enrichment")
    print("=" * 60)

    # Check if geocoded output already exists with real names
    if GEOCODED_CSV.exists():
        print(f"\n[SKIP] {GEOCODED_CSV.name} already exists.")
        print("  Delete it to re-run geocoding.")
        return

    # ------------------------------------------------------------------
    # Load buildings
    # ------------------------------------------------------------------
    print(f"\nReading buildings from: {INPUT_CSV}")
    if not INPUT_CSV.exists():
        raise FileNotFoundError(
            f"No input CSV found at {INPUT_CSV}.\n"
            "Run build_processed_outputs.py first to generate top_1000_buildings.csv."
        )

    with open(INPUT_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        buildings = list(reader)

    print(f"Loaded {len(buildings):,} buildings")

    # Sort by viability score descending so we geocode the best buildings first
    buildings.sort(
        key=lambda b: float(b.get("final_viability_score", 0) or 0),
        reverse=True,
    )

    # ------------------------------------------------------------------
    # Geocode
    # ------------------------------------------------------------------
    geocoded_count = 0
    skipped_count  = 0
    error_count    = 0

    for i, bldg in enumerate(buildings):
        if geocoded_count >= GEOCODE_LIMIT:
            break

        original_name = bldg.get("name", "") or ""

        if not is_generic_name(original_name):
            skipped_count += 1
            continue  # Already has a real name

        lat_str = bldg.get("latitude", "")
        lng_str = bldg.get("longitude", "")

        try:
            lat = float(lat_str)
            lng = float(lng_str)
        except (TypeError, ValueError):
            print(f"  [SKIP] Building {bldg.get('id')} — invalid coords ({lat_str}, {lng_str})")
            skipped_count += 1
            continue

        geocoded_count += 1

        try:
            result = nominatim_reverse(lat, lng)
        except Exception as exc:
            print(f"  [ERROR] ({lat}, {lng}): {exc}")
            error_count += 1
            # Rate-limit pause even on failure
            time.sleep(1.1)
            continue

        addr = result.get("address", {})

        building_name = build_display_name(addr, original_name)
        short_address = build_short_address(addr)
        city          = extract_city(addr) or bldg.get("city", "")
        state_name    = addr.get("state", bldg.get("state", ""))
        zip_code      = addr.get("postcode", "")

        bldg["building_name"] = building_name
        bldg["short_address"] = short_address
        bldg["city"]          = city
        bldg["state"]         = state_name
        bldg["zip_code"]      = zip_code

        print(f"  Geocoded {geocoded_count} of {GEOCODE_LIMIT}: {building_name}")

        # Nominatim rate-limit: >= 1 request per second
        time.sleep(1.1)

    # Fill in blanks for buildings that were not geocoded
    for bldg in buildings:
        bldg.setdefault("building_name", bldg.get("name", ""))
        bldg.setdefault("short_address", "")
        bldg.setdefault("zip_code", "")

    print(
        f"\nSummary: {geocoded_count} geocoded, "
        f"{skipped_count} already named/skipped, "
        f"{error_count} errors"
    )

    # ------------------------------------------------------------------
    # Save outputs
    # ------------------------------------------------------------------
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    # Write buildings_geocoded.csv
    fieldnames = list(buildings[0].keys())
    with open(GEOCODED_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(buildings)
    print(f"\nSaved: {GEOCODED_CSV.name} ({len(buildings):,} rows)")

    # Write buildings_geocoded.json (list of dicts)
    with open(GEOCODED_JSON, "w", encoding="utf-8") as f:
        json.dump(buildings, f, indent=2)
    print(f"Saved: {GEOCODED_JSON.name} ({len(buildings):,} records)")

    # Overwrite buildings_scored.csv / .json so the rest of the pipeline
    # picks up real names automatically.
    scored_csv  = PROCESSED_DIR / "buildings_scored.csv"
    scored_json = PROCESSED_DIR / "buildings_scored.json"

    shutil.copy2(GEOCODED_CSV,  scored_csv)
    print(f"Copied → {scored_csv.name}")

    shutil.copy2(GEOCODED_JSON, scored_json)
    print(f"Copied → {scored_json.name}")

    # Also update top_1000_buildings files in-place
    top_1000_csv  = PROCESSED_DIR / "top_1000_buildings.csv"
    top_1000_json = PROCESSED_DIR / "top_1000_buildings.json"

    shutil.copy2(GEOCODED_CSV,  top_1000_csv)
    print(f"Copied → {top_1000_csv.name}")

    shutil.copy2(GEOCODED_JSON, top_1000_json)
    print(f"Copied → {top_1000_json.name}")

    print("\n[DONE] Geocoding complete.")
    print("Next: python scripts/export/build_processed_outputs.py")


if __name__ == "__main__":
    main()
