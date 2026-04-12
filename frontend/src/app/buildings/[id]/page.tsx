import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";

export default function ProspectDetailPage() {
  return (
    <div className="bg-surface font-body text-on-surface overflow-x-hidden">
      <TopNav activeLink="/intelligence" />

      <main className="pt-24 pb-20 px-8 max-w-[1600px] mx-auto">
        {/* Breadcrumb & Back Action */}
        <div className="mb-12 flex items-center gap-4 text-stone-500">
          <Link href="/intelligence" className="flex items-center gap-4 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="font-label text-sm uppercase tracking-widest">
              Back to Regional Map
            </span>
          </Link>
          <span className="h-px w-12 bg-outline-variant/30" />
          <span className="font-label text-sm uppercase tracking-widest text-primary/60">
            Asset Analysis / 8829-01
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Hero Data Block (Left) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Main Header Card */}
            <section className="bg-surface-container-low p-12 relative overflow-hidden flex flex-col justify-between min-h-[500px]">
              <div className="relative z-10">
                <span className="font-label text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 block">
                  Primary Prospect
                </span>
                <h1 className="font-headline text-6xl md:text-7xl font-black tracking-tighter text-on-surface leading-[0.9] max-w-xl">
                  Zenith Industrial Hub
                </h1>
                <p className="mt-6 text-xl text-on-surface-variant font-light max-w-md border-l-2 border-primary/20 pl-6">
                  Tier 1 Commercial Infrastructure located in the South-East
                  Hydrology Corridor. Optimal catchment profile for
                  industrial-scale rainwater harvesting.
                </p>
              </div>
              <div className="mt-12 flex items-baseline gap-2">
                <span className="font-label text-sm uppercase text-stone-500">
                  Asset Identity:
                </span>
                <span className="font-label text-sm font-bold">TX-77002-ZENITH</span>
              </div>
              {/* Giant Viability Score Overlay */}
              <div className="absolute top-0 right-0 h-full w-1/3 flex flex-col justify-center items-center bg-primary-container text-on-primary p-8 text-center">
                <span className="font-label text-xs uppercase tracking-[0.3em] opacity-80 mb-2">
                  Viability Index
                </span>
                <div className="font-headline text-[10rem] font-extrabold tracking-tighter leading-none">
                  94
                </div>
                <div className="mt-4 flex flex-col items-center">
                  <span className="font-label text-sm uppercase tracking-widest mb-1">
                    Score: Platinum
                  </span>
                  <div className="h-1 w-24 bg-on-primary/30 relative">
                    <div className="absolute left-0 top-0 h-full w-[94%] bg-white" />
                  </div>
                </div>
              </div>
            </section>

            {/* Data Visual Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Rooftop Evidence Block */}
              <div className="bg-surface-container-lowest p-8 editorial-shadow">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="font-headline text-2xl font-bold tracking-tight">
                      Rooftop Analysis
                    </h3>
                    <p className="text-sm text-stone-500 font-label uppercase mt-1">
                      Satellite Verified Surface
                    </p>
                  </div>
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                </div>
                <div className="relative h-64 w-full bg-stone-100 overflow-hidden">
                  <img
                    className="w-full h-full object-cover grayscale brightness-110 contrast-125"
                    alt="Satellite top-down view of industrial warehouse roof"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCByUKPrYa5zFOQ7ULthlajLUvFTKaaGeJrrJSjrgwCWQgFJg0D_t5IRAkcQjxflhHDtqP9114XnmIRfk17p-bZFxvNO87kIerH99GRZ_i3TiP7C6bnFfFbqcJSArVcyRyQMrYrLmnb9S7yypQ_EhC1pRmsBYOw9U9kzxFyP04-13O9iWWEIJTsT5mRBg4JnjkukDArjAEdgYyeVNyDSeXBPEZ7yGDPnkXDRIQl5eYP7bGorGQHUFRclV2VUf9SRr2sh3CSdwxy69s"
                  />
                  <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border border-white/40 w-[80%] h-[80%] flex flex-col items-center justify-center">
                      <div className="bg-white/90 px-4 py-2 font-label text-[10px] tracking-widest uppercase text-primary font-bold">
                        242,000 SQ FT CATCHMENT
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-between items-end">
                  <div>
                    <span className="block font-label text-[10px] uppercase text-stone-400">
                      Surface Type
                    </span>
                    <span className="font-medium">EPDM Membrane</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-label text-[10px] uppercase text-stone-400">
                      Slope Gradient
                    </span>
                    <span className="font-medium">0.5° (Optimal)</span>
                  </div>
                </div>
              </div>

              {/* Confidence & Metrics */}
              <div className="bg-surface-container-lowest p-8 editorial-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-headline text-2xl font-bold tracking-tight">
                      Confidence Score
                    </h3>
                    <span className="font-label text-xl font-bold text-secondary">98.2%</span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-light leading-relaxed">
                    Our Nexus Engine correlates multi-source satellite imagery
                    with local rainfall history (20-year span) to guarantee
                    harvesting potential.
                  </p>
                </div>
                <div className="space-y-6 mt-12">
                  <div>
                    <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">
                      <span>Signal Quality</span>
                      <span>Superior</span>
                    </div>
                    <div className="h-[2px] w-full bg-stone-100">
                      <div className="h-full w-[98%] bg-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">
                      <span>Historical Variance</span>
                      <span>Minimal</span>
                    </div>
                    <div className="h-[2px] w-full bg-stone-100">
                      <div className="h-full w-[12%] bg-primary" />
                    </div>
                  </div>
                </div>
                <div className="mt-10 bg-surface-container-low p-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-sm">
                      analytics
                    </span>
                    <span className="font-label text-[11px] uppercase font-bold tracking-wider">
                      Analysis complete: 04.22.24
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financials / Sidebar (Right) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Gallons & Savings Card */}
            <div className="bg-primary text-on-primary p-10 flex flex-col justify-between min-h-[400px]">
              <div>
                <span className="font-label text-xs uppercase tracking-[0.3em] text-on-primary/60 mb-6 block">
                  Estimated Yield
                </span>
                <div className="mb-12">
                  <h2 className="font-headline text-6xl font-extrabold tracking-tighter">
                    4.2M
                  </h2>
                  <p className="font-label text-sm uppercase tracking-widest text-on-primary/80">
                    Annual Gallons Harvested
                  </p>
                </div>
                <div className="h-px w-full bg-on-primary/20 mb-12" />
                <div>
                  <h2 className="font-headline text-5xl font-extrabold tracking-tighter text-on-primary/90">
                    $142,500
                  </h2>
                  <p className="font-label text-sm uppercase tracking-widest text-on-primary/80">
                    Estimated Yearly Opex Savings
                  </p>
                </div>
              </div>
              <button className="w-full bg-on-primary text-primary font-label text-xs font-bold uppercase tracking-[0.2em] py-5 mt-12 hover:bg-primary-fixed transition-colors duration-400">
                Generate Full Prospectus
              </button>
            </div>

            {/* Technical Attributes List */}
            <div className="bg-surface-container-low p-8">
              <h4 className="font-label text-xs font-bold text-stone-400 uppercase tracking-widest mb-8">
                Technical Attributes
              </h4>
              <ul className="space-y-4">
                {[
                  { num: "01", label: "Geo-Coordinates", value: "29.7604° N, 95.3698° W" },
                  { num: "02", label: "Local Water Rate", value: "$6.42 / kGal" },
                  { num: "03", label: "Precipitation Avg", value: "49.8 in / yr" },
                  { num: "04", label: "Storage Capacity", value: "250,000 Gallons" },
                  { num: "05", label: "ROI Horizon", value: "3.2 Years" },
                ].map((attr, i, arr) => (
                  <li
                    key={attr.num}
                    className={`flex justify-between items-center py-3 ${
                      i < arr.length - 1 ? "border-b border-stone-200/50" : ""
                    }`}
                  >
                    <span className="font-label text-[11px] uppercase text-stone-500 font-bold">
                      {attr.num} / {attr.label}
                    </span>
                    <span className="font-mono text-sm">{attr.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Asset Map Preview */}
            <div className="bg-white p-2 editorial-shadow aspect-square relative group cursor-crosshair">
              <img
                className="w-full h-full object-cover"
                alt="Urban street map with data overlays"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgB85fLBaUpEuatkzUnVT05U_dBVHuoeHXi06BtW5hJ_30ePxLHhDIVeU50JboCnqgprTrxaC9LclGEzt10KUpeVjFQsFGaE6WB-Pp-RcA_WDXj4JK8F0OqNZUTdUMmyYZwRUkNQDQPDc1iu7toEkvMWhv7zmGFtTPzBcIGlJcxY_zMVGw6Z8LxDcpHxx4psDF9dEPvvn9pCpUOwXVUw9boS8DYWiGO3VfFv_DIx6Q8-IWBubQaqpvd5aDPyuJo_cnGD9ncf16wGs"
              />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center">
                <span className="bg-white px-4 py-2 font-label text-[10px] uppercase font-bold tracking-widest text-primary">
                  Expand Map Intelligence
                </span>
              </div>
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 max-w-[200px]">
                <span className="font-label text-[9px] uppercase tracking-widest text-stone-400 block mb-1">
                  Catchment Focus
                </span>
                <p className="text-xs font-bold leading-tight">
                  North Sector Drainage Convergence
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Section: Comparison */}
        <section className="mt-24">
          <div className="flex items-end justify-between mb-12">
            <h2 className="font-headline text-4xl font-bold tracking-tight">
              Market Benchmarking
            </h2>
            <Link
              href="/comparison"
              className="font-label text-sm font-bold text-primary border-b border-primary pb-1"
            >
              View Local Portfolio
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Comparison Item 1 */}
            <div className="bg-surface-container-low group overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                  alt="Modern logistics center at dusk"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1ocQ7wmQq8aHDnu6R5kr2Bh49Scs1My4AWaxUaCJTR6nDweuLWpM0RwL8d8XoyFpsn6YDUMfMEeKQGbDoUp5K6nbaJb838oh5x8hin_Hyc0AiR3Dwv84L367_lSNbt9bZOobSFfPG_2BOb5z0mQFdHHzvujGBqhiG4shdmYCvmzpXBnKZ5a-gG6QgPFsje8_JuGEBue5SkdZifxUevZnXRf8y0HMgSimQGiSm4I704GG9RQj5p0fKE7ZN510epnSnZXvHGpnRMyc"
                />
              </div>
              <div className="p-8">
                <span className="font-label text-[10px] uppercase tracking-widest text-stone-500">
                  Nearest Comparable
                </span>
                <h4 className="font-headline text-xl font-bold mt-2">
                  Omega Distribution
                </h4>
                <div className="mt-6 flex justify-between items-end">
                  <div>
                    <span className="block font-label text-[10px] text-stone-400 uppercase">
                      Yield
                    </span>
                    <span className="font-bold">3.1M Gallons</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-label text-[10px] text-stone-400 uppercase">
                      Index
                    </span>
                    <span className="font-bold text-primary">82</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Item 2 */}
            <div className="bg-surface-container-low group overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                  alt="Industrial complex with high-tech roofing"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHh2I0v9oMdjiKVh8igNSeSLiCsDjlJEgTtNrpg8uZLCTcoXVungbTQSgzgNpWHNH-LHG8dFFxwu71jV6wX0ljfuVXBh6omhx8noVaITl2ekcKLrjKiqgWnutBDYZDlqhrt6dFZauKkZ1Osc56DZertBeQGxM0kUvZUoWlQGhOeM302LVAOSeKRghcfOOvPjx6k5NSbNGQc_1wCbLFp9m92x4TGFWKGSuay1TDXUWhYo9aSm4WVDAAqSfhTgi-FKigvB9rhTCNUnc"
                />
              </div>
              <div className="p-8">
                <span className="font-label text-[10px] uppercase tracking-widest text-stone-500">
                  Sub-Regional Avg
                </span>
                <h4 className="font-headline text-xl font-bold mt-2">
                  Commercial Sector B
                </h4>
                <div className="mt-6 flex justify-between items-end">
                  <div>
                    <span className="block font-label text-[10px] text-stone-400 uppercase">
                      Yield
                    </span>
                    <span className="font-bold">1.8M Gallons</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-label text-[10px] text-stone-400 uppercase">
                      Index
                    </span>
                    <span className="font-bold text-stone-400">64</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action Card */}
            <div className="bg-surface-container-highest p-8 flex flex-col justify-center border border-dashed border-outline-variant/30">
              <h4 className="font-headline text-2xl font-bold tracking-tight text-on-surface mb-4 leading-tight">
                Identify neighboring opportunities
              </h4>
              <p className="text-sm font-light text-on-surface-variant mb-8">
                Run the comparative engine to see which assets in your portfolio
                qualify for Tier 1 harvesting status.
              </p>
              <Link
                href="/comparison"
                className="self-start flex items-center gap-2 font-label text-xs font-bold uppercase tracking-widest text-primary"
              >
                Start Batch Analysis{" "}
                <span className="material-symbols-outlined text-sm">trending_up</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer className="bg-white border-t border-stone-100 py-12 px-8 mt-20">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <span className="text-lg font-black uppercase tracking-tighter text-red-900 block mb-2">
              RainUSE Nexus
            </span>
            <p className="font-label text-[11px] uppercase tracking-widest text-stone-400">
              Proprietary Intelligent Water Management Infrastructure &copy; 2024
            </p>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-2">
              <span className="font-label text-[10px] uppercase font-bold text-stone-800">
                Intelligence Tier
              </span>
              <span className="font-label text-xs text-stone-500">
                Enterprise / Global Access
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-label text-[10px] uppercase font-bold text-stone-800">
                Engine Status
              </span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="font-label text-xs text-stone-500">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
