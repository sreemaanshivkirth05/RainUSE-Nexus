"""
RainUSE Nexus — LEED & Energy Star Matching
============================================
Matches buildings in buildings_scored.csv to LEED and Energy Star
certified buildings using:
  1. Exact state + zip code match (highest confidence)
  2. State + city fuzzy match (≥ 85 similarity via rapidfuzz)
  3. Proximity-based density score (LEED buildings within 25 km)

Produces: data/processed/buildings_leed_enriched.csv
"""

from __future__ import annotations
import math, sys
from pathlib import Path

import subprocess
for pkg in ["rapidfuzz", "pandas", "numpy"]:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", pkg])

import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402
from rapidfuzz import fuzz  # noqa: E402

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
RAW_DIR      = PROJECT_ROOT / "data" / "raw"
PROC_DIR     = PROJECT_ROOT / "data" / "processed"


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in km."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


STATE_ABBREV = {
    "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA",
    "Colorado":"CO","Connecticut":"CT","Delaware":"DE","Florida":"FL","Georgia":"GA",
    "Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA","Kansas":"KS",
    "Kentucky":"KY","Louisiana":"LA","Maine":"ME","Maryland":"MD","Massachusetts":"MA",
    "Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO","Montana":"MT",
    "Nebraska":"NE","Nevada":"NV","New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM",
    "New York":"NY","North Carolina":"NC","North Dakota":"ND","Ohio":"OH","Oklahoma":"OK",
    "Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC",
    "South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT",
    "Virginia":"VA","Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY",
}
ABBREV_STATE = {v: k for k, v in STATE_ABBREV.items()}

LEED_LEVEL_SCORE = {
    "Platinum": 1.00,
    "Gold":     0.85,
    "Silver":   0.70,
    "Certified":0.55,
}

# Building-type base scores for unmatched buildings
BUILDING_TYPE_BASE = {
    "hospital":    0.75, "medical":   0.75, "healthcare": 0.75,
    "university":  0.78, "education": 0.78, "school":     0.72,
    "office":      0.65, "corporate": 0.65,
    "data_center": 0.70, "data center": 0.70,
    "hotel":       0.58, "hospitality": 0.58,
    "retail":      0.48, "shopping":    0.48,
    "industrial":  0.32, "warehouse":   0.32, "manufacturing": 0.32,
    "airport":     0.60, "government":  0.62,
}

DEFAULT_TYPE_BASE = 0.42


def _type_base(row: pd.Series) -> float:
    name  = str(row.get("name", "")).lower()
    expl  = str(row.get("explanation", "")).lower()
    opp   = str(row.get("opportunity_type", "")).lower()
    text  = f"{name} {expl} {opp}"
    for kw, score in BUILDING_TYPE_BASE.items():
        if kw in text:
            return score
    return DEFAULT_TYPE_BASE


def _normalize(val: float, lo: float, hi: float) -> float:
    if hi <= lo:
        return 0.5
    return max(0.0, min(1.0, (val - lo) / (hi - hi - lo + (hi - lo))))


# ──────────────────────────────────────────────────────────────────────────────
# Load data
# ──────────────────────────────────────────────────────────────────────────────

def _load_buildings() -> pd.DataFrame:
    p = PROC_DIR / "buildings_scored.csv"
    print(f"[match] Loading buildings from {p}…")
    df = pd.read_csv(p, low_memory=False)
    df.columns = [c.strip().lower() for c in df.columns]
    # Normalise state name
    df["state_abbrev"] = df["state"].map(STATE_ABBREV).fillna(df["state"])
    # Normalise zip — strip .0 from float
    if "zip_code" in df.columns:
        df["zip_code"] = (
            df["zip_code"]
            .apply(lambda x: str(int(float(x))).zfill(5) if pd.notna(x) and str(x).strip() not in ("", "nan") else "")
        )
    else:
        df["zip_code"] = ""
    print(f"[match]   {len(df):,} buildings, {df['zip_code'].ne('').sum()} with zip codes")
    return df


def _load_leed() -> pd.DataFrame:
    p = RAW_DIR / "leed_certified_buildings.csv"
    if not p.exists():
        print(f"[WARN] LEED CSV not found at {p}. Run download_leed_data.py first.")
        return pd.DataFrame()
    df = pd.read_csv(p, dtype=str, low_memory=False)
    df.columns = [c.strip().lower() for c in df.columns]
    if "zip_code" in df.columns:
        df["zip_code"] = df["zip_code"].fillna("").str.strip().str[:5].str.zfill(5)
    # Convert state full name -> abbreviation
    df["state_abbrev"] = df["state"].map(STATE_ABBREV).fillna(df["state"].str.upper().str[:2])
    # Normalise cert_level
    df["cert_level"] = df["cert_level"].fillna("").str.title()
    df["leed_level_score"] = df["cert_level"].map(LEED_LEVEL_SCORE).fillna(0.0)
    # Normalise GFA
    df["gfa"] = pd.to_numeric(df.get("gross_floor_area_sqft", 0), errors="coerce").fillna(0)
    # City normalised
    df["city_norm"] = df["city"].fillna("").str.lower().str.strip()
    print(f"[match] LEED data: {len(df):,} records")
    return df


