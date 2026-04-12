import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, FileText, Layers, Repeat, Eye, HardHat, Loader2 } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { getScoreClass, formatGallons, formatSqft, formatRainfall } from '../utils/formatters';
import OpportunityBadge from '../components/buildings/OpportunityBadge';
import ScoreBreakdown from '../components/buildings/ScoreBreakdown';
import CountUp from '../components/CountUp';
import { FEATURE_GROUPS } from '../utils/constants';
import { fetchBuilding } from '../lib/api';

export default function BuildingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBuilding() {
       setLoading(true);
       try {
         const data = await fetchBuilding(id);
         setBuilding(data);
       } catch (err) {
         setError(err.message || 'Building Not Found');
       } finally {
         setLoading(false);
       }
    }
    loadBuilding();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-32 flex flex-col items-center">
         <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
         <p className="text-zinc-500">Loading building datums...</p>
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h2 className="text-2xl text-gray-200 font-display mb-4">{error || "Building Not Found"}</h2>
        <p className="text-gray-500 mb-6">The building ID {id} does not exist or failed to load.</p>
        <button onClick={() => navigate('/buildings')} className="px-5 py-2 bg-emerald-600 rounded-lg text-white">Return to Explorer</button>
      </div>
    );
  }

  return (
    <PageWrapper className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500 gap-2 mb-2">
        <Link to="/buildings" className="hover:text-gray-300">Building Explorer</Link>
        <span>/</span>
        <span className="text-gray-200 truncate">{building.name}</span>
      </nav>

      {/* Header Context */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-800/60">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
             <OpportunityBadge type={building.opportunity_type} />
             {parseFloat(building.final_viability_score) >= 70 && (
               <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
                 <span className="text-amber-500 text-base">★</span> High Priority Prospect
               </span>
             )}
          </div>
          <h1 className="font-display text-4xl font-medium text-white mb-2">
            {building.name}
          </h1>
          <p className="text-zinc-500 text-lg flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {building.city}, {building.state}
            {building.latitude && building.longitude && (
              <span className="text-zinc-600 text-xs font-mono ml-2 block sm:inline">[{Number(building.latitude).toFixed(4)}, {Number(building.longitude).toFixed(4)}]</span>
            )}
          </p>
        </div>
        
        <div className="flex-shrink-0 flex items-center gap-6 bg-zinc-900 border border-white/5 p-4 rounded">
          <div className="text-right hidden sm:block">
             <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-1">Rank</div>
             <div className="text-sm font-medium text-zinc-300">Top 5%</div>
          </div>
          <div className="w-px h-12 bg-white/5 hidden sm:block"></div>
          <div className="text-right">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-1">Viability Match</div>
            <div className={`text-5xl font-display font-medium text-zinc-100 flex items-center justify-end`}>
              <CountUp to={parseFloat(building.final_viability_score)} duration={2} />
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

      {/* Executive Summary */}
      <section className="p-6 md:p-8 rounded bg-zinc-900/30 border border-white/5 border-l-2 border-l-emerald-500">
        <h3 className="text-lg font-medium text-zinc-100 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-500" /> Executive Recommendation
        </h3>
        <p className="text-zinc-400 leading-relaxed text-base">
          {building.explanation || "No deep executive analysis available for this property currently."}
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Data Snapshots */}
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

          {building.visual_notes && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="p-6 rounded bg-zinc-900 border border-white/5 border-dashed"
            >
              <h3 className="font-display font-medium text-zinc-300 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500/50" /> Visual Assessment Notes
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed italic border-l-2 border-zinc-700 pl-3">
                {building.visual_notes}
              </p>
            </motion.div>
          )}

          <div className="p-6 rounded bg-zinc-900 border border-white/5 text-sm">
             <h3 className="font-display font-medium text-zinc-300 mb-4 flex items-center gap-2 tracking-wide">
               <Repeat className="w-4 h-4 text-cyan-500" /> Reuse Pathways
             </h3>
             <ul className="space-y-3">
                {parseFloat(building.cooling_tower_score) > 0.6 && (
                  <li className="flex gap-3 text-zinc-400">
                    <span className="text-cyan-500 mt-0.5 opacity-60">↳</span> Cooling tower makeup substitution
                  </li>
                )}
                {parseFloat(building.esg_score) > 0.6 && (
                  <li className="flex gap-3 text-zinc-400">
                    <span className="text-cyan-500 mt-0.5 opacity-60">↳</span> Non-potable flush fixtures (ESG driven)
                  </li>
                )}
                {parseFloat(building.roof_area_sqft) > 150000 && (
                  <li className="flex gap-3 text-zinc-400">
                    <span className="text-cyan-500 mt-0.5 opacity-60">↳</span> Industrial process washing/irrigation
                  </li>
                )}
                {/* Fallback */}
                {parseFloat(building.cooling_tower_score) <= 0.6 && parseFloat(building.roof_area_sqft) <= 150000 && (
                  <li className="flex gap-3 text-zinc-400">
                    <span className="text-cyan-500 mt-0.5 opacity-60">↳</span> Landscape irrigation and general purpose
                  </li>
                )}
             </ul>
          </div>

        </div>

        {/* Right Column: Deep Scores */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* 5 Category Pillar Cards */}
           <div>
             <h3 className="font-display font-medium text-xl text-zinc-200 mb-4 tracking-wide">Pillar Performance</h3>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
               {FEATURE_GROUPS.map(group => {
                 // Calculate an average of the available scores within this group as a proxy for the pillar score
                 const scores = group.features.filter(f => f.format === 'score').map(f => parseFloat(building[f.key]) || 0);
                 const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : (group.id==='physical' ? 0.8 : 0);
                 
                 return (
                   <div key={group.id} className="p-4 rounded border border-white/5 bg-zinc-900/30 flex flex-col items-center text-center">
                     <div className={`text-zinc-500 flex items-center justify-center text-lg mb-3 opacity-60`}>
                       {group.icon}
                     </div>
                     <h4 className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-3 h-8 flex items-center justify-center">{group.label}</h4>
                     <div className="mt-auto pt-3 border-t border-white/5 w-full">
                       <div className={`text-xl font-display font-medium text-zinc-100`}>{Math.round(avg * 100)}%</div>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>

           {/* Detailed table */}
           <div className="p-6 md:p-8 rounded bg-zinc-900/30 border border-white/5">
             <h3 className="font-display font-medium text-xl text-zinc-200 mb-6 tracking-wide">Metric Breakdown</h3>
             <ScoreBreakdown building={building} />
           </div>

        </div>
      </div>
    </PageWrapper>
  );
}
