"""
RainUSE Nexus — Enrichment Data Ingestion
==========================================
Assigns ESG scores, stormwater fees, and local incentive scores to buildings,
then saves an enriched output to data/processed/buildings_enriched.csv.

Usage:
    python scripts/ingest/load_enrichments.py

DATA SOURCES (implemented as deterministic rule-based stubs):
  - Building type / corporate context → esg_score
  - Progressive state bonus → esg_score
  - Improvement value → leed_score
  - State stormwater fee schedule → local_incentive_score
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

PROJECT_ROOT   = Path(__file__).resolve().parent.parent.parent
RAW_DATA_DIR   = PROJECT_ROOT / "data" / "raw"
PROCESSED_DIR  = PROJECT_ROOT / "data" / "processed"

# ---------------------------------------------------------------------------
# ESG scoring constants
# ---------------------------------------------------------------------------

# Building types that indicate ESG-conscious ownership
ESG_BUILDING_TYPES = {"office", "corporate", "headquarters", "campus"}

# States with progressive water / sustainability policy
PROGRESSIVE_STATES = {"CA", "NY", "WA", "OR", "CO", "MA", "VT", "MN"}

# State abbreviation → full name map (for matching)
STATE_ABBREV = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
    "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
    "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
    "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
    "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
    "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
    "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
    "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
    "Wisconsin": "WI", "Wyoming": "WY",
}

# ---------------------------------------------------------------------------
# Stormwater fee schedule ($/1000 gal) by state
# ---------------------------------------------------------------------------

STORMWATER_FEE: dict[str, float] = {
    "TX": 0.15,
    "CA": 0.28,
    "FL": 0.12,
    "NY": 0.31,
    "GA": 0.11,
    "NC": 0.13,
    "VA": 0.14,
    "MD": 0.16,
    "IL": 0.13,
    "WA": 0.22,
    "OR": 0.20,
    "CO": 0.18,
    "AZ": 0.17,
    "NM": 0.14,
    "OK": 0.10,
    "LA": 0.11,
    "AL": 0.10,
    "SC": 0.11,
    "TN": 0.12,
    "MS": 0.10,
    "AR": 0.10,
    "KY": 0.11,
    "MO": 0.12,
    "KS": 0.10,
    "IN": 0.11,
    "WV": 0.10,
    "DE": 0.14,
}

_FEE_MIN = 0.10   # $/1000 gal — lowest rate
_FEE_MAX = 0.35   # $/1000 gal — highest plausible rate


# ---------------------------------------------------------------------------
# Helper: state name → abbreviation
# ---------------------------------------------------------------------------

def _state_abbrev(state_name: str) -> str:
    """Convert full state name to 2-letter abbreviation (e.g., 'Texas' → 'TX')."""
    return STATE_ABBREV.get(str(state_name).strip().title(), "")


# ---------------------------------------------------------------------------
# ESG scoring
# ---------------------------------------------------------------------------

def compute_esg_score(row: pd.Series) -> float:
    """
    Assign an ESG score (0.0–1.0) based on building type and state policy.

    Rules:
    - Base score: 0.3
    - If building_type is office/corporate: esg_score = 0.7
    - If state is in progressive states list: esg_score += 0.1 (capped at 1.0)
    """
    # Infer building type from available fields
    btype = str(row.get("building_type", "") or "").lower()
    opp   = str(row.get("opportunity_type", "") or "").lower()
    name  = str(row.get("name", "") or "").lower()
    expl  = str(row.get("explanation", "") or "").lower()

    is_corporate = any(
        kw in btype or kw in name or kw in expl
        for kw in ESG_BUILDING_TYPES
    )

    base = 0.7 if is_corporate else 0.3

    state_abbrev = _state_abbrev(row.get("state", ""))
    if state_abbrev in PROGRESSIVE_STATES:
        base = min(base + 0.1, 1.0)

    return round(base, 3)


def compute_leed_score(row: pd.Series) -> float:
    """
    Assign a LEED score stub based on improvement value.

    Rules:
    - improvement_value > $1,000,000 → leed_score = 0.6
    - Default: leed_score = 0.2
    """
    impr_value = float(row.get("improvement_value", 0) or 0)
    return 0.6 if impr_value > 1_000_000 else 0.2


# ---------------------------------------------------------------------------
# Stormwater incentive scoring
# ---------------------------------------------------------------------------

def compute_stormwater_fee(state: str) -> float:
    """Return stormwater fee in $/1000 gal for the given state."""
    abbrev = _state_abbrev(state)
    return STORMWATER_FEE.get(abbrev, 0.10)


def compute_local_incentive_score(state: str) -> float:
    """
    Normalize stormwater fee to 0.0–1.0 incentive score.

    Higher stormwater fees mean higher savings from rainwater substitution,
    which translates to a higher local incentive score.

    Formula: (fee - _FEE_MIN) / (_FEE_MAX - _FEE_MIN)
    """
    fee = compute_stormwater_fee(state)
    score = (fee - _FEE_MIN) / (_FEE_MAX - _FEE_MIN)
    return round(max(0.0, min(1.0, score)), 4)


# ---------------------------------------------------------------------------
# Legacy loaders (wrappers for backward-compat — return empty dicts)
# ---------------------------------------------------------------------------

def load_visual_inspection_results() -> dict:
    filepath = RAW_DATA_DIR / "visual_inspections.json"
    if filepath.exists():
        with open(filepath, "r") as f:
            return json.load(f)
    print("[WARN] Visual inspection results not found. Using defaults.")
    return {}


def load_osm_cooling_tags() -> dict:
    print("[INFO] OSM cooling tower tag loading not yet implemented.")
    return {}


def load_fema_flood_risk() -> dict:
    filepath = RAW_DATA_DIR / "fema_flood_risk.csv"
    if not filepath.exists():
        print("[WARN] FEMA flood risk data not found. Using defaults.")
    return {}


def load_water_stress() -> dict:
    filepath = RAW_DATA_DIR / "water_stress.csv"
    if not filepath.exists():
        print("[WARN] Water stress data not found. Using defaults.")
    return {}


def load_epa_echo_facilities() -> dict:
    filepath = RAW_DATA_DIR / "epa_echo_facilities.csv"
    if not filepath.exists():
        print("[WARN] EPA ECHO facility data not found. Using defaults.")
    return {}


def load_sbti_esg_data() -> dict:
    filepath = RAW_DATA_DIR / "sbti_companies.csv"
    if not filepath.exists():
        print("[WARN] SBTi/ESG data not found. Using defaults.")
    return {}


def load_leed_certifications() -> dict:
    filepath = RAW_DATA_DIR / "leed_certified.csv"
    if not filepath.exists():
        print("[WARN] LEED certification data not found. Using defaults.")
    return {}


def load_energy_star_certifications() -> dict:
    filepath = RAW_DATA_DIR / "energy_star.csv"
    if not filepath.exists():
        print("[WARN] ENERGY STAR data not found. Using defaults.")
    return {}


def load_water_costs() -> dict:
    filepath = RAW_DATA_DIR / "water_costs.csv"
    if not filepath.exists():
        print("[WARN] Water cost data not found. Using defaults.")
    return {}


# ---------------------------------------------------------------------------
# Main enrichment pipeline
# ---------------------------------------------------------------------------

def enrich_buildings(input_csv: Path, output_csv: Path) -> pd.DataFrame:
    """
    Load buildings_scored.csv, apply ESG / incentive enrichments, and save
    to buildings_enriched.csv.

    Returns the enriched DataFrame.
    """
    if not input_csv.exists():
        print(f"[WARN] Input file not found: {input_csv}")
        print("       Run the scoring pipeline first to generate buildings_scored.csv")
        return pd.DataFrame()

    print(f"[enrich] Loading {input_csv}...")
    df = pd.read_csv(input_csv)
    df.columns = [str(c).strip().lower() for c in df.columns]
    print(f"[enrich]   {len(df):,} buildings loaded")

    # -- ESG score ---------------------------------------------------------
    print("[enrich] Computing ESG scores...")
    df["esg_score"] = df.apply(compute_esg_score, axis=1)

    # -- LEED score --------------------------------------------------------
    print("[enrich] Computing LEED scores...")
    df["leed_score"] = df.apply(compute_leed_score, axis=1)

    # -- Stormwater fee & local incentive score ----------------------------
    print("[enrich] Computing stormwater incentive scores...")
    df["stormwater_fee_per_kgal"] = df["state"].apply(compute_stormwater_fee)
    df["local_incentive_score"]   = df["state"].apply(compute_local_incentive_score)

    # -- Save output -------------------------------------------------------
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_csv, index=False)
    print(f"[enrich] Saved {len(df):,} enriched buildings → {output_csv}")

    # Summary
    print("\n[enrich] ESG score distribution:")
    print(df["esg_score"].describe().round(3).to_string())
    print("\n[enrich] Local incentive score distribution:")
    print(df["local_incentive_score"].describe().round(3).to_string())

    return df


def main() -> None:
    input_csv  = PROCESSED_DIR / "buildings_scored.csv"
    output_csv = PROCESSED_DIR / "buildings_enriched.csv"

    print("=" * 60)
    print("RainUSE Nexus — ESG & Incentive Enrichment Pipeline")
    print("=" * 60)

    df = enrich_buildings(input_csv, output_csv)

    if df.empty:
        print("\n[DONE] No buildings processed (input file missing).")
    else:
        print(f"\n[DONE] Enrichment complete. Output: {output_csv}")


if __name__ == "__main__":
    main()
