"""
RainUSE Nexus — Local Pipeline

Runs the raw → staging → serving pipeline entirely in-memory using pandas.
Produces a serving-layer CSV that the backend can load directly.

Usage:
    python -m scripts.pipeline.local_pipeline

This script:
    1. Loads sample CSVs from sample-data/
    2. Validates against YAML schemas
    3. Joins base + metrics (staging)
    4. Computes viability_score and opportunity_type (serving)
    5. Writes output to data/processed/buildings_serving.csv
"""

import sys
from pathlib import Path

import pandas as pd
import numpy as np

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "scripts"))

from pipeline.config_loader import load_source_config, load_metrics_config
from pipeline.schema_validator import validate_csv, validate_join_keys

SAMPLE_DATA_DIR = PROJECT_ROOT / "sample-data"
OUTPUT_DIR = PROJECT_ROOT / "data" / "processed"


def load_and_validate_source(source_id: str) -> pd.DataFrame:
    """Load a CSV and validate it against its YAML schema."""
    config = load_source_config(source_id)
    local_path = PROJECT_ROOT / config["local_path"]

    print(f"\n{'='*60}")
    print(f"Loading source: {config['label']}")
    print(f"  File: {local_path}")

    if not local_path.exists():
        print(f"  ❌ File not found: {local_path}")
        sys.exit(1)

    df = pd.read_csv(local_path)
    df.columns = df.columns.str.strip()
    print(f"  Rows: {len(df)}")
    print(f"  Columns: {list(df.columns)}")

    errors = validate_csv(df, config)
    if errors:
        for e in errors:
            prefix = "  ⚠️ " if "WARNING" in e or "INFO" in e else "  ❌ "
            print(f"{prefix}{e}")
        # Only abort on actual errors, not warnings
        real_errors = [e for e in errors if "WARNING" not in e and "INFO" not in e]
        if real_errors:
            print("  Schema validation failed. Fix issues and retry.")
            sys.exit(1)
    else:
        print("  ✅ Schema validation passed")

    return df


def run_staging(base_df: pd.DataFrame, metrics_df: pd.DataFrame) -> pd.DataFrame:
    """
    Staging transformation: join base + metrics, clean types.
    Mirrors sql/transformations/raw_to_staging.sql logic.
    """
    print(f"\n{'='*60}")
    print("Running staging transformation...")

    # Validate join keys
    join_errors = validate_join_keys(base_df, metrics_df)
    for e in join_errors:
        print(f"  ⚠️  {e}")

    # Join
    staged = base_df.merge(metrics_df, on="building_id", how="left", suffixes=("", "_m"))

    # Clean types
    staged["updated_at"] = pd.to_datetime(staged["updated_at"], errors="coerce").dt.date

    # Fill metric nulls
    metric_float_cols = [
        "roof_area_sqft", "annual_rain_inches", "annual_capture_gallons",
        "cooling_tower_score", "cooling_confidence", "water_cost_per_kgal",
        "water_stress_index", "flood_risk_score", "esg_commitment_score",
        "state_policy_score",
    ]
    for col in metric_float_cols:
        if col in staged.columns:
            staged[col] = staged[col].fillna(0.0)

    staged["energy_star_rating"] = staged.get("energy_star_rating", pd.Series(0)).fillna(0).astype(int)
    staged["leed_certified"] = staged.get("leed_certified", pd.Series(False)).fillna(False).astype(bool)
    staged["stormwater_fee_eligible"] = staged.get("stormwater_fee_eligible", pd.Series(False)).fillna(False).astype(bool)

    # Use roof_area_sqft from metrics if available, else fall back to area_sqft
    if "roof_area_sqft" not in staged.columns or staged["roof_area_sqft"].isna().all():
        staged["roof_area_sqft"] = staged["area_sqft"]

    # Deduplicate by building_id (keep latest by updated_at)
    staged = staged.sort_values("updated_at", ascending=False).drop_duplicates(
        subset=["building_id"], keep="first"
    )

    print(f"  Staged rows: {len(staged)}")
    print("  ✅ Staging complete")
    return staged


