import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, MapPin, FlaskConical, SlidersHorizontal, Rocket, Droplets, DollarSign, ShieldCheck, Gauge, ArrowRight } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import USAMap from '../components/USAMap';
import { fetchStates, fetchSummary } from '../lib/api';

/**
 * Landing Page — Introduction, Workflow, and State Selection
 */
export default function Landing() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ states: 0, buildings: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [statesRes, sumRes] = await Promise.all([
          fetchStates(),
          fetchSummary()
        ]);
        setStats({
          states: statesRes.states?.length || 5,
          buildings: sumRes.summary?.total_buildings || 0
        });
      } catch (err) {
        console.error("Failed to load global stats:", err);
      }
    }
    loadStats();
  }, []);

  return (
    <PageWrapper className="pb-24">
      {/* VIBRANT ANIMATED BACKGROUND (ISOLATED TO LANDING) */}
      <div className="fixed inset-0 -z-10 bg-[#060c18] overflow-hidden">
        {/* Dynamic Orbs */}
        <motion.div 
          animate={{ 
            x: [0, 150, -50, 0], 
            y: [0, -100, 50, 0] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-cyan-600/30 rounded-full blur-[130px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -120, 80, 0], 
            y: [0, 150, -80, 0] 
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/20 rounded-full blur-[140px]"
        />
        {/* Noise overlay for texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-24 mt-6">
        
        {/* 1. Hero Section */}
        <section className="relative pt-20 pb-16 min-h-[50vh] flex flex-col items-center justify-center text-center">
          {/* Hero Foreground Text */}
          <div className="relative z-10 space-y-8 max-w-4xl mx-auto px-4 mt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-cyan-200 text-sm font-medium shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              V 1.0 (Live Master Prototype)
            </div>
            
            <h1 className="font-display font-bold text-6xl md:text-8xl tracking-tight leading-[1.1] flex flex-col justify-center items-center drop-shadow-2xl">
              <span className="text-white">Engineered</span>
              <span className="text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">water intelligence.</span>
            </h1>
            
            <p className="text-xl text-indigo-100/70 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Identifying high-potential commercial topologies perfectly situated for localized rainwater capture and HVAC cooling makeup substitution.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <a href="#state-selector" className="px-8 py-3.5 rounded-xl text-sm bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95">
                Start Prospecting
              </a>
              <Link to="/methodology" className="px-8 py-3.5 rounded-xl text-sm bg-white/5 backdrop-blur-lg hover:bg-white/10 text-white font-medium transition-all border border-white/10 hover:border-white/20 shadow-xl">
                Read the Methodology
              </Link>
            </div>
          </div>
        </section>

      {/* 3. Workflow Pipeline — Premium redesign */}
      <section className="relative z-10 px-4">
        <div className="text-center mb-12">
          <span className="text-[10px] tracking-widest font-mono text-cyan-400 font-bold uppercase">How It Works</span>
          <h3 className="font-display font-medium text-3xl text-white mt-2">Execution Pipeline</h3>
        </div>

        <div className="relative flex flex-col md:flex-row items-stretch gap-0">
          {[
            { step: 1, icon: <MapPin className="w-6 h-6" />, color: 'from-cyan-400 to-blue-500', glow: 'rgba(34,211,238,0.4)', title: 'Target Geographies', desc: 'Select high-potential states and isolate specific commercial infrastructure nodes from the regional map.' },
            { step: 2, icon: <FlaskConical className="w-6 h-6" />, color: 'from-blue-400 to-violet-500', glow: 'rgba(99,102,241,0.4)', title: 'Parse Analytics', desc: 'Digest rainfall metrics, roof catchment data, HVAC load estimates and municipal water tariff benchmarks.' },
            { step: 3, icon: <SlidersHorizontal className="w-6 h-6" />, color: 'from-violet-400 to-purple-500', glow: 'rgba(167,139,250,0.4)', title: 'Constrain & Filter', desc: 'Apply ROI thresholds, ESG requirements, and cooling demand filters to isolate the exact top candidates.' },
            { step: 4, icon: <Rocket className="w-6 h-6" />, color: 'from-emerald-400 to-teal-500', glow: 'rgba(52,211,153,0.4)', title: 'Execute Capital', desc: 'Commit resources with confidence. Each candidate arrives with a full viability score and data provenance.' },
          ].map((item, index) => (
            <div key={item.step} className="flex-1 flex flex-col md:flex-row items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="flex-1 p-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl hover:bg-white/[0.07] transition-all duration-300 group cursor-default h-full"
              >
                {/* Glowing Number Badge */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}
                    style={{ boxShadow: `0 0 20px ${item.glow}` }}
                  >
                    {item.icon}
                  </div>
                  <span className="text-5xl font-display font-black text-white/5 leading-none select-none group-hover:text-white/10 transition-colors">0{item.step}</span>
                </div>
                <h4 className="font-bold text-white text-lg mb-3 tracking-tight">{item.title}</h4>
                <p className="text-sm text-indigo-200/50 leading-relaxed">{item.desc}</p>

                {/* Bottom Accent Line */}
                <div className={`mt-6 h-0.5 w-12 bg-gradient-to-r ${item.color} rounded-full opacity-60 group-hover:w-full transition-all duration-700`}></div>
              </motion.div>

              {/* Arrow Connector between steps  */}
              {index < 3 && (
                <div className="hidden md:flex items-center justify-center px-2 flex-shrink-0 text-white/20">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. State Selector */}
      <section id="state-selector" className="space-y-8 pt-16 scroll-mt-20 relative z-10 px-4">
        <div className="text-center">
          <h2 className="font-display font-medium text-4xl text-white drop-shadow-md">Regional Subsystem Mapping</h2>
          <p className="text-indigo-200/70 mt-3 text-sm">
             Aggregating {stats.buildings > 0 ? stats.buildings.toLocaleString() : 'thousands of'} assets across {stats.states > 0 ? stats.states : 'multiple'} active node deployments across the continental layer.
          </p>
        </div>

        {/* Upgraded Frame for US Map */}
        <div className="border border-white/10 bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl relative overflow-hidden ring-1 ring-white/5">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 p-4 md:p-10">
            <USAMap />
          </div>
        </div>
      </section>

      {/* 5. Five Scoring Pillars — Bento Grid layout */}
      <section className="pt-20 relative z-10 px-4 pb-12">
        <div className="flex flex-col items-center justify-center mb-12 gap-2">
          <span className="text-[10px] tracking-widest font-mono text-cyan-400 font-bold uppercase">The 5-Pillar Framework</span>
          <h3 className="text-center font-display font-medium text-3xl text-white">What Drives Every Score</h3>
          <p className="text-indigo-200/50 mt-2 text-sm max-w-lg text-center">Every building is evaluated across five quantitative vectors. Higher composite scores mean higher ROI probability.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 1, title: 'Roof Catchment', pct: '25%', color: 'from-cyan-500 to-blue-600', glow: 'rgba(34,211,238,0.2)', icon: <Droplets className="w-6 h-6 text-cyan-300" />, desc: 'Physical surface area capable of intercepting rainfall. Larger roofs capture more volume.' },
            { id: 2, title: 'Cooling Demand', pct: '25%', color: 'from-blue-500 to-violet-600', glow: 'rgba(99,102,241,0.2)', icon: <Gauge className="w-6 h-6 text-blue-300" />, desc: 'HVAC tower loads that can substitute municipal water with harvested rainwater.' },
            { id: 3, title: 'Water Cost', pct: '20%', color: 'from-emerald-500 to-teal-600', glow: 'rgba(52,211,153,0.2)', icon: <DollarSign className="w-6 h-6 text-emerald-300" />, desc: 'Municipal utility tariff. Higher cost jurisdictions yield faster payback periods.' },
            { id: 4, title: 'Flood Resilience', pct: '15%', color: 'from-indigo-500 to-purple-600', glow: 'rgba(129,140,248,0.2)', icon: <ShieldCheck className="w-6 h-6 text-indigo-300" />, desc: 'Stormwater attenuation capacity providing secondary urban flood mitigation benefit.' },
            { id: 5, title: 'ESG Adoption', pct: '15%', color: 'from-violet-500 to-pink-600', glow: 'rgba(167,139,250,0.2)', icon: <Target className="w-6 h-6 text-violet-300" />, desc: 'Existing LEED/Energy Star certifications signaling institutional sustainability commitments.' },
          ].map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative p-7 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.07] transition-all duration-300 shadow-xl group ${ i === 0 ? 'md:col-span-2' : '' }`}
              style={{ boxShadow: `0 0 40px ${p.glow}` }}
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                  {p.icon}
                </div>
                <span className="text-xs font-mono font-bold text-white/30 bg-white/5 px-2 py-1 rounded-md border border-white/5">{p.pct} weight</span>
              </div>
              <h4 className="font-bold text-xl text-white mb-2 tracking-tight">{p.title}</h4>
              <p className="text-sm leading-relaxed text-indigo-200/50">{p.desc}</p>
              <div className={`mt-5 h-1 w-full bg-white/5 rounded-full overflow-hidden`}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: p.pct }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${p.color} rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
    </PageWrapper>
  );
}
