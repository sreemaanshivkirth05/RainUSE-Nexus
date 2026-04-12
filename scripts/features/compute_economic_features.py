"""
RainUSE Nexus — Economic Feature Computation

Computes economic features from water cost, policy, and incentive data.

PRODUCES:
  - water_cost_score (0-1)
  - state_policy_score (0-1)
  - local_incentive_score (0-1)
  - improvement_value_score (0-1)

OWNER: Person 2

TODO:
  - [ ] Integrate real water cost data
  - [ ] Refine policy scoring based on detailed policy analysis
  - [ ] Add more granular local incentive data
  - [ ] Implement improvement value from TWDB or assessor data
"""


def compute_water_cost_score(
    water_rate_per_1000gal: float,
    min_rate: float = 2.0,
    max_rate: float = 15.0,
) -> float:
    """
    Normalize water cost to 0-1 scale.

    Higher water cost = more economic incentive for rainwater reuse.
    US commercial water rates typically range $2-$15 per 1000 gallons.

    TODO (Person 2):
      - Get actual utility rate data per city
      - Consider tiered rate structures
    """
    if max_rate <= min_rate:
        return 0.0
    score = (water_rate_per_1000gal - min_rate) / (max_rate - min_rate)
    return max(0.0, min(1.0, score))


def compute_improvement_value_score(
    improvement_value: float,
    max_value: float = 50_000_000,
) -> float:
    """
    Normalize building improvement value to 0-1 scale.

    Higher value buildings indicate more investment capacity and
    potentially more sophistication in water management.

    TODO (Person 2):
      - Source from TWDB for Texas
      - Source from county assessor data for other states
    """
    if max_value <= 0:
        return 0.0
    return min(improvement_value / max_value, 1.0)


if __name__ == "__main__":
    # Test with sample data
    print(f"Water cost $5/kgal: {compute_water_cost_score(5.0):.3f}")
    print(f"Water cost $10/kgal: {compute_water_cost_score(10.0):.3f}")
    print(f"Water cost $15/kgal: {compute_water_cost_score(15.0):.3f}")

    print(f"\nImprovement $5M: {compute_improvement_value_score(5_000_000):.3f}")
    print(f"Improvement $25M: {compute_improvement_value_score(25_000_000):.3f}")
