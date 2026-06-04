"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { emotionById, getEntryEmotions } from "@/lib/emotions";
import type { DiaryEntry } from "@/types/database.types";

interface Props {
  entry: DiaryEntry;
  onClose: () => void;
}

export default function DeleteConfirm({ entry, onClose }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metas = getEntryEmotions(entry)
    .map((id) => emotionById(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));
  const dateStr = new Date(entry.created_at).toLocaleDateString("pt-BR");

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  async function handleDelete() {
    setError(null);
    setDeleting(true);

    try {
      const { error } = await supabase
        .from("diary_entries")
        .delete()
        .eq("id", entry.id);

      if (error) throw error;

      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar.");
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-600/40 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-soft-lg p-6 animate-slide-up">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-full bg-blush-100 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-blush-500" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-cream-200 flex items-center justify-center hover:bg-cream-100 transition"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h2 className="font-display font-bold text-xl mb-2">
          Deletar este registro?
        </h2>
        <p className="text-sm text-ink-400 font-display mb-1">
          {metas.map((m) => m.emoji).join(" ")}{" "}
          <strong className="text-ink-500">
            {metas.map((m) => m.label).join(", ")}
          </strong>{" "}
          · {dateStr}
        </p>
        <p className="text-sm text-ink-400 font-display mb-5">
          Essa ação não pode ser desfeita.
        </p>

        {error && (
          <p className="text-sm text-blush-500 bg-blush-100 rounded-2xl px-4 py-3 font-display mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="btn-primary flex-1"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Deletando…
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" /> Deletar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
