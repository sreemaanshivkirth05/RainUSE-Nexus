import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";

export default function LandingPage() {
  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary selection:text-on-primary">
      <TopNav />

      <main className="relative pt-24 overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[921px] flex flex-col justify-center px-8 md:px-16 lg:px-24">
          <div className="absolute inset-0 z-0 opacity-40">
            <div
              className="w-full h-full grayscale mix-blend-multiply bg-surface-container-low"
              style={{
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAkNs13GTB7XL34Glg5MRzlikCBFhNIH-kgZ8iegO5DxGMfqNn6QE6b4TI1GpeJvCYM5SD47FPVHQkmzUF3y-UH68V6YEKIAFL_4HhO0UEMB-iuoUNoeW92ypSHKPe3cNL5qcKtWdT81Rsd0dk1zJaTQisHM6rpHV6n7e8mUne7M4I6_6HCXOaKjX2bOC-Tj0HABHbzRflPNckcLoSH1aLODlwzO2dLi8ZA3TzSNnCo4s1t5HY1P2dcQO70Ou_B3cDEjHdDGn5HG84')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
          <div className="relative z-10 max-w-7xl">
            <div className="mb-8">
              <span className="font-label text-sm uppercase tracking-[0.2em] text-primary font-semibold">
                Tier 1 Geospatial Intelligence
              </span>
            </div>
            <h1 className="hero-bleed-text font-headline font-black text-7xl md:text-8xl lg:text-[10rem] text-on-surface leading-[0.85] mb-12">
              The Sovereign <br />
              <span className="text-primary italic">Observer</span> <br />
              of Scarcity
            </h1>
            <div className="flex flex-col md:flex-row md:items-end gap-12 mt-16">
              <div className="max-w-md">
                <p className="text-xl font-body text-on-surface-variant leading-relaxed">
                  A refined methodology for aquatic prospecting. We leverage
                  high-fidelity hydrology layers and economic modeling to
                  redefine how infrastructure meets resource.
                </p>
              </div>
              <div>
                <Link
                  href="/intelligence"
                  className="bg-primary text-on-primary px-10 py-5 font-label text-sm font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform duration-400 ease-[cubic-bezier(0.2,0,0,1)] flex items-center gap-4"
                >
                  Launch Prospecting Engine
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Intelligence Grid */}
        <section className="py-32 px-8 md:px-16 lg:px-24 bg-surface">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large Feature */}
            <div className="md:col-span-8 bg-surface-container-low p-12 flex flex-col justify-between min-h-[500px]">
              <div>
                <span className="font-label text-xs uppercase tracking-widest text-primary mb-4 block">
                  01 / Intelligence
                </span>
                <h2 className="font-headline text-5xl font-light tracking-tight max-w-lg">
                  Hyper-localized Data Sovereignty
                </h2>
              </div>
              <div className="mt-8 flex flex-col md:flex-row gap-12 items-end">
                <div className="flex-1 overflow-hidden">
                  <img
                    alt="Satellite view of water patterns and urban infrastructure"
                    className="w-full h-64 object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYKS5Lvf3_8vayAT-aCv3h9I_fwejYMrwhwlVxal6iZm3imQ9ndvU83fJw52PtaX13dwjd3Ex7ilg9Xy40fvl3kNBXOFFTMUBhooYx3t9HANR24VqYHhYdvX1dDkwrjcdE6Y5QDbJh51jkQMZFD06FrnvQNQx_q3_GObHvglGXgk96UfnlLVoec-uRjLV1FbTmFUbCntaBGpbLqZhOtQYVidA_wBW4ECl53GmxTYOY4YdHc8L3-_L4MkoHINvaIsgh1nJO7RvWJ9U"
                  />
                </div>
                <p className="w-64 font-body text-sm text-on-surface-variant">
                  Real-time analysis of global water tables, integrated with
                  proprietary economic impact layers.
                </p>
              </div>
            </div>

            {/* Secondary Feature */}
            <div className="md:col-span-4 bg-primary text-on-primary p-12 flex flex-col justify-between hover:bg-primary-container transition-colors duration-400">
              <span className="font-label text-xs uppercase tracking-widest text-on-primary-container mb-4 block">
                02 / Methodology
              </span>
              <h3 className="font-headline text-4xl font-bold leading-tight">
                The Nexus Protocol
              </h3>
              <p className="text-on-primary-container text-sm leading-loose mt-4">
                Our algorithm identifies 147 distinct scarcity markers before
                they manifest in local markets.
              </p>
              <div className="mt-8">
                <span className="material-symbols-outlined text-6xl opacity-50">
                  water_drop
                </span>
              </div>
            </div>

            {/* Technical Specs List */}
            <div className="md:col-span-4 bg-surface-container-highest p-12">
              <span className="font-label text-xs uppercase tracking-widest text-stone-500 mb-8 block">
                Active Metrics
              </span>
              <ul className="space-y-6">
                <li className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                  <span className="font-label text-xs text-stone-500">01 Latency</span>
                  <span className="font-headline font-bold text-lg">14.2ms</span>
                </li>
                <li className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                  <span className="font-label text-xs text-stone-500">02 Precision</span>
                  <span className="font-headline font-bold text-lg">99.98%</span>
                </li>
                <li className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                  <span className="font-label text-xs text-stone-500">03 Coverage</span>
                  <span className="font-headline font-bold text-lg">Global</span>
                </li>
              </ul>
            </div>

            {/* Visual Accent */}
            <div className="md:col-span-8 bg-surface-container-low overflow-hidden relative group">
              <img
                alt="Modern water treatment plant architecture"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDs4nM-efjU4fRt4CdxnVY00qOhf9vmhnfHALvJNNdTpV_G7sSoxkAervC3b37NWUb2oPIko1-EruraJponYGuXgxpevpAMV0xAw9OYV2YeX14D1B0d8S7H8SxMR9364OjIOoyoSNM3V_D3T-Mx9Wk0LmwWwHw8D0gdP4kN03itojb7tVPZ8iL8xD3t_xiYac9spy-xnzz34dtt_tMcZG9dKKq_KpQqljM_0NijQKuhTY90x4mk_PmXUIMhWiG1ngaf8LZWOhNDNs4"
              />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
            </div>
          </div>
        </section>

        {/* Editorial Section: The Liquid Core */}
        <section className="py-40 bg-surface-container-lowest">
          <div className="container mx-auto px-8 flex flex-col md:flex-row items-center gap-24">
            <div className="flex-1 order-2 md:order-1">
              <h2 className="font-headline text-6xl font-light mb-12 leading-tight">
                Economic <br />
                <span className="text-primary font-bold">Resilience</span>{" "}
                Through <br />
                Predictive Fluidity
              </h2>
              <p className="text-xl text-on-surface-variant font-body leading-relaxed mb-10 max-w-xl">
                RainUSE Nexus isn&apos;t just a map; it&apos;s a decision
                engine. We synthesize centuries of meteorological data with
                modern supply chain volatility to provide an unprecedented view
                of the world&apos;s most vital resource.
              </p>
              <div className="flex gap-16">
                <div>
                  <div className="font-headline text-4xl font-black text-primary">
                    1.2B
                  </div>
                  <div className="font-label text-xs uppercase tracking-widest text-stone-500 mt-2">
                    Data Points/Sec
                  </div>
                </div>
                <div>
                  <div className="font-headline text-4xl font-black text-primary">
                    184
                  </div>
                  <div className="font-label text-xs uppercase tracking-widest text-stone-500 mt-2">
                    Territories
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 order-1 md:order-2">
              <div className="relative aspect-[3/4] w-full bg-surface-container-low overflow-hidden">
                <img
                  alt="Abstract fluid art with red and white textures"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyd1wi50Vcvg8hqxnXRu0kxApujXoDOCB3pV7XdCR75fR3M5_b8IIruVgMXpHqdU3aPl8hg3eSP9Fs0kpBbDp34dmXmtyjvRZOBojg5VJNwGdFp7HHTWO6Jw1LK3tUUDhMWP3E6LvKIhaIQpMFE4kO5Nz-MXrD99EDaF0WSwquVGJ_d6H3v-MBU1RRWGcbY-ECXoFQmfMaxtg6Tw5S4rev1BcOMhNKhE2e7isw4omarkvhkC2JCYyGVAX2RfnYkQgSu2PP2qC_TjA"
                />
                <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-md p-6 max-w-[240px]">
                  <span className="font-label text-[10px] uppercase tracking-widest text-primary mb-2 block">
                    Nexus Visualization
                  </span>
                  <p className="text-xs text-on-surface italic font-light">
                    &ldquo;The transition from scarcity to abundance is a matter
                    of perception and data.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA / Footer */}
        <footer className="bg-surface-container-low py-32 px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <span className="font-label text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-8 block">
              Ready for the Next Era
            </span>
            <h2 className="font-headline text-6xl md:text-8xl font-black tracking-tighter mb-16">
              Secure Your <br />
              Position.
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <Link
                href="/intelligence"
                className="w-full md:w-auto bg-primary text-on-primary px-12 py-6 font-label text-sm font-bold uppercase tracking-widest hover:bg-secondary transition-all"
              >
                Establish Connection
              </Link>
              <Link
                href="/methodology"
                className="w-full md:w-auto bg-transparent border-b-2 border-primary text-primary px-12 py-6 font-label text-sm font-bold uppercase tracking-widest hover:text-on-surface hover:border-on-surface transition-all"
              >
                Request Whitepaper
              </Link>
            </div>
            <div className="mt-32 pt-16 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center text-stone-400 font-label text-xs tracking-widest uppercase">
              <div>&copy; 2024 RAINUSE NEXUS. ALL RIGHTS RESERVED.</div>
              <div className="flex gap-8 mt-8 md:mt-0">
                <Link href="/intelligence" className="hover:text-primary">
                  Intelligence
                </Link>
                <Link href="#" className="hover:text-primary">
                  Legal
                </Link>
                <Link href="/explorer" className="hover:text-primary">
                  Terminal
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
