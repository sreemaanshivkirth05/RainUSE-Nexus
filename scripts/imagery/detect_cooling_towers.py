"""
detect_cooling_towers.py
------------------------
Uses the Anthropic Claude API to estimate cooling tower presence for the top 100
buildings by proxy viability score, then merges results back into buildings_scored.csv.

Usage:
    ANTHROPIC_API_KEY=sk-ant-... python scripts/imagery/detect_cooling_towers.py
"""

from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path

import anthropic
import pandas as pd

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT  = Path(__file__).resolve().parents[2]
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

INPUT_FILE     = PROCESSED_DIR / "buildings_scored.csv"
DETECTIONS_CSV = PROCESSED_DIR / "cooling_tower_detections.csv"
SCORED_CSV     = PROCESSED_DIR / "buildings_scored.csv"

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MODEL            = "claude-sonnet-4-20250514"
TOP_N            = 100
REQUEST_DELAY_S  = 0.5   # seconds between API calls to avoid burst rate-limiting


def log(msg: str) -> None:
    print(f"[detect] {msg}")


# ---------------------------------------------------------------------------
# Scoring helpers (mirrors score_buildings.py)
# ---------------------------------------------------------------------------

def _confidence_multiplier(conf: float) -> float:
    conf = float(conf)
    if conf >= 0.80:
        return 1.00
    if conf >= 0.60:
        return 0.97
    if conf >= 0.40:
        return 0.93
    return 0.88


def _proxy_viability(df: pd.DataFrame) -> pd.Series:
    """Same weights as score_buildings.py — used only for ranking."""
    def col(name: str) -> pd.Series:
        return pd.to_numeric(df.get(name, 0), errors="coerce").fillna(0)

    return (
        0.15 * col("roof_area_score")
        + 0.05 * col("roof_threshold_bonus")
        + 0.07 * col("annual_precip_score")
        + 0.12 * col("annual_capture_score")
        + 0.11 * col("cooling_tower_score")
        + 0.07 * col("cooling_degree_days_score")
        + 0.09 * col("facility_score")
        + 0.10 * col("water_cost_score")
        + 0.07 * col("state_policy_score")
        + 0.05 * col("local_incentive_score")
        + 0.12 * col("roof_geometry_quality_score")
    )


# ---------------------------------------------------------------------------
# Prompt construction
# ---------------------------------------------------------------------------

def _size_label(sqft: float) -> str:
    if sqft >= 500_000:
        return f"very large ({sqft:,.0f} sq ft roof — likely warehouse, distribution center, or campus)"
    if sqft >= 250_000:
        return f"large ({sqft:,.0f} sq ft roof — likely industrial or big-box commercial)"
    if sqft >= 100_000:
        return f"medium-large ({sqft:,.0f} sq ft roof — typical mid-size commercial or light industrial)"
    return f"moderate ({sqft:,.0f} sq ft roof)"


def _climate_label(cdd: float) -> str:
    if cdd >= 3000:
        return f"very hot ({cdd:.0f} cooling degree-days/yr — heavy mechanical cooling expected)"
    if cdd >= 1500:
        return f"warm ({cdd:.0f} cooling degree-days/yr — significant cooling load)"
    if cdd >= 500:
        return f"moderate ({cdd:.0f} cooling degree-days/yr — seasonal cooling)"
    return f"cool ({cdd:.0f} cooling degree-days/yr — minimal cooling load)"


def _facility_label(score: float) -> str:
    if score >= 0.7:
        return "high (near heavy industrial / regulated facilities)"
    if score >= 0.4:
        return "moderate (mixed commercial / light industrial context)"
    return "low (primarily commercial / retail context)"


