"use client";

import Link from "next/link";
import { format } from "date-fns";
import { MoreHorizontal, Trash2, Pencil, Clock3 } from "lucide-react";
import { useState } from "react";
import { MeetingListItem } from "@/lib/types";
import { formatDuration } from "@/lib/api";

const AVATAR_COLORS = [
  "bg-brand-100 text-brand-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function MeetingRow({
  meeting,
  onDelete,
  onEdit,
}: {
  meeting: MeetingListItem;
  onDelete: (id: number) => void;
  onEdit: (meeting: MeetingListItem) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group relative flex items-center gap-4 rounded-xl border border-ink-100 bg-white px-4 py-3.5 hover:border-brand-200 hover:shadow-card transition-all">
      <Link href={`/meetings/${meeting.id}`} className="flex-1 min-w-0 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {format(new Date(meeting.date), "MMM").toUpperCase()}
          <span className="sr-only">{meeting.date}</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-900 truncate group-hover:text-brand-700">
            {meeting.title}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-ink-400">
            <span>{format(new Date(meeting.date), "MMM d, yyyy · h:mm a")}</span>
            <span className="flex items-center gap-1">
              <Clock3 size={12} />
              {formatDuration(meeting.duration_seconds)}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center -space-x-2 shrink-0">
          {meeting.participants.slice(0, 4).map((p, i) => (
            <div
              key={p.id}
              title={p.name}
              className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-semibold ${
                AVATAR_COLORS[i % AVATAR_COLORS.length]
              }`}
            >
              {initials(p.name)}
            </div>
          ))}
          {meeting.participants.length > 4 && (
            <div className="w-7 h-7 rounded-full border-2 border-white bg-ink-100 text-ink-500 flex items-center justify-center text-[10px] font-semibold">
              +{meeting.participants.length - 4}
            </div>
          )}
        </div>
      </Link>

      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-ink-50 hover:text-ink-700"
        >
          <MoreHorizontal size={18} />
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-9 z-20 w-40 rounded-lg border border-ink-100 bg-white shadow-lg py-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(meeting);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
              >
                <Pencil size={14} /> Edit details
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(meeting.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