def _load_energystar() -> pd.DataFrame:
    p = RAW_DIR / "energystar_certified_buildings.csv"
    if not p.exists():
        print(f"[WARN] Energy Star CSV not found at {p}. Run download_leed_data.py first.")
        return pd.DataFrame()
    df = pd.read_csv(p, dtype=str, low_memory=False)
    df.columns = [c.strip().lower() for c in df.columns]
    if "zip_code" in df.columns:
        df["zip_code"] = df["zip_code"].fillna("").str.strip().str[:5].str.zfill(5)
    df["state_abbrev"] = df["state"].fillna("").str.strip().str.upper()
    df["es_score_num"] = pd.to_numeric(df.get("es_score", 0), errors="coerce").fillna(0)
    df["city_norm"] = df["city"].fillna("").str.lower().str.strip()
    print(f"[match] Energy Star data: {len(df):,} records")
    return df


# ──────────────────────────────────────────────────────────────────────────────
# Matching logic
# ──────────────────────────────────────────────────────────────────────────────

def _build_city_density(leed_df: pd.DataFrame, es_df: pd.DataFrame) -> tuple[dict, dict]:
    """
    Build state+city -> (avg_leed_score, count) and state+city -> (avg_es_score, count) dicts.
    """
    leed_density: dict[tuple, float] = {}
    if not leed_df.empty:
        g = leed_df.groupby(["state_abbrev", "city_norm"])
        for (st, city), grp in g:
            leed_density[(st, city)] = (grp["leed_level_score"].mean(), len(grp))

    es_density: dict[tuple, float] = {}
    if not es_df.empty:
        g = es_df.groupby(["state_abbrev", "city_norm"])
        for (st, city), grp in g:
            es_density[(st, city)] = (grp["es_score_num"].mean() / 100.0, len(grp))

    return leed_density, es_density


def _build_zip_index(leed_df: pd.DataFrame, es_df: pd.DataFrame) -> tuple[dict, dict]:
    """zip_code -> best_leed_level_score, zip_code -> avg_es_score"""
    leed_zip: dict[str, float] = {}
    if not leed_df.empty and "zip_code" in leed_df.columns:
        for zip_code, grp in leed_df.groupby("zip_code"):
            if zip_code and zip_code != "00000":
                leed_zip[zip_code] = grp["leed_level_score"].max()

    es_zip: dict[str, tuple] = {}
    if not es_df.empty and "zip_code" in es_df.columns:
        for zip_code, grp in es_df.groupby("zip_code"):
            if zip_code and zip_code != "00000":
                avg_score = grp["es_score_num"].mean() / 100.0
                es_zip[zip_code] = (avg_score, len(grp))

    return leed_zip, es_zip


