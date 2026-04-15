from __future__ import annotations

from pathlib import Path
import json
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

_STAGE2B = PROCESSED_DIR / "buildings_stage2b.csv"
_FALLBACK = PROCESSED_DIR / "buildings_scored.csv"
INPUT_FILE = _STAGE2B if _STAGE2B.exists() else _FALLBACK

SCORED_CSV = PROCESSED_DIR / "buildings_scored.csv"
SCORED_JSON = PROCESSED_DIR / "buildings_scored.json"

# New primary outputs (1 000 global / 500 per-state)
TOP_1000_CSV         = PROCESSED_DIR / "top_1000_buildings.csv"
TOP_1000_JSON        = PROCESSED_DIR / "top_1000_buildings.json"
TOP_500_BY_STATE_CSV = PROCESSED_DIR / "top_500_by_state.csv"
TOP_500_BY_STATE_JSON= PROCESSED_DIR / "top_500_by_state.json"

# Kept for backward compatibility — nothing that depends on them will break
TOP_500_CSV           = PROCESSED_DIR / "top_500_buildings.csv"
TOP_500_JSON          = PROCESSED_DIR / "top_500_buildings.json"
TOP_100_BY_STATE_CSV  = PROCESSED_DIR / "top_100_by_state.csv"
TOP_100_BY_STATE_JSON = PROCESSED_DIR / "top_100_by_state.json"

SUMMARY_JSON = PROCESSED_DIR / "summary.json"


GLOBAL_TOP_N = 1000   # was 500
STATE_TOP_N  = 500    # was 100


def log(msg: str) -> None:
    print(f"[score] {msg}")


def require_file(path: Path) -> None:
    if not path.exists():
        raise FileNotFoundError(
            f"Missing required file: {path}\n"
            "Run enrichment scripts first, or ensure buildings_scored.csv exists."
        )


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [str(c).strip().lower() for c in df.columns]
    return df


def confidence_multiplier(conf: float) -> float:
    conf = float(conf)
    if conf >= 0.80:
        return 1.00
    if conf >= 0.60:
        return 0.97
    if conf >= 0.40:
        return 0.93
    return 0.88


def determine_opportunity_type(row: pd.Series) -> str:
    rainfall_signal = (
        0.45 * row.get("annual_precip_score", 0) +
        0.55 * row.get("annual_capture_score", 0)
    )

    cooling_signal = (
        0.55 * row.get("cooling_tower_score", 0) +
        0.45 * row.get("cooling_degree_days_score", 0)
    )

    economic_signal = (
        0.45 * row.get("water_cost_score", 0) +
        0.30 * row.get("state_policy_score", 0) +
        0.25 * row.get("local_incentive_score", 0)
    )

    physical_signal = (
        0.40 * row.get("roof_area_score", 0) +
        0.35 * row.get("roof_geometry_quality_score", 0) +
        0.25 * row.get("facility_score", 0)
    )

    scores = {
        "Rainfall-Driven": rainfall_signal,
        "Cooling-Demand-Driven": cooling_signal,
        "Balanced Opportunity": (rainfall_signal + cooling_signal + economic_signal + physical_signal) / 4,
    }

    winner = max(scores, key=scores.get)
    values = sorted(scores.values(), reverse=True)

    if len(values) >= 2 and abs(values[0] - values[1]) < 0.05:
        return "Balanced Opportunity"

    return winner


def build_explanation(row: pd.Series) -> str:
    reasons = []

    if row.get("roof_area_sqft", 0) >= 250000:
        reasons.append("very large roof catchment area")
    elif row.get("roof_area_sqft", 0) >= 100000:
        reasons.append("large roof catchment area")

    if row.get("roof_geometry_quality_score", 0) >= 0.75:
        reasons.append("strong roof geometry for water collection")

    if row.get("annual_rain_inches", 0) >= 40:
        reasons.append("strong rainfall potential")
    elif row.get("annual_rain_inches", 0) >= 25:
        reasons.append("moderate rainfall potential")

    if row.get("annual_capture_gallons", 0) >= 5_000_000:
        reasons.append("very high annual capture potential")
    elif row.get("annual_capture_gallons", 0) >= 1_500_000:
        reasons.append("high annual capture potential")

    if row.get("cooling_tower_score", 0) >= 0.8:
        reasons.append("strong nearby cooling demand signal")
    elif row.get("cooling_tower_score", 0) >= 0.6:
        reasons.append("moderate nearby cooling demand signal")

    if row.get("facility_score", 0) >= 0.8:
        reasons.append("strong industrial or regulated facility context")
    elif row.get("facility_score", 0) >= 0.5:
        reasons.append("moderate industrial or facility context")

    if row.get("water_cost_score", 0) >= 0.7:
        reasons.append("higher water-cost savings potential")

    if row.get("state_policy_score", 0) > 0 or row.get("local_incentive_score", 0) > 0:
        reasons.append("supportive policy or incentive environment")

    if not reasons:
        return "Large-roof candidate with measurable reuse potential from physical, climate, and economic signals."

    return "Strong candidate due to " + ", ".join(reasons[:5]) + "."


