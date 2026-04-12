"""Tests for the v1 buildings and filters API endpoints."""


def test_health(client):
    """Health endpoint returns ok status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["data_source"] == "local"


def test_search_default(client):
    """Default search returns paginated results."""
    response = client.post("/api/v1/buildings/search", json={})
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert "page" in data
    assert "total_pages" in data
    assert data["total"] > 0
    assert len(data["items"]) > 0
    assert len(data["items"]) <= data["page_size"]


def test_search_filter_by_state(client):
    """Filtering by state returns only matching buildings."""
    response = client.post("/api/v1/buildings/search", json={
        "filters": {"states": ["Texas"]},
    })
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["state"] == "Texas"


def test_search_filter_by_min_score(client):
    """Filtering by minimum score returns only high-scoring buildings."""
    response = client.post("/api/v1/buildings/search", json={
        "filters": {"min_viability_score": 70},
    })
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["final_viability_score"] >= 70


def test_search_pagination(client):
    """Pagination limits results correctly."""
    response = client.post("/api/v1/buildings/search", json={
        "page": 1,
        "page_size": 3,
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) <= 3
    assert data["page"] == 1


def test_search_sort_ascending(client):
    """Sorting ascending works correctly."""
    response = client.post("/api/v1/buildings/search", json={
        "sort": {"field": "final_viability_score", "direction": "asc"},
    })
    assert response.status_code == 200
    data = response.json()
    scores = [item["final_viability_score"] for item in data["items"]]
    assert scores == sorted(scores)


def test_get_building_by_id(client):
    """Fetching a single building by ID works."""
    response = client.get("/api/v1/buildings/bldg-001")
    assert response.status_code == 200
    data = response.json()
    assert data["building_id"] == "bldg-001"
    assert data["name"] == "Texas Medical Center — West Pavilion"


def test_get_building_not_found(client):
    """Fetching a non-existent building returns 404."""
    response = client.get("/api/v1/buildings/bldg-nonexistent")
    assert response.status_code == 404


def test_filter_metadata(client):
    """Filter metadata endpoint returns all expected fields."""
    response = client.get("/api/v1/filters/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "states" in data
    assert "cities" in data
    assert "opportunity_types" in data
    assert "score_range" in data
    assert "roof_area_range" in data
    assert "total_buildings" in data
    assert data["total_buildings"] > 0
    # States should have counts
    assert len(data["states"]) > 0
    assert data["states"][0]["count"] > 0


def test_combined_filters(client):
    """Multiple filters can be combined."""
    response = client.post("/api/v1/buildings/search", json={
        "filters": {
            "states": ["Texas"],
            "min_roof_area_sqft": 100000,
        },
    })
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["state"] == "Texas"
        assert item["roof_area_sqft"] >= 100000
