import { lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, FileText, Activity, Layers, Repeat, Eye, HardHat, Droplets } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { formatGallons, formatSqft, formatRainfall } from '../utils/formatters';
import OpportunityBadge from '../components/buildings/OpportunityBadge';
import ScoreBreakdown from '../components/buildings/ScoreBreakdown';
import ROIPanel from '../components/buildings/ROIPanel';
import CountUp from '../components/CountUp';
import LoadingState from '../components/shared/LoadingState';
import { useBuildingDetail } from '../hooks/useBuildings';

const SatelliteView = lazy(() => import('../components/buildings/SatelliteView'));

export default function BuildingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { building, loading, error } = useBuildingDetail(id);

  if (loading) {
    return (
      <PageWrapper className="max-w-7xl mx-auto space-y-8 pb-12">
        <LoadingState rows={4} />
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="text-center py-12 bg-zinc-900/30 rounded border border-red-500/20 text-red-300">
          {error}
        </div>
      </PageWrapper>
    );
  }

  if (!building) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h2 className="text-2xl text-gray-200 font-display mb-4">Building Not Found</h2>
        <p className="text-gray-500 mb-6">The building ID {id} does not exist in our database.</p>
        <button
          onClick={() => navigate('/buildings')}
          className="px-5 py-2 bg-emerald-600 rounded-lg text-white"
        >
          Return to Explorer
        </button>
      </div>
    );
  }

  const buildingName = building.building_name || building.name || building.id;
  const cityState = [building.city, building.state].filter(Boolean).join(', ') || building.state || 'Unknown';
  const fullLocation = [
    building.city && building.city !== 'Unknown City' ? building.city : null,
    building.state,
    building.zip_code || null,
  ].filter(Boolean).join(', ');

  return (
    <PageWrapper className="max-w-7xl mx-auto space-y-8 pb-12">
      <nav className="flex text-sm text-gray-500 gap-2 mb-2">
        <Link to="/buildings" className="hover:text-gray-300">Building Explorer</Link>
        <span>/</span>
        <span className="text-gray-200 truncate">{buildingName}</span>
      </nav>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-800/60">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <OpportunityBadge type={building.opportunity_type} />
            {Number(building.final_viability_score || 0) >= 70 && (
              <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
                <span className="text-amber-500 text-base">★</span> High Priority Prospect
              </span>
            )}
            {building.roof_over_100k && (
              <span className="px-2.5 py-1 bg-amber-950/60 border border-amber-500/30 text-amber-400 text-xs font-bold rounded font-mono tracking-wide">
                100K+ ROOF
              </span>
            )}
            {building.cooling_confidence != null && (
              <span
                className={`px-3 py-1 rounded text-xs font-bold font-mono flex items-center gap-1.5 ${
                  Number(building.cooling_confidence) >= 0.8
                    ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-300'
                    : Number(building.cooling_confidence) >= 0.6
                    ? 'bg-amber-950/60 border border-amber-500/30 text-amber-400'
                    : 'bg-red-950/50 border border-red-500/20 text-red-400'
                }`}
              >
                ◈ AI COOLING CONFIDENCE: {Math.round(Number(building.cooling_confidence) * 100)}%
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl font-medium text-white mb-1">
            {buildingName}
          </h1>

          {building.short_address && (
            <p className="text-zinc-400 text-base mb-1">{building.short_address}</p>
          )}

          <p className="text-zinc-500 text-sm flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            {fullLocation || cityState}
            {building.latitude && building.longitude && (
              <span className="text-zinc-600 text-xs font-mono ml-2 block sm:inline">
                [{Number(building.latitude).toFixed(4)}, {Number(building.longitude).toFixed(4)}]
              </span>
            )}
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-6 bg-zinc-900 border border-white/5 p-4 rounded">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-1">Rank</div>
            <div className="text-sm font-medium text-zinc-300">
              {building.global_rank ? `#${building.global_rank}` : 'Top Prospect'}
            </div>
          </div>

          <div className="w-px h-12 bg-white/5 hidden sm:block"></div>

          <div className="text-right">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-1">Viability Match</div>
            <div className="text-5xl font-display font-medium text-zinc-100 flex items-center justify-end">
              <CountUp to={Number(building.final_viability_score || 0)} duration={2} />
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/compare')}
          className="md:absolute right-8 top-8 px-6 py-2.5 rounded bg-zinc-100 hover:bg-white text-zinc-900 font-medium shadow transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
        >
          Compare Asset
        </button>
      </header>

      <Suspense
        fallback={
          <div className="rounded border border-white/5 bg-zinc-900/30 animate-pulse" style={{ height: 310 }} />
        }
      >
        <SatelliteView building={building} />
      </Suspense>

      <section className="p-6 md:p-8 rounded bg-zinc-900/30 border border-white/5 border-l-2 border-l-emerald-500">
        <h3 className="text-lg font-medium text-zinc-100 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-500" /> Executive Recommendation
        </h3>
        <p className="text-zinc-400 leading-relaxed text-base">
          {building.explanation}
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded bg-zinc-900/30 border border-white/5 font-mono text-sm max-w-full overflow-x-auto">
            <h3 className="font-display font-medium text-zinc-200 mb-5 flex items-center gap-2 font-sans tracking-wide">
              <Layers className="w-4 h-4 text-zinc-500" /> Raw Profile
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-zinc-500">Roof Area</span>
                <span className="font-medium text-zinc-300">{formatSqft(building.roof_area_sqft)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-zinc-500">Annual Rainfall</span>
                <span className="font-medium text-blue-400">{formatRainfall(building.annual_rain_inches)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-500">Projected Harvest</span>
                <span className="font-medium text-emerald-400">{formatGallons(building.annual_capture_gallons)}</span>
              </div>
            </div>
          </div>

          {(building.visual_notes || building.imagery_note) && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="p-6 rounded bg-zinc-900 border border-white/5 border-dashed"
            >
              <h3 className="font-display font-medium text-zinc-300 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500/50" /> Visual Assessment Notes
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed italic border-l-2 border-zinc-700 pl-3">
                {building.visual_notes || building.imagery_note}
              </p>
            </motion.div>
          )}

          <div className="p-6 rounded bg-zinc-900 border border-white/5 text-sm">
            <h3 className="font-display font-medium text-zinc-300 mb-4 flex items-center gap-2 tracking-wide">
              <Repeat className="w-4 h-4 text-cyan-500" /> Reuse Pathways
            </h3>
            <ul className="space-y-3">
              {Number(building.cooling_tower_score || 0) > 0.6 && (
                <li className="flex gap-3 text-zinc-400">
                  <span className="text-cyan-500 mt-0.5 opacity-60">↳</span> Cooling tower makeup substitution
                </li>
              )}
              {Number(building.water_cost_score || 0) > 0.6 && (
                <li className="flex gap-3 text-zinc-400">
                  <span className="text-cyan-500 mt-0.5 opacity-60">↳</span> High-cost water offset opportunity
                </li>
              )}
              {Number(building.roof_area_sqft || 0) > 150000 && (
                <li className="flex gap-3 text-zinc-400">
                  <span className="text-cyan-500 mt-0.5 opacity-60">↳</span> Large-scale capture for non-potable reuse
                </li>
              )}
              {Number(building.cooling_tower_score || 0) <= 0.6 && Number(building.roof_area_sqft || 0) <= 150000 && (
                <li className="flex gap-3 text-zinc-400">
                  <span className="text-cyan-500 mt-0.5 opacity-60">↳</span> Landscape irrigation and general purpose
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div>
            <h3 className="font-display font-medium text-xl text-zinc-200 mb-4 tracking-wide">Pillar Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                {
                  id: 'physical',
                  label: 'Physical',
                  score: Math.round(
                    (
                      ((Number(building.roof_area_score || 0) +
                        Number(building.roof_geometry_quality_score || 0) +
                        Number(building.facility_score || 0)) / 3) * 100
                    )
                  ),
                  icon: <HardHat className="w-5 h-5" />,
                },
                {
                  id: 'rainfall',
                  label: 'Rainfall',
                  score: Math.round(
                    (
                      ((Number(building.annual_precip_score || 0) +
                        Number(building.annual_capture_score || 0)) / 2) * 100
                    )
                  ),
                  icon: <Droplets className="w-5 h-5" />,
                },
                {
                  id: 'cooling',
                  label: 'Cooling',
                  score: Math.round(
                    (
                      ((Number(building.cooling_tower_score || 0) +
                        Number(building.cooling_degree_days_score || 0)) / 2) * 100
                    )
                  ),
                  icon: <Activity className="w-5 h-5" />,
                },
                {
                  id: 'economic',
                  label: 'Economic',
                  score: Math.round(
                    (
                      ((Number(building.water_cost_score || 0) +
                        Number(building.state_policy_score || 0) +
                        Number(building.local_incentive_score || 0)) / 3) * 100
                    )
                  ),
                  icon: <MapPin className="w-5 h-5" />,
                },
                {
                  id: 'confidence',
                  label: 'Confidence',
                  score: Math.round(Number(building.confidence_multiplier || 0) * 100),
                  icon: <Eye className="w-5 h-5" />,
                },
              ].map((group) => (
                <div
                  key={group.id}
                  className="p-4 rounded border border-white/5 bg-zinc-900/30 flex flex-col items-center text-center"
                >
                  <div className="text-zinc-500 flex items-center justify-center text-lg mb-3 opacity-60">
                    {group.icon}
                  </div>
                  <h4 className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-3 h-8 flex items-center justify-center">
                    {group.label}
                  </h4>
                  <div className="mt-auto pt-3 border-t border-white/5 w-full">
                    <div className="text-xl font-display font-medium text-zinc-100">{group.score}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8 rounded bg-zinc-900/30 border border-white/5">
            <h3 className="font-display font-medium text-xl text-zinc-200 mb-6 tracking-wide">Metric Breakdown</h3>
            <ScoreBreakdown building={building} />
          </div>

          <ROIPanel building={building} />
        </div>
      </div>
    </PageWrapper>
  );
}