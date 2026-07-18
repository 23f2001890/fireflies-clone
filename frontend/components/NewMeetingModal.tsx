"use client";

import { useState } from "react";
import { X, Upload, FileText, ClipboardPaste } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "./Toast";

export default function NewMeetingModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<"paste" | "upload" | "blank">("paste");
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState("");
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );
  const [transcriptText, setTranscriptText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      showToast("Give the meeting a title first", "error");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "blank") {
        await api.createMeeting({
          title,
          date: new Date(date).toISOString(),
          participants: participants.split(",").map((p) => p.trim()).filter(Boolean),
          summary_overview: "",
        });
      } else if (mode === "upload" && file) {
        const fd = new FormData();
        fd.append("title", title);
        fd.append("participants", participants);
        fd.append("date", new Date(date).toISOString());
        fd.append("file", file);
        await api.uploadMeeting(fd);
      } else if (mode === "paste") {
        const fd = new FormData();
        fd.append("title", title);
        fd.append("participants", participants);
        fd.append("date", new Date(date).toISOString());
        const blob = new Blob([transcriptText || ""], { type: "text/plain" });
        fd.append("file", blob, "transcript.txt");
        await api.uploadMeeting(fd);
      }
      showToast("Meeting created");
      onCreated();
      onClose();
    } catch (err) {
      showToast("Couldn't create the meeting — try again", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="text-base font-semibold text-ink-900">New meeting</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-ink-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-4 flex gap-1 border-b border-ink-100">
          {[
            { key: "paste", label: "Paste transcript", icon: ClipboardPaste },
            { key: "upload", label: "Upload file", icon: Upload },
            { key: "blank", label: "Blank form", icon: FileText },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setMode(t.key as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 -mb-px transition-colors ${
                mode === t.key
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-ink-400 hover:text-ink-700"
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        <div className="px-5 py-4 space-y-3 overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-ink-500 mb-1 block">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Engineering Standup"
              className="w-full rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-500 mb-1 block">
                Date & time
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-500 mb-1 block">
                Participants
              </label>
              <input
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="Comma separated"
                className="w-full rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white"
              />
            </div>
          </div>

          {mode === "paste" && (
            <div>
              <label className="text-xs font-semibold text-ink-500 mb-1 block">
                Transcript text
              </label>
              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                rows={8}
                placeholder={"[0:00] Aisha: Let's get started...\n[0:12] Daniel: Sounds good."}
                className="w-full rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white"
              />
              <p className="text-[11px] text-ink-400 mt-1">
                Use the format <code>[mm:ss] Speaker: text</code> per line, one per turn. Plain lines work too — they'll import without speaker labels.
              </p>
            </div>
          )}

          {mode === "upload" && (
            <div>
              <label className="text-xs font-semibold text-ink-500 mb-1 block">
                Transcript file (.txt, .vtt, .json)
              </label>
              <input
                type="file"
                accept=".txt,.vtt,.json"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-ink-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 file:px-3 file:py-2 file:text-xs file:font-semibold"
              />
            </div>
          )}

          {mode === "blank" && (
            <p className="text-xs text-ink-400">
              Creates the meeting with just metadata — add a transcript, summary, or action items afterward from the meeting page.
            </p>
          )}
        </div>

        <div className="px-5 py-4 border-t border-ink-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-3.5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create meeting"}
          </button>
        </div>
      </div>
    </div>
  );
}
