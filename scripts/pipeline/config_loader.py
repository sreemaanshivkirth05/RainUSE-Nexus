"""
RainUSE Nexus — Config Loader

Loads source schemas and metric definitions from YAML config files.
"""

from pathlib import Path
from typing import Any

import yaml

CONFIG_DIR = Path(__file__).resolve().parent.parent.parent / "config"
SOURCES_DIR = CONFIG_DIR / "sources"
METRICS_PATH = CONFIG_DIR / "metrics.yaml"


def load_source_config(source_id: str) -> dict[str, Any]:
    """Load a single source schema definition."""
    path = SOURCES_DIR / f"{source_id}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Source config not found: {path}")
    with open(path) as f:
        return yaml.safe_load(f)


def load_all_source_configs() -> list[dict[str, Any]]:
    """Load all source schema definitions from config/sources/."""
    configs = []
    if not SOURCES_DIR.exists():
        return configs
    for path in sorted(SOURCES_DIR.glob("*.yaml")):
        with open(path) as f:
            configs.append(yaml.safe_load(f))
    return configs


def load_metrics_config() -> dict[str, Any]:
    """Load the metric definitions from config/metrics.yaml."""
    if not METRICS_PATH.exists():
        return {"metrics": [], "computed_metrics": []}
    with open(METRICS_PATH) as f:
        return yaml.safe_load(f)


def get_required_columns(source_config: dict) -> list[str]:
    """Get list of required column names for a source."""
    return [
        col["name"]
        for col in source_config.get("columns", [])
        if col.get("required", False)
    ]


def get_column_types(source_config: dict) -> dict[str, str]:
    """Get column name → BigQuery type mapping for a source."""
    return {
        col["name"]: col["type"]
        for col in source_config.get("columns", [])
    }
