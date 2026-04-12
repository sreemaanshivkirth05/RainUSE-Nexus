import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { getScoreColor } from '../utils/formatters';
import CountUp from '../components/CountUp';
import { fetchBuilding, fetchBuildings } from '../lib/api';

export default function Compare() {
  const [searchParams] = useSearchParams();
  const [analyzed, setAnalyzed] = useState(false);
  
  const [bldg1, setBldg1] = useState(null);
  const [bldg2, setBldg2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadComparisons() {
      setLoading(true);
      setError(null);
      try {
        const id1 = searchParams.get('id1');
        const id2 = searchParams.get('id2');

        if (id1 && id2) {
          const [res1, res2] = await Promise.all([
            fetchBuilding(id1).catch(() => null),
            fetchBuilding(id2).catch(() => null)
          ]);
          if (res1 && res2) {
            setBldg1(res1);
            setBldg2(res2);
          } else {
             setError("One or both requested building IDs could not be found.");
          }
        } else {
          // Default: load top 2 overall ranking buildings
          const data = await fetchBuildings('sort_by=final_viability_score&sort_order=desc&page_size=2');
          if (data.buildings && data.buildings.length >= 2) {
            setBldg1(data.buildings[0]);
            setBldg2(data.buildings[1]);
          } else {
            setError("Not enough data available to run simulation.");
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load buildings for comparison");
      } finally {
        setLoading(false);
      }
    }
    loadComparisons();
  }, [searchParams]);

  if (loading) {
    return (
      <PageWrapper className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        <div className="text-zinc-500 text-sm">Gathering comparative analytics...</div>
      </PageWrapper>
    );
  }

  if (error || !bldg1 || !bldg2) {
    return (
      <PageWrapper className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-400 mb-2">Error</div>
        <div className="text-center text-zinc-400">{error || "Failed to load building data"}</div>
      </PageWrapper>
    );
  }

  const s1 = parseFloat(bldg1.final_viability_score);
  const s2 = parseFloat(bldg2.final_viability_score);
  const winnerId = s1 > s2 ? bldg1.id : bldg2.id;

  const renderMetricBar = (label, val1, val2, format = (v) => v) => {
    const num1 = parseFloat(val1);
    const num2 = parseFloat(val2);
    const maxVal = Math.max(num1, num2) || 1; // avoid divide by zero
    
    return (
      <div className="mb-6 relative">
        <h4 className="text-sm text-gray-500 mb-3 text-center">{label}</h4>
        <div className="flex justify-center items-center relative h-3 rounded-full">
           <div className="w-1/2 flex justify-end pr-1">
             <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${(num1 / maxVal) * 100}%` }} 
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-3 bg-blue-500 rounded-l-full" 
             />
           </div>
           <div className="w-px h-6 bg-gray-700 z-10 shrink-0" />
           <div className="w-1/2 flex justify-start pl-1">
             <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${(num2 / maxVal) * 100}%` }} 
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-3 bg-emerald-500 rounded-r-full" 
             />
           </div>
        </div>
        <div className="flex justify-between mt-2 text-xs font-bold font-mono px-4">
           <span className="text-blue-400">{format(num1)}</span>
           <span className="text-emerald-400">{format(num2)}</span>
        </div>
      </div>
    );
  };

  const renderCard = (building, isWinner, isLoser) => {
    const score = parseFloat(building.final_viability_score);
    return (
      <motion.div
        layout
        className={`p-8 rounded bg-zinc-900/30 border relative transition-all duration-700
          ${isWinner ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.05)] bg-[#09090b] scale-[1.02] z-10' : 'border-white/5'}
          ${isLoser ? 'opacity-30 scale-[0.98] grayscale' : ''}
        `}
      >
        {isWinner && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase rounded tracking-widest backdrop-blur-md"
          >
            Match Winner
          </motion.div>
        )}
        <h2 className="text-2xl font-display font-medium text-zinc-100">{building.name}</h2>
        <p className="text-zinc-500 text-sm mb-6">{building.city}, {building.state}</p>
        
        <div className="flex justify-between items-end border-b border-white/5 pb-6 mb-6">
           <div>
             <div className="text-[10px] uppercase tracking-widest font-mono text-zinc-600 mb-1">Viability Match</div>
             <div className={`text-5xl font-display font-medium ${getScoreColor(score/100)}`}>
               <CountUp to={score} duration={1.5} />
             </div>
           </div>
        </div>
        
        <div className="space-y-4">
           <div className="text-sm text-zinc-400 leading-relaxed italic border-l block border-emerald-500/30 pl-4 py-2 bg-zinc-900/50">
             "{building.explanation || 'No descriptive analysis available for this asset.'}"
           </div>
        </div>
      </motion.div>
    );
  };

  return (
    <PageWrapper className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-white/5 pb-8 mt-4">
         <div>
            <h1 className="text-4xl font-display font-medium text-white mb-2 tracking-tight">Build Scenario Analysis</h1>
            <p className="text-zinc-500">Algorithmically evaluating technical and economic viability metrics side-by-side.</p>
         </div>
         <button 
            onClick={() => setAnalyzed(!analyzed)}
            className={`px-8 py-3 rounded font-medium transition-all text-sm border ${analyzed ? 'bg-zinc-900 text-zinc-300 border-white/5' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'}`}
         >
            {analyzed ? 'Reset Simulation' : 'Run Match Simulation'}
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start relative px-4">
         <div className="absolute left-1/2 -translate-x-1/2 top-20 bottom-0 w-px bg-white/5 hidden lg:block" />
         
         {renderCard(bldg1, analyzed && bldg1.id === winnerId, analyzed && bldg1.id !== winnerId)}
         {renderCard(bldg2, analyzed && bldg2.id === winnerId, analyzed && bldg2.id !== winnerId)}
      </div>

      <motion.div 
        layout
        className="mt-16 p-6 md:p-10 rounded border border-white/5 bg-zinc-900/30"
      >
        <h3 className="font-display font-medium text-xl text-center mb-10 text-zinc-300 tracking-wide uppercase">Head-to-Head Methodology Metrics</h3>
        <div className="max-w-4xl mx-auto space-y-6">
           {renderMetricBar('Roof Area Capability (sqft)', bldg1.roof_area_sqft, bldg2.roof_area_sqft, (v) => v.toLocaleString())}
           {renderMetricBar('HVAC Cooling Demand Density', bldg1.cooling_tower_score, bldg2.cooling_tower_score, (v) => (v*100).toFixed(0)+'%')}
           {renderMetricBar('NOAA Annual Precipitation (inches)', bldg1.annual_rain_inches, bldg2.annual_rain_inches, (v) => v.toFixed(1))}
           {renderMetricBar('Water Utility Cost Competitiveness', bldg1.water_cost_score, bldg2.water_cost_score, (v) => (v*100).toFixed(0)+'%')}
           {renderMetricBar('FEMA Flood Resilience Risk', bldg1.flood_score, bldg2.flood_score, (v) => (v*100).toFixed(0)+'%')}
        </div>
      </motion.div>
    </PageWrapper>
  );
}
