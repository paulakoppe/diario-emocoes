"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles, History, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EMOTIONS } from "@/lib/emotions";
import type { Emotion } from "@/types/database.types";

export default function DiaryForm() {
  const router = useRouter();
  const supabase = createClient();

  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [intensity, setIntensity] = useState(5);

  function toggleEmotion(id: Emotion) {
    setEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  }
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-dismiss do toast após 6s
  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 6000);
    return () => clearTimeout(t);
  }, [showToast]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (emotions.length === 0) {
      setError("Escolha pelo menos uma emoção primeiro 💛");
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
        emotions,
        intensity,
        text: text.trim() || null,
      });
      if (error) throw error;

      setSavedFlag(true);
      setShowToast(true);
      setEmotions([]);
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
    <>
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-slide-up">
          <div className="card flex items-start gap-3 shadow-soft-lg border border-mint-200">
            <div className="w-10 h-10 rounded-full bg-mint-200 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-mint-400" strokeWidth={3} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-ink-600">
                Salvo com carinho! 🌷
              </p>
              <p className="text-sm text-soft font-display mt-0.5">
                Seu registro tá guardadinho na aba{" "}
                <strong className="text-ink-600">Histórico</strong>.
              </p>
              <Link
                href="/historico"
                className="inline-flex items-center gap-1 mt-2 text-sm font-display font-semibold text-blush-500 hover:text-blush-400"
              >
                <History className="w-4 h-4" />
                Ver agora
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="w-8 h-8 rounded-full hover:bg-cream-200 flex items-center justify-center shrink-0 text-soft"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
      <section className="card">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="font-display font-bold text-lg">
            Que emoções são essas?
          </h2>
          {emotions.length > 0 && (
            <span className="text-xs font-display font-semibold text-blush-500">
              {emotions.length} selecionada{emotions.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="text-xs text-ink-400 font-display mb-4">
          Toque em todas que combinam com você agora.
        </p>

        <div className="grid grid-cols-4 gap-3">
          {EMOTIONS.map((e) => {
            const selected = emotions.includes(e.id);
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => toggleEmotion(e.id)}
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
          emotions.length > 0 ? "opacity-100" : "opacity-50 pointer-events-none"
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
          emotions.length > 0 ? "opacity-100" : "opacity-50 pointer-events-none"
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
        disabled={saving || emotions.length === 0}
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
    </>
  );
}
