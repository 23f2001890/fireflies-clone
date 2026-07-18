"use client";

import { useEffect, useRef } from "react";
import { Segment } from "@/lib/types";
import { formatTimestamp } from "@/lib/api";

const SPEAKER_COLORS = [
  "text-brand-700",
  "text-amber-700",
  "text-emerald-700",
  "text-rose-700",
  "text-sky-700",
];

function speakerColor(name: string, speakers: string[]) {
  const idx = speakers.indexOf(name) % SPEAKER_COLORS.length;
  return SPEAKER_COLORS[idx];
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-brand-200 text-ink-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function TranscriptPanel({
  segments,
  currentTime,
  query,
  onSeek,
}: {
  segments: Segment[];
  currentTime: number;
  query: string;
  onSeek: (t: number) => void;
}) {
  const activeRef = useRef<HTMLDivElement>(null);
  const speakers = Array.from(new Set(segments.map((s) => s.speaker)));

  const activeId = (() => {
    const active = [...segments]
      .reverse()
      .find((s) => currentTime >= s.start_seconds);
    return active?.id;
  })();

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId]);

  const filtered = query.trim()
    ? segments.filter((s) => s.text.toLowerCase().includes(query.toLowerCase()))
    : segments;

  if (segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 text-ink-400">
        <p className="text-sm font-medium">No transcript yet</p>
        <p className="text-xs mt-1">Edit this meeting to paste or upload a transcript.</p>
      </div>
    );
  }

  if (query.trim() && filtered.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-ink-400">
        No matches for &ldquo;{query}&rdquo;
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filtered.map((s) => (
        <div
          key={s.id}
          ref={s.id === activeId ? activeRef : undefined}
          onClick={() => onSeek(s.start_seconds)}
          className={`flex gap-3 rounded-lg px-2.5 py-2 cursor-pointer transition-colors ${
            s.id === activeId ? "bg-brand-50" : "hover:bg-ink-50"
          }`}
        >
          <span className="text-[11px] font-mono text-ink-300 pt-0.5 w-10 shrink-0 text-right">
            {formatTimestamp(s.start_seconds)}
          </span>
          <div className="min-w-0">
            <span className={`text-xs font-semibold ${speakerColor(s.speaker, speakers)}`}>
              {s.speaker}
            </span>
            <p className="text-sm text-ink-700 leading-relaxed mt-0.5">
              {highlight(s.text, query)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
