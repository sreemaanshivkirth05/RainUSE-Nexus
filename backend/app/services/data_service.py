from sqlalchemy import text
from app.db.connection import engine

ALLOWED_SORT_FIELDS = [
    "final_viability_score",
    "roof_area_sqft",
    "annual_rain_inches",
    "annual_capture_gallons",
    "cooling_confidence",
    "water_cost_score",
    "flood_score",
    "water_stress_score",
    "esg_score",
    "leed_score",
    "energy_star_score",
    "state",
    "city"
]

def get_buildings(
    state=None, city=None,
    min_score=None, max_score=None,
    opportunity_type=None,
    roof_area_min=None, roof_area_max=None,
    rainfall_min=None, rainfall_max=None,
    capture_min=None, capture_max=None,
    cooling_confidence_min=None,
    water_cost_min=None,
    flood_score_min=None,
    water_stress_min=None,
    esg_min=None,
    leed_min=None,
    energy_star_min=None,
    sort_by="final_viability_score",
    sort_order="desc",
    page=1,
    page_size=20
):
    if sort_by not in ALLOWED_SORT_FIELDS:
        sort_by = "final_viability_score"
    if sort_order not in ["asc", "desc"]:
        sort_order = "desc"

    conditions = []
    params = {}

    if state:
        conditions.append("state = :state")
        params["state"] = state
    if city:
        conditions.append("city = :city")
        params["city"] = city
    if opportunity_type:
        conditions.append("opportunity_type = :opportunity_type")
        params["opportunity_type"] = opportunity_type

    if min_score is not None:
        conditions.append("final_viability_score >= :min_score")
        params["min_score"] = min_score
    if max_score is not None:
        conditions.append("final_viability_score <= :max_score")
        params["max_score"] = max_score

    if roof_area_min is not None:
        conditions.append("roof_area_sqft >= :roof_area_min")
        params["roof_area_min"] = roof_area_min
    if roof_area_max is not None:
        conditions.append("roof_area_sqft <= :roof_area_max")
        params["roof_area_max"] = roof_area_max

    if rainfall_min is not None:
        conditions.append("annual_rain_inches >= :rainfall_min")
        params["rainfall_min"] = rainfall_min
    if rainfall_max is not None:
        conditions.append("annual_rain_inches <= :rainfall_max")
        params["rainfall_max"] = rainfall_max

    if capture_min is not None:
        conditions.append("annual_capture_gallons >= :capture_min")
        params["capture_min"] = capture_min
    if capture_max is not None:
        conditions.append("annual_capture_gallons <= :capture_max")
        params["capture_max"] = capture_max

    if cooling_confidence_min is not None:
        conditions.append("cooling_confidence >= :cooling_confidence_min")
        params["cooling_confidence_min"] = cooling_confidence_min
    if water_cost_min is not None:
        conditions.append("water_cost_score >= :water_cost_min")
        params["water_cost_min"] = water_cost_min
    if flood_score_min is not None:
        conditions.append("flood_score >= :flood_score_min")
        params["flood_score_min"] = flood_score_min
    if water_stress_min is not None:
        conditions.append("water_stress_score >= :water_stress_min")
        params["water_stress_min"] = water_stress_min
    if esg_min is not None:
        conditions.append("esg_score >= :esg_min")
        params["esg_min"] = esg_min
    if leed_min is not None:
        conditions.append("leed_score >= :leed_min")
        params["leed_min"] = leed_min
    if energy_star_min is not None:
        conditions.append("energy_star_score >= :energy_star_min")
        params["energy_star_min"] = energy_star_min

    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    count_sql = text(f"SELECT COUNT(*) FROM buildings WHERE {where_clause}")
    
    # Safe to inject sort_by and sort_order because they have been strictly validated
    order_clause = f"ORDER BY {sort_by} {sort_order.upper()}"
    offset = (page - 1) * page_size
    params["limit"] = page_size
    params["offset"] = offset

    select_sql = text(f"SELECT * FROM buildings WHERE {where_clause} {order_clause} LIMIT :limit OFFSET :offset")

    with engine.connect() as conn:
        count = conn.execute(count_sql, params).scalar()
        rows = conn.execute(select_sql, params).mappings().all()

    return {
        "count": count or 0,
        "page": page,
        "page_size": page_size,
        "buildings": [dict(r) for r in rows]
    }

