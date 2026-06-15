import type { Emotion } from "@/types/database.types";

export interface EmotionMeta {
  id: Emotion;
  label: string;
  emoji: string;
  tone: "positive" | "negative";
  bgClass: string;
  ringClass: string;
  textClass: string;
  /** RGB usado no PDF (jsPDF não renderiza emoji Unicode). */
  pdfColor: [number, number, number];
}

export const EMOTIONS: EmotionMeta[] = [
  {
    id: "feliz",
    label: "Feliz",
    emoji: "😊",
    tone: "positive",
    bgClass: "bg-butter-200",
    ringClass: "ring-butter-300",
    textClass: "text-ink-600",
    pdfColor: [255, 220, 133],
  },
  {
    id: "grato",
    label: "Grato",
    emoji: "🥰",
    tone: "positive",
    bgClass: "bg-blush-200",
    ringClass: "ring-blush-400",
    textClass: "text-ink-600",
    pdfColor: [236, 145, 164],
  },
  {
    id: "calmo",
    label: "Calmo",
    emoji: "😌",
    tone: "positive",
    bgClass: "bg-mint-200",
    ringClass: "ring-mint-400",
    textClass: "text-ink-600",
    pdfColor: [143, 204, 182],
  },
  {
    id: "animado",
    label: "Animado",
    emoji: "🤩",
    tone: "positive",
    bgClass: "bg-lavender-200",
    ringClass: "ring-lavender-400",
    textClass: "text-ink-600",
    pdfColor: [185, 127, 209],
  },
  {
    id: "triste",
    label: "Triste",
    emoji: "😔",
    tone: "negative",
    bgClass: "bg-blue-100",
    ringClass: "ring-blue-300",
    textClass: "text-ink-600",
    pdfColor: [147, 197, 253],
  },
  {
    id: "ansioso",
    label: "Ansioso",
    emoji: "😰",
    tone: "negative",
    bgClass: "bg-purple-100",
    ringClass: "ring-purple-300",
    textClass: "text-ink-600",
    pdfColor: [216, 180, 254],
  },
  {
    id: "irritado",
    label: "Irritado",
    emoji: "😤",
    tone: "negative",
    bgClass: "bg-red-100",
    ringClass: "ring-red-300",
    textClass: "text-ink-600",
    pdfColor: [252, 165, 165],
  },
  {
    id: "cansado",
    label: "Cansado",
    emoji: "😴",
    tone: "negative",
    bgClass: "bg-gray-100",
    ringClass: "ring-gray-300",
    textClass: "text-ink-600",
    pdfColor: [209, 213, 219],
  },
  {
    id: "apatico",
    label: "Apatia",
    emoji: "😶",
    tone: "negative",
    bgClass: "bg-slate-100",
    ringClass: "ring-slate-300",
    textClass: "text-ink-600",
    pdfColor: [203, 213, 225],
  },
];

export const emotionById = (id: string): EmotionMeta | undefined =>
  EMOTIONS.find((e) => e.id === id);

/**
 * Extrai a lista de emoções de uma entry, tolerante a schemas antigos.
 * - Schema novo: { emotions: ["feliz", "grato"] }
 * - Schema antigo: { emotion: "feliz" }
 * - Schema corrompido/parcial: retorna []
 */
export function getEntryEmotions(entry: unknown): string[] {
  if (!entry || typeof entry !== "object") return [];
  const e = entry as Record<string, unknown>;
  if (Array.isArray(e.emotions)) {
    return e.emotions.filter((x): x is string => typeof x === "string");
  }
  if (typeof e.emotion === "string") {
    return [e.emotion];
  }
  return [];
}
