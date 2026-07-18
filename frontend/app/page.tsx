"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { MeetingListItem } from "@/lib/types";
import Topbar from "@/components/Topbar";
import MeetingRow from "@/components/MeetingRow";
import NewMeetingModal from "@/components/NewMeetingModal";
import EditMeetingModal from "@/components/EditMeetingModal";
import { useToast } from "@/components/Toast";
import { Mic2, ArrowDownAZ, Clock } from "lucide-react";

export default function DashboardPage() {
  const { showToast } = useToast();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "oldest">("recent");
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<MeetingListItem | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api.listMeetings({
        sort,
        ...(search ? { search } : {}),
      });
      setMeetings(data);
    } catch {
      showToast("Couldn't reach the backend API", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this meeting? This can't be undone.")) return;
    try {
      await api.deleteMeeting(id);
      showToast("Meeting deleted");
      load();
    } catch {
      showToast("Couldn't delete the meeting", "error");
    }
  }

  const grouped = useMemo(() => {
    return meetings;
  }, [meetings]);

  return (
    <div className="min-h-screen">
      <Topbar search={search} onSearch={setSearch} onNewMeeting={() => setShowNew(true)} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-ink-900 tracking-tight">
              Your meetings
            </h1>
            <p className="text-sm text-ink-400 mt-0.5">
              {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
          <div className="flex items-center gap-1 bg-ink-50 rounded-lg p-1">
            <button
              onClick={() => setSort("recent")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold ${
                sort === "recent" ? "bg-white shadow-sm text-ink-900" : "text-ink-400"
              }`}
            >
              <Clock size={13} /> Recent
            </button>
            <button
              onClick={() => setSort("oldest")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold ${
                sort === "oldest" ? "bg-white shadow-sm text-ink-900" : "text-ink-400"
              }`}
            >
              <ArrowDownAZ size={13} /> Oldest
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[70px] rounded-xl bg-ink-50 animate-pulse" />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-ink-200 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
              <Mic2 size={20} className="text-brand-600" />
            </div>
            <p className="text-sm font-semibold text-ink-800">
              {search ? "No meetings match your search" : "No meetings yet"}
            </p>
            <p className="text-xs text-ink-400 mt-1 max-w-xs">
              {search
                ? "Try a different title or clear your search."
                : "Create your first meeting to see transcripts, summaries, and action items here."}
            </p>
            {!search && (
              <button
                onClick={() => setShowNew(true)}
                className="mt-4 px-3.5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
              >
                New meeting
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {grouped.map((m) => (
              <MeetingRow
                key={m.id}
                meeting={m}
                onDelete={handleDelete}
                onEdit={setEditing}
              />
            ))}
          </div>
        )}
      </main>

      {showNew && (
        <NewMeetingModal onClose={() => setShowNew(false)} onCreated={load} />
      )}
      {editing && (
        <EditMeetingModal
          meeting={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
