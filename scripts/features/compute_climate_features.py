"""
RainUSE Nexus — Climate Feature Computation

Computes climate-related features from weather/climate data.

PRODUCES:
  - annual_precip_score (normalized rainfall)
  - cooling_degree_days_score (normalized CDD)

TODO:
  - [ ] Refine normalization ranges based on actual data distribution
  - [ ] Add county-level granularity (currently state-level)
"""


def compute_annual_precip_score(
    annual_rain_inches: float,
    max_rain: float = 65.0,
    min_rain: float = 5.0,
) -> float:
    """
    Normalize annual rainfall to 0-1 scale.

    Higher rainfall = higher score = more capture potential.
    US range is roughly 5-65 inches annually.
    """
    if max_rain <= min_rain:
        return 0.0
    score = (annual_rain_inches - min_rain) / (max_rain - min_rain)
    return max(0.0, min(1.0, score))


def compute_cooling_degree_days_score(
    annual_cdd: float,
    max_cdd: float = 4500.0,
    min_cdd: float = 200.0,
) -> float:
    """
    Normalize cooling degree days to 0-1 scale.

    Higher CDD = more cooling demand = more water reuse potential.
    US range is roughly 200-4500 CDD annually.
    """
    if max_cdd <= min_cdd:
        return 0.0
    score = (annual_cdd - min_cdd) / (max_cdd - min_cdd)
    return max(0.0, min(1.0, score))


if __name__ == "__main__":
    # Test with sample data
    print(f"Houston (49.8 in): {compute_annual_precip_score(49.8):.3f}")
    print(f"Phoenix (8.2 in):  {compute_annual_precip_score(8.2):.3f}")
    print(f"Miami (61.9 in):   {compute_annual_precip_score(61.9):.3f}")

    print(f"\nTexas CDD (2800):   {compute_cooling_degree_days_score(2800):.3f}")
    print(f"Arizona CDD (4000): {compute_cooling_degree_days_score(4000):.3f}")
    print(f"Colorado CDD (700): {compute_cooling_degree_days_score(700):.3f}")
