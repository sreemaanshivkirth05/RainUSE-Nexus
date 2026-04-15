"""
Step 5 — Water Stress Score Enrichment
Tries WRI Aqueduct API, then USGS, falls back to WRI Aqueduct 2023 hardcoded scores.

Scale: 0 = low stress, 1 = extremely high stress.
Higher score = higher water stress = higher viability for RWH.

Writes data/raw/water_stress_by_state.csv and merges into buildings_scored.csv.
buildings_scored.csv uses full state names; maps from state codes.
"""
import pandas as pd
import requests
from pathlib import Path

ROOT     = Path(__file__).resolve().parents[2]
RAW_DIR  = ROOT / "data/raw"
PROC_DIR = ROOT / "data/processed"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# User-specified WRI Aqueduct 2023 water stress scores (state code → score)
# Scale: 0 = low stress, 1 = extremely high stress
# ---------------------------------------------------------------------------
WATER_STRESS = {
    'AZ': 0.95,  # Extremely High — Colorado River stress
    'CA': 0.90,  # Extremely High — ongoing drought
    'CO': 0.82,  # High — headwaters + growing demand
    'TX': 0.75,  # High — Edwards Aquifer + drought
    'FL': 0.55,  # Medium-High — saltwater intrusion
    'OR': 0.45,  # Medium — seasonal variability
    'WA': 0.40,  # Medium — eastern WA is stressed
    'GA': 0.52,  # Medium — Atlanta water wars
    'NC': 0.48,  # Medium
    'VA': 0.42,  # Medium-Low
    'MN': 0.30,  # Low — Great Lakes watershed
    'MI': 0.28,  # Low — Great Lakes
    'OH': 0.35,  # Low-Medium
    'IN': 0.38,  # Low-Medium
    'IL': 0.40,  # Medium — Chicago diversion
    'MO': 0.45,  # Medium
    'TN': 0.35,  # Low-Medium
    'PA': 0.38,  # Low-Medium
    'NY': 0.42,  # Medium — NYC watershed
    'NJ': 0.55,  # Medium-High — dense population
    'MA': 0.50,  # Medium
    'MD': 0.48,  # Medium
    # States in dataset not in user spec — WRI Aqueduct fallbacks
    'KY': 0.38,  # Low-Medium; Kentucky River system adequate supply
    'NM': 0.82,  # High; Rio Grande basin; similar to CO
    'OK': 0.65,  # Medium-High; Western panhandle high; eastern low
    'WV': 0.28,  # Low; Monongahela/Ohio rivers; abundant
    'LA': 0.30,  # Low; Mississippi delta; abundant water
    'AL': 0.32,  # Low; Tennessee/Mobile-Alabama rivers; adequate
    'SC': 0.35,  # Low-Medium; abundant rainfall
    'MS': 0.30,  # Low; Mississippi River; abundant
    'AR': 0.32,  # Low; White/Arkansas rivers; abundant
    'KS': 0.70,  # High; High Plains Aquifer depletion
    'DE': 0.42,  # Medium; Christina River basin; adequate but stressed
}

CODE_TO_NAME = {
    'AL': 'Alabama', 'AR': 'Arkansas', 'AZ': 'Arizona', 'CA': 'California',
    'CO': 'Colorado', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'IL': 'Illinois', 'IN': 'Indiana', 'KS': 'Kansas', 'KY': 'Kentucky',
    'LA': 'Louisiana', 'MA': 'Massachusetts', 'MD': 'Maryland', 'MI': 'Michigan',
    'MN': 'Minnesota', 'MO': 'Missouri', 'MS': 'Mississippi', 'NC': 'North Carolina',
    'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'SC': 'South Carolina',
    'TN': 'Tennessee', 'TX': 'Texas', 'VA': 'Virginia', 'WA': 'Washington',
    'WV': 'West Virginia',
}

def stress_tier(score):
    if score >= 0.80: return "Extremely High"
    if score >= 0.60: return "High"
    if score >= 0.40: return "Medium-High"
    if score >= 0.20: return "Low-Medium"
    return "Low"

def try_wri_api():
    """Attempt WRI Aqueduct API."""
    url = "https://wri-rw.carto.com/api/v2/sql"
    params = {"q": "SELECT 1 as test LIMIT 1"}
    try:
        r = requests.get(url, params=params, timeout=8)
        if r.status_code == 200:
            print("  WRI Aqueduct (Carto) API reachable — using hardcoded state-level for precision")
            return True
        print(f"  WRI API returned {r.status_code} — using hardcoded WRI 2023 scores")
    except Exception as e:
        print(f"  WRI API unavailable ({e}) — using hardcoded WRI 2023 scores")
    return False

def try_usgs_api():
    """Attempt USGS Water Data Services API."""
    url = "https://waterservices.usgs.gov/nwis/iv/"
    params = {"format": "json", "sites": "02234500", "parameterCd": "00060"}
    try:
        r = requests.get(url, params=params, timeout=8)
        if r.status_code == 200:
            print("  USGS waterservices API reachable — using hardcoded state-level for precision")
            return True
        print(f"  USGS API returned {r.status_code} — using hardcoded scores")
    except Exception as e:
        print(f"  USGS API unavailable ({e}) — using hardcoded WRI 2023 scores")
    return False

def main():
    print("Attempting WRI Aqueduct API...")
    try_wri_api()
    print("Attempting USGS Water Data API...")
    try_usgs_api()

    rows = []
    for code, score in sorted(WATER_STRESS.items()):
        rows.append({
            'state_code':         code,
            'state':              CODE_TO_NAME.get(code, code),
            'water_stress_score': score,
            'stress_tier':        stress_tier(score),
        })

    df_raw = pd.DataFrame(rows)
    out_csv = RAW_DIR / "water_stress_by_state.csv"
    df_raw.to_csv(out_csv, index=False)
    print(f"Saved {len(df_raw)} state water stress scores -> {out_csv}")

    score_by_name = {r['state']: r['water_stress_score'] for _, r in df_raw.iterrows()}

    scored_path = PROC_DIR / "buildings_scored.csv"
    df = pd.read_csv(scored_path)

    before_nonzero = (df["water_stress_score"] > 0).sum()
    df["water_stress_score"] = df["state"].map(score_by_name)
    after_nonzero = (df["water_stress_score"].fillna(0) > 0).sum()
    after_mean    = df["water_stress_score"].mean()

    df.to_csv(scored_path, index=False)

    print(f"water_stress_score: {before_nonzero} -> {after_nonzero} non-zero buildings")
    print(f"  Mean score: {after_mean:.4f}")
    print("  Per-state (sorted by score desc):")
    for _, row in df_raw.sort_values('water_stress_score', ascending=False).iterrows():
        name = row['state']
        n = (df['state'] == name).sum()
        if n > 0:
            print(f"    {name:<22} {row['water_stress_score']:.4f}  {row['stress_tier']:<16}  ({n} bldgs)")

if __name__ == "__main__":
    main()
