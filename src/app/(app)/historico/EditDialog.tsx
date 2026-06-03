"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EMOTIONS } from "@/lib/emotions";
import type { DiaryEntry, Emotion } from "@/types/database.types";

interface Props {
  entry: DiaryEntry;
  onClose: () => void;
}

export default function EditDialog({ entry, onClose }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [emotion, setEmotion] = useState<Emotion>(entry.emotion);
  const [intensity, setIntensity] = useState(entry.intensity);
  const [text, setText] = useState(entry.text ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const label =
    intensity <= 3 ? "Bem leve" : intensity <= 6 ? "Médio" : intensity <= 8 ? "Forte" : "Muito forte";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const { error } = await supabase
        .from("diary_entries")
        .update({
          emotion,
          intensity,
          text: text.trim() || null,
        })
        .eq("id", entry.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-600/40 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-soft-lg p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl">Editar registro</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-cream-200 flex items-center justify-center hover:bg-cream-100 transition"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-display font-semibold text-ink-500 mb-2">
              Emoção
            </p>
            <div className="grid grid-cols-4 gap-2">
              {EMOTIONS.map((e) => {
                const selected = emotion === e.id;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setEmotion(e.id)}
                    className={`flex flex-col items-center gap-0.5 p-2 rounded-2xl transition ${
                      selected
                        ? `${e.bgClass} ring-4 ${e.ringClass} animate-pop`
                        : "bg-cream-200 hover:scale-105"
                    }`}
                    style={selected ? { color: "#4A4440" } : undefined}
                  >
                    <span className="text-2xl">{e.emoji}</span>
                    <span
                      className={`text-[10px] font-display font-semibold ${
                        selected ? "" : "text-soft"
                      }`}
                    >
                      {e.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-display font-semibold text-ink-500">
                Intensidade
              </p>
              <span className="px-3 py-0.5 rounded-full bg-blush-100 text-blush-500 font-display font-semibold text-xs">
                {intensity} · {label}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="emotion-slider"
            />
          </div>

          <div>
            <p className="text-sm font-display font-semibold text-ink-500 mb-2">
              Texto
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Seja livre pra dizer o que sente"
              rows={4}
              className="input-field resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-blush-500 bg-blush-100 rounded-2xl px-4 py-3 font-display">
              {error}
            </p>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Salvando…
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" /> Salvo!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Salvar alterações
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
