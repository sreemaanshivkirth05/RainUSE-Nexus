"""
RainUSE Nexus — ESG & EPA Data Preparation
==========================================
Reads existing raw files:
  data/raw/enrichments/sbti_by_company.xlsx  (SBTi company targets)
  data/raw/enrichments/epa_facilities.csv    (EPA ECHO facility register)

Saves standardised CSVs to:
  data/raw/sbti_companies.csv
  data/raw/epa_echo_facilities.csv

No network download needed — raw files already present.
"""

from __future__ import annotations
import sys
from pathlib import Path

import subprocess
for pkg in ["openpyxl", "pandas"]:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", pkg])

import pandas as pd  # noqa: E402

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
RAW_DIR      = PROJECT_ROOT / "data" / "raw"
ENRICH_DIR   = RAW_DIR / "enrichments"


# ──────────────────────────────────────────────────────────────────────────────
# 1. SBTi company targets
# ──────────────────────────────────────────────────────────────────────────────

def process_sbti() -> pd.DataFrame:
    src = ENRICH_DIR / "sbti_by_company.xlsx"
    dst = RAW_DIR / "sbti_companies.csv"

    if not src.exists():
        print(f"[WARN] SBTi source not found: {src}")
        return pd.DataFrame()

    print(f"[SBTi] Loading {src}…")
    df = pd.read_excel(src, dtype=str)
    print(f"[SBTi] Raw rows: {len(df):,}  columns: {list(df.columns)}")

    # Normalise key columns
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    # Keep only columns we'll use
    keep = ["company_name", "sector", "location", "region",
            "near_term_status", "long_term_status", "net_zero_status"]
    keep = [c for c in keep if c in df.columns]
    df = df[keep].copy()

    # Filter to US companies where possible (location contains "United States")
    us_mask = df["location"].fillna("").str.contains("United States", case=False)
    df_us = df[us_mask].copy()

    # Standardise status values
    for col in ["near_term_status", "long_term_status", "net_zero_status"]:
        if col in df.columns:
            df[col] = df[col].fillna("None").str.strip()

    df.to_csv(dst, index=False)
    print(f"[SBTi] Saved {len(df):,} total companies ({len(df_us):,} US) -> {dst}")

    print("\n[SBTi] Near-term status breakdown:")
    if "near_term_status" in df.columns:
        print(df["near_term_status"].value_counts().head(10).to_string())

    return df


# ──────────────────────────────────────────────────────────────────────────────
# 2. EPA ECHO facility register
# ──────────────────────────────────────────────────────────────────────────────

def process_epa() -> pd.DataFrame:
    src = ENRICH_DIR / "epa_facilities.csv"
    dst = RAW_DIR / "epa_echo_facilities.csv"

    if not src.exists():
        print(f"[WARN] EPA ECHO source not found: {src}")
        return pd.DataFrame()

    print(f"\n[EPA] Loading {src}…")
    df = pd.read_csv(src, dtype=str, low_memory=False)
    print(f"[EPA] Raw rows: {len(df):,}  columns: {list(df.columns)[:10]}")

    col_map = {
        "FAC_NAME":          "facility_name",
        "FAC_STREET":        "address",
        "FAC_CITY":          "city",
        "FAC_STATE":         "state",
        "FAC_ZIP":           "zip_code",
        "LATITUDE_MEASURE":  "latitude",
        "LONGITUDE_MEASURE": "longitude",
        "FAC_COUNTY":        "county",
        "FAC_EPA_REGION":    "epa_region",
        "REGISTRY_ID":       "registry_id",
    }
    df = df.rename(columns={k: v for k, v in col_map.items() if k in df.columns})

    # Convert lat/lon to float
    for col in ["latitude", "longitude"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Drop rows without usable location
    df = df.dropna(subset=["latitude", "longitude"]).copy()

    df.to_csv(dst, index=False)
    print(f"[EPA] Saved {len(df):,} facilities with coordinates -> {dst}")

    print("\n[EPA] Records per state (top 20):")
    if "state" in df.columns:
        print(df["state"].value_counts().head(20).to_string())

    return df


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("RainUSE Nexus — ESG & EPA Data Preparation")
    print("=" * 60)

    sbti_df = process_sbti()
    epa_df  = process_epa()

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"SBTi companies: {len(sbti_df):,}")
    print(f"EPA facilities with coordinates: {len(epa_df):,}")
