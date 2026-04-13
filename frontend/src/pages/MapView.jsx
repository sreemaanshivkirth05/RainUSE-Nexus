import { useMemo, useState } from 'react';
import { MapPin, ChevronDown, Building2, Droplets, Activity } from 'lucide-react';
import BuildingMap from '../components/BuildingMap';
import { useBuildings } from '../hooks/useBuildings';
import { formatGallons } from '../utils/formatters';

export default function MapView() {
  const [selectedState, setSelectedState] = useState('');
  const { buildings, loading, error } = useBuildings({ limit: 500 });

  // Unique sorted states from loaded data
  const states = useMemo(() => {
    const set = new Set(buildings.map((b) => b.state).filter(Boolean));
    return [...set].sort();
  }, [buildings]);

  // Stats for the selected view
  const visible = selectedState
    ? buildings.filter((b) => b.state?.toLowerCase() === selectedState.toLowerCase())
    : buildings;

  const statCount   = visible.length;
  const highCount   = visible.filter((b) => Number(b.final_viability_score || 0) >= 70).length;
  const totalCapture = visible.reduce((s, b) => s + Number(b.annual_capture_gallons || 0), 0);

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-500" />
            Map View
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Top {buildings.length.toLocaleString()} scored buildings — click any pin to inspect
          </p>
        </div>

        {/* State filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2 bg-zinc-900 border border-white/10 rounded text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
            >
              <option value="">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {selectedState && (
            <button
              onClick={() => setSelectedState('')}
              className="px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 border border-white/5 hover:border-white/10 rounded transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Stat chips ──────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 border border-white/5 rounded text-xs">
          <Building2 className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-zinc-400">
            <span className="text-zinc-200 font-medium">{statCount.toLocaleString()}</span> buildings
            {selectedState ? ` in ${selectedState}` : ' nationwide'}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 border border-white/5 rounded text-xs">
          <Activity className="w-3.5 h-3.5 text-emerald-500/70" />
          <span className="text-zinc-400">
            <span className="text-emerald-400 font-medium">{highCount.toLocaleString()}</span> high-priority (score ≥ 70)
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 border border-white/5 rounded text-xs">
          <Droplets className="w-3.5 h-3.5 text-blue-500/70" />
          <span className="text-zinc-400">
            <span className="text-blue-400 font-medium">{formatGallons(totalCapture)}</span> combined annual harvest
          </span>
        </div>
      </div>

      {/* ── Map area ────────────────────────────────────────────── */}
      <div
        className="rounded border border-white/5 overflow-hidden"
        style={{ height: 'calc(100vh - 13rem)' }}
      >
        {loading && (
          <div className="h-full flex items-center justify-center bg-zinc-900/40">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">Loading buildings…</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="h-full flex items-center justify-center bg-zinc-900/40">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <BuildingMap buildings={buildings} selectedState={selectedState} />
        )}
      </div>
    </div>
  );
}