def build_prompt(row: pd.Series) -> str:
    state          = row.get("state", "Unknown")
    city           = str(row.get("city", "") or "").strip() or "unknown city"
    lat            = float(row.get("latitude", 0))
    lng            = float(row.get("longitude", 0))
    roof_sqft      = float(row.get("roof_area_sqft", 0))
    cdd            = float(row.get("cooling_degree_days", 0))
    rain_in        = float(row.get("annual_rain_inches", 0))
    capture_gal    = float(row.get("annual_capture_gallons", 0))
    facility_score = float(row.get("facility_score", 0))
    btype_score    = float(row.get("building_type_score", 0))
    water_cost     = float(row.get("water_cost", 0))
    rect_score     = float(row.get("rectangularity_score", 0))
    compact_score  = float(row.get("shape_compactness", 0))
    impr_value     = float(row.get("improvement_value", 0))
    roof_flag      = roof_sqft >= 100_000

    return f"""You are a commercial-building infrastructure analyst acting as a satellite imagery expert.
Your task: estimate whether this building likely has cooling towers or significant mechanical
cooling infrastructure that would benefit from rainwater harvesting as make-up water.

Building profile
----------------
Location         : {city}, {state}  (lat {lat:.4f}, lon {lng:.4f})
Roof footprint   : {_size_label(roof_sqft)}
Roof > 100K sqft : {"YES" if roof_flag else "NO"}
Climate          : {_climate_label(cdd)}
Annual rainfall  : {rain_in:.1f} inches/yr
Capture potential: {capture_gal:,.0f} gal/yr
Facility context : {_facility_label(facility_score)} (score {facility_score:.2f})
Building-type score : {btype_score:.3f}  (higher = more industrial/commercial)
Local water cost : ${water_cost:.2f}/kgal
Improvement value: ${impr_value:,.0f}
Roof geometry    : rectangularity {rect_score:.2f}, compactness {compact_score:.2f}

Expert context
--------------
Cooling towers are common in:
• Large industrial & manufacturing plants (very likely if facility_score >= 0.7)
• Data centers, hospitals, large hotels (high cooling load + 24/7 operation)
• Large office complexes and convention centers in warm climates
• Food processing and cold-storage facilities
• Buildings in hot climates (CDD > 2000) with large mechanical rooms

Buildings unlikely to have cooling towers:
• Small retail, restaurants, or residential
• Warehouses in cool climates with minimal HVAC
• Simple distribution centers with roof-only refrigeration

Task
----
Return ONLY a valid JSON object — no markdown, no commentary:
{{
  "cooling_confidence": <float 0.00-1.00>,
  "visual_notes": "<1 sentence explanation of your reasoning>",
  "roof_flag": <true if roof_area_sqft >= 100000, else false>,
  "detection_summary": "<2-3 sentence human-readable summary of your overall assessment>"
}}

cooling_confidence scale:
  0.0-0.2 : Very unlikely (cool climate, small/retail building, low industrial context)
  0.2-0.4 : Unlikely
  0.4-0.6 : Possible but uncertain
  0.6-0.8 : Likely (warm climate + large footprint or high facility context)
  0.8-1.0 : Very likely (hot climate + very large industrial/regulated facility)
"""


# ---------------------------------------------------------------------------
# Claude API call
# ---------------------------------------------------------------------------

