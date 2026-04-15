"""
Step 3 — Local Incentive Score Enrichment
Combines stormwater utility fees + rebate program existence per user spec.

Formula: local_incentive_score = normalize(stormwater_fee) * 0.6 + rebate_exists * 0.4

Writes data/raw/local_incentives_by_state.csv and merges into buildings_scored.csv.
buildings_scored.csv uses full state names; maps from state codes.
"""
import pandas as pd
from pathlib import Path

ROOT     = Path(__file__).resolve().parents[2]
RAW_DIR  = ROOT / "data/raw"
PROC_DIR = ROOT / "data/processed"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Stormwater fees per 1000 gallons (user spec)
# ---------------------------------------------------------------------------
STORMWATER_FEES = {
    'CA': 0.032, 'NY': 0.038, 'WA': 0.028,
    'MA': 0.035, 'NJ': 0.041, 'MD': 0.029,
    'PA': 0.025, 'CO': 0.022, 'OR': 0.024,
    'IL': 0.021, 'VA': 0.019, 'MN': 0.018,
    'NC': 0.016, 'GA': 0.015, 'FL': 0.017,
    'TX': 0.015, 'AZ': 0.020, 'MI': 0.017,
    'OH': 0.014, 'IN': 0.012, 'TN': 0.013,
    'MO': 0.012,
    # States in dataset not covered by user spec — conservative estimates
    'KY': 0.013,  # Louisville MSD; limited statewide
    'NM': 0.014,  # Albuquerque; limited other cities
    'OK': 0.012,  # OKC pilot; limited programs
    'WV': 0.010,  # Charleston; most areas no fee
    'LA': 0.014,  # New Orleans pilot; rural parishes none
    'AL': 0.010,  # Birmingham; most counties no fee
    'SC': 0.014,  # Charleston, Columbia limited
    'MS': 0.008,  # Jackson; very limited
    'AR': 0.010,  # Little Rock; most areas no fee
    'KS': 0.013,  # Wichita limited
    'DE': 0.018,  # Wilmington, Newark programs
}

# ---------------------------------------------------------------------------
# Rebate program existence (user spec + fallbacks)
# ---------------------------------------------------------------------------
REBATE_PROGRAMS = {
    'TX': True,   # TWDB rebates
    'CA': True,   # Metropolitan Water District rebates
    'AZ': True,   # Tucson Water rebates
    'CO': True,   # Denver Water rebates
    'WA': True,   # Seattle Public Utilities
    'OR': True,   # Portland BES rebates
    'MA': True,   # Mass Save program
    'MD': True,   # MD stormwater credits
    # All others default False
}

# Normalization bounds (min and max of all fee values)
FEE_MIN = min(STORMWATER_FEES.values())
FEE_MAX = max(STORMWATER_FEES.values())

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

def compute_score(code):
    fee    = STORMWATER_FEES.get(code, 0.0)
    rebate = 1.0 if REBATE_PROGRAMS.get(code, False) else 0.0
    fee_norm = (fee - FEE_MIN) / (FEE_MAX - FEE_MIN) if FEE_MAX > FEE_MIN else 0.0
    return round(fee_norm * 0.6 + rebate * 0.4, 4)

def main():
    rows = []
    for code in sorted(STORMWATER_FEES):
        fee    = STORMWATER_FEES[code]
        rebate = REBATE_PROGRAMS.get(code, False)
        score  = compute_score(code)
        rows.append({
            'state_code':              code,
            'state':                   CODE_TO_NAME.get(code, code),
            'stormwater_fee_per_1000': fee,
            'rebate_program_exists':   rebate,
            'local_incentive_score':   score,
        })

    df_raw = pd.DataFrame(rows)
    out_csv = RAW_DIR / "local_incentives_by_state.csv"
    df_raw.to_csv(out_csv, index=False)
    print(f"Saved {len(df_raw)} local incentive scores -> {out_csv}")

    # Build name-keyed map
    score_by_name = {r['state']: r['local_incentive_score'] for _, r in df_raw.iterrows()}

    # Merge into buildings_scored.csv
    scored_path = PROC_DIR / "buildings_scored.csv"
    df = pd.read_csv(scored_path)

    before_mean    = df["local_incentive_score"].mean()
    before_nonzero = (df["local_incentive_score"] > 0).sum()

    df["local_incentive_score"] = df["state"].map(score_by_name)

    after_mean    = df["local_incentive_score"].mean()
    after_nonzero = (df["local_incentive_score"].fillna(0) > 0).sum()

    df.to_csv(scored_path, index=False)

    print(f"local_incentive_score: {before_nonzero} -> {after_nonzero} non-zero buildings")
    print(f"  Mean score: {before_mean:.4f} -> {after_mean:.4f}")
    print("  Per-state (fee | rebate | score):")
    for _, row in df_raw.sort_values('local_incentive_score', ascending=False).iterrows():
        name = row['state']
        n = (df['state'] == name).sum()
        if n > 0:
            rebate_flag = "rebate=Y" if row['rebate_program_exists'] else "rebate=N"
            print(f"    {name:<22} fee={row['stormwater_fee_per_1000']:.3f}  "
                  f"{rebate_flag}  score={row['local_incentive_score']:.4f}  ({n} bldgs)")

if __name__ == "__main__":
    main()
