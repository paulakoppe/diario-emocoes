"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EMOTIONS } from "@/lib/emotions";
import type { Emotion } from "@/types/database.types";

export default function DiaryForm() {
  const router = useRouter();
  const supabase = createClient();

  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!emotion) {
      setError("Escolha uma emoção primeiro 💛");
      return;
    }
    setError(null);
    setSaving(true);
    setSavedFlag(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada.");

      const { error } = await supabase.from("diary_entries").insert({
        user_id: user.id,
        emotion,
        intensity,
        text: text.trim() || null,
      });
      if (error) throw error;

      setSavedFlag(true);
      setEmotion(null);
      setIntensity(5);
      setText("");
      setTimeout(() => setSavedFlag(false), 2500);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  const intensityLabel =
    intensity <= 3 ? "Bem leve" : intensity <= 6 ? "Médio" : intensity <= 8 ? "Forte" : "Muito forte";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="card">
        <h2 className="font-display font-bold text-lg mb-1">
          Que emoção é essa?
        </h2>
        <p className="text-xs text-ink-400 font-display mb-4">
          Toque na que mais combina com você agora.
        </p>

        <div className="grid grid-cols-4 gap-3">
          {EMOTIONS.map((e) => {
            const selected = emotion === e.id;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setEmotion(e.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition ${
                  selected
                    ? `${e.bgClass} ring-4 ${e.ringClass} animate-pop`
                    : "bg-cream-200 hover:scale-105"
                }`}
                style={selected ? { color: "#4A4440" } : undefined}
              >
                <span className="text-3xl" aria-hidden>
                  {e.emoji}
                </span>
                <span
                  className={`text-xs font-display font-semibold ${
                    selected ? "" : "text-soft"
                  }`}
                >
                  {e.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section
        className={`card transition ${
          emotion ? "opacity-100" : "opacity-50 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg">Intensidade</h2>
          <span className="px-3 py-1 rounded-full bg-blush-100 text-blush-500 font-display font-semibold text-sm">
            {intensity} · {intensityLabel}
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={10}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="emotion-slider"
          aria-label="Intensidade da emoção"
        />
        <div className="flex justify-between text-xs font-display text-ink-400 mt-2 px-1">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </section>

      <section
        className={`card transition ${
          emotion ? "opacity-100" : "opacity-50 pointer-events-none"
        }`}
      >
        <h2 className="font-display font-bold text-lg mb-3">
          Quer escrever sobre isso?
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Seja livre pra dizer o que sente"
          rows={5}
          className="input-field resize-none"
        />
        <p className="text-xs text-ink-400 font-display mt-2 ml-2">
          Opcional, mas escrever ajuda 🌷
        </p>
      </section>

      {error && (
        <p className="text-sm text-blush-500 bg-blush-100 rounded-2xl px-4 py-3 font-display">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !emotion}
        className="btn-primary w-full"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Salvando…
          </>
        ) : savedFlag ? (
          <>
            <Check className="w-5 h-5" /> Salvo com carinho!
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" /> Salvar no diário
          </>
        )}
      </button>
    </form>
  );
}
