"use client";

import { useMemo, useState } from "react";
import { TrendingUp, Calendar } from "lucide-react";
import { EMOTIONS, emotionById, getEntryEmotions } from "@/lib/emotions";
import type { DiaryEntry, Emotion } from "@/types/database.types";

interface Props {
  entries: DiaryEntry[];
}

type Range = "7d" | "30d" | "all";

export default function EmotionStats({ entries }: Props) {
  const [range, setRange] = useState<Range>("7d");

  const stats = useMemo(() => computeStats(entries, range), [entries, range]);

  if (entries.length === 0) return null;

  return (
    <section className="card mb-4">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blush-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blush-500" />
          </div>
          <h2 className="font-display font-bold">Seu humor</h2>
        </div>
        <div className="flex bg-cream-200 rounded-full p-1">
          {(["7d", "30d", "all"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-full text-xs font-display font-semibold transition ${
                range === r
                  ? "bg-white text-ink-600 shadow-soft"
                  : "text-ink-400"
              }`}
            >
              {r === "7d" ? "7 dias" : r === "30d" ? "30 dias" : "tudo"}
            </button>
          ))}
        </div>
      </header>

      {stats.total === 0 ? (
        <div className="text-center py-6">
          <Calendar className="w-8 h-8 text-ink-400 mx-auto mb-2" />
          <p className="text-sm font-display text-ink-400">
            Nenhum registro nesse período.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-5">
            <Stat
              label="Registros"
              value={stats.total.toString()}
              hint={range === "7d" ? "esta semana" : range === "30d" ? "este mês" : "no total"}
            />
            <Stat
              label="Intensidade"
              value={stats.avgIntensity.toFixed(1)}
              hint="em média"
            />
            <Stat
              label="Mais sentida"
              value={stats.topEmotion?.emoji ?? "—"}
              hint={stats.topEmotion?.label ?? ""}
            />
          </div>

          <div className="space-y-2">
            {stats.distribution.map(({ emotion, count, pct }) => {
              const meta = emotionById(emotion)!;
              return (
                <div key={emotion} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0 ${meta.bgClass}`}
                  >
                    {meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-display font-semibold text-ink-500">
                        {meta.label}
                      </span>
                      <span className="text-xs font-display text-ink-400">
                        {count} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blush-300 rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: tonGradient(meta.tone),
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-blush-100 flex items-center justify-between text-xs font-display">
            <span className="text-ink-400">Tom geral</span>
            <span
              className={
                stats.positiveRatio >= 0.5
                  ? "text-mint-400 font-semibold"
                  : "text-blush-500 font-semibold"
              }
            >
              {Math.round(stats.positiveRatio * 100)}% positivo ·{" "}
              {Math.round((1 - stats.positiveRatio) * 100)}% negativo
            </span>
          </div>
        </>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="bg-cream-200 rounded-2xl px-3 py-2 text-center">
      <div className="text-2xl font-display font-bold text-ink-600 leading-tight">
        {value}
      </div>
      <div className="text-[10px] font-display text-ink-400 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-[10px] font-display text-ink-400">{hint}</div>
    </div>
  );
}

function tonGradient(tone: "positive" | "negative") {
  return tone === "positive"
    ? "linear-gradient(to right, #B8E0D2, #8FCCB6)"
    : "linear-gradient(to right, #FACFD7, #DC6E85)";
}

interface ComputedStats {
  total: number;
  avgIntensity: number;
  topEmotion: { id: Emotion; label: string; emoji: string } | null;
  distribution: { emotion: Emotion; count: number; pct: number }[];
  positiveRatio: number;
}

function computeStats(entries: DiaryEntry[], range: Range): ComputedStats {
  const now = Date.now();
  const cutoff =
    range === "7d"
      ? now - 7 * 24 * 60 * 60 * 1000
      : range === "30d"
        ? now - 30 * 24 * 60 * 60 * 1000
        : 0;

  const filtered = entries.filter(
    (e) => new Date(e.created_at).getTime() >= cutoff,
  );

  if (filtered.length === 0) {
    return {
      total: 0,
      avgIntensity: 0,
      topEmotion: null,
      distribution: [],
      positiveRatio: 0,
    };
  }

  const total = filtered.length;
  const avgIntensity =
    filtered.reduce((acc, e) => acc + e.intensity, 0) / total;

  // Cada entrada pode ter várias emoções — cada uma conta como uma "ocorrência"
  const countByEmotion = new Map<Emotion, number>();
  let totalOccurrences = 0;
  let positiveOccurrences = 0;
  for (const entry of filtered) {
    for (const id of getEntryEmotions(entry)) {
      countByEmotion.set(id as Emotion, (countByEmotion.get(id as Emotion) ?? 0) + 1);
      totalOccurrences++;
      if (emotionById(id)?.tone === "positive") positiveOccurrences++;
    }
  }

  const distribution = EMOTIONS.map((e) => {
    const count = countByEmotion.get(e.id) ?? 0;
    return {
      emotion: e.id,
      count,
      pct: totalOccurrences > 0 ? Math.round((count / totalOccurrences) * 100) : 0,
    };
  })
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  const topId = distribution[0]?.emotion ?? null;
  const topMeta = topId ? emotionById(topId) : null;
  const topEmotion = topMeta
    ? { id: topMeta.id, label: topMeta.label, emoji: topMeta.emoji }
    : null;

  const positiveRatio = totalOccurrences > 0 ? positiveOccurrences / totalOccurrences : 0;

  return {
    total,
    avgIntensity,
    topEmotion,
    distribution,
    positiveRatio,
  };
}
