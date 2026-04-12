"""
RainUSE Nexus — Score Normalization

Functions for normalizing raw feature values to 0-1 scale.
All features must be normalized before entering the scoring formula.
"""


def min_max_normalize(value: float, min_val: float, max_val: float) -> float:
    """
    Min-max normalize a value to 0-1 scale.

    Args:
        value: Raw value to normalize
        min_val: Minimum expected value
        max_val: Maximum expected value

    Returns:
        Normalized value clipped to [0.0, 1.0]
    """
    if max_val <= min_val:
        return 0.0
    normalized = (value - min_val) / (max_val - min_val)
    return max(0.0, min(1.0, normalized))


def boolean_to_score(value: bool) -> float:
    """Convert a boolean to 0.0 or 1.0 score."""
    return 1.0 if value else 0.0


def clip_score(value: float) -> float:
    """Clip a score to [0.0, 1.0] range."""
    return max(0.0, min(1.0, value))


# =============================================================================
# FEATURE-SPECIFIC NORMALIZATION RANGES
# =============================================================================
# These define the min/max ranges for normalizing raw values.
# Adjust based on actual data distribution.

NORMALIZATION_RANGES = {
    "roof_area_sqft": {"min": 0, "max": 400_000},
    "annual_rain_inches": {"min": 5.0, "max": 65.0},
    "annual_capture_gallons": {"min": 0, "max": 12_000_000},
    "cooling_degree_days": {"min": 200, "max": 4500},
    "water_rate_per_1000gal": {"min": 2.0, "max": 15.0},
    "improvement_value": {"min": 0, "max": 50_000_000},
    "fema_flood_risk": {"min": 0, "max": 100},
    "water_stress_index": {"min": 0, "max": 5.0},
    "energy_star_rating": {"min": 0, "max": 100},
}


def normalize_feature(feature_name: str, raw_value: float) -> float:
    """
    Normalize a raw feature value using predefined ranges.

    Args:
        feature_name: Name of the feature (must exist in NORMALIZATION_RANGES)
        raw_value: Raw value to normalize

    Returns:
        Normalized value in [0.0, 1.0]
    """
    if feature_name not in NORMALIZATION_RANGES:
        # If no range defined, assume already normalized
        return clip_score(raw_value)

    ranges = NORMALIZATION_RANGES[feature_name]
    return min_max_normalize(raw_value, ranges["min"], ranges["max"])


if __name__ == "__main__":
    # Test normalization
    print(f"Roof 185000 sqft: {normalize_feature('roof_area_sqft', 185000):.3f}")
    print(f"Rain 49.8 inches: {normalize_feature('annual_rain_inches', 49.8):.3f}")
    print(f"Capture 5.7M gal: {normalize_feature('annual_capture_gallons', 5_700_000):.3f}")
    print(f"Boolean True: {boolean_to_score(True):.1f}")
    print(f"Boolean False: {boolean_to_score(False):.1f}")