def get_building_by_id(building_id):
    sql = text("SELECT * FROM buildings WHERE id = :id")
    with engine.connect() as conn:
        row = conn.execute(sql, {"id": building_id}).mappings().first()
        return dict(row) if row else None

def get_filter_metadata():
    with engine.connect() as conn:
        states = conn.execute(text("SELECT DISTINCT state FROM buildings WHERE state IS NOT NULL ORDER BY state")).scalars().all()
        
        cities_rows = conn.execute(text("SELECT DISTINCT state, city FROM buildings WHERE state IS NOT NULL AND city IS NOT NULL")).mappings().all()
        cities_by_state = {}
        for r in cities_rows:
            cities_by_state.setdefault(r["state"], []).append(r["city"])
        for state in cities_by_state:
            cities_by_state[state].sort()

        opportunity_types = conn.execute(text("SELECT DISTINCT opportunity_type FROM buildings WHERE opportunity_type IS NOT NULL AND opportunity_type != '' ORDER BY opportunity_type")).scalars().all()

        ranges = conn.execute(text("""
            SELECT 
                MIN(final_viability_score) as min_score, MAX(final_viability_score) as max_score,
                MIN(roof_area_sqft) as min_roof, MAX(roof_area_sqft) as max_roof,
                MIN(annual_rain_inches) as min_rain, MAX(annual_rain_inches) as max_rain,
                MIN(annual_capture_gallons) as min_cap, MAX(annual_capture_gallons) as max_cap
            FROM buildings
        """)).mappings().first()

    return {
        "states": list(states),
        "cities_by_state": cities_by_state,
        "opportunity_types": list(opportunity_types),
        "score_range": {"min": ranges["min_score"] or 0, "max": ranges["max_score"] or 100},
        "roof_area_range": {"min": ranges["min_roof"] or 0, "max": ranges["max_roof"] or 0},
        "rainfall_range": {"min": ranges["min_rain"] or 0, "max": ranges["max_rain"] or 0},
        "capture_range": {"min": ranges["min_cap"] or 0, "max": ranges["max_cap"] or 0}
    }

def get_state_summaries():
    sql = text("""
        SELECT 
            state,
            COUNT(*) as total_buildings,
            AVG(final_viability_score) as avg_score,
            SUM(annual_capture_gallons) as total_capture,
            MAX(final_viability_score) as max_score
        FROM buildings
        WHERE state IS NOT NULL
        GROUP BY state
        ORDER BY avg_score DESC
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()
        return [dict(r) for r in rows]

def get_summary():
    with engine.connect() as conn:
        totals = conn.execute(text("""
            SELECT 
                COUNT(DISTINCT state) as total_states,
                COUNT(*) as total_buildings,
                SUM(CASE WHEN roof_over_100k THEN 1 ELSE 0 END) as buildings_over_100k,
                AVG(final_viability_score) as average_viability_score,
                SUM(annual_capture_gallons) as total_annual_capture_gallons
            FROM buildings
        """)).mappings().first()

        top_state = conn.execute(text("""
            SELECT state
            FROM buildings
            WHERE state IS NOT NULL
            GROUP BY state
            ORDER BY AVG(final_viability_score) DESC
            LIMIT 1
        """)).scalar()

        top_buildings = conn.execute(text("""
            SELECT * FROM buildings 
            ORDER BY final_viability_score DESC 
            LIMIT 5
        """)).mappings().all()

        state_summaries = get_state_summaries()

    return {
        "total_states": totals["total_states"] or 0,
        "total_buildings": totals["total_buildings"] or 0,
        "buildings_over_100k": totals["buildings_over_100k"] or 0,
        "average_viability_score": totals["average_viability_score"] or 0,
        "top_state": top_state or "",
        "total_annual_capture_gallons": totals["total_annual_capture_gallons"] or 0,
        "top_buildings_preview": [dict(b) for b in top_buildings],
        "state_summaries": state_summaries
    }
