"use client";

import Link from "next/link";

const navLinks = [
  { href: "/intelligence", label: "Intelligence" },
  { href: "/methodology", label: "Methodology" },
  { href: "/comparison", label: "Comparison" },
];

export function TopNav({ activeLink }: { activeLink?: string }) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm shadow-stone-200/50 flex justify-between items-center px-8 py-4 max-w-full">
      <Link
        href="/"
        className="text-xl font-black uppercase tracking-tighter text-red-900"
      >
        RainUSE Nexus
      </Link>
      <div className="hidden md:flex items-center gap-10">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              activeLink === link.href
                ? "text-red-700 font-semibold border-b-2 border-red-700 transition-colors duration-400 ease-in-out font-headline tracking-tight"
                : "text-stone-600 font-medium hover:text-red-800 transition-colors duration-400 ease-in-out font-headline tracking-tight font-light"
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-6">
        <span className="material-symbols-outlined text-stone-600 cursor-pointer hover:text-primary transition-colors">
          notifications
        </span>
        <span className="material-symbols-outlined text-stone-600 cursor-pointer hover:text-primary transition-colors">
          settings
        </span>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-highest">
          <img
            alt="User profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgRfCcRHOvvWtYNW4dh-_4XIDvq07Ts4ikWAp_3pchQlvcxRqNRUaONc5-Vamd0XWN0pd9yhLGjlRapkn7nZgNhYRiMmEdX89q-OCcjTl_GcnBBlemW_gbIrn9RL3xufpnOFdzU7n-Np54-Po_TunE1D5CPTcAdv6m0nEw7bEEdz5YFSMiMul525SCxqQG8WfaTOo8IbEpxENlDa-x7EmEM7qg2lAONH-gnOp2GbxgL0aHFEFBYf-PGQ24Wx38zTdEF_05D6eSK3o"
          />
        </div>
      </div>
    </nav>
  );
}
