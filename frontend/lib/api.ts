import { MeetingDetail, MeetingListItem, ActionItem } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  listMeetings: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_URL}/api/meetings${qs ? `?${qs}` : ""}`, {
      cache: "no-store",
    }).then((r) => handle<MeetingListItem[]>(r));
  },

  getMeeting: (id: number | string) =>
    fetch(`${API_URL}/api/meetings/${id}`, { cache: "no-store" }).then((r) =>
      handle<MeetingDetail>(r)
    ),

  createMeeting: (payload: any) =>
    fetch(`${API_URL}/api/meetings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<MeetingDetail>(r)),

  uploadMeeting: (formData: FormData) =>
    fetch(`${API_URL}/api/meetings/upload`, {
      method: "POST",
      body: formData,
    }).then((r) => handle<MeetingDetail>(r)),

  updateMeeting: (id: number, payload: any) =>
    fetch(`${API_URL}/api/meetings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<MeetingDetail>(r)),

  deleteMeeting: (id: number) =>
    fetch(`${API_URL}/api/meetings/${id}`, { method: "DELETE" }).then((r) =>
      handle<{ ok: boolean }>(r)
    ),

  addActionItem: (meetingId: number, payload: Partial<ActionItem>) =>
    fetch(`${API_URL}/api/meetings/${meetingId}/action_items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<ActionItem>(r)),

  updateActionItem: (id: number, payload: Partial<ActionItem>) =>
    fetch(`${API_URL}/api/action_items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<ActionItem>(r)),

  deleteActionItem: (id: number) =>
    fetch(`${API_URL}/api/action_items/${id}`, { method: "DELETE" }).then(
      (r) => handle<{ ok: boolean }>(r)
    ),

  globalSearch: (q: string) =>
    fetch(`${API_URL}/api/search?q=${encodeURIComponent(q)}`, {
      cache: "no-store",
    }).then((r) => handle<any>(r)),
};

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatTimestamp(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
