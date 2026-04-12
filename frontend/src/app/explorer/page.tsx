"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { searchBuildings, getFilterMetadata } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import type {
  BuildingSearchResponse,
  FilterMetadataResponse,
  SearchFilters,
  SortSpec,
} from "@/lib/types";

import { MultiSelectFilter } from "@/components/filters/MultiSelectFilter";
import { RangeFilter } from "@/components/filters/RangeFilter";
import { BooleanFilter } from "@/components/filters/BooleanFilter";
import { ResultsTable } from "@/components/results/ResultsTable";
import { Pagination } from "@/components/results/Pagination";

function ExplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SearchFilters>(() => parseFiltersFromURL(searchParams));
  const [sort, setSort] = useState<SortSpec>({
    field: searchParams.get("sort") || "final_viability_score",
    direction: (searchParams.get("dir") as "asc" | "desc") || "desc",
  });
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [results, setResults] = useState<BuildingSearchResponse | null>(null);
  const [metadata, setMetadata] = useState<FilterMetadataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    getFilterMetadata()
      .then(setMetadata)
      .catch((err) => console.error("Failed to load filter metadata:", err));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const cleanFilters: SearchFilters = {};
    for (const [k, v] of Object.entries(debouncedFilters)) {
      if (v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)) {
        (cleanFilters as Record<string, unknown>)[k] = v;
      }
    }

    searchBuildings({ filters: cleanFilters, sort, page, page_size: 25 })
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [debouncedFilters, sort, page]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.states?.length) params.set("states", filters.states.join(","));
    if (filters.opportunity_types?.length) params.set("opp", filters.opportunity_types.join(","));
    if (filters.min_viability_score !== undefined) params.set("minScore", String(filters.min_viability_score));
    if (filters.min_roof_area_sqft !== undefined) params.set("minRoof", String(filters.min_roof_area_sqft));
    if (filters.roof_over_100k !== undefined) params.set("bigRoof", "true");
    if (sort.field !== "final_viability_score") params.set("sort", sort.field);
    if (sort.direction !== "desc") params.set("dir", sort.direction);
    if (page > 1) params.set("page", String(page));

    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "/explorer", { scroll: false });
  }, [filters, sort, page, router]);

  const updateFilter = useCallback(<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSort({ field: "final_viability_score", direction: "desc" });
    setPage(1);
  }, []);

  const handleSort = useCallback((field: string) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
    setPage(1);
  }, []);

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)
  ).length;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-100">
      <aside className="w-72 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-cyan-400">RainUSE Nexus</h1>
            <p className="text-xs text-gray-500 mt-0.5">Building Prospecting Engine</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {metadata ? (
            <>
              <MultiSelectFilter
                label="State"
                options={metadata.states}
                selected={filters.states || []}
                onChange={(v) => updateFilter("states", v.length ? v : undefined)}
              />
              <MultiSelectFilter
                label="Opportunity Type"
                options={metadata.opportunity_types}
                selected={filters.opportunity_types || []}
                onChange={(v) => updateFilter("opportunity_types", v.length ? v : undefined)}
              />
              <RangeFilter
                label="Viability Score"
                min={metadata.score_range.min}
                max={metadata.score_range.max}
                currentMin={filters.min_viability_score}
                currentMax={filters.max_viability_score}
                onChangeMin={(v) => updateFilter("min_viability_score", v)}
                onChangeMax={(v) => updateFilter("max_viability_score", v)}
              />
              <RangeFilter
                label="Roof Area (sq ft)"
                min={metadata.roof_area_range.min}
                max={metadata.roof_area_range.max}
                currentMin={filters.min_roof_area_sqft}
                currentMax={filters.max_roof_area_sqft}
                step={1000}
                onChangeMin={(v) => updateFilter("min_roof_area_sqft", v)}
                onChangeMax={(v) => updateFilter("max_roof_area_sqft", v)}
              />
              <BooleanFilter
                label="Large Roof Only (>100k sqft)"
                value={filters.roof_over_100k}
                onChange={(v) => updateFilter("roof_over_100k", v)}
              />
              <RangeFilter
                label="Min Water Stress Score"
                min={0}
                max={1}
                step={0.05}
                currentMin={filters.min_water_stress_score}
                onChangeMin={(v) => updateFilter("min_water_stress_score", v)}
                onChangeMax={() => {}}
              />
              <RangeFilter
                label="Min ESG Score"
                min={0}
                max={1}
                step={0.05}
                currentMin={filters.min_esg_score}
                onChangeMin={(v) => updateFilter("min_esg_score", v)}
                onChangeMax={() => {}}
              />
            </>
          ) : (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          )}
        </div>

        {activeFilterCount > 0 && (
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={resetFilters}
              className="w-full py-2 text-sm text-red-400 border border-red-400/30 rounded hover:bg-red-400/10 transition-colors"
            >
              Reset All Filters ({activeFilterCount})
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-gray-950">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-100">Buildings</h2>
            {results && (
              <span className="px-2.5 py-1 text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full tabular-nums">
                {results.total.toLocaleString()} results
              </span>
            )}
            {loading && (
              <span className="text-xs text-gray-500 animate-pulse">Loading…</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="text-red-400 text-5xl mb-4">⚠</div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Connection Error</h3>
              <p className="text-gray-400 text-sm max-w-md mb-4">{error}</p>
              <p className="text-gray-500 text-xs">
                Make sure the backend is running at{" "}
                <code className="text-gray-400">http://localhost:8000</code>
              </p>
            </div>
          ) : loading && !results ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Loading buildings…</span>
              </div>
            </div>
          ) : results && results.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="text-gray-600 text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No buildings match</h3>
              <p className="text-gray-500 text-sm max-w-md mb-4">
                Try removing some filters or broadening your search criteria.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-cyan-400 border border-cyan-400/30 rounded hover:bg-cyan-400/10 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : results ? (
            <>
              <ResultsTable items={results.items} onSort={handleSort} currentSort={sort} />
              <Pagination
                page={results.page}
                totalPages={results.total_pages}
                onPageChange={setPage}
              />
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function parseFiltersFromURL(params: URLSearchParams): SearchFilters {
  const filters: SearchFilters = {};
  const states = params.get("states");
  if (states) filters.states = states.split(",");
  const opp = params.get("opp");
  if (opp) filters.opportunity_types = opp.split(",");
  const minScore = params.get("minScore");
  if (minScore) filters.min_viability_score = Number(minScore);
  const minRoof = params.get("minRoof");
  if (minRoof) filters.min_roof_area_sqft = Number(minRoof);
  if (params.get("bigRoof")) filters.roof_over_100k = true;
  return filters;
}

export default function ExplorerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ExplorerContent />
    </Suspense>
  );
}
