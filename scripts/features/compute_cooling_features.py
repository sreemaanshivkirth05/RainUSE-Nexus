"""
RainUSE Nexus — Cooling Feature Computation

Computes cooling-related features from visual inspection and climate data.

PRODUCES:
  - cooling_tower_score (0-1, likelihood of cooling tower presence)
  - cooling_confidence (0-1, confidence in the detection)
  - visual_notes (text description of rooftop observations)

OWNER: Person 2

TODO:
  - [ ] Implement actual cooling tower detection from satellite imagery
  - [ ] Integrate OSM tag validation
  - [ ] Refine scoring based on building type and climate zone
"""


def compute_cooling_tower_score(
    visual_detection_score: float = 0.0,
    osm_tag_present: bool = False,
    building_type_cooling_likelihood: float = 0.0,
) -> float:
    """
    Compute composite cooling tower score from multiple signals.

    Combines:
    - Visual detection from satellite imagery (primary signal)
    - OSM tag presence (validation signal)
    - Building type likelihood (prior probability)

    TODO (Person 2):
      - Implement actual image-based detection
      - Weight signals based on reliability
    """
    # Weighted combination of signals
    # Visual detection is the primary signal
    score = (
        0.60 * visual_detection_score +
        0.20 * (1.0 if osm_tag_present else 0.0) +
        0.20 * building_type_cooling_likelihood
    )
    return max(0.0, min(1.0, score))


def compute_cooling_confidence(
    has_visual_inspection: bool = False,
    has_osm_tag: bool = False,
    visual_clarity: float = 0.0,
) -> float:
    """
    Compute confidence level for cooling tower detection.

    Higher confidence when multiple sources agree.

    TODO (Person 2):
      - Factor in image quality / resolution
      - Factor in number of confirming sources
    """
    confidence = 0.0

    if has_visual_inspection:
        confidence += 0.50 * visual_clarity  # Up to 0.50 from visual
    if has_osm_tag:
        confidence += 0.30  # 0.30 from OSM
    if has_visual_inspection and has_osm_tag:
        confidence += 0.20  # 0.20 agreement bonus

    return max(0.0, min(1.0, confidence))


def get_building_type_cooling_likelihood(building_type: str) -> float:
    """
    Estimate cooling tower likelihood based on building type.

    TODO (Person 2):
      - Expand building type categories
      - Use actual data to calibrate probabilities
    """
    type_map = {
        "hospital": 0.90,
        "medical": 0.85,
        "data_center": 0.95,
        "office_large": 0.70,
        "office_small": 0.30,
        "industrial": 0.60,
        "manufacturing": 0.75,
        "warehouse": 0.15,
        "retail": 0.25,
        "convention": 0.65,
        "hotel": 0.60,
        "university": 0.70,
    }
    return type_map.get(building_type.lower(), 0.40)


if __name__ == "__main__":
    # Test with sample scenarios
    print("Hospital with visual detection + OSM:")
    print(f"  Score: {compute_cooling_tower_score(0.85, True, 0.90):.3f}")
    print(f"  Confidence: {compute_cooling_confidence(True, True, 0.90):.3f}")

    print("\nWarehouse with no detection:")
    print(f"  Score: {compute_cooling_tower_score(0.10, False, 0.15):.3f}")
    print(f"  Confidence: {compute_cooling_confidence(True, False, 0.50):.3f}")
