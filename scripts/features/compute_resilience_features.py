"""
RainUSE Nexus — Resilience Feature Computation

Computes resilience features from flood risk and water stress data.

PRODUCES:
  - flood_score (0-1)
  - water_stress_score (0-1)

OWNER: Person 2

TODO:
  - [ ] Integrate FEMA NRI flood risk data
  - [ ] Integrate WRI Aqueduct water stress data
  - [ ] Add drought monitor integration
  - [ ] Consider compound risk (flood + drought in same area)
"""


def compute_flood_score(
    fema_flood_risk_index: float,
    max_risk: float = 100.0,
) -> float:
    """
    Normalize FEMA flood risk to 0-1 scale.

    Higher flood risk = more value from stormwater capture/management.
    FEMA NRI uses a 0-100 risk index.

    TODO (Person 2):
      - Download FEMA NRI data
      - Match by county/census tract
    """
    if max_risk <= 0:
        return 0.0
    return min(fema_flood_risk_index / max_risk, 1.0)


def compute_water_stress_score(
    stress_index: float,
    max_stress: float = 5.0,
) -> float:
    """
    Normalize water stress index to 0-1 scale.

    Higher stress = more value from alternative water sources.
    WRI Aqueduct uses a 0-5 scale.

    TODO (Person 2):
      - Download WRI Aqueduct data
      - Match by watershed/HUC
    """
    if max_stress <= 0:
        return 0.0
    return min(stress_index / max_stress, 1.0)


if __name__ == "__main__":
    # Test with sample data
    print(f"Low flood risk (20): {compute_flood_score(20):.3f}")
    print(f"High flood risk (85): {compute_flood_score(85):.3f}")

    print(f"\nLow water stress (1.0): {compute_water_stress_score(1.0):.3f}")
    print(f"High water stress (4.5): {compute_water_stress_score(4.5):.3f}")
