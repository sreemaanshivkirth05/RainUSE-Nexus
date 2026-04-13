from __future__ import annotations

from pathlib import Path
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

TOP_500_FILE = PROCESSED_DIR / "top_500_buildings.csv"
TOP_100_BY_STATE_FILE = PROCESSED_DIR / "top_100_by_state.csv"

GLOBAL_OUTPUT_FILE = PROCESSED_DIR / "imagery_review_top_500.csv"
STATE_OUTPUT_FILE = PROCESSED_DIR / "imagery_review_top_100_by_state.csv"
SHORTLIST_OUTPUT_FILE = PROCESSED_DIR / "imagery_review_demo_shortlist.csv"


def log(msg: str) -> None:
    print(f"[imagery-queue] {msg}")


def require_file(path: Path) -> None:
    if not path.exists():
        raise FileNotFoundError(f"Missing required file: {path}")


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [str(c).strip().lower() for c in df.columns]
    return df


def build_review_frame(df: pd.DataFrame, review_scope: str) -> pd.DataFrame:
    keep_cols = [
        "id",
        "global_rank",
        "state_rank",
        "state",
        "name",
        "city",
        "latitude",
        "longitude",
        "roof_area_sqft",
        "annual_rain_inches",
        "annual_capture_gallons",
        "cooling_tower_score",
        "cooling_confidence",
        "cooling_tower_distance_m",
        "facility_score",
        "water_cost_score",
        "roof_geometry_quality_score",
        "final_viability_score",
        "opportunity_type",
        "explanation",
        "visual_notes",
    ]

    existing_cols = [c for c in keep_cols if c in df.columns]
    out = df[existing_cols].copy()

    out["review_scope"] = review_scope
    out["review_status"] = "pending"

    out["image_source"] = ""
    out["image_url_or_path"] = ""
    out["usable_roof_observation"] = ""
    out["rooftop_obstruction_flag"] = ""
    out["rooftop_obstruction_notes"] = ""
    out["cooling_visual_support"] = ""
    out["cooling_visual_confidence"] = ""
    out["site_context_note"] = ""
    out["imagery_note"] = ""
    out["reviewed_by"] = ""
    out["reviewed_at"] = ""

    return out


def build_demo_shortlist(top500: pd.DataFrame, top100_state: pd.DataFrame) -> pd.DataFrame:
    global_demo = top500.head(20).copy()

    state_demo = (
        top100_state.sort_values(["state", "state_rank"], ascending=[True, True])
        .groupby("state", group_keys=False)
        .head(5)
        .copy()
    )

    combined = pd.concat([global_demo, state_demo], ignore_index=True)
    combined = combined.drop_duplicates(subset=["id"]).copy()

    sort_cols = [
        c for c in ["final_viability_score", "annual_capture_gallons", "roof_area_sqft"]
        if c in combined.columns
    ]
    if sort_cols:
        combined = combined.sort_values(
            sort_cols,
            ascending=[False] * len(sort_cols)
        ).reset_index(drop=True)

    combined["demo_priority_rank"] = combined.index + 1
    return combined


def main() -> None:
    require_file(TOP_500_FILE)
    require_file(TOP_100_BY_STATE_FILE)

    top500 = pd.read_csv(TOP_500_FILE)
    top100_state = pd.read_csv(TOP_100_BY_STATE_FILE)

    top500 = normalize_columns(top500)
    top100_state = normalize_columns(top100_state)

    global_review = build_review_frame(top500, review_scope="global_top_500")
    state_review = build_review_frame(top100_state, review_scope="state_top_100")

    demo_shortlist_base = build_demo_shortlist(top500, top100_state)
    demo_shortlist = build_review_frame(demo_shortlist_base, review_scope="demo_shortlist")

    if "demo_priority_rank" in demo_shortlist_base.columns:
        demo_shortlist["demo_priority_rank"] = demo_shortlist_base["demo_priority_rank"].values

    global_review.to_csv(GLOBAL_OUTPUT_FILE, index=False)
    log(f"Wrote {GLOBAL_OUTPUT_FILE} ({len(global_review):,} rows)")

    state_review.to_csv(STATE_OUTPUT_FILE, index=False)
    log(f"Wrote {STATE_OUTPUT_FILE} ({len(state_review):,} rows)")

    demo_shortlist.to_csv(SHORTLIST_OUTPUT_FILE, index=False)
    log(f"Wrote {SHORTLIST_OUTPUT_FILE} ({len(demo_shortlist):,} rows)")

    log("Imagery review queue files created.")


if __name__ == "__main__":
    main()