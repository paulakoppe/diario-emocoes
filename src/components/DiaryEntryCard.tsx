"use client";

import { Send, Pencil, Trash2, Check } from "lucide-react";
import { emotionById, getEntryEmotions } from "@/lib/emotions";
import type { DiaryEntry } from "@/types/database.types";

interface Props {
  entry: DiaryEntry;
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export default function DiaryEntryCard({
  entry,
  onShare,
  onEdit,
  onDelete,
  selectable = false,
  selected = false,
  onToggleSelect,
}: Props) {
  const date = new Date(entry.created_at);
  const dateStr = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Fallback: se vier 1 só, mantém visual atual
  const metas = getEntryEmotions(entry)
    .map((id) => emotionById(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));
  const labels = metas.map((m) => m.label).join(", ");
  const firstBg = metas[0]?.bgClass ?? "bg-cream-200";

  const cardClasses = [
    "card animate-fade-in",
    selectable ? "cursor-pointer transition" : "",
    selectable && selected
      ? "ring-2 ring-blush-400 bg-blush-100/40 dark:bg-blush-400/10"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={cardClasses}
      onClick={selectable ? onToggleSelect : undefined}
      role={selectable ? "button" : undefined}
      aria-pressed={selectable ? selected : undefined}
    >
      <header className="flex items-start gap-3 mb-3">
        <div className="shrink-0">
          {metas.length === 1 ? (
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${firstBg}`}
            >
              {metas[0].emoji}
            </div>
          ) : (
            <div className="flex -space-x-2">
              {metas.slice(0, 3).map((m, i) => (
                <div
                  key={m.id}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ring-2 ring-white dark:ring-[rgb(44,38,48)] ${m.bgClass}`}
                  style={{ zIndex: 10 - i }}
                >
                  {m.emoji}
                </div>
              ))}
              {metas.length > 3 && (
                <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center text-xs font-display font-bold text-ink-500 ring-2 ring-white dark:ring-[rgb(44,38,48)]">
                  +{metas.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-bold text-ink-600">
              {labels || "Emoção"}
            </h3>
            <span className="text-xs font-display text-blush-400 bg-blush-100 px-2 py-0.5 rounded-full">
              Intensidade {entry.intensity}/10
            </span>
          </div>
          <p className="text-xs text-ink-400 font-display mt-0.5">
            {dateStr} · {timeStr}
          </p>
        </div>

        {selectable && (
          <div
            className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition border-2 ${
              selected
                ? "bg-blush-400 border-blush-400 text-white"
                : "border-ink-400/40 dark:border-[rgb(188,178,184)]/40"
            }`}
            aria-hidden
          >
            {selected && <Check className="w-4 h-4" strokeWidth={3} />}
          </div>
        )}
      </header>

      {entry.text && (
        <p className="text-sm text-ink-500 leading-relaxed whitespace-pre-wrap break-words mb-3">
          {entry.text}
        </p>
      )}

      {!selectable && (
        <div className="flex items-center gap-1 -mb-2 -mr-2 justify-end">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="btn-icon text-ink-400 hover:bg-cream-200 hover:text-lavender-400"
              aria-label="Editar"
              title="Editar entrada"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="btn-icon text-ink-400 hover:bg-blush-100 hover:text-blush-500"
              aria-label="Deletar"
              title="Deletar entrada"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="btn-icon bg-blush-100 text-blush-500 hover:bg-blush-200"
              aria-label="Compartilhar como PDF"
              title="Enviar por email como PDF"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </article>
  );
}
