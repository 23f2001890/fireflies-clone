"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  BarChart3,
  Settings,
  Puzzle,
  Sparkles,
} from "lucide-react";

const NAV = [
  { label: "Meetings", href: "/", icon: Home },
  { label: "Team", href: "#", icon: Users, comingSoon: true },
  { label: "Analytics", href: "#", icon: BarChart3, comingSoon: true },
  { label: "Integrations", href: "#", icon: Puzzle, comingSoon: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-ink-100 bg-white h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-ink-100">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="font-semibold text-ink-900 text-[15px] tracking-tight">
          Fireflight
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = item.href === "/" && pathname === "/";
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.comingSoon) e.preventDefault();
              }}
              className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              } ${item.comingSoon ? "cursor-default" : ""}`}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={17} strokeWidth={2} />
                {item.label}
              </span>
              {item.comingSoon && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-300 bg-ink-50 border border-ink-100 rounded-full px-1.5 py-0.5">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-ink-100">
        <Link
          href="#"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900"
        >
          <Settings size={17} strokeWidth={2} />
          Settings
        </Link>
        <div className="flex items-center gap-2.5 mt-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
            LG
          </div>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-ink-800">Lakshya G.</p>
            <p className="text-[11px] text-ink-400">Default workspace</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
