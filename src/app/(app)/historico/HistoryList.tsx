"use client";

import { useState } from "react";
import { BookHeart } from "lucide-react";
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
      <div className="space-y-3">
        {entries.map((entry) => (
          <DiaryEntryCard
            key={entry.id}
            entry={entry}
            onShare={() => setActive({ entry, action: "share" })}
            onEdit={() => setActive({ entry, action: "edit" })}
            onDelete={() => setActive({ entry, action: "delete" })}
          />
        ))}
      </div>

      {active?.action === "share" && (
        <ShareDialog
          entry={active.entry}
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
    </>
  );
}
