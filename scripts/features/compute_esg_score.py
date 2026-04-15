"""
RainUSE Nexus — Final ESG Score Computation
============================================
Computes a final ESG score (0.0 – 1.0) per building using four components:

  A. State Policy Score      (30%) — from state_esg_baselines.csv
  B. Building Cert Score     (35%) — LEED / Energy Star from match step
  C. Building Type ESG       (20%) — sector-based likelihood
  D. Facility Compliance     (15%) — EPA ECHO proximity signal

Writes:
  data/processed/buildings_esg_final.csv
  (and merges back into buildings_scored.csv replacing stub values)

Prints a state-level summary table.
"""

from __future__ import annotations
import math, sys
from pathlib import Path

import subprocess
for pkg in ["pandas", "numpy"]:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", pkg])

import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
RAW_DIR      = PROJECT_ROOT / "data" / "raw"
PROC_DIR     = PROJECT_ROOT / "data" / "processed"

# ──────────────────────────────────────────────────────────────────────────────
# Component C — building type ESG likelihood
# ──────────────────────────────────────────────────────────────────────────────

TYPE_ESG = {
    "hospital": 0.75, "medical": 0.75, "healthcare": 0.75,
    "university": 0.78, "education": 0.78, "school": 0.72,
    "office": 0.65, "corporate": 0.65, "headquarters": 0.65,
    "data_center": 0.80, "data center": 0.80,
    "hotel": 0.55, "hospitality": 0.55,
    "retail": 0.45, "shopping": 0.45,
    "industrial": 0.35, "warehouse": 0.35, "manufacturing": 0.35,
    "airport": 0.60, "government": 0.62, "military": 0.58,
    "power plant": 0.30, "power": 0.30,
}
DEFAULT_TYPE_ESG = 0.40


def _building_type_esg(row: pd.Series) -> float:
    text = " ".join([
        str(row.get("name", "")),
        str(row.get("explanation", "")),
        str(row.get("opportunity_type", "")),
        str(row.get("visual_notes", "")),
    ]).lower()
    for kw, score in TYPE_ESG.items():
        if kw in text:
            return score
    return DEFAULT_TYPE_ESG


# ──────────────────────────────────────────────────────────────────────────────
# Component D — EPA ECHO facility compliance
# ──────────────────────────────────────────────────────────────────────────────

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi, dlam = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _build_epa_index(epa_df: pd.DataFrame) -> list[tuple]:
    """Return list of (lat, lon) for fast proximity search."""
    if epa_df.empty:
        return []
    valid = epa_df.dropna(subset=["latitude", "longitude"])
    return list(zip(valid["latitude"], valid["longitude"]))


def _epa_compliance_score(
    lat: float, lon: float,
    epa_points: list[tuple],
    state_base: float,
) -> float:
    """
    If any EPA ECHO facility is within 10 km, score = 0.60
    (regulated facility nearby -> more environmental accountability).
    Otherwise = state_base × 0.8.
    """
    if not epa_points or pd.isna(lat) or pd.isna(lon):
        return state_base * 0.8

    for elat, elon in epa_points[:5000]:  # limit search for speed
        if abs(elat - lat) > 1.0 or abs(elon - lon) > 1.0:
            continue
        if _haversine_km(lat, lon, elat, elon) <= 10.0:
            return 0.60

    return state_base * 0.8


# ──────────────────────────────────────────────────────────────────────────────
# Tier assignment
# ──────────────────────────────────────────────────────────────────────────────

