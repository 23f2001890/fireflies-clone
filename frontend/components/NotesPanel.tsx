"use client";

import { useState } from "react";
import { ActionItem, Topic } from "@/lib/types";
import { formatTimestamp } from "@/lib/api";
import { api } from "@/lib/api";
import { useToast } from "./Toast";
import { CheckSquare, Square, Plus, ListTree, FileText, Trash2 } from "lucide-react";

type Tab = "summary" | "actions" | "topics";

export default function NotesPanel({
  meetingId,
  summary,
  actionItems,
  topics,
  onSeek,
  onActionItemsChange,
}: {
  meetingId: number;
  summary: string;
  actionItems: ActionItem[];
  topics: Topic[];
  onSeek: (t: number) => void;
  onActionItemsChange: () => void;
}) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("summary");
  const [newItem, setNewItem] = useState("");
  const [adding, setAdding] = useState(false);

  async function toggleItem(item: ActionItem) {
    try {
      await api.updateActionItem(item.id, { completed: !item.completed });
      onActionItemsChange();
    } catch {
      showToast("Couldn't update that action item", "error");
    }
  }

  async function deleteItem(id: number) {
    try {
      await api.deleteActionItem(id);
      onActionItemsChange();
    } catch {
      showToast("Couldn't remove that action item", "error");
    }
  }

  async function addItem() {
    if (!newItem.trim()) return;
    setAdding(true);
    try {
      await api.addActionItem(meetingId, { text: newItem.trim() });
      setNewItem("");
      onActionItemsChange();
    } catch {
      showToast("Couldn't add the action item", "error");
    } finally {
      setAdding(false);
    }
  }

  const TABS: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: "summary", label: "Summary", icon: FileText },
    { key: "actions", label: "Action items", icon: CheckSquare, count: actionItems.length },
    { key: "topics", label: "Topics", icon: ListTree, count: topics.length },
  ];

  return (
    <div className="rounded-xl border border-ink-100 bg-white shadow-card flex flex-col h-full">
      <div className="flex border-b border-ink-100 px-2 pt-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-ink-400 hover:text-ink-700"
            }`}
          >
            <t.icon size={13} />
            {t.label}
            {typeof t.count === "number" && (
              <span className="text-[10px] bg-ink-100 text-ink-500 rounded-full px-1.5">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        {tab === "summary" && (
          <div>
            {summary ? (
              <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">
                {summary}
              </p>
            ) : (
              <p className="text-sm text-ink-400">
                No summary yet for this meeting.
              </p>
            )}
          </div>
        )}

        {tab === "actions" && (
          <div className="space-y-1">
            {actionItems.length === 0 && (
              <p className="text-sm text-ink-400 mb-2">No action items yet.</p>
            )}
            {actionItems.map((item) => (
              <div
                key={item.id}
                className="group flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-ink-50"
              >
                <button onClick={() => toggleItem(item)} className="mt-0.5 shrink-0">
                  {item.completed ? (
                    <CheckSquare size={16} className="text-brand-600" />
                  ) : (
                    <Square size={16} className="text-ink-300" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      item.completed ? "text-ink-300 line-through" : "text-ink-700"
                    }`}
                  >
                    {item.text}
                  </p>
                  {item.assignee && (
                    <p className="text-[11px] text-ink-400 mt-0.5">{item.assignee}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-ink-300 hover:text-red-500 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-2 pt-2 mt-2 border-t border-ink-100">
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
                placeholder="Add an action item"
                className="flex-1 rounded-lg border border-ink-100 bg-ink-50 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white"
              />
              <button
                onClick={addItem}
                disabled={adding}
                className="w-8 h-8 rounded-lg bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shrink-0 disabled:opacity-60"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        )}

        {tab === "topics" && (
          <div className="space-y-1">
            {topics.length === 0 && (
              <p className="text-sm text-ink-400">No topics outlined yet.</p>
            )}
            {topics.map((t) => (
              <button
                key={t.id}
                onClick={() => onSeek(t.start_seconds)}
                className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left hover:bg-ink-50"
              >
                <span className="text-sm text-ink-700">{t.title}</span>
                <span className="text-[11px] font-mono text-ink-400">
                  {formatTimestamp(t.start_seconds)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
