"""
RainUSE Nexus — Push Geocoded Names to PostgreSQL

Run this once from the same terminal where you start the backend
(so DB_USER / DB_PASS / DB_NAME env vars are available):

    cd backend
    python ../scripts/enrich/migrate_geocoded_to_db.py

What it does:
  1. ALTER TABLE buildings ADD COLUMN IF NOT EXISTS building_name TEXT DEFAULT ''
  2. ALTER TABLE buildings ADD COLUMN IF NOT EXISTS short_address TEXT DEFAULT ''
  3. ALTER TABLE buildings ADD COLUMN IF NOT EXISTS zip_code TEXT DEFAULT ''
  4. UPDATE buildings SET building_name, short_address, city, zip_code, name
     for each of the 200 geocoded rows in buildings_geocoded.csv
"""

from __future__ import annotations

import csv
import sys
from pathlib import Path

# Make backend app importable
PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR  = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

# This import reads env vars / .env and creates the engine
from app.db.connection import engine  # noqa: E402
from sqlalchemy import text           # noqa: E402

GEOCODED_CSV = PROJECT_ROOT / "data" / "processed" / "buildings_geocoded.csv"


def main() -> None:
    if not GEOCODED_CSV.exists():
        print(f"ERROR: {GEOCODED_CSV} not found. Run reverse_geocode_buildings.py first.")
        sys.exit(1)

    print("Connecting to database...")
    with engine.begin() as conn:
        # Step 1: add columns
        for col, typ in [
            ("building_name", "TEXT"),
            ("short_address", "TEXT"),
            ("zip_code",      "TEXT"),
        ]:
            conn.execute(text(
                f"ALTER TABLE buildings ADD COLUMN IF NOT EXISTS {col} {typ} DEFAULT ''"
            ))
        print("Columns ensured: building_name, short_address, zip_code")

        # Step 2: bulk UPDATE
        updated = 0
        skipped = 0
        errors  = []

        with open(GEOCODED_CSV, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                bid           = row.get("id", "").strip()
                building_name = row.get("building_name", "").strip()
                short_address = row.get("short_address", "").strip()
                city          = row.get("city", "").strip()
                zip_code      = row.get("zip_code", "").strip()

                if not bid or not building_name or "Candidate" in building_name:
                    skipped += 1
                    continue

                try:
                    conn.execute(text("""
                        UPDATE buildings
                        SET building_name = :bn,
                            short_address = :sa,
                            city          = :city,
                            zip_code      = :zc,
                            name          = :bn
                        WHERE id = :id
                    """), {"bn": building_name, "sa": short_address,
                           "city": city,        "zc": zip_code, "id": bid})
                    updated += 1
                except Exception as exc:
                    errors.append(f"{bid}: {exc}")

        print(f"Updated: {updated} rows")
        print(f"Skipped: {skipped} rows (no geocode result)")
        if errors:
            print(f"Errors ({len(errors)}):")
            for e in errors[:10]:
                print(f"  {e}")

    print("\n[DONE] DB migration complete. Restart the backend to serve real names.")


if __name__ == "__main__":
    main()
