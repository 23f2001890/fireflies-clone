"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Search, Pencil, Trash2, Users } from "lucide-react";
import { api, formatDuration } from "@/lib/api";
import { MeetingDetail } from "@/lib/types";
import Player from "@/components/Player";
import TranscriptPanel from "@/components/TranscriptPanel";
import NotesPanel from "@/components/NotesPanel";
import EditMeetingModal from "@/components/EditMeetingModal";
import { useToast } from "@/components/Toast";

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = Number(params.id);

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(false);

  async function load() {
    try {
      const data = await api.getMeeting(id);
      setMeeting(data);
    } catch {
      showToast("Couldn't load this meeting", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this meeting? This can't be undone.")) return;
    try {
      await api.deleteMeeting(id);
      showToast("Meeting deleted");
      router.push("/");
    } catch {
      showToast("Couldn't delete the meeting", "error");
    }
  }

  function handleSeek(t: number) {
    setCurrentTime(t);
    if (meeting && t >= meeting.duration_seconds) setPlaying(false);
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="h-8 w-64 bg-ink-50 rounded animate-pulse mb-4" />
        <div className="h-40 bg-ink-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-sm font-semibold text-ink-800">Meeting not found</p>
        <button
          onClick={() => router.push("/")}
          className="mt-3 text-sm font-semibold text-brand-600 hover:underline"
        >
          Back to meetings
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-50 shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold text-ink-900 truncate">
              {meeting.title}
            </h1>
            <p className="text-xs text-ink-400">
              {format(new Date(meeting.date), "MMM d, yyyy · h:mm a")} · {formatDuration(meeting.duration_seconds)}
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:bg-ink-50 rounded-lg px-2.5 py-1.5"
          >
            <Pencil size={13} /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg px-2.5 py-1.5"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-ink-500 bg-ink-50 rounded-full px-2.5 py-1">
            <Users size={12} />
            {meeting.participants.map((p) => p.name).join(", ") || "No participants listed"}
          </div>
        </div>

        <div className="mb-5">
          <Player
            duration={meeting.duration_seconds}
            currentTime={currentTime}
            playing={playing}
            onSeek={handleSeek}
            onTogglePlay={() => setPlaying((p) => !p)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 rounded-xl border border-ink-100 bg-white shadow-card flex flex-col max-h-[calc(100vh-260px)]">
            <div className="p-3 border-b border-ink-100">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search this transcript"
                  className="w-full rounded-lg border border-ink-100 bg-ink-50 pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white"
                />
              </div>
            </div>
            <div className="p-3 overflow-y-auto flex-1">
              <TranscriptPanel
                segments={meeting.segments}
                currentTime={currentTime}
                query={query}
                onSeek={handleSeek}
              />
            </div>
          </div>

          <div className="lg:col-span-2 max-h-[calc(100vh-260px)]">
            <NotesPanel
              meetingId={meeting.id}
              summary={meeting.summary_overview}
              actionItems={meeting.action_items}
              topics={meeting.topics}
              onSeek={handleSeek}
              onActionItemsChange={load}
            />
          </div>
        </div>
      </main>

      {editing && (
        <EditMeetingModal
          meeting={meeting}
          onClose={() => setEditing(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}
