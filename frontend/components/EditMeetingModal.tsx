"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "./Toast";
import { MeetingListItem } from "@/lib/types";

export default function EditMeetingModal({
  meeting,
  onClose,
  onSaved,
}: {
  meeting: MeetingListItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [title, setTitle] = useState(meeting.title);
  const [participants, setParticipants] = useState(
    meeting.participants.map((p) => p.name).join(", ")
  );
  const [date, setDate] = useState(
    new Date(meeting.date).toISOString().slice(0, 16)
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await api.updateMeeting(meeting.id, {
        title,
        date: new Date(date).toISOString(),
        participants: participants.split(",").map((p) => p.trim()).filter(Boolean),
      });
      showToast("Meeting updated");
      onSaved();
      onClose();
    } catch {
      showToast("Couldn't save changes", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="text-base font-semibold text-ink-900">Edit meeting</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-ink-50"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-ink-500 mb-1 block">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-500 mb-1 block">Date & time</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-500 mb-1 block">Participants</label>
            <input
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="Comma separated"
              className="w-full rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white"
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-ink-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3.5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