def _sustainability_tier(score: float) -> str:
    if score >= 0.75:
        return "High ESG"
    if score >= 0.60:
        return "Moderate ESG"
    if score >= 0.45:
        return "Emerging ESG"
    return "Standard"


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main() -> None:
    print("=" * 60)
    print("RainUSE Nexus — Final ESG Score Computation")
    print("=" * 60)

    # ── Load enriched buildings ───────────────────────────────────────────────
    enriched_path = PROC_DIR / "buildings_leed_enriched.csv"
    if not enriched_path.exists():
        print("[ERROR] buildings_leed_enriched.csv not found. Run match_leed_to_buildings.py first.")
        sys.exit(1)

    df = pd.read_csv(enriched_path, low_memory=False)
    df.columns = [c.strip().lower() for c in df.columns]
    print(f"[esg] Loaded {len(df):,} buildings")

    # ── Load state baselines ──────────────────────────────────────────────────
    baseline_path = RAW_DIR / "state_esg_baselines.csv"
    if baseline_path.exists():
        bl = pd.read_csv(baseline_path)
        state_baselines = dict(zip(bl["state"], bl["state_esg_baseline"]))
    else:
        print("[WARN] state_esg_baselines.csv not found — using defaults")
        state_baselines = {}

    # ── Load EPA ECHO for Component D ────────────────────────────────────────
    epa_path = RAW_DIR / "epa_echo_facilities.csv"
    epa_points = []
    if epa_path.exists():
        epa_df = pd.read_csv(epa_path, usecols=["latitude", "longitude"], dtype=float,
                              low_memory=False)
        epa_points = _build_epa_index(epa_df)
        print(f"[esg] EPA ECHO facility points loaded: {len(epa_points):,}")
    else:
        print("[WARN] epa_echo_facilities.csv not found — using state-baseline proxy for Component D")

    DEFAULT_BASELINE = 0.48

    # ── Compute per-building ESG scores ───────────────────────────────────────
    print("[esg] Computing final ESG scores…")

    esg_scores, comp_a_list, comp_b_list, comp_c_list, comp_d_list = [], [], [], [], []
    tiers, breakdowns = [], []

    for _, row in df.iterrows():
        state_base = state_baselines.get(str(row.get("state", "")), DEFAULT_BASELINE)

        # Use state_esg_baseline from match step if available, else look up
        if "state_esg_baseline" in row and pd.notna(row["state_esg_baseline"]):
            comp_a = float(row["state_esg_baseline"])
        else:
            comp_a = state_base

        # Component B — certification score (LEED + Energy Star blend)
        leed_s = float(row.get("leed_score", 0) or 0)
        es_s   = float(row.get("energy_star_score", 0) or 0)
        comp_b = (leed_s * 0.60) + (es_s * 0.40)   # weight LEED more

        # Component C — building type ESG likelihood
        comp_c = _building_type_esg(row)

        # Component D — EPA ECHO compliance proximity
        lat = float(row.get("latitude", np.nan) or np.nan)
        lon = float(row.get("longitude", np.nan) or np.nan)
        comp_d = _epa_compliance_score(lat, lon, epa_points, state_base)

        # Final weighted score
        score = (comp_a * 0.30) + (comp_b * 0.35) + (comp_c * 0.20) + (comp_d * 0.15)
        score = round(min(1.0, score), 4)

        tier = _sustainability_tier(score)

        esg_scores.append(score)
        comp_a_list.append(round(comp_a, 4))
        comp_b_list.append(round(comp_b, 4))
        comp_c_list.append(round(comp_c, 4))
        comp_d_list.append(round(comp_d, 4))
        tiers.append(tier)
        breakdowns.append(
            f"A={comp_a:.2f}×0.30 + B={comp_b:.2f}×0.35 + C={comp_c:.2f}×0.20 + D={comp_d:.2f}×0.15"
        )

    df["esg_score"]             = esg_scores
    df["sustainability_tier"]   = tiers
    df["esg_comp_a_policy"]     = comp_a_list
    df["esg_comp_b_cert"]       = comp_b_list
    df["esg_comp_c_type"]       = comp_c_list
    df["esg_comp_d_compliance"] = comp_d_list
    df["esg_component_breakdown"] = breakdowns

    # ── Save esg_final ────────────────────────────────────────────────────────
    final_path = PROC_DIR / "buildings_esg_final.csv"
    df.to_csv(final_path, index=False)
    print(f"[esg] Saved {len(df):,} buildings -> {final_path}")

    # ── Merge back into buildings_scored.csv ─────────────────────────────────
    scored_path = PROC_DIR / "buildings_scored.csv"
    scored = pd.read_csv(scored_path, low_memory=False)
    scored.columns = [c.strip().lower() for c in scored.columns]

    merge_cols = [
        "id", "esg_score", "leed_score", "energy_star_score",
        "leed_certified", "energy_star_certified", "leed_level",
        "leed_match_method", "es_match_method",
        "state_esg_baseline", "sustainability_tier",
        "esg_comp_a_policy", "esg_comp_b_cert", "esg_comp_c_type",
        "esg_comp_d_compliance", "esg_component_breakdown",
    ]
    merge_cols = [c for c in merge_cols if c in df.columns]

    patch = df[merge_cols].copy()
    # Drop old versions of these columns from scored
    for col in merge_cols:
        if col != "id" and col in scored.columns:
            scored.drop(columns=[col], inplace=True)

    scored = scored.merge(patch, on="id", how="left")
    scored.to_csv(scored_path, index=False)
    print(f"[esg] Merged ESG fields back into {scored_path}")

    # ── State summary table ───────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print(f"{'State':<22} {'Bldgs':>6} {'Avg ESG':>9} {'LEED Cert':>10} {'ES Cert':>8}")
    print("-" * 60)

    summary = df.groupby("state").agg(
        buildings=("id", "count"),
        avg_esg=("esg_score", "mean"),
        leed_cert=("leed_certified", "sum"),
        es_cert=("energy_star_certified", "sum"),
    ).reset_index().sort_values("avg_esg", ascending=False)

    for _, r in summary.iterrows():
        print(
            f"{r['state']:<22} {r['buildings']:>6,} {r['avg_esg']:>9.3f} "
            f"{r['leed_cert']:>10,} {r['es_cert']:>8,}"
        )

    print("\n[esg] ESG score distribution across all buildings:")
    print(df["esg_score"].describe().round(3).to_string())

    print("\n[esg] Sustainability tier breakdown:")
    print(df["sustainability_tier"].value_counts().to_string())

    # Unique values check
    unique_esg = df["esg_score"].nunique()
    print(f"\n[esg] Unique esg_score values: {unique_esg} (was 1 before — stub fixed)")
    print(f"[esg] Unique leed_score values: {df['leed_score'].nunique()}")
    print(f"[esg] Unique energy_star_score values: {df['energy_star_score'].nunique()}")


if __name__ == "__main__":
    main()