def run_serving(staged_df: pd.DataFrame) -> pd.DataFrame:
    """
    Serving transformation: compute viability_score and opportunity_type.
    Mirrors sql/transformations/staging_to_serving.sql logic.
    """
    print(f"\n{'='*60}")
    print("Running serving transformation...")

    df = staged_df.copy()

    # Derived: large_roof flag
    df["large_roof"] = df["roof_area_sqft"] >= 100000

    # Compute viability_score (0–100)
    df["viability_score"] = (
        # Rainwater potential (30%)
        np.minimum(df["annual_capture_gallons"] / 10_000_000.0, 1.0) * 30
        # Cooling demand (20%)
        + df["cooling_tower_score"] * 20
        # Economic pressure (15%)
        + np.minimum(df["water_cost_per_kgal"] / 10.0, 1.0) * 8
        + df["water_stress_index"] * 7
        # Resilience (15%)
        + df["flood_risk_score"] * 15
        # Sustainability (10%)
        + df["esg_commitment_score"] * 5
        + df["leed_certified"].astype(float) * 3
        + np.minimum(df["energy_star_rating"] / 100.0, 1.0) * 2
        # Policy (10%)
        + df["state_policy_score"] * 7
        + df["stormwater_fee_eligible"].astype(float) * 3
    ).round().astype(int)

    # Compute opportunity_type classification
    conditions = [
        (df["cooling_tower_score"] >= 0.7) & (df["cooling_confidence"] >= 0.6),
        (df["flood_risk_score"] >= 0.8),
        (df["annual_capture_gallons"] >= 5_000_000),
    ]
    choices = ["Cooling-Demand-Driven", "Resilience-Driven", "Rainfall-Driven"]
    df["opportunity_type"] = np.select(conditions, choices, default="Balanced Opportunity")

    # Select final columns in serving order
    serving_columns = [
        "building_id", "building_name", "address", "city", "state", "zip_code",
        "property_type", "area_sqft", "year_built", "owner_name",
        "latitude", "longitude", "stories", "roof_type", "parking_spaces", "updated_at",
        "roof_area_sqft", "annual_rain_inches", "annual_capture_gallons",
        "cooling_tower_score", "cooling_confidence",
        "water_cost_per_kgal", "water_stress_index", "flood_risk_score",
        "esg_commitment_score", "energy_star_rating", "leed_certified",
        "state_policy_score", "stormwater_fee_eligible",
        "large_roof", "viability_score", "opportunity_type",
    ]

    # Only select columns that exist
    available = [c for c in serving_columns if c in df.columns]
    df = df[available].copy()

    print(f"  Serving rows: {len(df)}")
    print(f"  Score range: {df['viability_score'].min()} – {df['viability_score'].max()}")
    print(f"  Opportunity types: {dict(df['opportunity_type'].value_counts())}")
    print("  ✅ Serving transformation complete")

    return df


def main():
    print("=" * 60)
    print("RainUSE Nexus — Local Data Pipeline")
    print("=" * 60)

    # Step 1: Load and validate sources
    base_df = load_and_validate_source("buildings_base")
    metrics_df = load_and_validate_source("building_metrics")

    # Step 2: Run staging
    staged_df = run_staging(base_df, metrics_df)

    # Step 3: Run serving
    serving_df = run_serving(staged_df)

    # Step 4: Write output
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / "buildings_serving.csv"
    serving_df.to_csv(output_path, index=False)
    print(f"\n{'='*60}")
    print(f"✅ Output written to: {output_path}")
    print(f"   Total buildings: {len(serving_df)}")
    print(f"   Columns: {len(serving_df.columns)}")

    # Step 5: Print sample queries
    print(f"\n{'='*60}")
    print("Sample queries against serving table:")
    print("-" * 60)

    print("\n1. Buildings in Texas with area > 100,000 sqft:")
    tx = serving_df[(serving_df["state"] == "Texas") & (serving_df["area_sqft"] > 100000)]
    print(tx[["building_id", "building_name", "area_sqft", "viability_score"]].to_string(index=False))

    print("\n2. Top 5 by viability score:")
    top5 = serving_df.nlargest(5, "viability_score")
    print(top5[["building_id", "building_name", "state", "viability_score", "opportunity_type"]].to_string(index=False))

    print("\n3. Count by opportunity type:")
    print(serving_df["opportunity_type"].value_counts().to_string())

    print("\n4. Count by state:")
    print(serving_df["state"].value_counts().to_string())

    print(f"\n{'='*60}")
    print("Pipeline complete. ✅")


if __name__ == "__main__":
    main()
