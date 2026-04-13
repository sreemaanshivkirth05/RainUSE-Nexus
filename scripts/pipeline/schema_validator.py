"""
RainUSE Nexus — Schema Validator

Validates CSV files against their YAML source schema definitions.
Reports missing required columns, type mismatches, and data quality issues.
"""

import pandas as pd
from typing import Any


def validate_csv(df: pd.DataFrame, source_config: dict[str, Any]) -> list[str]:
    """
    Validate a DataFrame against a source config schema.

    Returns a list of error/warning strings. Empty list = valid.
    """
    errors = []
    source_id = source_config.get("source_id", "unknown")
    columns_config = source_config.get("columns", [])

    csv_columns = set(df.columns.str.strip())

    # Check required columns
    for col_def in columns_config:
        col_name = col_def["name"]
        required = col_def.get("required", False)

        if col_name not in csv_columns:
            if required:
                errors.append(f"[{source_id}] MISSING required column: '{col_name}'")
            continue

        # Check for nulls in required columns
        if required and df[col_name].isna().any():
            null_count = df[col_name].isna().sum()
            errors.append(
                f"[{source_id}] Column '{col_name}' has {null_count} null values (required column)"
            )

        # Basic type validation
        expected_type = col_def.get("type", "").upper()
        if expected_type in ("FLOAT64", "INT64") and col_name in csv_columns:
            non_numeric = pd.to_numeric(df[col_name], errors="coerce").isna() & df[col_name].notna()
            if non_numeric.any():
                bad_count = non_numeric.sum()
                errors.append(
                    f"[{source_id}] Column '{col_name}' has {bad_count} non-numeric values (expected {expected_type})"
                )

    # Warn about extra columns not in schema
    expected_columns = {col["name"] for col in columns_config}
    extra = csv_columns - expected_columns
    if extra:
        errors.append(
            f"[{source_id}] WARNING: Extra columns not in schema: {sorted(extra)}"
        )

    return errors


def validate_join_keys(
    base_df: pd.DataFrame,
    metrics_df: pd.DataFrame,
    join_key: str = "building_id",
) -> list[str]:
    """
    Validate that join keys align between base and metrics tables.
    """
    errors = []
    base_ids = set(base_df[join_key].dropna().unique())
    metrics_ids = set(metrics_df[join_key].dropna().unique())

    orphan_metrics = metrics_ids - base_ids
    if orphan_metrics:
        errors.append(
            f"WARNING: {len(orphan_metrics)} metric records have no matching base record: "
            f"{sorted(list(orphan_metrics)[:5])}{'...' if len(orphan_metrics) > 5 else ''}"
        )

    missing_metrics = base_ids - metrics_ids
    if missing_metrics:
        errors.append(
            f"INFO: {len(missing_metrics)} base records have no metrics: "
            f"{sorted(list(missing_metrics)[:5])}{'...' if len(missing_metrics) > 5 else ''}"
        )

    return errors
