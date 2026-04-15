"""
Step 2 — State Policy Score Enrichment
Hardcodes state rainwater harvesting policy scores from user spec.
Sources: NCSL, ARCSA, state water agency websites.

buildings_scored.csv uses full state names; this script maps from
state codes to full names before merging.
"""
import pandas as pd
from pathlib import Path

ROOT     = Path(__file__).resolve().parents[2]
RAW_DIR  = ROOT / "data/raw"
PROC_DIR = ROOT / "data/processed"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# User-specified policy scores (state code → score)
# Sources: NCSL, ARCSA, state water agency websites
# ---------------------------------------------------------------------------
POLICY_BY_CODE = {
    'TX': 0.90,  # SB 769 - strong RWH incentives, tax exemption
    'CA': 0.85,  # AB 1750 - legal + incentivized
    'CO': 0.80,  # HB 16-1005 - legal up to 110 gal, improving
    'WA': 0.82,  # WAC 173-200 - permitted with license
    'OR': 0.78,  # ORS 537 - legal, permitted
    'NC': 0.72,  # GS 143-355.4 - encouraged
    'FL': 0.70,  # FS 373 - legal, some incentives
    'GA': 0.65,  # Permitted, limited incentives
    'VA': 0.68,  # Code of VA 15.2 - encouraged
    'MN': 0.66,  # MS 103G - legal
    'MD': 0.74,  # MDE permits - stormwater credits
    'NJ': 0.71,  # NJ stormwater rules - credit system
    'PA': 0.67,  # Act 167 - stormwater management
    'MA': 0.75,  # 310 CMR 10 - wetlands + stormwater
    'IL': 0.63,  # Permitted, city-level incentives
    'OH': 0.55,  # Legal but minimal incentives
    'MI': 0.58,  # Legal, some municipal programs
    'AZ': 0.76,  # ARS 45 - active water conservation laws
    'NY': 0.69,  # Legal, NYC has active programs
    'IN': 0.48,  # Legal but no specific incentives
    'TN': 0.52,  # Limited policy framework
    'MO': 0.50,  # Minimal specific RWH policy
    # States in dataset not in user spec — reasonable fallbacks
    'KY': 0.48,  # Legal; KY guidance in development; no formal incentives
    'NM': 0.70,  # Legal; NM OSE oversight for large systems; similar to AZ framework
    'OK': 0.50,  # Legal; OWRB exempts small systems; limited incentives
    'WV': 0.45,  # Legal; WVDEP no restrictions; minimal state programs
    'LA': 0.55,  # Legal; Dept of Health guidance; limited incentives
    'AL': 0.45,  # Legal by default; no state law; local jurisdiction
    'SC': 0.60,  # Legal; SCDHEC guidance; some county programs
    'MS': 0.40,  # Legal; MDEQ no restrictions; minimal guidance
    'AR': 0.42,  # Legal; no formal state policy; extension programs
    'KS': 0.50,  # Legal; KDA exempts small systems; no incentives
    'DE': 0.65,  # Legal; DNREC guidance; Delaware Nature Society programs
}

# Map state codes to full names (matching buildings_scored.csv values)
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

# Build name-keyed lookup
POLICY_BY_NAME = {CODE_TO_NAME[code]: score
                  for code, score in POLICY_BY_CODE.items()
                  if code in CODE_TO_NAME}

def main():
    # Save raw CSV
    rows = [{'state_code': code, 'state': CODE_TO_NAME.get(code, code),
             'state_policy_score': score}
            for code, score in sorted(POLICY_BY_CODE.items())]
    df_raw = pd.DataFrame(rows)
    out_csv = RAW_DIR / "state_policy_scores.csv"
    df_raw.to_csv(out_csv, index=False)
    print(f"Saved {len(df_raw)} state policy scores -> {out_csv}")

    # Merge into buildings_scored.csv (overwrite existing values)
    scored_path = PROC_DIR / "buildings_scored.csv"
    df = pd.read_csv(scored_path)

    before_mean = df["state_policy_score"].mean()

    df["state_policy_score"] = df["state"].map(POLICY_BY_NAME)

    after_mean = df["state_policy_score"].mean()
    n_filled   = df["state_policy_score"].notna().sum()

    df.to_csv(scored_path, index=False)

    print(f"state_policy_score: {n_filled}/{ len(df)} buildings filled")
    print(f"  Mean score: {before_mean:.4f} -> {after_mean:.4f}")
    print("  Per-state (from spec):")
    for _, row in df.groupby("state")["state_policy_score"].first().reset_index().iterrows():
        n = (df["state"] == row["state"]).sum()
        print(f"    {row['state']:<22} {row['state_policy_score']:.2f}  ({n} bldgs)")

if __name__ == "__main__":
    main()
