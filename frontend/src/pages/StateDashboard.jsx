import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Building2, Droplets, MapPin } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { formatGallons, formatSqft } from '../utils/formatters';
import LoadingState from '../components/shared/LoadingState';
import OpportunityBadge from '../components/buildings/OpportunityBadge';
import { useTopBuildingsByState } from '../hooks/useBuildings';

export default function StateDashboard() {
  const { stateId } = useParams();
  const navigate = useNavigate();

  const stateName = useMemo(() => {
    if (!stateId) return '';
    const raw = decodeURIComponent(stateId).replace(/-/g, ' ').trim();
    return raw
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, [stateId]);

  const { buildings: items, loading, error } = useTopBuildingsByState(stateName, 20);

  const avgRainfall =
    items.length > 0
      ? (
          items.reduce((sum, b) => sum + Number(b.annual_rain_inches || 0), 0) / items.length
        ).toFixed(2)
      : 0;

  const totalCapture = items.reduce(
    (sum, b) => sum + Number(b.annual_capture_gallons || 0),
    0
  );

  const avgScore =
    items.length > 0
      ? (
          items.reduce((sum, b) => sum + Number(b.final_viability_score || 0), 0) / items.length
        ).toFixed(2)
      : 0;

  return (
    <PageWrapper className="max-w-6xl mx-auto pb-12">
      <div className="mb-10 border-b border-white/5 pb-8 relative mt-4">
        <Link
          to="/"
          className="text-zinc-500 hover:text-zinc-300 text-sm mb-4 inline-flex items-center gap-2 transition-colors"
        >
          <span>←</span> Regional Select
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-medium text-white tracking-tight">
              {stateName}
            </h1>
            <p className="text-zinc-500 mt-3 text-lg">
              Top 20 ranked prospects for this state.
            </p>
          </div>

          <Link
            to="/buildings"
            className="flex-shrink-0 px-6 py-2.5 bg-zinc-100 text-black font-semibold rounded shadow hover:bg-white transition-all text-sm flex items-center gap-2"
          >
            View All Data <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="p-6 rounded bg-zinc-900/30 border border-white/5">
          <div className="flex items-start justify-between mb-4">
            <span className="text-zinc-500">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-display font-medium text-zinc-100 tracking-tight">
              {items.length}
            </span>
          </div>
          <h3 className="text-xs text-zinc-600 mt-2 uppercase tracking-wide">
            Loaded Buildings
          </h3>
        </div>

        <div className="p-6 rounded bg-zinc-900/30 border border-white/5">
          <div className="flex items-start justify-between mb-4">
            <span className="text-zinc-500">
              <Droplets className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-display font-medium text-zinc-100 tracking-tight">
              {avgRainfall}
            </span>
            <span className="text-sm font-medium text-zinc-500">in</span>
          </div>
          <h3 className="text-xs text-zinc-600 mt-2 uppercase tracking-wide">
            Avg Rainfall
          </h3>
        </div>

        <div className="p-6 rounded bg-zinc-900/30 border border-white/5">
          <div className="flex items-start justify-between mb-4">
            <span className="text-zinc-500">
              <MapPin className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-display font-medium text-zinc-100 tracking-tight">
              {avgScore}
            </span>
            <span className="text-sm font-medium text-zinc-500">/100</span>
          </div>
          <h3 className="text-xs text-zinc-600 mt-2 uppercase tracking-wide">
            Avg Score
          </h3>
        </div>
      </div>

      {loading && <LoadingState rows={8} />}

      {!loading && error && (
        <div className="text-center py-12 bg-zinc-900/30 rounded border border-red-500/20 text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-20 bg-zinc-900/30 rounded border border-white/5 border-dashed">
          <Activity className="w-12 h-12 text-zinc-700 mx-auto mb-5" />
          <p className="text-zinc-300 mb-2 font-medium text-lg">No buildings found</p>
          <p className="text-zinc-600 text-sm max-w-sm mx-auto">
            This state route may not match the backend state name exactly.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {items.map((bldg) => (
            <div
              key={bldg.id}
              onClick={() => navigate(`/buildings/${bldg.id}`)}
              className="group p-6 bg-zinc-900/30 rounded border border-white/5 cursor-pointer hover:bg-zinc-900/60 hover:border-white/10 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display font-medium text-xl text-zinc-100 truncate group-hover:text-emerald-400 transition-colors">
                      {bldg.building_name || bldg.name || bldg.id}
                    </h3>
                    <OpportunityBadge type={bldg.opportunity_type} />
                  </div>

                  {/* City badge + address */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {bldg.city && bldg.city !== 'Unknown City' && (
                      <span className="px-2 py-0.5 bg-zinc-800 border border-white/5 rounded text-xs text-zinc-400">
                        {bldg.city}, {bldg.state}
                      </span>
                    )}
                    {bldg.short_address && (
                      <span className="text-xs text-zinc-600 truncate">{bldg.short_address}</span>
                    )}
                  </div>

                  <div className="text-sm text-zinc-500 mb-4">
                    {(bldg.explanation || '').substring(0, 110)}…
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1.5 bg-zinc-900 border border-white/5 rounded text-xs font-medium text-zinc-400 font-mono">
                      ROOF: <span className="text-zinc-300">{formatSqft(bldg.roof_area_sqft)}</span>
                    </span>

                    <span className="px-2.5 py-1.5 bg-zinc-900 border border-white/5 rounded text-xs font-medium text-blue-400 font-mono">
                      HARVEST: {formatGallons(bldg.annual_capture_gallons)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs uppercase tracking-widest text-zinc-500">Score</div>
                  <div className="text-3xl font-display font-medium text-zinc-100">
                    {bldg.final_viability_score}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}