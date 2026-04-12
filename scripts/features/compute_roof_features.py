"""
RainUSE Nexus — Roof Feature Computation

Computes physical catchment features from building footprint data.

PRODUCES:
  - roof_area_sqft (raw value, normalized in scoring)
  - roof_over_100k (boolean threshold)
  - annual_capture_gallons (derived from roof area + rainfall)

FORMULA (DOE/FEMP methodology):
  annual_capture_gallons = roof_area_sqft * annual_rain_inches * 0.623 * collection_efficiency

  Where:
  - 0.623 is the conversion factor (1 sqft * 1 inch of rain = 0.623 gallons)
  - collection_efficiency is typically 0.80-0.90 for commercial roofs
"""

# Collection efficiency for commercial flat roofs
COLLECTION_EFFICIENCY = 0.85

# Threshold for "large roof" bonus
LARGE_ROOF_THRESHOLD_SQFT = 100_000


def compute_roof_area_score(roof_area_sqft: float, max_roof_area: float = 400_000) -> float:
    """
    Normalize roof area to 0-1 scale.

    Uses min-max normalization with a reasonable max cap.
    Larger roofs = more capture area = higher score.
    """
    if max_roof_area <= 0:
        return 0.0
    return min(roof_area_sqft / max_roof_area, 1.0)


def compute_roof_threshold_bonus(roof_area_sqft: float) -> float:
    """
    Binary bonus for roofs exceeding the large roof threshold.

    Returns 1.0 if roof >= 100,000 sqft, else 0.0.
    """
    return 1.0 if roof_area_sqft >= LARGE_ROOF_THRESHOLD_SQFT else 0.0


def compute_annual_capture_gallons(
    roof_area_sqft: float,
    annual_rain_inches: float,
    efficiency: float = COLLECTION_EFFICIENCY,
) -> float:
    """
    Compute annual rainwater capture potential in gallons.

    Uses the DOE/FEMP methodology:
      gallons = roof_area_sqft × annual_rain_inches × 0.623 × efficiency

    Args:
        roof_area_sqft: Roof area in square feet
        annual_rain_inches: Annual rainfall in inches
        efficiency: Collection efficiency (default 0.85)

    Returns:
        Annual capture potential in gallons
    """
    return roof_area_sqft * annual_rain_inches * 0.623 * efficiency


def compute_annual_capture_score(
    annual_capture_gallons: float,
    max_capture: float = 12_000_000,
) -> float:
    """
    Normalize annual capture gallons to 0-1 scale.

    Uses a reasonable max cap for commercial buildings.
    """
    if max_capture <= 0:
        return 0.0
    return min(annual_capture_gallons / max_capture, 1.0)


def enrich_building_with_roof_features(building: dict) -> dict:
    """
    Compute and add all roof features to a building record.
    """
    roof_area = building.get("roof_area_sqft", 0)
    rain = building.get("annual_rain_inches", 0)

    building["roof_over_100k"] = roof_area >= LARGE_ROOF_THRESHOLD_SQFT
    building["annual_capture_gallons"] = compute_annual_capture_gallons(roof_area, rain)

    return building


if __name__ == "__main__":
    # Test with sample data
    test_building = {
        "roof_area_sqft": 185000,
        "annual_rain_inches": 49.8,
    }
    result = enrich_building_with_roof_features(test_building)
    print(f"Roof area: {result['roof_area_sqft']:,.0f} sqft")
    print(f"Over 100k: {result['roof_over_100k']}")
    print(f"Annual capture: {result['annual_capture_gallons']:,.0f} gallons")
    print(f"Roof area score: {compute_roof_area_score(result['roof_area_sqft']):.3f}")
    print(f"Capture score: {compute_annual_capture_score(result['annual_capture_gallons']):.3f}")
