"""
RainUSE Nexus — BigQuery Pipeline

Runs the raw -> staging -> serving pipeline against BigQuery.
Requires BIGQUERY_PROJECT environment variable and valid GCP credentials.

Usage:
    python -m scripts.pipeline.bq_pipeline [COMMAND ...]

Commands:
    --create-datasets    Create raw, staging, serving datasets in BigQuery
    --create-tables      Create raw tables with explicit schemas (DDL)
    --load-samples       Load sample CSVs into raw tables
    --rebuild-serving    Run staging + serving SQL transformations
    --full               Run everything (create -> load -> rebuild)
    --dry-run            Print SQL instead of executing (combine with any above)
    --verify             Run verification queries against the serving table
"""

import os
import sys
import argparse
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
SQL_DIR = PROJECT_ROOT / "sql"
SAMPLE_DATA_DIR = PROJECT_ROOT / "sample-data"

BQ_PROJECT = os.getenv("BIGQUERY_PROJECT", "")
RAW_DATASET = os.getenv("BQ_RAW_DATASET", "rainuse_raw")
STAGING_DATASET = os.getenv("BQ_STAGING_DATASET", "rainuse_staging")
SERVING_DATASET = os.getenv("BQ_SERVING_DATASET", "rainuse_serving")
BQ_LOCATION = os.getenv("BQ_LOCATION", "US")

DRY_RUN = False


def get_client():
    """Lazy-load BigQuery client."""
    try:
        from google.cloud import bigquery
        return bigquery.Client(project=BQ_PROJECT)
    except ImportError:
        print("  google-cloud-bigquery is not installed. Run: pip install google-cloud-bigquery")
        sys.exit(1)
    except Exception as e:
        print(f"  Failed to create BigQuery client: {e}")
        print("  Make sure BIGQUERY_PROJECT is set and credentials are configured.")
        sys.exit(1)


def substitute_sql(sql: str) -> str:
    """Replace template variables in SQL with actual values."""
    return (
        sql.replace("${PROJECT}", BQ_PROJECT)
           .replace("${RAW_DATASET}", RAW_DATASET)
           .replace("${STAGING_DATASET}", STAGING_DATASET)
           .replace("${SERVING_DATASET}", SERVING_DATASET)
    )


def execute_sql(sql: str, description: str):
    """Execute a SQL statement against BigQuery (or print in dry-run mode)."""
    resolved = substitute_sql(sql)
    if DRY_RUN:
        print(f"\n  -- [DRY RUN] {description}")
        print(f"  {resolved[:500]}{'...' if len(resolved) > 500 else ''}")
        return
    client = get_client()
    print(f"  Running: {description}...")
    try:
        job = client.query(resolved)
        job.result()
        print(f"  Done: {description}")
    except Exception as e:
        print(f"  Failed: {description}: {e}")
        sys.exit(1)


def run_sql_file(sql_file: Path, description: str):
    """Read and execute a SQL file."""
    if not sql_file.exists():
        print(f"  SQL file not found: {sql_file}")
        sys.exit(1)
    sql = sql_file.read_text()
    execute_sql(sql, description)


# -------------------------------------------------------------------------
# Commands
# -------------------------------------------------------------------------

def create_datasets():
    """Create raw, staging, and serving datasets if they don't exist."""
    print("\n  Creating datasets...")
    if DRY_RUN:
        for ds in [RAW_DATASET, STAGING_DATASET, SERVING_DATASET]:
            print(f"  [DRY RUN] Would create dataset: {BQ_PROJECT}.{ds}")
        return

    from google.cloud import bigquery as bq
    client = get_client()
    for dataset_id in [RAW_DATASET, STAGING_DATASET, SERVING_DATASET]:
        dataset_ref = bq.Dataset(f"{BQ_PROJECT}.{dataset_id}")
        dataset_ref.location = BQ_LOCATION
        try:
            client.create_dataset(dataset_ref, exists_ok=True)
            print(f"  Dataset '{dataset_id}' ready")
        except Exception as e:
            print(f"  Failed to create dataset '{dataset_id}': {e}")
            sys.exit(1)


def create_tables():
    """Create raw tables with explicit schemas from DDL files."""
    print("\n  Creating raw tables from DDL...")
    for ddl_file in sorted((SQL_DIR / "schema").glob("raw_*.sql")):
        run_sql_file(ddl_file, f"Create table from {ddl_file.name}")


def load_csv_to_raw(csv_path: Path, table_name: str):
    """Load a single CSV file into a BigQuery raw table."""
    if DRY_RUN:
        print(f"  [DRY RUN] Would load {csv_path.name} -> {BQ_PROJECT}.{RAW_DATASET}.{table_name}")
        return

    from google.cloud import bigquery as bq
    client = get_client()
    table_ref = f"{BQ_PROJECT}.{RAW_DATASET}.{table_name}"

    job_config = bq.LoadJobConfig(
        source_format=bq.SourceFormat.CSV,
        skip_leading_rows=1,
        autodetect=False,
        write_disposition=bq.WriteDisposition.WRITE_TRUNCATE,
    )

    print(f"  Loading {csv_path.name} -> {table_ref}...")
    with open(csv_path, "rb") as f:
        job = client.load_table_from_file(f, table_ref, job_config=job_config)
    job.result()
    table = client.get_table(table_ref)
    print(f"  Loaded {table.num_rows} rows into {table_ref}")


