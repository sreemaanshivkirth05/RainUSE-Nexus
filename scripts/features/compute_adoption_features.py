"""
RainUSE Nexus — Adoption / Sustainability Feature Computation

Computes sustainability and adoption readiness features.

PRODUCES:
  - esg_score (0-1)
  - leed_score (0-1)
  - energy_star_score (0-1)

OWNER: Person 2

TODO:
  - [ ] Integrate SBTi company list matching
  - [ ] Integrate LEED certification levels
  - [ ] Integrate ENERGY STAR scores
  - [ ] Consider adding CDP, GRESB, or other ESG frameworks
"""


# LEED certification level mapping
LEED_LEVEL_SCORES = {
    "platinum": 1.0,
    "gold": 0.80,
    "silver": 0.60,
    "certified": 0.40,
    "none": 0.0,
}

# SBTi commitment level mapping
SBTI_LEVEL_SCORES = {
    "targets_validated": 1.0,
    "targets_set": 0.75,
    "committed": 0.50,
    "none": 0.0,
}


def compute_esg_score(
    sbti_level: str = "none",
    has_sustainability_report: bool = False,
    has_water_target: bool = False,
) -> float:
    """
    Compute ESG score based on sustainability commitments.

    Combines:
    - SBTi commitment level (primary signal)
    - Published sustainability report (bonus)
    - Explicit water reduction target (bonus)

    TODO (Person 2):
      - Match building owner to SBTi participant list
      - Check for published sustainability reports
      - Look for water-specific targets
    """
    base = SBTI_LEVEL_SCORES.get(sbti_level.lower(), 0.0)
    bonus = 0.0
    if has_sustainability_report:
        bonus += 0.10
    if has_water_target:
        bonus += 0.15
    return min(1.0, base + bonus)


def compute_leed_score(leed_level: str = "none") -> float:
    """
    Compute LEED score based on certification level.

    TODO (Person 2):
      - Match building to USGBC LEED project directory
      - Map certification level to score
    """
    return LEED_LEVEL_SCORES.get(leed_level.lower(), 0.0)


def compute_energy_star_score(
    energy_star_rating: float = 0,
) -> float:
    """
    Normalize ENERGY STAR score to 0-1 scale.

    ENERGY STAR scores buildings 1-100.
    Buildings scoring 75+ are eligible for certification.

    TODO (Person 2):
      - Match building to ENERGY STAR Portfolio Manager data
      - Use actual score if available
    """
    if energy_star_rating <= 0:
        return 0.0
    return min(energy_star_rating / 100.0, 1.0)


if __name__ == "__main__":
    # Test with sample data
    print(f"ESG (validated + report + water target): {compute_esg_score('targets_validated', True, True):.3f}")
    print(f"ESG (committed only): {compute_esg_score('committed'):.3f}")
    print(f"ESG (none): {compute_esg_score('none'):.3f}")

    print(f"\nLEED Platinum: {compute_leed_score('platinum'):.3f}")
    print(f"LEED Gold: {compute_leed_score('gold'):.3f}")
    print(f"LEED None: {compute_leed_score('none'):.3f}")

    print(f"\nENERGY STAR 92: {compute_energy_star_score(92):.3f}")
    print(f"ENERGY STAR 75: {compute_energy_star_score(75):.3f}")
    print(f"ENERGY STAR 0:  {compute_energy_star_score(0):.3f}")
