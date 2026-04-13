# Sample Data

This directory contains seed/demo CSV files that allow the application and pipeline to run locally without any Google Cloud credentials.

## Files

| File | Description | Rows | Schema |
|------|-------------|------|--------|
| `buildings_base.csv` | Core building identity, location, and physical attributes | 20 | `config/sources/buildings_base.yaml` |
| `building_metrics.csv` | Rainwater, cooling, economic, and sustainability metrics | 20 | `config/sources/building_metrics.yaml` |
| `buildings_sample.csv` | Legacy denormalized format (kept for backward compatibility) | 15 | N/A |

## Pipeline Flow

```
buildings_base.csv ─┐
                    ├─ raw_to_staging.sql ─► buildings_staged
building_metrics.csv┘                              │
                                          staging_to_serving.sql
                                                   │
                                          buildings_serving (final)
```

## Usage

### Local Pipeline (no GCP required)

```bash
make seed
# or directly:
python3 -m scripts.pipeline.local_pipeline
```

This reads both CSVs, validates schemas, joins them, computes viability scores, and writes `data/processed/buildings_serving.csv`.

### BigQuery Pipeline

```bash
export BIGQUERY_PROJECT=my-gcp-project
make pipeline-bq-full
```

## Adding New Sample Data

1. Create a CSV with headers matching the column names in the corresponding `config/sources/*.yaml`
2. Place it in this directory
3. Add a source entry in `config/sources.yaml` with `local_path` pointing here
4. Create a schema definition in `config/sources/<source_id>.yaml`
5. Run the pipeline to verify

## Data Coverage

The 20 sample buildings span:
- **7 states**: Texas, Georgia, Arizona, Florida, North Carolina, Colorado, Louisiana
- **10 property types**: Healthcare, Industrial, Office, Warehouse, Manufacturing, Convention, Data Center, Laboratory, Government
- **Viability scores**: 40–79 (full range of opportunity types)
- **Roof areas**: 88,000–510,000 sq ft
