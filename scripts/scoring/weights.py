"""
RainUSE Nexus — Scoring Weights

Defines the weights for each feature in the viability score formula.
These weights sum to 1.0.

IMPORTANT: Changes here affect all scores. Coordinate with the team.
"""

# =============================================================================
# FEATURE WEIGHTS
# =============================================================================

# Physical Catchment Features (total: 0.30)
W_ROOF_AREA = 0.12
W_ROOF_THRESHOLD = 0.05
W_ANNUAL_PRECIP = 0.05
W_ANNUAL_CAPTURE = 0.08

# Reuse-Demand Features (total: 0.25)
W_COOLING_TOWER = 0.12
W_COOLING_DEGREE_DAYS = 0.06
W_BUILDING_TYPE = 0.04
W_FACILITY = 0.03

# Economic Features (total: 0.20)
W_WATER_COST = 0.08
W_STATE_POLICY = 0.05
W_LOCAL_INCENTIVE = 0.04
W_IMPROVEMENT_VALUE = 0.03

# Resilience Features (total: 0.15)
W_FLOOD = 0.08
W_WATER_STRESS = 0.07

# Adoption / Sustainability Features (total: 0.10)
W_ESG = 0.04
W_LEED = 0.03
W_ENERGY_STAR = 0.03

# =============================================================================
# WEIGHT GROUPS (for opportunity type classification)
# =============================================================================

WEIGHT_GROUPS = {
    "physical_catchment": {
        "weight": 0.30,
        "features": ["roof_area_score", "roof_threshold_bonus", "annual_precip_score", "annual_capture_score"],
    },
    "reuse_demand": {
        "weight": 0.25,
        "features": ["cooling_tower_score", "cooling_degree_days_score", "building_type_score", "facility_score"],
    },
    "economic": {
        "weight": 0.20,
        "features": ["water_cost_score", "state_policy_score", "local_incentive_score", "improvement_value_score"],
    },
    "resilience": {
        "weight": 0.15,
        "features": ["flood_score", "water_stress_score"],
    },
    "adoption": {
        "weight": 0.10,
        "features": ["esg_score", "leed_score", "energy_star_score"],
    },
}

# =============================================================================
# CONFIDENCE MULTIPLIERS
# =============================================================================

CONFIDENCE_THRESHOLDS = [
    (0.80, 1.00),   # High confidence → no penalty
    (0.60, 0.97),   # Medium-high → small penalty
    (0.40, 0.93),   # Medium → moderate penalty
    (0.00, 0.88),   # Low → significant penalty
]


def get_confidence_multiplier(cooling_confidence: float) -> float:
    """
    Get the confidence multiplier based on cooling tower detection confidence.
    """
    for threshold, multiplier in CONFIDENCE_THRESHOLDS:
        if cooling_confidence >= threshold:
            return multiplier
    return 0.88  # Default to lowest


# Verify weights sum to 1.0
_total = (
    W_ROOF_AREA + W_ROOF_THRESHOLD + W_ANNUAL_PRECIP + W_ANNUAL_CAPTURE +
    W_COOLING_TOWER + W_COOLING_DEGREE_DAYS + W_BUILDING_TYPE + W_FACILITY +
    W_WATER_COST + W_STATE_POLICY + W_LOCAL_INCENTIVE + W_IMPROVEMENT_VALUE +
    W_FLOOD + W_WATER_STRESS +
    W_ESG + W_LEED + W_ENERGY_STAR
)
assert abs(_total - 1.0) < 0.001, f"Weights must sum to 1.0, got {_total}"
