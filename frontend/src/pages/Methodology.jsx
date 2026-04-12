import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, Target, Settings2, BarChart3, Binary, Scale, Library, Snowflake, Droplets, ShieldAlert, Cpu } from 'lucide-react';
import { FEATURE_GROUPS } from '../utils/constants';
import PageWrapper from '../components/layout/PageWrapper';

gsap.registerPlugin(ScrollTrigger);

/**
 * Methodology — Explains the scoring logic, datasets, and approach
 */
export default function Methodology() {
  const horizontalRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      let panels = gsap.utils.toArray(".horizontal-panel");
      if (horizontalRef.current) {
        gsap.to(panels, {
          xPercent: -100 * (panels.length - 1),
          ease: "none",
          scrollTrigger: {
            trigger: horizontalRef.current,
            pin: true,
            scrub: 1,
            snap: 1 / (panels.length - 1),
            end: () => "+=" + horizontalRef.current.offsetWidth * 1.5
          }
        });
      }
    }, horizontalRef);
    return () => ctx.revert();
  }, []);
  return (
    <PageWrapper className="max-w-7xl mx-auto pb-24 overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-10">
      {/* Page header */}
      <div className="border-b border-white/5 pb-6 mb-8 mt-4">
        <h1 className="font-display text-4xl font-medium text-white flex items-center gap-3 tracking-tight">
          <BookOpen strokeWidth={1} className="w-8 h-8 text-emerald-500" /> Methodology Output
        </h1>
        <p className="text-zinc-500 text-sm mt-2">
          How RainUSE Nexus algorithmically evaluates commercial assets for cooling and catchment capacity.
        </p>
      </div>

      {/* Overview */}
      <section className="p-8 rounded bg-zinc-900/30 border border-white/5">
        <h2 className="font-display text-xl font-medium text-zinc-100 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-500" /> Executive Overview
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">
          Identifying commercial scale water reuse requires collapsing disparate data layers into a singular normalized rank. Each footprint receives a <strong className="text-zinc-200 font-medium">Viability Score (0–100)</strong> derived from physical architecture, hyper-local economic drivers, meteorological statistics, and ESG policy overlays.
        </p>
      </section>

      {/* Horizontal Scrollytelling Section */}
      </div> {/* Close max-w-4xl for full width */}

      <div ref={horizontalRef} className="h-screen w-full flex flex-nowrap overflow-hidden bg-[#09090b] relative border-y border-white/5 my-20">
        {/* Scrollytelling Title Context */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
           <div className="px-4 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-zinc-500 font-mono text-[10px] uppercase tracking-widest inline-block mb-3">The Analysis Pipeline</div>
           <h2 className="font-display text-4xl text-white font-bold opacity-10 tracking-widest uppercase">Engine Architecture</h2>
        </div>

        {/* Panel 1: Imagery */}
        <div className="horizontal-panel w-screen h-screen flex-shrink-0 flex items-center justify-center relative bg-zinc-900/10">
           <div className="max-w-lg p-10 relative z-10 bg-[#09090b] border border-white/5 rounded mx-6">
             <div className="mb-6"><Target strokeWidth={1} size={48} className="text-zinc-600" /></div>
             <h3 className="font-display text-2xl font-medium text-zinc-100 mb-4">1. Raw Imagery Ingestion</h3>
             <p className="text-zinc-500 text-sm leading-relaxed">
                Aggregating high-resolution satellite signals and raw footprint polygons to establish spatial boundaries for over 2.5 million commercial geometries.
             </p>
           </div>
        </div>

        {/* Panel 2: CV */}
        <div className="horizontal-panel w-screen h-screen flex-shrink-0 flex items-center justify-center relative bg-zinc-900/30">
           <div className="max-w-lg p-10 relative z-10 bg-[#09090b] border border-white/5 rounded mx-6">
             <div className="mb-6"><Settings2 strokeWidth={1} size={48} className="text-zinc-600" /></div>
             <h3 className="font-display text-2xl font-medium text-zinc-100 mb-4">2. Computer Vision Assessment</h3>
             <p className="text-zinc-500 text-sm leading-relaxed">
                Custom semantic segmentation pipelines scan rooftops for specific mechanical layouts—explicitly hunting for industrial cooling towers requiring high-volume makeup water.
             </p>
           </div>
        </div>

        {/* Panel 3: Data Fusion */}
        <div className="horizontal-panel w-screen h-screen flex-shrink-0 flex items-center justify-center relative bg-zinc-900/50">
           <div className="max-w-lg p-10 relative z-10 bg-[#09090b] border border-white/5 rounded mx-6">
             <div className="mb-6"><Binary strokeWidth={1} size={48} className="text-zinc-600" /></div>
             <h3 className="font-display text-2xl font-medium text-zinc-100 mb-4">3. Data Fusion</h3>
             <p className="text-zinc-500 text-sm leading-relaxed">
                Spatial dimensions are cross-referenced directly against NOAA precipitation layers, FEMA flood tables, EPA tracking databases, and localized utility price benchmarks.
             </p>
           </div>
        </div>

        {/* Panel 4: Scoring & Viability */}
        <div className="horizontal-panel w-screen h-screen flex-shrink-0 flex items-center justify-center relative bg-emerald-950/10">
           <div className="max-w-lg p-10 relative z-10 bg-[#09090b] border border-emerald-500/20 rounded mx-6">
             <div className="mb-6"><BarChart3 strokeWidth={1} size={48} className="text-emerald-500/50" /></div>
             <h3 className="font-display text-2xl font-medium text-emerald-400 mb-4">4. Deterministic Scoring</h3>
             <p className="text-zinc-500 text-sm leading-relaxed">
                Data is normalized, multiplied by regional weighting coefficients, and confidence-adjusted based on visual fidelity to emit a centralized 0–100 readiness metric.
             </p>
           </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
      {/* Feature Groups */}
      <section className="p-8 rounded bg-zinc-900/30 border border-white/5 mt-12">
        <h2 className="font-display text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-amber-500" /> Assessment Vectors
        </h2>
        <div className="space-y-3">
          {FEATURE_GROUPS.map((group) => (
            <div key={group.id} className="border border-white/5 rounded p-5 bg-zinc-900/40">
              <div className="flex items-center gap-3 mb-4">
                <span className="opacity-60">{group.icon}</span>
                <h3 className={`font-medium text-sm text-zinc-200 uppercase tracking-widest`}>{group.label}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.features.map((f) => (
                  <div key={f.key} className="text-xs font-mono text-zinc-500 flex items-center gap-2">
                    <span className={`w-1 h-1 rounded flex-shrink-0 bg-white/20`} />
                    {f.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scoring formula */}
      <section className="p-8 rounded bg-zinc-900/30 border border-white/5">
        <h2 className="font-display text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
          <Binary className="w-5 h-5 text-violet-500" /> Normalization Math
        </h2>
        <div className="bg-[#09090b] rounded p-6 font-mono text-xs text-zinc-500 leading-relaxed overflow-x-auto border border-white/5">
          <div className="text-zinc-300 mb-3 font-semibold">BASE_SCORE =</div>
          <div className="pl-4 space-y-1">
            <div><span className="text-cyan-500 font-medium">0.12</span> * roof_area_score +</div>
            <div><span className="text-cyan-500 font-medium">0.08</span> * annual_harvest_score +</div>
            <div><span className="text-emerald-500 font-medium">0.12</span> * cooling_tower_score +</div>
            <div><span className="text-emerald-500 font-medium">0.08</span> * water_cost_score +</div>
            <div><span className="text-zinc-400 font-medium tracking-widest">... + 13 additional weighted factors</span></div>
          </div>
        </div>
      </section>

      {/* Confidence adjustment */}
      <section className="glass-card p-8 rounded-2xl">
        <h2 className="font-display text-2xl font-bold text-gray-200 mb-4 flex items-center gap-2">
          <span className="text-orange-400">🎚️</span> Confidence Adjustment
        </h2>
        <p className="text-base text-gray-400 mb-6">
          The final score is adjusted based on the confidence level of cooling tower detection:
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-800/60 bg-gray-900/40">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-900/80 text-gray-300 font-semibold border-b border-gray-800/60">
              <tr>
                <th className="py-3 px-4">Confidence Range</th>
                <th className="py-3 px-4">Multiplier</th>
                <th className="py-3 px-4">Effect</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr className="border-b border-gray-800/40">
                <td className="py-3 px-4">≥ 0.80</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">1.00</td>
                <td className="py-3 px-4 text-gray-300">No adjustment</td>
              </tr>
              <tr className="border-b border-gray-800/40 bg-white/[0.02]">
                <td className="py-3 px-4">0.60 – 0.79</td>
                <td className="py-3 px-4 text-amber-500 font-bold">0.97</td>
                <td className="py-3 px-4 text-gray-300">-3% penalty</td>
              </tr>
              <tr className="border-b border-gray-800/40">
                <td className="py-3 px-4">0.40 – 0.59</td>
                <td className="py-3 px-4 text-orange-500 font-bold">0.93</td>
                <td className="py-3 px-4 text-gray-300">-7% penalty</td>
              </tr>
              <tr>
                <td className="py-3 px-4">{'<'} 0.40</td>
                <td className="py-3 px-4 text-red-500 font-bold">0.88</td>
                <td className="py-3 px-4 text-gray-300">-12% penalty</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6 bg-gray-950 border border-gray-800/60 rounded-xl p-4 font-mono text-sm inline-block text-gray-400">
          <span className="text-gray-100 font-semibold">Final Score</span> = round(Base Score × Confidence Multiplier × 100)
        </div>
      </section>

      {/* Opportunity types */}
      <section className="p-8 rounded bg-zinc-900/30 border border-white/5">
        <h2 className="font-display text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-400" /> Stratification Types
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { type: 'Rainfall-Driven', icon: <Droplets size={16}/>, desc: 'Dominant alignment with high square footage and extreme precipitation bands.', color: 'border-white/5 bg-zinc-900/50' },
            { type: 'Cooling-Demand-Driven', icon: <Snowflake size={16}/>, desc: 'Dominant alignment with industrial heat rejection assets requiring non-potable makeup flow.', color: 'border-white/5 bg-zinc-900/50' },
            { type: 'Resilience-Driven', icon: <ShieldAlert size={16}/>, desc: 'Alignment with flood mitigation efforts and baseline water stress thresholds.', color: 'border-white/5 bg-zinc-900/50' },
            { type: 'Balanced Opportunity', icon: <Scale size={16}/>, desc: 'Composite match across physical, economic, and policy metrics.', color: 'border-white/5 bg-zinc-900/50' },
          ].map((opp) => (
            <div key={opp.type} className={`border ${opp.color} rounded p-5`}>
              <div className="flex items-center gap-3 mb-3 text-zinc-300">
                <span className="opacity-60">{opp.icon}</span>
                <h3 className="font-medium text-sm">{opp.type}</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">{opp.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data sources */}
      <section className="p-8 rounded bg-zinc-900/30 border border-white/5">
        <h2 className="font-display text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
          <Library className="w-5 h-5 text-emerald-500" /> Core Topologies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {[
            'Microsoft U.S. Building Footprints',
            'NOAA U.S. Climate Precipitation Normals',
            'DOE / FEMP Evaporation Metrics',
            'NOAA Cooling Degree Days',
            'FEMA National Risk Index',
            'WRI Aqueduct Risk Layers',
            'EPA ECHO Database',
            'SBTi Target Registries',
          ].map((source) => (
            <div key={source} className="flex items-start gap-3 text-xs text-zinc-500 font-mono bg-zinc-900/40 p-3 rounded border border-white/5 hover:border-white/10 hover:bg-zinc-900/60 transition-colors">
              <span className="text-emerald-500/50 leading-none">●</span>
              <span>{source}</span>
            </div>
          ))}
        </div>
      </section>
      </div>
    </PageWrapper>
  );
}
