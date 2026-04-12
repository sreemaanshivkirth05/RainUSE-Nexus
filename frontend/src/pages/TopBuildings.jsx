import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, FileSearch, Loader2, AlertCircle } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import BuildingFilters from '../components/buildings/BuildingFilters';
import CountUp from '../components/CountUp';
import { formatGallons, formatSqft } from '../utils/formatters';
import OpportunityBadge from '../components/buildings/OpportunityBadge';
import { fetchBuildings, fetchFilterMetadata } from '../lib/api';

const DEFAULT_FILTERS = {
  state: "",
  city: "",
  min_score: "",
  max_score: "",
  opportunity_type: "",
  roof_area_min: "",
  roof_area_max: "",
  rainfall_min: "",
  rainfall_max: "",
  capture_min: "",
  capture_max: "",
  cooling_confidence_min: "",
  water_cost_min: "",
  flood_score_min: "",
  water_stress_min: "",
  esg_min: "",
  leed_min: "",
  energy_star_min: "",
  sort_by: "final_viability_score",
  sort_order: "desc",
  page: 1,
  page_size: 50
};

export default function TopBuildings() {
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  
  const [metadata, setMetadata] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMetadata() {
      try {
        const data = await fetchFilterMetadata();
        setMetadata(data);
      } catch (err) {
        console.error("Failed to load metadata:", err);
      }
    }
    loadMetadata();
  }, []);

  useEffect(() => {
    async function getBuildings() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
             params.append(key, value);
          }
        });
        
        const data = await fetchBuildings(params.toString());
        setBuildings(data.buildings || []);
        setCount(data.count || 0);
      } catch (err) {
        setError(err.message || "Failed to load prospects");
        setBuildings([]);
      } finally {
        setLoading(false);
      }
    }
    getBuildings();
  }, [filters]);

  return (
    <PageWrapper className="max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="mb-8 border-b border-white/5 pb-6">
        <h1 className="font-display text-4xl font-medium text-white flex items-center gap-3">
          <Building2 className="w-8 h-8 text-emerald-500" /> Building Explorer
        </h1>
        <p className="text-zinc-500 mt-2 text-lg">
          Filtering {count} target prospects across {filters.state || 'all active regions'}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Sidebar Filters */}
        <div className="lg:col-span-1">
          <BuildingFilters filters={filters} onFilterChange={setFilters} metadata={metadata} />
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-4">
          
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-500/20 rounded flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
              <p>Loading prospects...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {buildings.map((bldg, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                    key={bldg.id} 
                    onClick={() => navigate(`/buildings/${bldg.id}`)}
                    className="group p-6 bg-zinc-900/30 rounded border border-white/5 cursor-pointer hover:bg-zinc-900/60 hover:border-white/10 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-3 mb-2">
                         <h3 className="font-display font-medium text-xl text-zinc-100 truncate group-hover:text-emerald-400 transition-colors">{bldg.name}</h3>
                         <OpportunityBadge type={bldg.opportunity_type} />
                       </div>
                       <div className="text-sm text-zinc-500 mb-4">{bldg.city}, {bldg.state} • {(bldg.explanation || "").substring(0, 110)}...</div>
                       <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1.5 bg-zinc-900 border border-white/5 rounded text-xs font-medium text-zinc-400 font-mono">
                             ROOF: <span className="text-zinc-300">{formatSqft(bldg.roof_area_sqft)}</span>
                          </span>
                          <span className="px-2.5 py-1.5 bg-zinc-900 border border-white/5 rounded text-xs font-medium text-blue-400 font-mono">
                             HARVEST: {formatGallons(bldg.annual_capture_gallons)}
                          </span>
                          {parseFloat(bldg.cooling_tower_score) > 0.7 && (
                            <span className="px-2.5 py-1.5 bg-zinc-800/50 border border-white/[0.04] rounded text-xs font-medium text-cyan-400 flex items-center gap-1.5">
                               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div> High Cooling Demand
                            </span>
                          )}
                          {parseFloat(bldg.esg_score) > 0.7 && (
                            <span className="px-2.5 py-1.5 bg-zinc-800/50 border border-white/[0.04] rounded text-xs font-medium text-violet-400">
                               ESG/SBTi Ready
                            </span>
                          )}
                       </div>
                    </div>
                    
                    <div className="flex-shrink-0 flex items-center gap-4 md:flex-col md:items-end justify-between md:justify-center pl-4 border-l border-white/5 md:w-32">
                       <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono hidden md:block">Score</div>
                       <div className={`text-4xl font-display font-medium text-zinc-100`}>
                         <CountUp to={parseFloat(bldg.final_viability_score)} duration={1.5} />
                       </div>
                       <div className="text-xs text-emerald-500 font-medium md:mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         Analyze Prospect →
                       </div>
                    </div>
                  </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {buildings.length === 0 && !error && (
                <div className="text-center py-20 bg-zinc-900/30 rounded border border-white/5 border-dashed">
                  <FileSearch className="w-12 h-12 text-zinc-700 mx-auto mb-5" />
                  <p className="text-zinc-300 mb-2 font-medium text-lg">No prospects match your criteria</p>
                  <p className="text-zinc-600 text-sm mb-6 max-w-sm mx-auto">Try lowering thresholds or removing specific requirements to see more building opportunities.</p>
                  <button 
                    onClick={() => setFilters(DEFAULT_FILTERS)} 
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
