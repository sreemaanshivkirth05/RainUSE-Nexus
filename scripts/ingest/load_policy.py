"""
RainUSE Nexus — Policy & Incentive Data Ingestion

Loads state-level policy and local incentive data.

DATA SOURCES:
  - State rainwater policy research (manually curated)
  - Local incentive sources (rebates, stormwater fee discounts, grants)

PRODUCES:
  - state_policy_score
  - local_incentive_score

TODO:
  - [ ] Research state rainwater harvesting policies per target state
  - [ ] Score each state 0-1 based on policy supportiveness
  - [ ] Research local incentive programs (city/county level)
  - [ ] Score each locality 0-1 based on incentive availability
"""

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"


def load_state_policies() -> dict:
    """
    Load state-level rainwater policy scores.

    Expected file: data/raw/state_policies.json
    Format: { "state_name": { "score": 0.0-1.0, "notes": "..." } }

    TODO:
      - Research each state's rainwater harvesting regulations
      - States with tax exemptions, mandates, or strong support = higher score
      - States with restrictions or no policy = lower score
    """
    filepath = RAW_DATA_DIR / "state_policies.json"

    if not filepath.exists():
        print(f"[WARN] State policies file not found: {filepath}")
        # Fallback scores based on known policy landscape
        return {
            "Texas": {"score": 0.72, "notes": "Tax exemption for RWH equipment. State encourages collection."},
            "Georgia": {"score": 0.45, "notes": "No specific incentives. Allowed but not promoted."},
            "Arizona": {"score": 0.35, "notes": "Complex water rights. Some allowance for residential."},
            "Florida": {"score": 0.55, "notes": "Tax exemption available. Growing interest."},
            "North Carolina": {"score": 0.50, "notes": "Allowed. Some local programs exist."},
            "Louisiana": {"score": 0.30, "notes": "Minimal policy framework for RWH."},
            "Colorado": {"score": 0.80, "notes": "Recent legalization with strong support programs."},
        }

    with open(filepath, "r") as f:
        return json.load(f)


def load_local_incentives() -> dict:
    """
    Load local incentive data by city/county.

    Expected file: data/raw/local_incentives.json
    Format: { "city, state": { "score": 0.0-1.0, "programs": [...] } }

    TODO:
      - Research rebate programs by city
      - Check stormwater fee credit programs
      - Check grant availability
      - Score based on financial incentive magnitude
    """
    filepath = RAW_DATA_DIR / "local_incentives.json"

    if not filepath.exists():
        print(f"[WARN] Local incentives file not found: {filepath}")
        # Fallback scores for sample cities
        return {
            "Houston, Texas": {"score": 0.55, "programs": ["Stormwater fee credit"]},
            "San Antonio, Texas": {"score": 0.60, "programs": ["SAWS rebate", "Stormwater credit"]},
            "Austin, Texas": {"score": 0.68, "programs": ["Rebate program", "Green infrastructure incentive"]},
            "Atlanta, Georgia": {"score": 0.40, "programs": ["Limited stormwater credit"]},
            "Chandler, Arizona": {"score": 0.25, "programs": ["Minimal"]},
            "Miami Beach, Florida": {"score": 0.65, "programs": ["Resilience grant program"]},
            "Raleigh, North Carolina": {"score": 0.35, "programs": ["Some stormwater credits"]},
            "Lakewood, Colorado": {"score": 0.75, "programs": ["State-backed incentive", "Local rebate"]},
            "Baton Rouge, Louisiana": {"score": 0.20, "programs": ["Minimal"]},
        }

    with open(filepath, "r") as f:
        return json.load(f)


def get_policy_score(state: str) -> float:
    """Get policy score for a state. Returns 0.0 if not found."""
    policies = load_state_policies()
    entry = policies.get(state, {})
    if isinstance(entry, dict):
        return entry.get("score", 0.0)
    return float(entry)


def get_incentive_score(city: str, state: str) -> float:
    """Get local incentive score for a city. Returns 0.0 if not found."""
    incentives = load_local_incentives()
    key = f"{city}, {state}"
    entry = incentives.get(key, {})
    if isinstance(entry, dict):
        return entry.get("score", 0.0)
    return float(entry)


def main():
    """Test policy and incentive data loading."""
    print("Loading state policies...")
    policies = load_state_policies()
    for state, data in policies.items():
        print(f"  {state}: {data}")

    print("\nLoading local incentives...")
    incentives = load_local_incentives()
    for city, data in incentives.items():
        print(f"  {city}: {data}")


if __name__ == "__main__":
    main()
