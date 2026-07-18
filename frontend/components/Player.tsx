"use client";

import { useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, RotateCw, Volume2 } from "lucide-react";
import { formatTimestamp } from "@/lib/api";

export default function Player({
  duration,
  currentTime,
  playing,
  onSeek,
  onTogglePlay,
}: {
  duration: number;
  currentTime: number;
  playing: boolean;
  onSeek: (t: number) => void;
  onTogglePlay: () => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      onSeek(Math.min(currentTime + 1, duration));
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, currentTime, duration]);

  function handleBarClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(duration, pct * duration)));
  }

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-xl border border-ink-100 bg-white px-4 py-3.5 shadow-card">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSeek(Math.max(0, currentTime - 15))}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink-500 hover:bg-ink-50"
          title="Back 15s"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shrink-0"
        >
          {playing ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
        </button>
        <button
          onClick={() => onSeek(Math.min(duration, currentTime + 15))}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink-500 hover:bg-ink-50"
          title="Forward 15s"
        >
          <RotateCw size={16} />
        </button>

        <span className="text-xs font-mono text-ink-500 w-10 text-right">
          {formatTimestamp(currentTime)}
        </span>

        <div
          ref={barRef}
          onClick={handleBarClick}
          className="relative flex-1 h-2 rounded-full bg-ink-100 cursor-pointer group"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-brand-500"
            style={{ width: `${pct}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-600 border-2 border-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${pct}% - 6px)` }}
          />
        </div>

        <span className="text-xs font-mono text-ink-400 w-10">
          {formatTimestamp(duration)}
        </span>

        <Volume2 size={16} className="text-ink-300 hidden sm:block" />
      </div>
      <p className="text-[11px] text-ink-300 mt-2 text-center">
        Simulated playback — real audio/video upload &amp; speech-to-text are out of scope for this clone.
      </p>
    </div>
  );
}
