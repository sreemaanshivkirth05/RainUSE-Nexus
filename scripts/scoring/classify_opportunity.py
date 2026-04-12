"""
RainUSE Nexus — Opportunity Type Classification

Classifies buildings into opportunity types based on dominant feature groups.

OPPORTUNITY TYPES:
  - Rainfall-Driven: Physical catchment features dominate
  - Cooling-Demand-Driven: Reuse-demand features (cooling) dominate
  - Resilience-Driven: Resilience features (flood + water stress) dominate
  - Balanced Opportunity: No single group dominates
"""


def compute_group_scores(building: dict) -> dict:
    """
    Compute average score for each feature group.

    Returns a dict of group_name -> average_score.
    """
    groups = {
        "physical_catchment": [
            building.get("roof_area_sqft", 0) / 400_000,  # Normalized roof area
            1.0 if building.get("roof_over_100k", False) else 0.0,
            building.get("annual_rain_inches", 0) / 65.0,  # Normalized rainfall
            building.get("annual_capture_gallons", 0) / 12_000_000,  # Normalized capture
        ],
        "reuse_demand": [
            building.get("cooling_tower_score", 0),
            building.get("cooling_degree_days_score", 0),
            building.get("building_type_score", 0),
            building.get("facility_score", 0),
        ],
        "resilience": [
            building.get("flood_score", 0),
            building.get("water_stress_score", 0),
        ],
        "economic": [
            building.get("water_cost_score", 0),
            building.get("state_policy_score", 0),
            building.get("local_incentive_score", 0),
            building.get("improvement_value_score", 0),
        ],
        "adoption": [
            building.get("esg_score", 0),
            building.get("leed_score", 0),
            building.get("energy_star_score", 0),
        ],
    }

    # Compute average for each group, clipping to [0, 1]
    group_scores = {}
    for group_name, scores in groups.items():
        avg = sum(scores) / len(scores) if scores else 0
        group_scores[group_name] = max(0.0, min(1.0, avg))

    return group_scores


def classify_opportunity(building: dict, dominance_threshold: float = 0.15) -> str:
    """
    Classify a building's opportunity type based on dominant feature group.

    A group "dominates" if its average score exceeds the next highest by
    more than the dominance_threshold.

    Args:
        building: Building record dict
        dominance_threshold: Minimum margin to declare dominance (default 0.15)

    Returns:
        One of: "Rainfall-Driven", "Cooling-Demand-Driven",
                "Resilience-Driven", "Balanced Opportunity"
    """
    group_scores = compute_group_scores(building)

    # Only consider primary driver groups (not economic or adoption)
    driver_scores = {
        "Rainfall-Driven": group_scores.get("physical_catchment", 0),
        "Cooling-Demand-Driven": group_scores.get("reuse_demand", 0),
        "Resilience-Driven": group_scores.get("resilience", 0),
    }

    # Sort by score descending
    sorted_drivers = sorted(driver_scores.items(), key=lambda x: x[1], reverse=True)

    top_type, top_score = sorted_drivers[0]
    second_type, second_score = sorted_drivers[1]

    # Check if the top group dominates
    if top_score - second_score >= dominance_threshold:
        return top_type
    else:
        return "Balanced Opportunity"


def generate_explanation(building: dict) -> str:
    """
    Generate a human-readable explanation of why a building scored the way it did.

    TODO: Make this more sophisticated with template-based generation.
    """
    parts = []

    # Physical catchment
    if building.get("roof_over_100k", False):
        parts.append(f"Large roof area ({building.get('roof_area_sqft', 0):,.0f} sqft) "
                     f"with strong capture potential")

    # Rainfall
    rain = building.get("annual_rain_inches", 0)
    if rain > 40:
        parts.append(f"high annual rainfall ({rain:.1f} inches)")
    elif rain < 15:
        parts.append(f"limited rainfall ({rain:.1f} inches) reduces capture volume")

    # Cooling
    if building.get("cooling_tower_score", 0) > 0.7:
        parts.append("significant cooling demand presents reuse opportunity")

    # Resilience
    if building.get("flood_score", 0) > 0.7:
        parts.append("high flood risk amplifies stormwater management value")

    if building.get("water_stress_score", 0) > 0.7:
        parts.append("water stress increases value of alternative supply")

    # Sustainability
    sustainability_signals = []
    if building.get("leed_score", 0) > 0.5:
        sustainability_signals.append("LEED")
    if building.get("energy_star_score", 0) > 0.5:
        sustainability_signals.append("ENERGY STAR")
    if building.get("esg_score", 0) > 0.5:
        sustainability_signals.append("ESG commitment")

    if sustainability_signals:
        parts.append(f"sustainability credentials ({', '.join(sustainability_signals)}) indicate adoption readiness")

    if not parts:
        return "Moderate candidate across all dimensions."

    return ". ".join(parts).capitalize() + "."


if __name__ == "__main__":
    # Test with sample building
    test_building = {
        "roof_area_sqft": 185000,
        "roof_over_100k": True,
        "annual_rain_inches": 49.8,
        "annual_capture_gallons": 5724510,
        "cooling_tower_score": 0.92,
        "cooling_degree_days_score": 0.85,
        "building_type_score": 0.80,
        "facility_score": 0.70,
        "water_cost_score": 0.65,
        "state_policy_score": 0.72,
        "local_incentive_score": 0.55,
        "improvement_value_score": 0.78,
        "flood_score": 0.90,
        "water_stress_score": 0.60,
        "esg_score": 0.75,
        "leed_score": 0.80,
        "energy_star_score": 0.70,
    }

    print("Group scores:", compute_group_scores(test_building))
    print("Opportunity:", classify_opportunity(test_building))
    print("Explanation:", generate_explanation(test_building))