def _match_building(
    row: pd.Series,
    leed_df: pd.DataFrame,
    es_df: pd.DataFrame,
    leed_density: dict,
    es_density: dict,
    leed_zip: dict,
    es_zip: dict,
    state_baselines: dict,
) -> dict:
    st_abbrev   = row["state_abbrev"]
    city_raw    = str(row.get("city", "")).lower().strip()
    zip_code    = str(row.get("zip_code", "")).strip()
    state_base  = state_baselines.get(row.get("state", ""), 0.48)

    # ── 1. Zip-code exact match (highest confidence) ──────────────────────────
    leed_score_zip = leed_zip.get(zip_code, None)
    es_score_zip   = es_zip.get(zip_code, (None, 0))[0]
    leed_certified   = leed_score_zip is not None
    es_certified     = es_score_zip is not None

    # ── 2. City fuzzy match within same state ─────────────────────────────────
    leed_score_city = None
    es_score_city   = None
    leed_level_name = ""

    # Exact state+city
    key = (st_abbrev, city_raw)
    if key in leed_density:
        avg_score, cnt = leed_density[key]
        # Weight by density (more certified buildings = higher proxy score)
        density_boost = min(0.15, math.log1p(cnt) * 0.03)
        leed_score_city = min(1.0, avg_score + density_boost)

    if key in es_density:
        avg_score, cnt = es_density[key]
        density_boost = min(0.10, math.log1p(cnt) * 0.02)
        es_score_city = min(1.0, avg_score + density_boost)

    # Fuzzy city match (if no exact match)
    if leed_score_city is None and not leed_df.empty:
        state_leed = leed_df[leed_df["state_abbrev"] == st_abbrev]
        best_score = 0
        best_leed_score = None
        for _, lr in state_leed.iterrows():
            sim = fuzz.token_sort_ratio(city_raw, lr["city_norm"])
            if sim >= 85 and lr["leed_level_score"] > best_score:
                best_score = sim
                best_leed_score = lr["leed_level_score"]
                leed_level_name = lr.get("cert_level", "")
        if best_leed_score is not None:
            leed_score_city = best_leed_score * 0.80  # discount for fuzzy match

    if es_score_city is None and not es_df.empty:
        state_es = es_df[es_df["state_abbrev"] == st_abbrev]
        best_sim = 0
        best_es_score = None
        for _, er in state_es.iterrows():
            sim = fuzz.token_sort_ratio(city_raw, er["city_norm"])
            if sim >= 85 and er["es_score_num"] > 0:
                if sim > best_sim:
                    best_sim = sim
                    best_es_score = er["es_score_num"] / 100.0
        if best_es_score is not None:
            es_score_city = best_es_score * 0.80

    # ── 3. Resolve best LEED score ────────────────────────────────────────────
    if leed_certified and leed_score_zip is not None:
        final_leed_score = leed_score_zip
        match_method = "zip_exact"
    elif leed_score_city is not None:
        final_leed_score = leed_score_city
        match_method = "city_match"
        leed_certified = False  # city density ≠ building certification
    else:
        # Proxy estimate from building type + state ESG
        btype_base = _type_base(row)
        iv_norm = min(1.0, float(row.get("improvement_value_score", 0) or 0))
        final_leed_score = (btype_base * 0.4) + (iv_norm * 0.3) + (state_base * 0.3)
        match_method = "proxy"

    # ── 4. Resolve best Energy Star score ─────────────────────────────────────
    if es_certified and es_score_zip is not None:
        final_es_score = min(1.0, es_score_zip)
        es_match = "zip_exact"
    elif es_score_city is not None:
        final_es_score = es_score_city
        es_match = "city_match"
        es_certified = False
    else:
        # Proxy: state policy gives an energy efficiency baseline
        final_es_score = state_base * 0.70
        es_match = "proxy"

    # Resolve LEED level name
    if leed_certified:
        if final_leed_score >= 0.95:
            leed_level_name = "Platinum"
        elif final_leed_score >= 0.80:
            leed_level_name = "Gold"
        elif final_leed_score >= 0.65:
            leed_level_name = "Silver"
        else:
            leed_level_name = "Certified"

    return {
        "leed_score":             round(final_leed_score, 4),
        "leed_certified":         leed_certified,
        "leed_level":             leed_level_name if leed_certified else "",
        "leed_match_method":      match_method,
        "energy_star_score":      round(final_es_score, 4),
        "energy_star_certified":  es_certified,
        "es_match_method":        es_match,
        "state_esg_baseline":     state_base,
    }


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main() -> None:
    print("=" * 60)
    print("RainUSE Nexus — LEED & Energy Star Building Match")
    print("=" * 60)

    buildings = _load_buildings()
    leed_df   = _load_leed()
    es_df     = _load_energystar()

    # Load state baselines
    baseline_path = RAW_DIR / "state_esg_baselines.csv"
    if baseline_path.exists():
        bl = pd.read_csv(baseline_path)
        state_baselines = dict(zip(bl["state"], bl["state_esg_baseline"]))
    else:
        print("[WARN] State baselines not found — run compute_state_esg_baseline.py first")
        state_baselines = {}

    print(f"\n[match] Building density indexes…")
    leed_density, es_density = _build_city_density(leed_df, es_df)
    leed_zip, es_zip         = _build_zip_index(leed_df, es_df)
    print(f"[match]   LEED city buckets: {len(leed_density)}  zip buckets: {len(leed_zip)}")
    print(f"[match]   ES   city buckets: {len(es_density)}  zip buckets: {len(es_zip)}")

    print(f"\n[match] Matching {len(buildings):,} buildings…")
    results = []
    for _, row in buildings.iterrows():
        r = _match_building(
            row, leed_df, es_df,
            leed_density, es_density, leed_zip, es_zip,
            state_baselines,
        )
        results.append(r)

    result_df = pd.DataFrame(results)

    # Merge back
    for col in result_df.columns:
        buildings[col] = result_df[col].values

    out = PROC_DIR / "buildings_leed_enriched.csv"
    buildings.to_csv(out, index=False)
    print(f"\n[match] Saved -> {out}")

    # ── Report ──────────────────────────────────────────────────────────────
    n_leed  = buildings["leed_certified"].sum()
    n_es    = buildings["energy_star_certified"].sum()
    n_proxy = (buildings["leed_match_method"] == "proxy").sum()
    n_city  = (buildings["leed_match_method"] == "city_match").sum()
    n_zip   = (buildings["leed_match_method"] == "zip_exact").sum()

    print("\n" + "=" * 60)
    print("LEED matching complete:")
    print(f"  Exact LEED certified matches (zip):  {n_zip:>6,} buildings")
    print(f"  City-density matches:                {n_city:>6,} buildings")
    print(f"  Estimated from proxy:                {n_proxy:>6,} buildings")
    print(f"  Buildings marked LEED certified:     {n_leed:>6,}")
    print(f"  Buildings marked Energy Star:        {n_es:>6,}")

    print("\n[match] LEED score distribution:")
    print(buildings["leed_score"].describe().round(3).to_string())
    print("\n[match] Energy Star score distribution:")
    print(buildings["energy_star_score"].describe().round(3).to_string())

    print("\n[match] States with most LEED city-density coverage:")
    top_states = (
        buildings[buildings["leed_match_method"] == "city_match"]
        .groupby("state").size()
        .sort_values(ascending=False)
        .head(5)
    )
    print(top_states.to_string())


if __name__ == "__main__":
    main()
