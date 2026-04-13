import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";

export default function MethodologyPage() {
  return (
    <div className="font-body selection:bg-primary-container selection:text-on-primary-container">
      <TopNav activeLink="/methodology" />

      <div className="flex min-h-screen pt-16">
        {/* SideNavBar */}
        <aside className="fixed left-0 h-[calc(100vh-80px)] mt-20 w-64 bg-white/70 backdrop-blur-2xl flex flex-col py-8 z-40 hidden lg:flex">
          <div className="px-8 mb-10">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
              Methodology
            </p>
            <h3 className="font-headline text-lg font-bold text-on-background">
              System Logic
            </h3>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
            {[
              { href: "#vision", icon: "visibility", label: "Computer Vision" },
              { href: "#imagery", icon: "layers", label: "Remote Sensing" },
              { href: "#scoring", icon: "analytics", label: "Scoring Logic" },
              { href: "#dataset", icon: "database", label: "Dataset Integrity" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 text-stone-500 pl-6 py-3 hover:bg-stone-50 hover:translate-x-1 transition-transform duration-400 font-label text-sm tracking-wide uppercase"
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="px-6 mt-auto">
            <button className="w-full py-4 bg-primary text-on-primary font-label text-xs uppercase tracking-widest font-bold hover:bg-primary-container transition-colors">
              Technical Whitepaper
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 w-full overflow-hidden">
          {/* Hero Section */}
          <section className="min-h-screen flex flex-col justify-center px-8 md:px-20 relative overflow-hidden bg-surface">
            <div className="max-w-5xl z-10">
              <div className="mb-6 inline-block bg-primary text-white px-3 py-1 font-label text-[10px] uppercase tracking-widest">
                Scientific Framework v4.2
              </div>
              <h1 className="text-display-lg font-headline font-black text-on-background mb-8 leading-none">
                How We Quantify <br />
                <span className="text-primary italic">Atmospheric Value</span>
              </h1>
              <p className="max-w-xl text-lg text-on-surface-variant font-body leading-relaxed mb-12">
                RainUSE Nexus leverages hyper-spectral imagery and neural semantic
                segmentation to transform raw meteorological data into actionable
                geospatial intelligence.
              </p>
            </div>
            {/* Floating Decorative Element */}
            <div className="absolute right-[-10%] top-[20%] w-1/2 h-4/5 opacity-20 pointer-events-none">
              <img
                className="w-full h-full object-cover filter grayscale sepia brightness-50"
                alt="Digital planet visualization"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpMPF4xXQ_uDCvvwk5gu_WuI0b5BRPzvFa05oYbZhy2S7sj54CbuXbDnWsM6_DUPn9-Sg6ArZELGVtRHwjud_JJqKXCWcUO13xcXCseapArR-OJvA7jW97myAprFp0qoOewUgs8MQKU2DneUKgRn8IccWFnaCR6RwxMUDosFNeJySh6h2qgVVD0Hyy_VFCp_7EESRqtvzMid2d5im11mqcS0IcDi3yEpSBfxAgp7gGZ48TOwG2OhIjHjYf-PqCYVYH1MUE4UShJxE"
              />
            </div>
            {/* Scroll Indicator */}
            <div className="absolute bottom-12 left-20 flex flex-col items-center gap-4 animate-bounce">
              <span className="font-label text-[10px] uppercase tracking-tighter text-primary">
                Discover Process
              </span>
              <span className="material-symbols-outlined text-primary">expand_more</span>
            </div>
          </section>

          {/* Module 01: Computer Vision */}
          <section
            className="min-h-screen py-32 px-8 md:px-20 bg-surface-container-low"
            id="vision"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 order-2 lg:order-1">
                <span className="font-label text-sm text-primary font-bold mb-4 block">
                  01 / COMPUTER VISION
                </span>
                <h2 className="text-display-md font-headline font-bold text-on-background mb-6">
                  Neural Terrain <br />
                  Classification
                </h2>
                <p className="text-on-surface-variant leading-relaxed mb-8">
                  Our proprietary CNN (Convolutional Neural Network) architecture,{" "}
                  <span className="font-semibold text-primary">Hydra-Net</span>,
                  analyzes surface textures with sub-meter precision to distinguish
                  between permeable and impermeable surfaces.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-surface-container-lowest transition-all hover:translate-x-2 cursor-pointer">
                    <span className="font-label text-primary font-bold">01.1</span>
                    <span className="font-headline font-semibold">
                      Semantic Segmentation
                    </span>
                    <span className="material-symbols-outlined ml-auto text-primary">
                      arrow_forward
                    </span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-surface-container-lowest transition-all hover:translate-x-2 cursor-pointer">
                    <span className="font-label text-primary font-bold">01.2</span>
                    <span className="font-headline font-semibold">
                      Boundary refinement
                    </span>
                    <span className="material-symbols-outlined ml-auto text-primary">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 order-1 lg:order-2">
                <div className="relative group">
                  <div className="aspect-video overflow-hidden shadow-2xl">
                    <img
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt="AI processor architecture detail"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnYhyirKlAtiTcWyczHKQPc5i0DBr2XPcvT_Uxlom-Ptfn-V53H2qaknXoUzaoUi4YZsowBh-enhZ47pzngbvUcqRU-OUU5UlQ5yliy70KqPvJkVl3v5uMiLM-Zumt0d9kkaFboyIAD6IHTqyc33QXnpxwTgCTVqhsj8uxESekaezFX6npDs0ZIubyKL002BFV2Vz7QZjQaMdeCdaQe1aEyhfIMnccDDi-di04ZcDX2jvRT82iAtbmvGgusRDQKjqhjEml8elH7hQ"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-primary p-8 text-white max-w-xs shadow-xl">
                    <p className="text-xs font-label uppercase tracking-widest mb-2">
                      Processing Load
                    </p>
                    <p className="text-2xl font-headline font-black">1.2 TB/hr</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Module 02: Remote Sensing */}
          <section className="min-h-screen py-32 px-8 md:px-20 bg-surface" id="imagery">
            <div className="text-center mb-20">
              <span className="font-label text-sm text-primary font-bold mb-4 block">
                02 / REMOTE SENSING
              </span>
              <h2 className="text-display-md font-headline font-bold text-on-background">
                Multi-Spectral Convergence
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              {[
                {
                  icon: "satellite_alt",
                  title: "Sentinel-2 Sync",
                  desc: "Synchronized 5-day revisit cycles ensuring temporal consistency in moisture detection.",
                  spec: "10m Resolution",
                  bg: "bg-surface-container-low",
                },
                {
                  icon: "radar",
                  title: "LIDAR Overlays",
                  desc: "Sub-centimeter topographical mapping to determine precise runoff velocity and direction.",
                  spec: "99.8% Accuracy",
                  bg: "bg-surface-container",
                },
                {
                  icon: "thermostat",
                  title: "Thermal Anomaly",
                  desc: "Heat-map cross-referencing to identify underground infrastructure heat signatures.",
                  spec: "±0.2°C Delta",
                  bg: "bg-surface-container-high",
                },
              ].map((item) => (
                <div key={item.title} className={`p-12 ${item.bg} flex flex-col gap-6`}>
                  <span className="material-symbols-outlined text-4xl text-primary">
                    {item.icon}
                  </span>
                  <h4 className="font-headline text-xl font-bold">{item.title}</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="mt-auto font-label text-[10px] text-primary font-bold uppercase">
                    {item.spec}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-24 w-full h-[400px] relative">
              <img
                className="w-full h-full object-cover"
                alt="Earth observation from orbit"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2xHIZ4o7yz7dScBIWGiq4w5oJegF9NM-2UBq6H8eIj390iOZ7jR9HZ1p6ZNfDjTml-qKvXKf3ghvozLcS3uOMcWsXozQmgIRsXz9lLNofs8B8HXHTVXLyMaG2MsZG-l2j-oNfH-o4TNuz9P-cpcT_hGPryzP9eV2u7RiecNxdRmeLunpmNJv6hZq3qDOlmOkEtQma4BFQkTvh-o3rF3xGaoOeyE1UPeR2YFMm-BsDG3o339I6PnnGU20BNV0SrolptgMxiIOrU-A"
              />
              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-md border border-white/30 p-10 text-center">
                  <p className="text-white font-headline text-3xl font-light italic">
                    &ldquo;Imagery is the ink; data is the story.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Module 03: Scoring Logic */}
          <section
            className="min-h-screen py-32 px-8 md:px-20 bg-surface-container-lowest"
            id="scoring"
          >
            <div className="flex flex-col lg:flex-row gap-20">
              <div className="w-full lg:w-1/3">
                <span className="font-label text-sm text-primary font-bold mb-4 block">
                  03 / SCORING LOGIC
                </span>
                <h2 className="text-display-md font-headline font-bold text-on-background mb-10">
                  The Nexus <br />
                  Equation
                </h2>
                <p className="text-on-surface-variant mb-12">
                  Our proprietary algorithm calculates the{" "}
                  <span className="font-bold text-on-background">
                    Hydraulic Efficiency Index (HEI)
                  </span>
                  , a single metric summarizing 14 distinct variables.
                </p>
                <ul className="space-y-6">
                  {[
                    { label: "Permeability", value: "42%" },
                    { label: "Slope Gradient", value: "18%" },
                    { label: "Vegetation Density", value: "25%" },
                    { label: "Soil Saturation", value: "15%" },
                  ].map((item) => (
                    <li
                      key={item.label}
                      className="flex justify-between items-end border-b border-surface-container-highest pb-2"
                    >
                      <span className="font-label text-xs uppercase text-stone-500">
                        {item.label}
                      </span>
                      <span className="font-headline font-bold text-primary">
                        {item.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full lg:w-2/3 grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-8 aspect-square flex flex-col justify-between">
                  <span className="font-label text-xs font-bold text-primary">MODULAR</span>
                  <div>
                    <h5 className="text-4xl font-headline font-black mb-2">840+</h5>
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                      Variables Analyzed
                    </p>
                  </div>
                </div>
                <div className="bg-primary p-8 aspect-square flex flex-col justify-between text-white">
                  <span className="font-label text-xs font-bold opacity-70">DYNAMIC</span>
                  <div>
                    <h5 className="text-4xl font-headline font-black mb-2">Real-time</h5>
                    <p className="text-xs uppercase tracking-widest opacity-70">
                      Scoring updates
                    </p>
                  </div>
                </div>
                <div className="bg-surface-container-highest p-8 aspect-square flex flex-col justify-between">
                  <span className="font-label text-xs font-bold text-primary">VALIDATED</span>
                  <div>
                    <h5 className="text-4xl font-headline font-black mb-2">99.4%</h5>
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                      Ground-Truth Match
                    </p>
                  </div>
                </div>
                <div className="bg-white p-8 aspect-square border border-surface-container flex flex-col justify-between shadow-sm">
                  <span className="font-label text-xs font-bold text-primary">ADAPTIVE</span>
                  <div>
                    <h5 className="text-4xl font-headline font-black mb-2">AI-Core</h5>
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                      Continuous Learning
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA / Dataset Integrity */}
          <section className="py-32 px-8 md:px-20 bg-primary text-on-primary" id="dataset">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-display-lg font-headline font-black mb-12">
                Unparalleled Data <br />
                Integrity.
              </h2>
              <div className="flex flex-col md:flex-row gap-8 justify-center">
                <button className="bg-white text-primary px-10 py-5 font-label text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-colors">
                  Request Demo Access
                </button>
                <button className="border border-white/30 text-white px-10 py-5 font-label text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                  Technical Specs PDF
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 px-8 md:px-20 bg-surface text-stone-500 border-t border-surface-container-low">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="font-headline font-black text-on-background uppercase tracking-tighter">
                RainUSE Nexus
              </div>
              <div className="flex gap-8 font-label text-[10px] uppercase tracking-widest">
                <Link href="#" className="hover:text-primary">
                  Terms
                </Link>
                <Link href="#" className="hover:text-primary">
                  Privacy
                </Link>
                <Link href="#" className="hover:text-primary">
                  API Docs
                </Link>
              </div>
              <div className="font-label text-[10px] uppercase tracking-widest">
                &copy; 2024 Nexus Intelligence Lab
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50">
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          description
        </span>
      </button>
    </div>
  );
}