def score_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    required = [
        "id",
        "state",
        "roof_area_score",
        "roof_threshold_bonus",
        "annual_precip_score",
        "annual_capture_score",
        "cooling_tower_score",
        "cooling_confidence",
        "cooling_degree_days_score",
        "facility_score",
        "water_cost_score",
        "state_policy_score",
        "local_incentive_score",
        "flood_score",
        "water_stress_score",
        "roof_geometry_quality_score",
    ]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required scoring columns: {missing}")

    numeric_cols = required[2:] + [
        "annual_capture_gallons",
        "roof_area_sqft",
        "annual_rain_inches",
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # Full scoring formula — weights sum to 1.0
    # Physical (30%): roof + geometry + climate
    # Demand  (18%): cooling tower + CDD + facility
    # Economic(19%): water cost + policy + incentive
    # Resilience(15%): flood + water stress
    # Geometry( 8%): roof quality (shared w/ physical)
    df["base_viability_score"] = (
        0.12 * df["roof_area_score"] +
        0.05 * df["roof_threshold_bonus"] +
        0.07 * df["annual_precip_score"] +
        0.10 * df["annual_capture_score"] +
        0.09 * df["cooling_tower_score"] +
        0.07 * df["cooling_degree_days_score"] +
        0.06 * df["facility_score"] +
        0.08 * df["water_cost_score"] +
        0.07 * df["state_policy_score"] +
        0.05 * df["local_incentive_score"] +
        0.08 * df["flood_score"] +
        0.07 * df["water_stress_score"] +
        0.09 * df["roof_geometry_quality_score"]
    ).round(6)

    df["confidence_multiplier"] = df["cooling_confidence"].apply(confidence_multiplier)
    df["final_viability_score"] = (df["base_viability_score"] * df["confidence_multiplier"] * 100).round(2)

    df["opportunity_type"] = df.apply(determine_opportunity_type, axis=1)
    df["explanation"] = df.apply(build_explanation, axis=1)

    df = df.sort_values(
        ["final_viability_score", "annual_capture_gallons", "roof_area_sqft"],
        ascending=[False, False, False]
    ).reset_index(drop=True)

    df["global_rank"] = df.index + 1
    df["state_rank"] = df.groupby("state").cumcount() + 1

    return df


def build_summary(df: pd.DataFrame, global_top: pd.DataFrame, state_top: pd.DataFrame) -> dict:
    state_summary = (
        df.groupby("state", dropna=False)
        .agg(
            candidate_count=("id", "count"),
            avg_score=("final_viability_score", "mean"),
            max_score=("final_viability_score", "max"),
            avg_capture_gallons=("annual_capture_gallons", "mean"),
            avg_roof_area_sqft=("roof_area_sqft", "mean"),
        )
        .reset_index()
        .sort_values("avg_score", ascending=False)
    )

    for col in ["avg_score", "max_score", "avg_capture_gallons", "avg_roof_area_sqft"]:
        state_summary[col] = state_summary[col].round(2)

    summary = {
        "total_candidates_scored": int(len(df)),
        "global_top_n": GLOBAL_TOP_N,
        "state_top_n": STATE_TOP_N,
        "top_5_global_preview": global_top[
            ["global_rank", "id", "state", "final_viability_score", "opportunity_type"]
        ].head(5).to_dict(orient="records"),
        "top_3_states_by_avg_score": state_summary.head(3).to_dict(orient="records"),
        "top_by_state_counts": state_top.groupby("state")["id"].count().sort_index().to_dict(),
        # kept for backward compat
        "top_100_by_state_counts": state_top.groupby("state")["id"].count().sort_index().to_dict(),
        "state_summary": state_summary.to_dict(orient="records"),
    }
    return summary


def main() -> None:
    require_file(INPUT_FILE)

    df = pd.read_csv(INPUT_FILE)
    df = normalize_columns(df)

    df = score_dataframe(df)

    df.to_csv(SCORED_CSV, index=False)
    log(f"Wrote {SCORED_CSV} ({len(df):,} rows)")

    df.to_json(SCORED_JSON, orient="records", indent=2)
    log(f"Wrote {SCORED_JSON}")

    global_top = df.head(GLOBAL_TOP_N).copy()

    # Primary output: top 1 000
    global_top.to_csv(TOP_1000_CSV, index=False)
    log(f"Wrote {TOP_1000_CSV} ({len(global_top):,} rows)")
    global_top.to_json(TOP_1000_JSON, orient="records", indent=2)
    log(f"Wrote {TOP_1000_JSON}")

    # Backward-compat: top 500 (subset of top 1 000)
    top500 = df.head(500).copy()
    top500.to_csv(TOP_500_CSV, index=False)
    log(f"Wrote {TOP_500_CSV} (500 rows — backward compat)")
    top500.to_json(TOP_500_JSON, orient="records", indent=2)
    log(f"Wrote {TOP_500_JSON}")

    _state_sorted = df.sort_values(
        ["state", "final_viability_score", "annual_capture_gallons", "roof_area_sqft"],
        ascending=[True, False, False, False]
    )

    state_top = (
        _state_sorted
        .groupby("state", group_keys=False)
        .head(STATE_TOP_N)
        .copy()
    )

    # Primary: top 500 per state
    state_top.to_csv(TOP_500_BY_STATE_CSV, index=False)
    log(f"Wrote {TOP_500_BY_STATE_CSV} ({len(state_top):,} rows)")
    state_top.to_json(TOP_500_BY_STATE_JSON, orient="records", indent=2)
    log(f"Wrote {TOP_500_BY_STATE_JSON}")

    # Backward-compat: top 100 per state
    old_state_top = (
        _state_sorted
        .groupby("state", group_keys=False)
        .head(100)
        .copy()
    )
    old_state_top.to_csv(TOP_100_BY_STATE_CSV, index=False)
    log(f"Wrote {TOP_100_BY_STATE_CSV} (100/state — backward compat)")
    old_state_top.to_json(TOP_100_BY_STATE_JSON, orient="records", indent=2)
    log(f"Wrote {TOP_100_BY_STATE_JSON}")

    summary = build_summary(df, global_top, state_top)
    with open(SUMMARY_JSON, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    log(f"Wrote {SUMMARY_JSON}")
    log("Scoring complete.")


if __name__ == "__main__":
    main()