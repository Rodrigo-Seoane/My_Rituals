"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, RotateCcw, History, Plus, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentMonday, getToday } from "@/lib/utils";

const navItems = [
  { href: "/", label: "This Week", icon: CalendarDays },
  { href: `/week/entry`, label: "Weekly Plan", icon: ClipboardList },
  { href: `/daily/entry`, label: "Daily Ops", icon: Plus },
  { href: `/review/entry`, label: "Review", icon: RotateCcw },
  { href: "/history", label: "History", icon: History },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile top bar — only visible below lg breakpoint */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#421E06] flex items-center px-4 z-50 border-b border-[#5a2a08]">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-[#C7C8C6] hover:bg-[#5a2a08] hover:text-white transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-heading font-bold text-lg text-[#FFD115] ml-3 tracking-tight">
          My Rituals
        </span>
      </header>

      {/* Backdrop overlay — only rendered when drawer is open on mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — always visible on lg+, slide-in drawer on mobile */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-56 bg-[#421E06] flex flex-col z-50",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo / Brand */}
        <div className="px-6 py-6 border-b border-[#5a2a08] flex items-center justify-between">
          <div>
            <span className="font-heading font-bold text-xl text-[#FFD115] tracking-tight">
              My Rituals
            </span>
            <p className="text-xs text-[#C7C8C6] mt-0.5 opacity-70">Designer workflow</p>
          </div>
          {/* Close button — only visible on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#C7C8C6] hover:bg-[#5a2a08] hover:text-white transition-colors"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#FFD115] text-[#421E06]"
                    : "text-[#C7C8C6] hover:bg-[#5a2a08] hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Category legend */}
        <div className="px-5 py-5 border-t border-[#5a2a08]">
          <p className="text-xs font-semibold text-[#C7C8C6] uppercase tracking-wider mb-3 opacity-60">
            Categories
          </p>
          {[
            { label: "Personal", color: "#FFD115" },
            { label: "Management", color: "#686B63" },
            { label: "Creation", color: "#7C6B5A" },
            { label: "Consumption", color: "#3D6B4F" },
            { label: "Ideation", color: "#7C5230" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 mb-1.5">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-[#C7C8C6] opacity-70">{label}</span>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
