"use client";

import { useMemo, useState } from "react";
import { BookHeart, CheckSquare, X, Send } from "lucide-react";
import DiaryEntryCard from "@/components/DiaryEntryCard";
import ShareDialog from "./ShareDialog";
import EditDialog from "./EditDialog";
import DeleteConfirm from "./DeleteConfirm";
import type { DiaryEntry } from "@/types/database.types";

interface Props {
  entries: DiaryEntry[];
  userName: string | null;
  userEmail: string | null;
}

type Action = "share" | "edit" | "delete";

export default function HistoryList({ entries, userName, userEmail }: Props) {
  const [active, setActive] = useState<{ entry: DiaryEntry; action: Action } | null>(
    null,
  );

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkShareOpen, setBulkShareOpen] = useState(false);

  const selectedEntries = useMemo(
    () => entries.filter((e) => selectedIds.has(e.id)),
    [entries, selectedIds],
  );

  const allSelected =
    entries.length > 0 && selectedIds.size === entries.length;

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function enterSelectMode() {
    setSelectMode(true);
    setSelectedIds(new Set());
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(entries.map((e) => e.id)));
    }
  }

  if (entries.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-blush-100 mb-3">
          <BookHeart className="w-8 h-8 text-blush-400" />
        </div>
        <p className="font-display font-semibold text-ink-500">
          Nenhum registro ainda.
        </p>
        <p className="text-sm text-ink-400 font-display mt-1">
          Abra o diário pra começar.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3 px-1 min-h-[2.5rem] gap-2">
        {selectMode ? (
          <>
            <button
              type="button"
              onClick={exitSelectMode}
              className="inline-flex items-center gap-1 text-sm font-display font-semibold text-ink-500 hover:text-blush-500 transition"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <span className="text-sm font-display text-soft">
              {selectedIds.size} selecionado{selectedIds.size === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={toggleAll}
              className="text-sm font-display font-semibold text-blush-500 hover:text-blush-400 transition"
            >
              {allSelected ? "Limpar" : "Selecionar tudo"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={enterSelectMode}
            className="inline-flex items-center gap-2 rounded-full bg-blush-400 text-white px-4 py-2 font-display font-semibold text-sm shadow-soft hover:bg-blush-500 active:scale-95 transition"
          >
            <CheckSquare className="w-4 h-4" />
            Selecionar vários para envio
          </button>
        )}
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <DiaryEntryCard
            key={entry.id}
            entry={entry}
            onShare={() => setActive({ entry, action: "share" })}
            onEdit={() => setActive({ entry, action: "edit" })}
            onDelete={() => setActive({ entry, action: "delete" })}
            selectable={selectMode}
            selected={selectedIds.has(entry.id)}
            onToggleSelect={() => toggleSelect(entry.id)}
          />
        ))}
      </div>

      <p className="text-xs font-display text-soft text-right mt-4 pr-1">
        {entries.length} registro{entries.length === 1 ? "" : "s"}
      </p>

      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md animate-slide-up">
          <button
            type="button"
            onClick={() => setBulkShareOpen(true)}
            className="btn-primary w-full shadow-soft-lg"
          >
            <Send className="w-4 h-4" />
            Enviar selecionados ({selectedIds.size})
          </button>
        </div>
      )}

      {active?.action === "share" && (
        <ShareDialog
          entries={[active.entry]}
          defaultEmail={userEmail ?? ""}
          userName={userName}
          userEmail={userEmail}
          onClose={() => setActive(null)}
        />
      )}

      {active?.action === "edit" && (
        <EditDialog entry={active.entry} onClose={() => setActive(null)} />
      )}

      {active?.action === "delete" && (
        <DeleteConfirm entry={active.entry} onClose={() => setActive(null)} />
      )}

      {bulkShareOpen && selectedEntries.length > 0 && (
        <ShareDialog
          entries={selectedEntries}
          defaultEmail={userEmail ?? ""}
          userName={userName}
          userEmail={userEmail}
          onClose={() => {
            setBulkShareOpen(false);
            exitSelectMode();
          }}
        />
      )}
    </>
  );
}
