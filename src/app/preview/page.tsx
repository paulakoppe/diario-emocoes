"use client";

import { useState } from "react";
import {
  Heart,
  Mail,
  Lock,
  Camera,
  User,
  Phone,
  Send,
  Sparkles,
  BookHeart,
  History,
  User as UserIcon,
} from "lucide-react";
import { EMOTIONS, emotionById } from "@/lib/emotions";
import DiaryEntryCard from "@/components/DiaryEntryCard";
import type { DiaryEntry, Emotion } from "@/types/database.types";

const MOCK_ENTRIES: DiaryEntry[] = [
  {
    id: "1",
    user_id: "demo",
    emotion: "grato",
    intensity: 8,
    text: "Hoje meu café da manhã teve sol entrando pela janela. Coisas simples, sabe? Fiquei pensando como faz tempo que eu não notava esses detalhes.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "2",
    user_id: "demo",
    emotion: "ansioso",
    intensity: 6,
    text: "Reunião amanhã cedo. Tô tentando não ficar remoendo, mas a cabeça insiste.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
  },
  {
    id: "3",
    user_id: "demo",
    emotion: "calmo",
    intensity: 7,
    text: "Caminhada longa no parque. Voltei mais leve.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

type Tab = "login" | "perfil" | "diario" | "historico";

export default function PreviewPage() {
  const [tab, setTab] = useState<Tab>("login");

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-blush-100">
      {/* Banner aviso */}
      <div className="bg-lavender-200 text-ink-600 text-sm font-display py-2 px-4 text-center">
        🌸 <strong>Modo Preview</strong> — visual sem backend. Configure o
        Supabase no <code className="bg-white/60 px-1 rounded">.env.local</code>{" "}
        para ativar tudo.
      </div>

      {/* Switcher de telas */}
      <div className="sticky top-0 z-20 bg-cream-100/90 backdrop-blur-md border-b border-blush-100">
        <div className="max-w-md mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          {(
            [
              ["login", "Login"],
              ["perfil", "Perfil"],
              ["diario", "Diário"],
              ["historico", "Histórico"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`shrink-0 px-4 py-1.5 rounded-full font-display font-semibold text-sm transition ${
                tab === id
                  ? "bg-blush-400 text-white shadow-soft"
                  : "bg-white text-ink-500 hover:bg-cream-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 animate-fade-in">
        {tab === "login" && <LoginPreview />}
        {tab === "perfil" && <PerfilPreview />}
        {tab === "diario" && <DiarioPreview />}
        {tab === "historico" && <HistoricoPreview />}
      </div>

      {/* Bottom nav (visual) */}
      {tab !== "login" && (
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-md">
          <div className="bg-white rounded-full shadow-soft-lg px-2 py-2 flex items-center justify-around border border-blush-100">
            {(
              [
                ["perfil", "Perfil", UserIcon],
                ["diario", "Diário", BookHeart],
                ["historico", "Histórico", History],
              ] as [Tab, string, typeof UserIcon][]
            ).map(([id, label, Icon]) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`relative flex flex-col items-center justify-center flex-1 py-2 rounded-full font-display text-xs transition ${
                    active ? "text-blush-500" : "text-ink-400"
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 bg-blush-100 rounded-full -z-10 animate-pop" />
                  )}
                  <Icon
                    className="w-5 h-5 mb-0.5"
                    fill={active ? "currentColor" : "none"}
                    strokeWidth={active ? 0 : 2}
                  />
                  <span className={active ? "font-bold" : "font-medium"}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <div className="h-32" />
    </div>
  );
}

/* ─── Login ─── */
function LoginPreview() {
  const [remember, setRemember] = useState(true);
  return (
    <div className="animate-slide-up">
      <div className="text-center mb-8">
        <div className="inline-flex w-20 h-20 items-center justify-center rounded-full bg-white shadow-soft mb-4">
          <Heart className="w-10 h-10 text-blush-400" fill="currentColor" />
        </div>
        <h1 className="text-3xl font-display font-bold">Diário de Emoções</h1>
        <p className="text-ink-400 mt-2 font-display">
          Um espaço só seu, com carinho.
        </p>
      </div>

      <div className="card">
        <div className="flex bg-cream-200 rounded-full p-1 mb-6">
          <button className="flex-1 py-2 rounded-full bg-white shadow-soft font-display font-semibold text-sm">
            Entrar
          </button>
          <button className="flex-1 py-2 rounded-full text-ink-400 font-display font-semibold text-sm">
            Criar conta
          </button>
        </div>

        <div className="space-y-4">
          <Field icon={Mail} label="Email" placeholder="voce@email.com" />
          <Field icon={Lock} label="Senha" placeholder="••••••••" type="password" />

          <label className="flex items-center gap-3 cursor-pointer select-none px-2 py-1">
            <span
              className={`relative inline-flex h-6 w-11 rounded-full transition ${
                remember ? "bg-blush-400" : "bg-cream-200"
              }`}
              onClick={() => setRemember(!remember)}
            >
              <span
                className={`absolute top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                  remember ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </span>
            <span className="text-sm font-display text-ink-500">
              Manter conectado
            </span>
          </label>

          <button className="btn-primary w-full">Entrar</button>
        </div>
      </div>

      <p className="text-center text-xs text-ink-400 mt-6 font-display">
        Feito com carinho 🌸
      </p>
    </div>
  );
}

/* ─── Perfil ─── */
function PerfilPreview() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold">Seu perfil</h1>
        <p className="text-ink-400 font-display text-sm">Quem é você por aqui?</p>
      </header>

      <div className="card space-y-6">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-blush-100 flex items-center justify-center ring-4 ring-white shadow-soft">
              <span className="text-4xl font-display font-bold text-blush-400">
                M
              </span>
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-blush-400 text-white shadow-soft flex items-center justify-center"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-3 text-xs font-display text-ink-400">
            Sem foto? Sem problema 💕
          </p>
        </div>

        <div className="space-y-4">
          <Field icon={User} label="Nome" value="Maria" />
          <Field icon={Phone} label="Telefone" value="(11) 99999-9999" />
          <Field icon={Mail} label="Email" value="maria@email.com" />
        </div>

        <button className="btn-primary w-full">Salvar alterações</button>
      </div>
    </div>
  );
}

/* ─── Diário ─── */
function DiarioPreview() {
  const [emotion, setEmotion] = useState<Emotion | null>("grato");
  const [intensity, setIntensity] = useState(7);
  const [text, setText] = useState("");

  const label =
    intensity <= 3 ? "Bem leve" : intensity <= 6 ? "Médio" : intensity <= 8 ? "Forte" : "Muito forte";

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold">Boa tarde, Maria 🌷</h1>
        <p className="text-ink-400 font-display text-sm mt-1">
          Como você está se sentindo agora?
        </p>
      </header>

      <div className="space-y-6">
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
                  <span className="text-3xl">{e.emoji}</span>
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

        <section className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg">Intensidade</h2>
            <span className="px-3 py-1 rounded-full bg-blush-100 text-blush-500 font-display font-semibold text-sm">
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
          <div className="flex justify-between text-xs font-display text-ink-400 mt-2 px-1">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </section>

        <section className="card">
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

        <button className="btn-primary w-full">
          <Sparkles className="w-5 h-5" />
          Salvar no diário
        </button>
      </div>
    </div>
  );
}

/* ─── Histórico ─── */
function HistoricoPreview() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold">Seu histórico</h1>
        <p className="text-ink-400 font-display text-sm mt-1">
          Cada registro é um pedacinho de você.
        </p>
      </header>

      <div className="space-y-3">
        {MOCK_ENTRIES.map((entry) => (
          <DiaryEntryCard
            key={entry.id}
            entry={entry}
            onShare={() => alert("No preview o envio fica desabilitado 😉")}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── helpers ─── */
function Field({
  icon: Icon,
  label,
  placeholder,
  value,
  type = "text",
}: {
  icon: typeof Mail;
  label: string;
  placeholder?: string;
  value?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-display font-semibold text-ink-500 ml-2">
        {label}
      </span>
      <div className="relative mt-1">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blush-300" />
        <input
          type={type}
          defaultValue={value}
          placeholder={placeholder}
          className="input-field pl-12"
          readOnly={!!value}
        />
      </div>
    </label>
  );
}
