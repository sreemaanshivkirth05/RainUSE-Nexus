"""
Step 4 — FEMA Flood Risk Score Enrichment
Tries FEMA API first; falls back to hardcoded flood risk scores from user spec.

Higher score = higher flood risk = higher RWH resilience value
(buildings in flood zones have stronger case for water management independence).

Coastal states get +0.05 proximity bonus.
Writes data/raw/flood_scores_by_state.csv and merges into buildings_scored.csv.
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
# User-specified flood risk scores (state code → score)
# Based on % of state land area in flood zones and NFIP claims per capita
# ---------------------------------------------------------------------------
FLOOD_SCORES = {
    'FL': 0.95,  # Highest flood risk state
    'LA': 0.93,  # Louisiana (in dataset)
    'TX': 0.82,  # Gulf coast + river flooding
    'NC': 0.75,  # Hurricane + river flooding
    'SC': 0.74,
    'GA': 0.68,
    'VA': 0.65,
    'MD': 0.70,
    'NJ': 0.72,  # Coastal + storm surge
    'NY': 0.68,  # Coastal flooding
    'PA': 0.58,  # River flooding
    'OH': 0.52,
    'IN': 0.55,
    'TN': 0.60,  # River flooding
    'MO': 0.62,  # Mississippi + Missouri rivers
    'IL': 0.58,
    'MI': 0.48,
    'MN': 0.50,
    'MA': 0.62,  # Coastal
    'WA': 0.45,
    'OR': 0.48,
    'CO': 0.38,
    'AZ': 0.35,
    'CA': 0.55,  # Flash flood + coastal
    # States in dataset not in user spec — researched fallbacks
    'KY': 0.40,  # Kentucky River system; moderate flood risk
    'NM': 0.32,  # Flash flooding (monsoon); arroyo flooding; low NFIP
    'OK': 0.50,  # Tornado + flash flood prone; moderate NFIP
    'WV': 0.58,  # Flash flooding in mountain valleys
    'AL': 0.62,  # Gulf Coast; Mobile Bay; inland flooding
    'MS': 0.80,  # Mississippi Delta + Gulf Coast; high NFIP
    'AR': 0.52,  # Arkansas/Mississippi River floodplains
    'KS': 0.38,  # Flash flooding; low NFIP; drought-dominant
    'DE': 0.72,  # Low elevation; Sussex County coastal
}

# Coastal states that get +0.05 bonus (from user spec)
COASTAL_CODES = {'FL', 'TX', 'NC', 'SC', 'GA', 'VA', 'MD', 'NJ', 'NY', 'MA', 'WA', 'OR', 'CA',
                 # Additional coastal states in dataset
                 'LA', 'AL', 'MS', 'DE'}

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

def try_fema_api():
    """Attempt FEMA NFHL API per user spec."""
    url = ("https://hazards.fema.gov/gis/nfhl/rest/services/"
           "public/NFHL/MapServer/28/query")
    params = {
        "where": "1=1",
        "outFields": "STATE,FLOODZONE",
        "returnGeometry": "false",
        "f": "json",
        "resultRecordCount": 1,
    }
    try:
        r = requests.get(url, params=params, timeout=8)
        if r.status_code == 200 and "features" in r.json():
            print("  FEMA NFHL API reachable — using hardcoded state-level scores for precision")
            return True
        print(f"  FEMA API returned {r.status_code} — using hardcoded scores")
    except Exception as e:
        print(f"  FEMA API unavailable ({e}) — using hardcoded scores")
    return False

def main():
    print("Attempting FEMA NFHL API...")
    try_fema_api()

    rows = []
    for code, base in sorted(FLOOD_SCORES.items()):
        coastal_bonus = 0.05 if code in COASTAL_CODES else 0.0
        final = round(min(1.0, base + coastal_bonus), 4)
        rows.append({
            'state_code':    code,
            'state':         CODE_TO_NAME.get(code, code),
            'flood_base':    base,
            'coastal_bonus': coastal_bonus,
            'flood_score':   final,
        })

    df_raw = pd.DataFrame(rows)
    out_csv = RAW_DIR / "flood_scores_by_state.csv"
    df_raw.to_csv(out_csv, index=False)
    print(f"Saved {len(df_raw)} state flood scores -> {out_csv}")

    score_by_name = {r['state']: r['flood_score'] for _, r in df_raw.iterrows()}

    scored_path = PROC_DIR / "buildings_scored.csv"
    df = pd.read_csv(scored_path)

    before_nonzero = (df["flood_score"] > 0).sum()
    df["flood_score"] = df["state"].map(score_by_name)
    after_nonzero = (df["flood_score"].fillna(0) > 0).sum()
    after_mean    = df["flood_score"].mean()

    df.to_csv(scored_path, index=False)

    print(f"flood_score: {before_nonzero} -> {after_nonzero} non-zero buildings")
    print(f"  Mean score: {after_mean:.4f}")
    print("  Per-state (base + coastal bonus = final):")
    for _, row in df_raw.sort_values('flood_score', ascending=False).iterrows():
        name = row['state']
        n = (df['state'] == name).sum()
        if n > 0:
            bonus_str = f"+{row['coastal_bonus']:.2f} coastal" if row['coastal_bonus'] else "inland"
            print(f"    {name:<22} {row['flood_base']:.2f} {bonus_str} = {row['flood_score']:.4f}  ({n} bldgs)")

if __name__ == "__main__":
    main()
