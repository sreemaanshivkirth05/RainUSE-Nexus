import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, FileSearch, Search, X } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import BuildingFilters from '../components/buildings/BuildingFilters';
import CountUp from '../components/CountUp';
import { formatGallons, formatSqft } from '../utils/formatters';
import OpportunityBadge from '../components/buildings/OpportunityBadge';
import LoadingState from '../components/shared/LoadingState';
import { useTopBuildings } from '../hooks/useBuildings';
import { useStates } from '../hooks/useSummary';

export default function TopBuildings() {
  const navigate = useNavigate();

  const { buildings, loading: buildingsLoading, error } = useTopBuildings(1000);
  const { states,    loading: statesLoading }           = useStates();
  const loading = buildingsLoading || statesLoading;

  const [search, setSearch] = useState('');

  const [filters, setFilters] = useState({
    state: '',
    opportunityType: '',
    minScore: '',
    minRoofArea: '',
    roofOver100k: false,
    minRainfall: '',
    minHarvest: '',
    requireCooling: false,
    highWaterCost: false,
    strongGeometry: false,
  });


  const filteredBuildings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return buildings
      .filter((b) => {
        if (filters.state && b.state !== filters.state) return false;
        if (filters.opportunityType && b.opportunity_type !== filters.opportunityType) return false;
        if (filters.minScore && Number(b.final_viability_score) < Number(filters.minScore)) return false;
        if (filters.minRoofArea && Number(b.roof_area_sqft) < Number(filters.minRoofArea)) return false;
        if (filters.roofOver100k && Number(b.roof_area_sqft) < 100000) return false;
        if (filters.minRainfall && Number(b.annual_rain_inches) < Number(filters.minRainfall)) return false;
        if (filters.minHarvest && Number(b.annual_capture_gallons) < Number(filters.minHarvest)) return false;
        if (filters.requireCooling && Number(b.cooling_tower_score) < 0.7) return false;
        if (filters.highWaterCost && Number(b.water_cost_score) < 0.7) return false;
        if (filters.strongGeometry && Number(b.roof_geometry_quality_score) < 0.6) return false;
        if (q) {
          const haystack = [
            b.building_name,
            b.name,
            b.short_address,
            b.city,
            b.state,
          ].filter(Boolean).join(' ').toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => Number(b.final_viability_score) - Number(a.final_viability_score));
  }, [buildings, filters, search]);

  return (
    <PageWrapper className="max-w-[1600px] mx-auto pb-12">
      <div className="mb-8 border-b border-white/5 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-medium text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-emerald-500" /> Building Explorer
            </h1>
            <p className="text-zinc-500 mt-2 text-lg">
              Filtering {filteredBuildings.length} target prospects across {filters.state || 'all active regions'}.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative flex-shrink-0 w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, address, city…"
              className="w-full pl-9 pr-8 py-2.5 bg-zinc-900 border border-white/10 rounded text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1">
          <BuildingFilters filters={filters} onFilterChange={setFilters} states={states} />
        </div>

        <div className="lg:col-span-3 space-y-4">
          {loading && <LoadingState rows={6} />}

          {!loading && error && (
            <div className="text-center py-12 bg-zinc-900/30 rounded border border-red-500/20 text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredBuildings.map((bldg, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
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

                        {bldg.short_address ? (
                          <p className="text-xs text-zinc-500 mb-1 truncate">{bldg.short_address}</p>
                        ) : (
                          <p className="text-xs text-zinc-600 mb-1">
                            {[bldg.city, bldg.state].filter(Boolean).join(', ') || bldg.state}
                          </p>
                        )}

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

                          {/* Roof flag: ✅ if >100K sqft, ❌ otherwise */}
                          <span
                            className="px-2.5 py-1.5 bg-zinc-900 border border-white/5 rounded text-xs font-bold font-mono"
                            title={bldg.roof_over_100k ? 'Roof area exceeds 100,000 sq ft' : 'Roof area below 100,000 sq ft'}
                          >
                            {bldg.roof_over_100k
                              ? <span className="text-amber-400">✅ 100K+ ROOF</span>
                              : <span className="text-zinc-600">❌ &lt;100K ROOF</span>
                            }
                          </span>

                          {/* AI Cooling-Tower Confidence — progress bar + tooltip */}
                          {bldg.cooling_confidence != null && (() => {
                            const pct = Math.round(Number(bldg.cooling_confidence) * 100);
                            const isGreen  = pct >= 80;
                            const isYellow = pct >= 60;
                            const barColor = isGreen ? 'bg-cyan-500' : isYellow ? 'bg-amber-500' : 'bg-red-500';
                            const textColor = isGreen ? 'text-cyan-300' : isYellow ? 'text-amber-400' : 'text-red-400';
                            const borderColor = isGreen ? 'border-cyan-500/30' : isYellow ? 'border-amber-500/20' : 'border-red-500/20';
                            const bgColor = isGreen ? 'bg-cyan-950/60' : isYellow ? 'bg-amber-950/50' : 'bg-red-950/40';
                            return (
                              <span
                                className={`px-2.5 py-1.5 rounded text-xs font-semibold font-mono border ${bgColor} ${borderColor} ${textColor} flex items-center gap-2`}
                                title={bldg.visual_notes || `AI cooling confidence: ${pct}%`}
                              >
                                <span className="whitespace-nowrap">AI: {pct}%</span>
                                <span className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden flex-shrink-0">
                                  <span className={`block h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                                </span>
                              </span>
                            );
                          })()}

                          {Number(bldg.water_cost_score) > 0.7 && (
                            <span className="px-2.5 py-1.5 bg-zinc-800/50 border border-white/[0.04] rounded text-xs font-medium text-emerald-400">
                              High Water Cost
                            </span>
                          )}

                          {Number(bldg.roof_geometry_quality_score) > 0.6 && (
                            <span className="px-2.5 py-1.5 bg-zinc-800/50 border border-white/[0.04] rounded text-xs font-medium text-violet-400">
                              Strong Roof Geometry
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex items-center gap-4 md:flex-col md:items-end justify-between md:justify-center pl-4 border-l border-white/5 md:w-32">
                        <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono hidden md:block">
                          Score
                        </div>
                        <div className={`text-4xl font-display font-medium ${
                          Number(bldg.final_viability_score) >= 70 ? 'text-emerald-400'
                          : Number(bldg.final_viability_score) >= 50 ? 'text-amber-400'
                          : 'text-red-400'
                        }`}>
                          <CountUp to={Number(bldg.final_viability_score)} duration={1.5} />
                        </div>
                        <div className="text-xs text-emerald-500 font-medium md:mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          Analyze Prospect →
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredBuildings.length === 0 && (
                <div className="text-center py-20 bg-zinc-900/30 rounded border border-white/5 border-dashed">
                  <FileSearch className="w-12 h-12 text-zinc-700 mx-auto mb-5" />
                  <p className="text-zinc-300 mb-2 font-medium text-lg">No prospects match your criteria</p>
                  <p className="text-zinc-600 text-sm mb-6 max-w-sm mx-auto">
                    Try lowering thresholds or removing specific requirements to see more building opportunities.
                  </p>
                  <button
                    onClick={() =>
                      setFilters({
                        state: '',
                        opportunityType: '',
                        minScore: '',
                        minRoofArea: '',
                        roofOver100k: false,
                        minRainfall: '',
                        minHarvest: '',
                        requireCooling: false,
                        highWaterCost: false,
                        strongGeometry: false,
                      })
                    }
                    className="px-6 py-2 flex items-center gap-2 mx-auto rounded border border-white/5 bg-zinc-900 hover:bg-zinc-800 hover:border-white/10 text-zinc-300 transition-all text-sm"
                  >
                    Clear Parameters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}