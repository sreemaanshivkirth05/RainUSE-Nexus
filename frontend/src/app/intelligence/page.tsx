import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";

export default function IntelligencePage() {
  return (
    <div className="bg-background text-on-background font-body selection:bg-primary-container selection:text-on-primary-container overflow-hidden">
      <TopNav activeLink="/intelligence" />

      {/* Sidebar & Filter Rail */}
      <aside className="fixed left-0 top-0 h-screen mt-20 w-64 glass-panel flex flex-col py-8 z-40 font-headline text-sm tracking-wide uppercase transition-transform duration-400">
        <div className="px-8 mb-8">
          <div className="flex items-center gap-3 text-red-800 mb-1">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              analytics
            </span>
            <span className="font-bold tracking-widest text-xs">Tier 1 Dataset</span>
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-on-surface normal-case">
            Intelligence
          </h2>
        </div>
        <div className="flex flex-col flex-1">
          <Link
            href="#"
            className="flex items-center gap-3 bg-red-50 text-red-800 rounded-l-full pl-6 py-4 border-r-4 border-red-700 transition-transform duration-400"
          >
            <span className="material-symbols-outlined">map</span>
            <span>Map View</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 text-stone-500 pl-6 py-4 hover:bg-stone-50 hover:translate-x-1 transition-all duration-400"
          >
            <span className="material-symbols-outlined">layers</span>
            <span>Data Layers</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 text-stone-500 pl-6 py-4 hover:bg-stone-50 hover:translate-x-1 transition-all duration-400"
          >
            <span className="material-symbols-outlined">water_drop</span>
            <span>Hydrology</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 text-stone-500 pl-6 py-4 hover:bg-stone-50 hover:translate-x-1 transition-all duration-400"
          >
            <span className="material-symbols-outlined">payments</span>
            <span>Economics</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 text-stone-500 pl-6 py-4 hover:bg-stone-50 hover:translate-x-1 transition-all duration-400"
          >
            <span className="material-symbols-outlined">description</span>
            <span>Reports</span>
          </Link>
        </div>
        <div className="px-6 mt-auto">
          <div className="p-4 bg-surface-container-low rounded-lg space-y-4">
            <div>
              <label className="font-label text-[10px] text-stone-400 tracking-widest mb-2 block">
                REGION
              </label>
              <div className="text-on-surface font-bold normal-case">United States</div>
            </div>
            <div>
              <label className="font-label text-[10px] text-stone-400 tracking-widest mb-2 block">
                TYPOLOGY
              </label>
              <div className="text-on-surface font-bold normal-case">
                Industrial / Commercial
              </div>
            </div>
            <button className="w-full bg-primary text-on-primary py-3 font-label text-xs tracking-widest hover:bg-primary-container transition-colors duration-400">
              EXPORT ANALYSIS
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="ml-64 mt-20 h-[calc(100vh-80px)] relative overflow-hidden bg-surface">
        {/* Map Background */}
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover grayscale opacity-40 mix-blend-multiply"
            alt="Topographical map of urban industrial district"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkNs13GTB7XL34Glg5MRzlikCBFhNIH-kgZ8iegO5DxGMfqNn6QE6b4TI1GpeJvCYM5SD47FPVHQkmzUF3y-UH68V6YEKIAFL_4HhO0UEMB-iuoUNoeW92ypSHKPe3cNL5qcKtWdT81Rsd0dk1zJaTQisHM6rpHV6n7e8mUne7M4I6_6HCXOaKjX2bOC-Tj0HABHbzRflPNckcLoSH1aLODlwzO2dLi8ZA3TzSNnCo4s1t5HY1P2dcQO70Ou_B3cDEjHdDGn5HG84"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-transparent" />
        </div>

        {/* Dashboard Overlay */}
        <div className="relative z-10 p-8 grid grid-cols-12 gap-8 h-full">
          {/* Left Panel: Ranking & Insights */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-8 h-full overflow-y-auto pr-4 scrollbar-hide">
            {/* Hero Metric */}
            <div className="bg-surface-container-low p-10 relative overflow-hidden rounded-lg">
              <div className="relative z-10">
                <span className="font-label text-xs tracking-[0.2em] text-red-800 font-bold mb-4 block uppercase">
                  Global Impact Quotient
                </span>
                <h1 className="font-headline text-6xl font-black tracking-tighter text-on-surface mb-2">
                  94.8<span className="text-red-800">/</span>100
                </h1>
                <p className="font-body text-stone-500 max-w-xs leading-relaxed">
                  System-wide efficiency across 1,204 commercial assets in North
                  America.
                </p>
              </div>
              <div className="absolute right-[-10%] top-[-20%] w-64 h-64 bg-red-500/5 blur-[100px] rounded-full" />
            </div>

            {/* Rankings Section */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end mb-2 px-2">
                <h3 className="font-headline text-xl font-bold tracking-tight">
                  Top Performing Assets
                </h3>
                <Link
                  href="/explorer"
                  className="font-label text-[10px] text-red-700 border-b border-red-200 cursor-pointer"
                >
                  VIEW ALL DATA
                </Link>
              </div>

              {/* Ranking Cards */}
              {[
                {
                  rank: "01",
                  name: "Nexus Logistics Hub Alpha",
                  location: "Chicago, IL • 450,000 sq ft",
                  score: "98.2",
                },
                {
                  rank: "02",
                  name: "Harbor Commerce Center",
                  location: "Savannah, GA • 1.2M sq ft",
                  score: "96.5",
                },
                {
                  rank: "03",
                  name: "Summit Data Complex",
                  location: "Denver, CO • 82,000 sq ft",
                  score: "95.1",
                },
              ].map((item) => (
                <Link
                  key={item.rank}
                  href="/buildings/sample-1"
                  className="glass-panel p-6 rounded-lg group hover:bg-white transition-all duration-500 cursor-pointer shadow-sm shadow-stone-100"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <span className="font-label text-stone-300 text-lg font-bold">
                        {item.rank}
                      </span>
                      <div>
                        <h4 className="font-headline font-bold text-on-surface">
                          {item.name}
                        </h4>
                        <p className="font-body text-xs text-stone-500 mt-1">
                          {item.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-800 font-bold font-label">{item.score}</div>
                      <div className="text-[10px] text-stone-400 font-label">AQI INDEX</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Panel: Visual Intelligence */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-8 h-full">
            {/* Asymmetric Data Visualization Grid */}
            <div className="grid grid-cols-2 gap-8 flex-1">
              <div className="bg-surface-container-lowest p-8 rounded-lg relative overflow-hidden group">
                <img
                  className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform duration-700"
                  alt="Modern skyscraper glass facade"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkz6NN3cZzHxD2JZzvZngvLpIxNNOHT_HY04trEULyK-mnf9eTyyOR4qT9UvvtOJnEdWA5NPZtFULRwYXnfc7KWBeSLTPb60WLZsOynLHHBvnSk7rPvT3dRMhAcXXkGW3WKQizRV0Z5RDFHx1ankSXirEcaXuETS7rw5lku8WX42dJvLXkNrDP44VDNS_XaeF2DcAQEYFdKmr3_29xj1O3TQO45-ByMYFl1SuU0tF5QBw0R565dXx6ZIUOIMpm73cHIVOCo3t3Ufo"
                />
                <div className="relative z-10 flex flex-col h-full">
                  <span className="font-label text-[10px] tracking-widest text-stone-400 mb-auto uppercase">
                    Hydraulic Pressure Map
                  </span>
                  <div className="mt-8">
                    <div className="h-2 w-full bg-stone-100 rounded-full mb-4 overflow-hidden">
                      <div className="h-full w-2/3 bg-primary transition-all duration-1000" />
                    </div>
                    <div className="flex justify-between font-label text-[10px] font-bold">
                      <span>PEAK LOAD</span>
                      <span>67% CAPACITY</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary p-8 rounded-lg text-on-primary">
                <span className="font-label text-[10px] tracking-widest opacity-60 mb-8 block uppercase">
                  Climate Resilience Rating
                </span>
                <h3 className="text-4xl font-headline font-black mb-4">A+ Class</h3>
                <p className="font-body text-sm leading-relaxed opacity-80">
                  Infrastructure exceeds 2030 sustainability benchmarks for the
                  Industrial-Standard-IV protocol.
                </p>
                <div className="mt-8 flex gap-4">
                  <span className="material-symbols-outlined text-4xl">shield_with_heart</span>
                  <span className="material-symbols-outlined text-4xl">verified</span>
                </div>
              </div>

              {/* Bottom Wide Bento Card */}
              <div className="col-span-2 bg-surface-container-low p-8 rounded-lg flex gap-12 items-center">
                <div className="flex-1">
                  <h4 className="font-headline font-bold text-xl mb-2">
                    Precipitation Harvesting Projection
                  </h4>
                  <p className="font-body text-sm text-stone-500 leading-relaxed mb-6">
                    Based on historical rainfall data and the latest NWS
                    meteorological models for the 02240 region.
                  </p>
                  <div className="flex gap-12">
                    <div>
                      <div className="font-label text-2xl font-bold text-red-800">4.2M</div>
                      <div className="font-label text-[10px] text-stone-400 uppercase tracking-tighter">
                        GALLONS / ANNUM
                      </div>
                    </div>
                    <div>
                      <div className="font-label text-2xl font-bold text-on-surface">$124K</div>
                      <div className="font-label text-[10px] text-stone-400 uppercase tracking-tighter">
                        PROJECTED SAVINGS
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-48 h-48 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-stone-100 shadow-xl shadow-stone-200/20">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        className="text-stone-100"
                        cx="64"
                        cy="64"
                        fill="transparent"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="8"
                      />
                      <circle
                        className="text-red-700"
                        cx="64"
                        cy="64"
                        fill="transparent"
                        r="60"
                        stroke="currentColor"
                        strokeDasharray="376.99"
                        strokeDashoffset="100"
                        strokeWidth="8"
                      />
                    </svg>
                    <span className="absolute font-headline font-black text-2xl">72%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Summary Footer */}
            <div className="p-6 border-t border-stone-200 flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-t-xl">
              <div className="flex items-center gap-4">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="font-label text-[10px] tracking-widest text-stone-500 uppercase">
                  Live Nexus Stream: Operational
                </span>
              </div>
              <div className="flex gap-8">
                <div className="text-right">
                  <span className="block font-label text-[10px] text-stone-400">LAST SYNC</span>
                  <span className="block font-label text-[10px] font-bold">14:02:55 UTC</span>
                </div>
                <div className="text-right">
                  <span className="block font-label text-[10px] text-stone-400">DATA TIER</span>
                  <span className="block font-label text-[10px] font-bold">PREMIUM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Element */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-400 group">
          <span className="material-symbols-outlined">add</span>
          <div className="absolute right-full mr-4 bg-on-surface text-surface py-2 px-4 rounded text-xs font-label tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            NEW ANALYSIS
          </div>
        </button>
      </div>
    </div>
  );
}
