"""
RainUSE Nexus — LEED & Energy Star Data Preparation
====================================================
Reads existing raw files:
  data/raw/enrichments/leed_raw.csv   (XLSX format — USGBC project database)
  data/raw/enrichments/energy_star_buildings.csv

Cleans and saves standardised CSVs to:
  data/raw/leed_certified_buildings.csv
  data/raw/energystar_certified_buildings.csv

No network download is needed — the raw files were already fetched.
If either file is missing the script prints a warning and continues.
"""

from __future__ import annotations
import shutil, sys
from pathlib import Path

import subprocess
for pkg in ["openpyxl", "pandas"]:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", pkg])

import openpyxl  # noqa: E402
import pandas as pd  # noqa: E402

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
RAW_DIR      = PROJECT_ROOT / "data" / "raw"
ENRICH_DIR   = RAW_DIR / "enrichments"

# ──────────────────────────────────────────────────────────────────────────────
# 1. LEED — convert mislabelled XLSX -> clean CSV
# ──────────────────────────────────────────────────────────────────────────────

def process_leed() -> pd.DataFrame:
    src = ENRICH_DIR / "leed_raw.csv"
    dst = RAW_DIR / "leed_certified_buildings.csv"

    if not src.exists():
        print(f"[WARN] LEED source not found: {src}")
        return pd.DataFrame()

    print(f"[LEED] Loading {src} (XLSX format)…")
    # The file is an XLSX saved with a .csv extension — copy to .xlsx to load
    tmp = src.with_suffix(".xlsx")
    shutil.copy(src, tmp)
    try:
        wb = openpyxl.load_workbook(tmp, read_only=True, data_only=True)
        ws = wb.active
        data = list(ws.iter_rows(values_only=True))
        wb.close()
    finally:
        tmp.unlink(missing_ok=True)

    headers = [str(h) if h is not None else "" for h in data[0]]
    df = pd.DataFrame(data[1:], columns=headers)
    print(f"[LEED] Raw rows: {len(df):,}  columns: {list(df.columns)[:10]}")

    # Normalise columns we need
    col_map = {
        "ProjectName":  "project_name",
        "Street":       "address",
        "City":         "city",
        "State":        "state",
        "Zipcode":      "zip_code",
        "CertLevel":    "cert_level",
        "CertDate":     "cert_date",
        "IsCertified":  "is_certified",
        "GrossFloorArea": "gross_floor_area_sqft",
        "ProjectTypes": "property_type",
        "PointsAchieved": "points_achieved",
        "LEEDSystemVersion": "leed_version",
    }
    df = df.rename(columns={k: v for k, v in col_map.items() if k in df.columns})

    # Keep US records only (State field contains full state name)
    us_states = {
        "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
        "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
        "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
        "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
        "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
        "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
        "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
        "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
    }
    if "state" in df.columns:
        df = df[df["state"].isin(us_states)].copy()

    # Standardise cert_level
    if "cert_level" in df.columns:
        df["cert_level"] = df["cert_level"].fillna("").str.strip().str.title()
        level_map = {
            "Platinum": "Platinum",
            "Gold":     "Gold",
            "Silver":   "Silver",
            "Certified":"Certified",
        }
        df["cert_level"] = df["cert_level"].map(level_map).fillna("")
        df = df[df["cert_level"] != ""].copy()

    # Convert GFA to numeric
    if "gross_floor_area_sqft" in df.columns:
        df["gross_floor_area_sqft"] = pd.to_numeric(
            df["gross_floor_area_sqft"], errors="coerce"
        ).fillna(0)

    df.to_csv(dst, index=False)
    print(f"[LEED] Saved {len(df):,} US certified records -> {dst}")

    print("\n[LEED] Records per state (top 20):")
    if "state" in df.columns:
        print(df["state"].value_counts().head(20).to_string())
    print("\n[LEED] Cert level breakdown:")
    if "cert_level" in df.columns:
        print(df["cert_level"].value_counts().to_string())

    return df


# ──────────────────────────────────────────────────────────────────────────────
# 2. Energy Star — clean and standardise
# ──────────────────────────────────────────────────────────────────────────────

def process_energystar() -> pd.DataFrame:
    src = ENRICH_DIR / "energy_star_buildings.csv"
    dst = RAW_DIR / "energystar_certified_buildings.csv"

    if not src.exists():
        print(f"[WARN] Energy Star source not found: {src}")
        return pd.DataFrame()

    print(f"\n[ES] Loading {src}…")
    df = pd.read_csv(src, dtype=str, low_memory=False)
    print(f"[ES] Raw rows: {len(df):,}  columns: {list(df.columns)}")

    col_map = {
        "Property/Plant ID":  "property_id",
        "Building Name":      "building_name",
        "Address1":           "address",
        "City":               "city",
        "State":              "state",
        "Zip":                "zip_code",
        "Score(s)":           "es_scores",
        "Property Type":      "property_type",
        "Gross Floor Area":   "gross_floor_area_sqft",
        "Year constructed":   "year_built",
    }
    df = df.rename(columns={k: v for k, v in col_map.items() if k in df.columns})

    # Clean building names (strip leading whitespace)
    for col in ["building_name", "address", "city"]:
        if col in df.columns:
            df[col] = df[col].str.strip()

    # Extract latest ES score (scores column contains e.g. "83, 85 , 88")
    if "es_scores" in df.columns:
        df["es_score"] = (
            df["es_scores"]
            .str.split(",")
            .apply(lambda x: pd.to_numeric(x[-1].strip(), errors="coerce") if isinstance(x, list) else 0)
            .fillna(0)
            .astype(float)
        )
    else:
        df["es_score"] = 0.0

    if "gross_floor_area_sqft" in df.columns:
        df["gross_floor_area_sqft"] = pd.to_numeric(
            df["gross_floor_area_sqft"], errors="coerce"
        ).fillna(0)

    df.to_csv(dst, index=False)
    print(f"[ES] Saved {len(df):,} certified records -> {dst}")

    print("\n[ES] Records per state (top 20):")
    if "state" in df.columns:
        print(df["state"].value_counts().head(20).to_string())

    return df


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("RainUSE Nexus — LEED & Energy Star Data Preparation")
    print("=" * 60)

    leed_df = process_leed()
    es_df   = process_energystar()

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"LEED certified records (US): {len(leed_df):,}")
    print(f"Energy Star certified records: {len(es_df):,}")