def load_samples():
    """Load all sample CSVs into BigQuery raw tables."""
    print("\n  Loading sample data to raw...")
    sources = [
        (SAMPLE_DATA_DIR / "buildings_base.csv", "buildings_base"),
        (SAMPLE_DATA_DIR / "building_metrics.csv", "building_metrics"),
    ]
    for csv_path, table_name in sources:
        if csv_path.exists():
            load_csv_to_raw(csv_path, table_name)
        else:
            print(f"  Skipping: {csv_path} not found")


def rebuild_serving():
    """Run staging and serving SQL transformations."""
    print("\n  Rebuilding staging and serving tables...")
    run_sql_file(
        SQL_DIR / "transformations" / "raw_to_staging.sql",
        "Raw -> Staging transformation",
    )
    run_sql_file(
        SQL_DIR / "transformations" / "staging_to_serving.sql",
        "Staging -> Serving transformation",
    )

    if not DRY_RUN:
        client = get_client()
        table_ref = f"{BQ_PROJECT}.{SERVING_DATASET}.buildings_serving"
        try:
            table = client.get_table(table_ref)
            print(f"\n  Serving table: {table.num_rows} rows, {len(table.schema)} columns")
            if table.clustering_fields:
                print(f"  Clustering: {table.clustering_fields}")
        except Exception:
            pass


def seed_serving():
    """Load seed data directly into the serving table (skips pipeline)."""
    print("\n  Seeding serving table directly...")
    create_serving_ddl = SQL_DIR / "schema" / "buildings_serving.sql"
    run_sql_file(create_serving_ddl, "Create serving table (if not exists)")
    run_sql_file(
        SQL_DIR / "seed" / "seed_buildings_serving.sql",
        "Insert seed data into serving table",
    )


def verify():
    """Run verification queries against the serving table."""
    print("\n  Running verification queries...")
    if DRY_RUN:
        print("  [DRY RUN] Skipping verification (requires live BigQuery)")
        return

    client = get_client()
    table_ref = f"`{BQ_PROJECT}.{SERVING_DATASET}.buildings_serving`"

    queries = [
        ("Row count", f"SELECT COUNT(*) AS total FROM {table_ref}"),
        ("Score range", f"SELECT MIN(viability_score) AS min_score, MAX(viability_score) AS max_score FROM {table_ref}"),
        ("By state", f"SELECT state, COUNT(*) AS cnt FROM {table_ref} GROUP BY state ORDER BY cnt DESC"),
        ("By opportunity_type", f"SELECT opportunity_type, COUNT(*) AS cnt FROM {table_ref} GROUP BY opportunity_type ORDER BY cnt DESC"),
        ("Top 5 buildings", f"SELECT building_id, building_name, state, viability_score FROM {table_ref} ORDER BY viability_score DESC LIMIT 5"),
    ]

    for label, sql in queries:
        print(f"\n  -- {label}")
        try:
            rows = list(client.query(sql).result())
            for row in rows:
                print(f"     {dict(row)}")
        except Exception as e:
            print(f"     Query failed: {e}")


# -------------------------------------------------------------------------
# Main
# -------------------------------------------------------------------------

def main():
    global DRY_RUN

    parser = argparse.ArgumentParser(
        description="RainUSE Nexus BigQuery Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m scripts.pipeline.bq_pipeline --full
  python -m scripts.pipeline.bq_pipeline --full --dry-run
  python -m scripts.pipeline.bq_pipeline --create-datasets --create-tables
  python -m scripts.pipeline.bq_pipeline --rebuild-serving --verify
        """,
    )
    parser.add_argument("--create-datasets", action="store_true", help="Create BQ datasets")
    parser.add_argument("--create-tables", action="store_true", help="Create raw tables from DDL")
    parser.add_argument("--load-samples", action="store_true", help="Load sample CSVs to raw")
    parser.add_argument("--rebuild-serving", action="store_true", help="Run staging + serving SQL")
    parser.add_argument("--seed", action="store_true", help="Seed serving table directly (skip pipeline)")
    parser.add_argument("--full", action="store_true", help="Run everything: create -> load -> rebuild")
    parser.add_argument("--dry-run", action="store_true", help="Print SQL instead of executing")
    parser.add_argument("--verify", action="store_true", help="Run verification queries")
    args = parser.parse_args()

    DRY_RUN = args.dry_run

    if not BQ_PROJECT and not DRY_RUN:
        print("BIGQUERY_PROJECT environment variable is not set.")
        print("Set it to your GCP project ID, or use --dry-run to preview SQL.")
        print("  export BIGQUERY_PROJECT=my-gcp-project")
        sys.exit(1)

    bq_project_display = BQ_PROJECT or "<not set>"
    print("=" * 60)
    print("RainUSE Nexus — BigQuery Pipeline")
    print(f"  Project:  {bq_project_display}")
    print(f"  Datasets: {RAW_DATASET} -> {STAGING_DATASET} -> {SERVING_DATASET}")
    if DRY_RUN:
        print("  Mode:     DRY RUN (no queries will be executed)")
    print("=" * 60)

    ran_something = False

    if args.full or args.create_datasets:
        create_datasets()
        ran_something = True

    if args.full or args.create_tables:
        create_tables()
        ran_something = True

    if args.full or args.load_samples:
        load_samples()
        ran_something = True

    if args.full or args.rebuild_serving:
        rebuild_serving()
        ran_something = True

    if args.seed:
        seed_serving()
        ran_something = True

    if args.full or args.verify:
        verify()
        ran_something = True

    if not ran_something:
        parser.print_help()

    print("\nDone.")


if __name__ == "__main__":
    main()
