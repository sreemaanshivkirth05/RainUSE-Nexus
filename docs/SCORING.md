# RainUSE Nexus — Scoring Logic

## Overview

Each building receives a **viability score** (0–100) based on a weighted sum of normalized feature scores, adjusted by a confidence multiplier.

---

## Feature Groups

### 1. Physical Catchment Features
| Feature | Weight | Description |
|---------|--------|-------------|
| `roof_area_score` | 0.12 | Normalized roof area (larger = better catchment) |
| `roof_threshold_bonus` | 0.05 | Boolean bonus: roof > 100k sqft |
| `annual_precip_score` | 0.05 | Normalized annual rainfall |
| `annual_capture_score` | 0.08 | Normalized annual capture potential in gallons |

### 2. Reuse-Demand Features
| Feature | Weight | Description |
|---------|--------|-------------|
| `cooling_tower_score` | 0.12 | Likelihood of cooling tower presence |
| `cooling_degree_days_score` | 0.06 | Cooling demand based on climate |
| `building_type_score` | 0.04 | Building category suitability |
| `facility_score` | 0.03 | Industrial facility indicator |

### 3. Economic Features
| Feature | Weight | Description |
|---------|--------|-------------|
| `water_cost_score` | 0.08 | Local water cost pressure |
| `state_policy_score` | 0.05 | State-level policy readiness |
| `local_incentive_score` | 0.04 | Local rebates / incentives |
| `improvement_value_score` | 0.03 | Building improvement value |

### 4. Resilience Features
| Feature | Weight | Description |
|---------|--------|-------------|
| `flood_score` | 0.08 | Flood risk / stormwater management value |
| `water_stress_score` | 0.07 | Water scarcity / drought stress |

### 5. Adoption / Sustainability Features
| Feature | Weight | Description |
|---------|--------|-------------|
| `esg_score` | 0.04 | ESG / SBTi commitment |
| `leed_score` | 0.03 | LEED certification signal |
| `energy_star_score` | 0.03 | ENERGY STAR certification signal |

**Total weights: 1.00**

---

## Base Score Formula

```
Base Score =
  0.12 * roof_area_score +
  0.05 * roof_threshold_bonus +
  0.05 * annual_precip_score +
  0.08 * annual_capture_score +
  0.12 * cooling_tower_score +
  0.06 * cooling_degree_days_score +
  0.04 * building_type_score +
  0.03 * facility_score +
  0.08 * water_cost_score +
  0.05 * state_policy_score +
  0.04 * local_incentive_score +
  0.03 * improvement_value_score +
  0.08 * flood_score +
  0.07 * water_stress_score +
  0.04 * esg_score +
  0.03 * leed_score +
  0.03 * energy_star_score
```

Base score range: **0.0 – 1.0**

---

## Normalization Notes

- All feature scores should be normalized to **0.0 – 1.0** range before entering the formula
- Use min-max normalization within the dataset for continuous values
- Binary features (e.g., `roof_over_100k`) map to 0.0 or 1.0
- Scores from external enrichments arrive pre-normalized (0.0 – 1.0)
- See `scripts/scoring/normalize.py` for implementation

---

## Confidence Adjustment

The cooling tower confidence level adjusts the final score to penalize uncertain cooling tower detections.

| `cooling_confidence` Range | Multiplier |
|---------------------------|------------|
| >= 0.80 | 1.00 |
| 0.60 – 0.79 | 0.97 |
| 0.40 – 0.59 | 0.93 |
| < 0.40 | 0.88 |

---

## Final Score

```
Final Score = round(Base Score × Confidence Multiplier × 100)
```

Final score range: **0 – 100** (integer)

---

## Opportunity Type Classification

Based on which feature group dominates the building's profile:

| Opportunity Type | Condition |
|-----------------|-----------|
| **Rainfall-Driven** | Physical catchment features are the strongest group |
| **Cooling-Demand-Driven** | Reuse-demand features (cooling) are the strongest group |
| **Resilience-Driven** | Resilience features (flood + water stress) are the strongest group |
| **Balanced Opportunity** | No single group dominates by more than a threshold |

See `scripts/scoring/classify_opportunity.py` for the heuristic implementation.

---

## Implementation Files

| File | Purpose |
|------|---------|
| `scripts/scoring/weights.py` | Weight constants and group definitions |
| `scripts/scoring/normalize.py` | Normalization functions |
| `scripts/scoring/score_buildings.py` | Main scoring pipeline |
| `scripts/scoring/classify_opportunity.py` | Opportunity type classification |
