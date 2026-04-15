/**
 * StateInsights — Per-state building explorer with interactive map.
 *
 * Features:
 *   1. State selector dropdown (all states with building counts)
 *   2. State summary cards (Buildings, Avg Score, Total Capture, Avg Rainfall)
 *   3. Interactive Leaflet map (satellite/streets, marker clustering, popups)
 *   4. Buildings table (search, sortable columns, 25/page pagination)
 *   5. Live/Demo mode pill
 */

import { lazy, Suspense, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Droplets, Activity, ChevronDown, Search,
  ChevronUp, ArrowUpDown, Map, ExternalLink,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import OpportunityBadge from '../components/buildings/OpportunityBadge';
import LoadingState from '../components/shared/LoadingState';
import { formatGallons, formatSqft } from '../utils/formatters';
import { apiClient } from '../utils/api';
import { useStateBuildings } from '../hooks/useBuildings';
import USChoropleth from '../components/USChoropleth';

const StateInsightsMap = lazy(() => import('../components/StateInsightsMap'));

// ---------------------------------------------------------------------------
// State code ↔ name mappings
// ---------------------------------------------------------------------------

const STATE_NAMES = {
  TX:'Texas', FL:'Florida', GA:'Georgia', NC:'North Carolina',
  LA:'Louisiana', AL:'Alabama', SC:'South Carolina', TN:'Tennessee',
  VA:'Virginia', MS:'Mississippi', AR:'Arkansas', KY:'Kentucky',
  OK:'Oklahoma', MO:'Missouri', MD:'Maryland', DE:'Delaware',
  AZ:'Arizona', NM:'New Mexico', KS:'Kansas', IN:'Indiana',
  IL:'Illinois', WV:'West Virginia',
};

const PAGE_SIZE = 25;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DataModePill({ isLive }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-medium ${
      isLive
        ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
        : 'bg-zinc-900/60 border-white/[0.06] text-zinc-500'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
      {isLive ? '● Live Data' : '● Demo Mode'}
    </span>
  );
}

function SummaryCard({ icon, label, value, sub, color = 'text-zinc-100' }) {
  return (
    <div className="p-5 rounded bg-zinc-900/30 border border-white/5 flex flex-col gap-1">
      <div className="text-zinc-500 mb-1">{icon}</div>
      <div className={`text-2xl font-display font-medium tracking-tight ${color}`}>{value}</div>
      {sub && <div className="text-xs text-zinc-600">{sub}</div>}
      <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

// Sortable column header
function SortHeader({ col, label, sortCol, sortDir, onSort }) {
  const active = sortCol === col;
  return (
    <button
      onClick={() => onSort(col)}
      className="flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
    >
      {label}
      {active
        ? sortDir === 'asc'
          ? <ChevronUp className="w-3 h-3" />
          : <ChevronDown className="w-3 h-3" />
        : <ArrowUpDown className="w-3 h-3 opacity-40" />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function StateInsights() {
  const navigate = useNavigate();

  // State selection
  const [selectedCode, setSelectedCode] = useState('');
  const [stateCounts, setStateCounts]   = useState({});   // { stateCode: count }
  const [stateScores, setStateScores]   = useState({});   // { stateCode: avgScore } for choropleth

  // Table controls
  const [search,   setSearch]   = useState('');
  const [sortCol,  setSortCol]  = useState('final_viability_score');
  const [sortDir,  setSortDir]  = useState('desc');
  const [page,     setPage]     = useState(1);

  // Load state-level summaries for counts in the dropdown + choropleth scores
  useEffect(() => {
    apiClient.states().then((res) => {
      const counts = {};
      const scores = {};
      (res.states ?? []).forEach((s) => {
        // s.state is the full name; find its code
        const code = Object.entries(STATE_NAMES).find(([, name]) => name === s.state)?.[0];
        if (code) {
          counts[code] = s.total_buildings ?? s.building_count ?? 0;
          scores[code] = s.avg_score ?? s.avg_viability_score ?? null;
        }
      });
      setStateCounts(counts);
      setStateScores(scores);
    }).catch(() => {
      // Fallback: compute from mock buildings
      import('../data/mockBuildings.json').then((mod) => {
        const buildings = Array.isArray(mod.default) ? mod.default : (mod.default?.buildings ?? []);
        const countMap = {};
        const scoreSum = {};
        buildings.forEach((b) => {
          const code = Object.entries(STATE_NAMES).find(([, name]) => name === b.state)?.[0];
          if (!code) return;
          countMap[code] = (countMap[code] ?? 0) + 1;
          scoreSum[code] = (scoreSum[code] ?? 0) + Number(b.final_viability_score ?? 0);
        });
        const scores = {};
        Object.keys(countMap).forEach((code) => {
          scores[code] = scoreSum[code] / countMap[code];
        });
        setStateCounts(countMap);
        setStateScores(scores);
      }).catch(() => {});
    });
  }, []);

  // Buildings for selected state
  const { buildings, stateName, total, loading, error, isLive } =
    useStateBuildings(selectedCode, { limit: 200 });

  // Reset pagination on state change
  useEffect(() => { setPage(1); setSearch(''); }, [selectedCode]);

  // Compute summary stats
  const avgScore = useMemo(() => {
    if (!buildings.length) return 0;
    return buildings.reduce((s, b) => s + Number(b.final_viability_score || 0), 0) / buildings.length;
  }, [buildings]);

  const totalCapture = useMemo(
    () => buildings.reduce((s, b) => s + Number(b.annual_capture_gallons || 0), 0),
    [buildings]
  );

  const avgRainfall = useMemo(() => {
    if (!buildings.length) return 0;
    return buildings.reduce((s, b) => s + Number(b.annual_rain_inches || 0), 0) / buildings.length;
  }, [buildings]);

  // Filter + sort for table
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return buildings
      .filter((b) => {
        if (!q) return true;
        return (
          (b.building_name || b.name || '').toLowerCase().includes(q) ||
          (b.city || '').toLowerCase().includes(q)
        );
      })
      .slice()
      .sort((a, b) => {
        const va = a[sortCol] ?? 0;
        const vb = b[sortCol] ?? 0;
        if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        return sortDir === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va);
      });
  }, [buildings, search, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(col) {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('desc'); }
    setPage(1);
  }

  const stateOptions = Object.entries(STATE_NAMES).sort(([, a], [, b]) => a.localeCompare(b));

  return (
    <PageWrapper className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="font-display text-3xl font-medium text-white tracking-tight flex items-center gap-2">
            <Map className="w-6 h-6 text-emerald-500" />
            State Insights
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Top 200 buildings per state with interactive map exploration
          </p>
        </div>
        <DataModePill isLive={isLive} />
      </div>

      {/* ── State selector ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider flex-shrink-0">
          Select State
        </label>
        <div className="relative max-w-xs w-full">
          <select
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            className="w-full appearance-none pl-4 pr-9 py-2.5 bg-zinc-900 border border-white/10 rounded text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
          >
            <option value="">— All States Overview —</option>
            {stateOptions.map(([code, name]) => {
              const count = stateCounts[code];
              return (
                <option key={code} value={code}>
                  {name} ({code}){count ? ` — ${count} buildings` : ''}
                </option>
              );
            })}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {selectedCode && (
          <button
            onClick={() => setSelectedCode('')}
            className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-2 border border-white/5 rounded transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Summary cards (only when state selected & data loaded) ─────── */}
      {selectedCode && !loading && buildings.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={<Building2 className="w-4 h-4" />}
            label="Buildings"
            value={buildings.length.toLocaleString()}
            sub={total > buildings.length ? `of ${total.toLocaleString()} total` : undefined}
          />
          <SummaryCard
            icon={<Activity className="w-4 h-4 text-emerald-500" />}
            label="Avg Score"
            value={`${Math.round(avgScore)}/100`}
            color="text-emerald-400"
          />
          <SummaryCard
            icon={<Droplets className="w-4 h-4 text-blue-400" />}
            label="Total Capture"
            value={formatGallons(totalCapture)}
            sub="annual combined harvest"
            color="text-blue-400"
          />
          <SummaryCard
            icon={<Droplets className="w-4 h-4 text-sky-400" />}
            label="Avg Rainfall"
            value={`${avgRainfall.toFixed(1)} in`}
            sub="annual average"
            color="text-sky-300"
          />
        </div>
      )}

      {/* ── Map ────────────────────────────────────────────────────────── */}
      <div
        className="rounded border border-white/5 overflow-hidden relative"
        style={{ minHeight: 500, height: 520 }}
      >
        {loading && (
          <div className="h-full flex items-center justify-center bg-zinc-900/40">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">Loading buildings…</p>
            </div>
          </div>
        )}

        {!loading && !selectedCode && (
          <USChoropleth
            stateScores={stateScores}
            onStateSelect={(code) => setSelectedCode(code)}
          />
        )}

        {!loading && selectedCode && (
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center bg-zinc-900/40">
                <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            }
          >
            <StateInsightsMap buildings={buildings} stateCode={selectedCode} />
          </Suspense>
        )}
      </div>

      {/* ── Buildings table ────────────────────────────────────────────── */}
      {selectedCode && !loading && buildings.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-xl font-medium text-zinc-100">
              {stateName} — Top {buildings.length} Buildings
            </h2>

            {/* Search */}
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or city…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-4 py-2 bg-zinc-900 border border-white/10 rounded text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-900/60">
                  <th className="px-4 py-3 text-left w-10">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">#</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader col="building_name" label="Building" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader col="city" label="City" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortHeader col="final_viability_score" label="Score" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Type</span>
                  </th>
                  <th className="px-4 py-3 text-right hidden lg:table-cell">
                    <SortHeader col="roof_area_sqft" label="Roof Area" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-right hidden lg:table-cell">
                    <SortHeader col="cooling_confidence" label="Confidence" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {pageRows.map((b, idx) => {
                  const rank  = (page - 1) * PAGE_SIZE + idx + 1;
                  const score = Number(b.final_viability_score || 0);
                  const scoreColor = score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
                  const conf  = b.cooling_confidence != null ? Math.round(Number(b.cooling_confidence) * 100) : null;

                  return (
                    <tr
                      key={b.id}
                      onClick={() => navigate(`/buildings/${b.id}`)}
                      className="group hover:bg-zinc-900/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-zinc-600 font-mono text-xs">{rank}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors truncate max-w-[200px]">
                          {b.building_name || b.name || b.id}
                        </div>
                        {b.short_address && (
                          <div className="text-xs text-zinc-600 truncate max-w-[200px] mt-0.5">{b.short_address}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{b.city || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-display font-medium text-lg ${scoreColor}`}>{score}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <OpportunityBadge type={b.opportunity_type} />
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell text-zinc-400 text-xs font-mono">
                        {formatSqft(b.roof_area_sqft)}
                        {b.roof_over_100k && (
                          <span className="ml-1 text-amber-500 text-[10px]">★</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        {conf != null ? (
                          <span className={`text-xs font-mono ${conf >= 80 ? 'text-emerald-400' : conf >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                            {conf}%
                          </span>
                        ) : (
                          <span className="text-zinc-700 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                      </td>
                    </tr>
                  );
                })}

                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-zinc-600 text-sm">
                      No buildings match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>
                Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} buildings
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded border border-white/5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                  .reduce((acc, n, i, arr) => {
                    if (i > 0 && n - arr[i - 1] > 1) acc.push('…');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === '…' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-zinc-700">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`px-3 py-1.5 rounded border transition-colors ${
                          page === item
                            ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400'
                            : 'border-white/5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded border border-white/5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Empty / error states ────────────────────────────────────────── */}
      {selectedCode && !loading && error && buildings.length === 0 && (
        <div className="text-center py-12 bg-zinc-900/30 rounded border border-red-500/20 text-red-300 text-sm">
          {error}
        </div>
      )}

      {selectedCode && loading && <LoadingState rows={6} />}
    </PageWrapper>
  );
}