def _parse_response(text: str) -> dict:
    """Extract JSON from Claude's response, tolerating markdown fences."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    match = re.search(r'\{[^{}]+\}', text, re.DOTALL)
    if match:
        return json.loads(match.group())
    return json.loads(text)


def detect_for_building(
    row: pd.Series,
    client: anthropic.Anthropic,
    fallback_confidence: float,
) -> tuple[float, str, bool, str]:
    """Return (cooling_confidence, visual_notes, roof_flag, detection_summary)."""
    prompt = build_prompt(row)
    roof_flag = float(row.get("roof_area_sqft", 0)) >= 100_000

    try:
        message = client.messages.create(
            model=MODEL,
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = message.content[0].text if message.content else ""
        parsed = _parse_response(raw)

        confidence = float(parsed["cooling_confidence"])
        confidence = max(0.0, min(1.0, confidence))
        notes = str(parsed.get("visual_notes", "")).strip()
        parsed_flag = bool(parsed.get("roof_flag", roof_flag))
        summary = str(parsed.get("detection_summary", notes)).strip()
        return confidence, notes, parsed_flag, summary

    except (json.JSONDecodeError, KeyError, IndexError, ValueError) as exc:
        log(f"    Parse error: {exc} — keeping fallback confidence")
        return fallback_confidence, "AI response could not be parsed; prior estimate retained.", roof_flag, ""

    except anthropic.APIError as exc:
        log(f"    API error: {exc} — keeping fallback confidence")
        return fallback_confidence, "API error during analysis; prior estimate retained.", roof_flag, ""


# ---------------------------------------------------------------------------
# Batch detection
# ---------------------------------------------------------------------------

def run_detections(top_df: pd.DataFrame, client: anthropic.Anthropic) -> pd.DataFrame:
    records = []
    total = len(top_df)

    for i, (_, row) in enumerate(top_df.iterrows(), 1):
        bid = row["id"]
        fallback = float(row.get("cooling_confidence", 0.5))
        print(f"Processing building {i} of {total}...")

        confidence, notes, roof_flag, summary = detect_for_building(row, client, fallback)
        log(f"  {bid}  → confidence={confidence:.3f}, roof_flag={roof_flag}")

        records.append({
            "id":                 bid,
            "latitude":           row.get("latitude"),
            "longitude":          row.get("longitude"),
            "cooling_confidence": round(confidence, 4),
            "visual_notes":       notes,
            "roof_flag":          roof_flag,
            "detection_summary":  summary,
        })

        if i < total:
            time.sleep(REQUEST_DELAY_S)

    return pd.DataFrame(records)


# ---------------------------------------------------------------------------
# Merge back into buildings_scored.csv
# ---------------------------------------------------------------------------

def merge_into_scored(detections: pd.DataFrame) -> None:
    if not SCORED_CSV.exists():
        log(f"buildings_scored.csv not found at {SCORED_CSV} — skipping merge")
        return

    log(f"Loading {SCORED_CSV} for merge...")
    scored = pd.read_csv(SCORED_CSV)
    scored.columns = [str(c).strip().lower() for c in scored.columns]

    lookup = (
        detections
        .set_index("id")[["cooling_confidence", "visual_notes", "roof_flag", "detection_summary"]]
        .to_dict("index")
    )

    updated = 0
    for idx, row in scored.iterrows():
        bid = row["id"]
        if bid in lookup:
            scored.at[idx, "cooling_confidence"]  = lookup[bid]["cooling_confidence"]
            scored.at[idx, "visual_notes"]         = lookup[bid]["visual_notes"]
            scored.at[idx, "roof_flag"]            = lookup[bid]["roof_flag"]
            scored.at[idx, "detection_summary"]    = lookup[bid]["detection_summary"]
            updated += 1

    if "base_viability_score" in scored.columns:
        scored["confidence_multiplier"] = (
            pd.to_numeric(scored["cooling_confidence"], errors="coerce")
            .fillna(0.5)
            .apply(_confidence_multiplier)
        )
        scored["final_viability_score"] = (
            pd.to_numeric(scored["base_viability_score"], errors="coerce").fillna(0)
            * scored["confidence_multiplier"]
            * 100
        ).round(2)
        log("Recalculated confidence_multiplier and final_viability_score for all rows")

    scored.to_csv(SCORED_CSV, index=False)
    log(f"Merged {updated} AI detections into {SCORED_CSV}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        raise EnvironmentError(
            "ANTHROPIC_API_KEY environment variable is not set.\n"
            "Export it before running:  export ANTHROPIC_API_KEY=sk-ant-..."
        )

    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Missing input file: {INPUT_FILE}\n"
            "Run the scoring pipeline first: python scripts/scoring/score_buildings.py"
        )

    client = anthropic.Anthropic(api_key=api_key)

    log(f"Loading {INPUT_FILE}...")
    df = pd.read_csv(INPUT_FILE)
    df.columns = [str(c).strip().lower() for c in df.columns]
    log(f"  {len(df):,} total buildings loaded")

    score_cols = [
        "roof_area_score", "roof_threshold_bonus", "annual_precip_score",
        "annual_capture_score", "cooling_tower_score", "cooling_degree_days_score",
        "facility_score", "water_cost_score", "state_policy_score",
        "local_incentive_score", "roof_geometry_quality_score",
    ]
    for col in score_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    df["_proxy"] = _proxy_viability(df)
    top_df = df.nlargest(TOP_N, "_proxy").drop(columns=["_proxy"]).copy()
    log(f"  Selected top {len(top_df)} buildings by proxy viability score")

    log(f"\nStarting Claude analysis  (model={MODEL})...")
    detections = run_detections(top_df, client)

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    detections.to_csv(DETECTIONS_CSV, index=False)
    log(f"\nSaved {len(detections)} detections → {DETECTIONS_CSV}")

    conf_vals = detections["cooling_confidence"]
    log(f"  confidence  min={conf_vals.min():.3f}  "
        f"mean={conf_vals.mean():.3f}  max={conf_vals.max():.3f}")
    high = (conf_vals >= 0.7).sum()
    log(f"  High-confidence detections (>=0.70): {high}/{len(detections)}")

    log("\nMerging into buildings_scored.csv...")
    merge_into_scored(detections)

    log("\nDone.")


if __name__ == "__main__":
    main()
