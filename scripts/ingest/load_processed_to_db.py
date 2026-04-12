import os
import csv
import json
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile
from google.cloud import storage
from sqlalchemy import text

# Add backend directory to sys.path so we can import the app modules
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent.parent / "backend"
sys.path.append(str(backend_dir))

# Import the database engine which initializes dot env
from app.db.connection import engine

def parse_float(value):
    """Ensure reliable parsing of floats from text."""
    if not value or str(value).strip().lower() in ["", "nan", "null", "none"]:
        return None
    try:
        return float(value)
    except ValueError:
        return None

def parse_bool(value):
    """Convert text representation to a boolean."""
    if not value:
        return False
    val_str = str(value).strip().lower()
    return val_str in ["true", "t", "1", "yes", "y"]

def process_and_load(bucket_name: str, blob_name: str, chunk_size: int = 1000):
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    
    insert_query = text("""
        INSERT INTO buildings (
            id, name, state, city, latitude, longitude,
            roof_area_sqft, roof_over_100k, annual_rain_inches, annual_capture_gallons,
            cooling_tower_score, cooling_confidence, cooling_degree_days_score, building_type_score, facility_score,
            water_cost_score, state_policy_score, local_incentive_score, improvement_value_score,
            flood_score, water_stress_score,
            esg_score, leed_score, energy_star_score,
            base_viability_score, final_viability_score,
            opportunity_type, explanation, visual_notes, raw_payload
        ) VALUES (
            :id, :name, :state, :city, :latitude, :longitude,
            :roof_area_sqft, :roof_over_100k, :annual_rain_inches, :annual_capture_gallons,
            :cooling_tower_score, :cooling_confidence, :cooling_degree_days_score, :building_type_score, :facility_score,
            :water_cost_score, :state_policy_score, :local_incentive_score, :improvement_value_score,
            :flood_score, :water_stress_score,
            :esg_score, :leed_score, :energy_star_score,
            :base_viability_score, :final_viability_score,
            :opportunity_type, :explanation, :visual_notes, :raw_payload
        )
    """)

    with NamedTemporaryFile(suffix='.csv', delete=False) as tmp:
        tmp_path = tmp.name
        print(f"Downloading CSV to temporary file: {tmp_path}")
        blob.download_to_filename(tmp_path)

    try:
        with open(tmp_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            # Truncate table first
            with engine.begin() as conn:
                print("Truncating existing buildings table...")
                conn.execute(text("TRUNCATE TABLE buildings"))

            chunk = []
            total_processed = 0
            total_loaded = 0
            
            print("Beginning chunked ingestion...")
            for row in reader:
                try:
                    processed_row = {
                        "id": row.get("id", ""),
                        "name": row.get("name", ""),
                        "state": row.get("state", ""),
                        "city": row.get("city", ""),
                        "latitude": parse_float(row.get("latitude")),
                        "longitude": parse_float(row.get("longitude")),
                        "roof_area_sqft": parse_float(row.get("roof_area_sqft")),
                        "roof_over_100k": parse_bool(row.get("roof_over_100k")),
                        "annual_rain_inches": parse_float(row.get("annual_rain_inches")),
                        "annual_capture_gallons": parse_float(row.get("annual_capture_gallons")),
                        "cooling_tower_score": parse_float(row.get("cooling_tower_score")),
                        "cooling_confidence": parse_float(row.get("cooling_confidence")),
                        "cooling_degree_days_score": parse_float(row.get("cooling_degree_days_score")),
                        "building_type_score": parse_float(row.get("building_type_score")),
                        "facility_score": parse_float(row.get("facility_score")),
                        "water_cost_score": parse_float(row.get("water_cost_score")),
                        "state_policy_score": parse_float(row.get("state_policy_score")),
                        "local_incentive_score": parse_float(row.get("local_incentive_score")),
                        "improvement_value_score": parse_float(row.get("improvement_value_score")),
                        "flood_score": parse_float(row.get("flood_score")),
                        "water_stress_score": parse_float(row.get("water_stress_score")),
                        "esg_score": parse_float(row.get("esg_score")),
                        "leed_score": parse_float(row.get("leed_score")),
                        "energy_star_score": parse_float(row.get("energy_star_score")),
                        "base_viability_score": parse_float(row.get("base_viability_score")),
                        "final_viability_score": parse_float(row.get("final_viability_score")),
                        "opportunity_type": row.get("opportunity_type", ""),
                        "explanation": row.get("explanation", ""),
                        "visual_notes": row.get("visual_notes", ""),
                        "raw_payload": json.dumps(row)
                    }
                    chunk.append(processed_row)
                    total_processed += 1
                except Exception as e:
                    print(f"Error processing row {total_processed + 1}: {e}")
                
                if len(chunk) >= chunk_size:
                    with engine.begin() as conn:
                        conn.execute(insert_query, chunk)
                    total_loaded += len(chunk)
                    print(f"  Processed {total_processed} | Loaded {total_loaded} rows...")
                    chunk = []
            
            # Final chunk
            if chunk:
                with engine.begin() as conn:
                    conn.execute(insert_query, chunk)
                total_loaded += len(chunk)
                
            print(f"Successfully loaded {total_loaded} rows into buildings table.")

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

if __name__ == "__main__":
    bucket_name = os.environ.get("GCS_BUCKET_NAME")
    blob_name = os.environ.get("GCS_BLOB_NAME")

    if not bucket_name or not blob_name:
        raise ValueError("Missing required environment variables. Please provide GCS_BUCKET_NAME and GCS_BLOB_NAME.")

    process_and_load(bucket_name, blob_name)
