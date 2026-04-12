import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";

export default function ComparisonPage() {
  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <TopNav activeLink="/comparison" />

      {/* SideNavBar */}
      <aside className="fixed left-0 flex flex-col py-8 z-40 h-[calc(100vh-80px)] mt-20 w-64 bg-white/70 backdrop-blur-2xl tonal-shift">
        <div className="px-6 mb-10">
          <div className="text-stone-400 font-label text-[10px] uppercase tracking-[0.2em] mb-1">
            Geospatial Tier 1
          </div>
          <div className="text-red-800 font-headline font-bold text-lg uppercase tracking-wider">
            Intelligence
          </div>
        </div>
        <nav className="flex flex-col flex-grow">
          {[
            { icon: "map", label: "Map View" },
            { icon: "layers", label: "Data Layers" },
            { icon: "water_drop", label: "Hydrology" },
            { icon: "payments", label: "Economics" },
            { icon: "description", label: "Reports" },
          ].map((item) => (
            <Link
              key={item.label}
              href="#"
              className="flex items-center gap-3 text-stone-500 pl-6 py-3 hover:bg-stone-50 hover:translate-x-1 transition-transform duration-400 font-headline text-sm tracking-wide uppercase"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-6 mt-auto">
          <button className="w-full bg-primary text-on-primary py-3 px-4 font-label text-xs tracking-widest uppercase hover:bg-primary-container transition-colors duration-400">
            Export Analysis
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="ml-64 mt-20 p-12 min-h-screen">
        {/* Header Section */}
        <header className="mb-16">
          <div className="flex items-baseline gap-4 mb-2">
            <span className="font-label text-sm text-primary font-semibold tracking-tighter">
              03 // COMPARATIVE_ANALYTICS
            </span>
          </div>
          <h1 className="text-6xl font-headline font-extrabold text-on-background tracking-tighter leading-none mb-4">
            Industrial Yield <br />
            <span className="text-primary italic">Assessment.</span>
          </h1>
          <p className="max-w-2xl text-on-surface-variant font-body leading-relaxed">
            Strategic side-by-side evaluation of hydraulic efficiency and economic
            viability across Tier 1 industrial assets. Data calibrated for 100-year
            flood event projections.
          </p>
        </header>

        {/* Comparison Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Comparison Card 01 (Winner) */}
          <div className="group relative bg-surface-container-lowest p-px overflow-hidden shadow-2xl shadow-stone-200/40">
            <div className="absolute top-0 right-0 bg-primary text-on-primary px-4 py-1 font-label text-[10px] tracking-[0.2em] uppercase z-10">
              High Efficiency
            </div>
            <div className="bg-surface p-8">
              <div className="aspect-[4/5] mb-8 overflow-hidden relative">
                <img
                  alt="Modern industrial logistics center at twilight"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfVWnpa99CXP0fV_WS3Wb1K2UiOITsITSt7fZif1nRivp4ArJBdeimXz7-k6snKNwyO-3OKwUyK7l0BC4IWO3d0nZU51d_pUhnTsUln2k81-CD2zElgX7nbZFe3mUTt9u7eqy8X8oFzfAVoR8NWoZvCz8q4aPLmKABwzGDGXlQtOs8sMjoAl_NBcamJXcdeOkOxHSBPyjJl4N0UAG2cCbU7gd4U2x3Scw51M-LiyhH_2-SXXvqdWx67Oy7jL677rg1qANL0kaKnJo"
                />
                <div className="absolute bottom-0 left-0 bg-white/90 backdrop-blur-md p-6 w-3/4">
                  <span className="font-label text-[10px] text-stone-500 uppercase tracking-widest block mb-1">
                    Asset ID: 899-X
                  </span>
                  <h3 className="text-2xl font-headline font-bold text-on-background">
                    Apex Logistics Hub
                  </h3>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-surface-container-high pb-4">
                  <div>
                    <span className="font-label text-xs uppercase text-stone-400">
                      Nexus Score
                    </span>
                    <div className="text-4xl font-headline font-black text-primary">94.2</div>
                  </div>
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-4">
                    <span className="font-label text-[10px] uppercase text-stone-500 block mb-1">
                      Hydrology
                    </span>
                    <span className="font-headline font-bold text-lg">High</span>
                  </div>
                  <div className="bg-surface-container-low p-4">
                    <span className="font-label text-[10px] uppercase text-stone-500 block mb-1">
                      ROI Est.
                    </span>
                    <span className="font-headline font-bold text-lg">12.4%</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm font-body">
                    <span className="material-symbols-outlined text-primary text-sm">
                      check_circle
                    </span>
                    <span>Advanced catchment optimization</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-body">
                    <span className="material-symbols-outlined text-primary text-sm">
                      check_circle
                    </span>
                    <span>Zero-runoff substrate integration</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Comparison Card 02 */}
          <div className="group relative bg-surface-container-lowest p-px overflow-hidden shadow-xl shadow-stone-200/20 mt-12">
            <div className="bg-surface p-8">
              <div className="aspect-[4/5] mb-8 overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-700">
                <img
                  alt="Large concrete industrial warehouse"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIXZpZz62RxMTj9VU4G12vNgBK4HmVaxcZTGRBZP8ahaByzh8dGmZ0xBBscuTYg5cCGFhJfdq6mtBIfJx5JdU9n-pz84Ypqa9_RrW6cwAQwZQrkXjsHt_5EWkUWWUuvjWQmm3Qi0_-_ENE_vR7CNOFXRETDlhHXZ1o7zUzle_GV5dCV_UdOKak3d8TOeFvSh2fh_rxjcnG0_sv0iJONZxfT1vTDnfji0XTjAZW_wf0QDGSR3qwSTzpYDX9Pjh3neBRHOoVz6MVin4"
                />
                <div className="absolute bottom-0 left-0 bg-white/90 backdrop-blur-md p-6 w-3/4">
                  <span className="font-label text-[10px] text-stone-500 uppercase tracking-widest block mb-1">
                    Asset ID: 412-K
                  </span>
                  <h3 className="text-2xl font-headline font-bold text-on-background">
                    North Delta Yard
                  </h3>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-surface-container-high pb-4">
                  <div>
                    <span className="font-label text-xs uppercase text-stone-400">
                      Nexus Score
                    </span>
                    <div className="text-4xl font-headline font-black text-stone-300">71.8</div>
                  </div>
                  <span className="text-error font-label text-xs font-bold">-22.4 pts</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-4">
                    <span className="font-label text-[10px] uppercase text-stone-500 block mb-1">
                      Hydrology
                    </span>
                    <span className="font-headline font-bold text-lg">Mid</span>
                  </div>
                  <div className="bg-surface-container-low p-4">
                    <span className="font-label text-[10px] uppercase text-stone-500 block mb-1">
                      ROI Est.
                    </span>
                    <span className="font-headline font-bold text-lg">8.1%</span>
                  </div>
                </div>
                <ul className="space-y-3 opacity-60">
                  <li className="flex items-center gap-3 text-sm font-body">
                    <span className="material-symbols-outlined text-stone-400 text-sm">
                      warning
                    </span>
                    <span>Standard drainage infrastructure</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-body">
                    <span className="material-symbols-outlined text-stone-400 text-sm">
                      warning
                    </span>
                    <span>Permeability deficit (14%)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Comparison Card 03 (Asymmetric Detail) */}
          <div className="lg:pt-24">
            <div className="bg-primary-container p-8 text-on-primary-container relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.15)_1px,_transparent_0)] bg-[size:20px_20px]" />
              <h4 className="font-headline font-extrabold text-3xl mb-4 tracking-tighter">
                Strategic Gap Analysis
              </h4>
              <p className="font-body text-sm mb-8 opacity-80 leading-relaxed">
                Comparing Apex vs. North Delta reveals a significant $2.4M
                divergence in 10-year maintenance overhead due to stormwater
                mismanagement in the latter.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-black/10 p-4">
                  <span className="font-label text-[10px] uppercase tracking-widest">
                    Efficiency Delta
                  </span>
                  <span className="font-headline font-bold">+31.2%</span>
                </div>
                <div className="flex justify-between items-center bg-black/10 p-4">
                  <span className="font-label text-[10px] uppercase tracking-widest">
                    Carbon Offset
                  </span>
                  <span className="font-headline font-bold">144 Tonnes</span>
                </div>
              </div>
              <button className="mt-12 group/btn flex items-center gap-4 font-label text-xs uppercase tracking-widest">
                Download Full Matrix
                <span className="material-symbols-outlined group-hover/btn:translate-x-2 transition-transform">
                  arrow_right_alt
                </span>
              </button>
            </div>

            {/* Secondary Data Block */}
            <div className="mt-8 p-8 bg-surface-container-low border-l-4 border-primary">
              <span className="font-label text-[10px] text-stone-500 uppercase tracking-widest block mb-4">
                Live Satellite Overlay
              </span>
              <div className="aspect-video bg-surface-container overflow-hidden">
                <img
                  alt="Satellite imagery of industrial district"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhgvNQD-tg5-X2VtMj6bQd_nJZ6Ua5DEvo9wWqA1hube1MzorC8Me1LrefsIqgSQBqEtBj7eBTbbVReqc6lAqWRHcW5txJLvlaXUJvX9ulyhhokzrpplWusEnmFAHJdeyuXL7gzd1R9lvaQfIymUQHawwPKoGyb9l_Bwnab5pEbutOwRNMFabpUlSV_ulM6xaSwxvSBstwPEVyuKhOTMf3NrlwRsIdkpptyJ2ZPkOVqxhxyJUK2ixaka5ts0xBGqnqOus8e_aFiUI"
                />
              </div>
              <p className="text-xs font-body mt-4 text-stone-600 leading-relaxed italic">
                &ldquo;Apex Logistics Hub demonstrates superior topography
                integration.&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 bg-surface-container-high p-10 flex flex-col justify-between h-64">
            <span className="font-label text-[10px] text-stone-500 uppercase tracking-widest">
              Total Asset Value Under Review
            </span>
            <div>
              <h2 className="text-5xl font-headline font-black text-on-background">$1.4B</h2>
              <p className="text-primary font-label text-xs uppercase mt-2 tracking-widest">
                +4.2% YOY GROWTH
              </p>
            </div>
          </div>
          <div className="bg-secondary p-10 flex flex-col justify-between h-64 text-on-secondary">
            <span className="material-symbols-outlined text-4xl">water_damage</span>
            <div>
              <span className="font-headline font-bold text-3xl">98%</span>
              <p className="font-label text-[10px] uppercase mt-2 opacity-70">
                Risk Mitigation Score
              </p>
            </div>
          </div>
          <div className="bg-white p-10 flex flex-col justify-between h-64 border border-surface-container-highest">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-white bg-stone-200" />
              <div className="w-10 h-10 rounded-full border-2 border-white bg-stone-300" />
              <div className="w-10 h-10 rounded-full border-2 border-white bg-stone-400" />
            </div>
            <div>
              <span className="font-headline font-bold text-3xl text-on-background">12</span>
              <p className="font-label text-[10px] uppercase text-stone-500 mt-2">
                Active Analysts
              </p>
            </div>
          </div>
        </section>

        {/* Footer Metadata */}
        <footer className="mt-32 pt-12 border-t border-surface-container-highest flex flex-col md:flex-row justify-between items-start gap-8 opacity-40 hover:opacity-100 transition-opacity duration-700">
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest">
              RainUSE Nexus // Global Intelligence Unit
            </p>
            <p className="font-body text-xs mt-2">
              v4.2.0-Alpha Build. Proprietary geospatial data. &copy; 2024
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="font-label text-[10px] uppercase tracking-widest mb-2">Standards</p>
              <p className="text-xs font-body">ISO 14001:2015 Compliant</p>
              <p className="text-xs font-body">LEED Platinum Standard</p>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase tracking-widest mb-2">Legal</p>
              <p className="text-xs font-body">Privacy Protocol</p>
              <p className="text-xs font-body">Terms of Service</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
