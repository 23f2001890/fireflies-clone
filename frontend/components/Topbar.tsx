"use client";

import { Search, Plus, Bell } from "lucide-react";

export default function Topbar({
  search,
  onSearch,
  onNewMeeting,
}: {
  search: string;
  onSearch: (v: string) => void;
  onNewMeeting: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 h-16 px-6 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="relative flex-1 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
        />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search meetings, people, or topics"
          className="w-full rounded-lg border border-ink-100 bg-ink-50 pl-9 pr-3 py-2 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          className="w-9 h-9 rounded-lg border border-ink-100 flex items-center justify-center text-ink-500 hover:bg-ink-50"
          title="Notifications — coming soon"
        >
          <Bell size={16} />
        </button>
        <button
          onClick={onNewMeeting}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-3.5 py-2 shadow-sm transition-colors"
        >
          <Plus size={16} />
          New meeting
        </button>
      </div>
    </header>
  );
}
