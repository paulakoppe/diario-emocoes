"use client";

import { useState, useEffect, type FormEvent } from "react";
import { X, Mail, Download, Send, Check, Loader2 } from "lucide-react";
import { buildEntryPdf, pdfToBase64, downloadPdf } from "@/lib/pdf";
import type { DiaryEntry } from "@/types/database.types";

interface Props {
  entry: DiaryEntry;
  defaultEmail: string;
  userName: string | null;
  userEmail: string | null;
  onClose: () => void;
}

export default function ShareDialog({
  entry,
  defaultEmail,
  userName,
  userEmail,
  onClose,
}: Props) {
  const [to, setTo] = useState(defaultEmail);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  function handleDownload() {
    const doc = buildEntryPdf(entry, { userName, userEmail });
    const filename = `diario-${entry.created_at.slice(0, 10)}.pdf`;
    downloadPdf(doc, filename);
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);

    try {
      const doc = buildEntryPdf(entry, { userName, userEmail });
      const pdfBase64 = pdfToBase64(doc);
      const filename = `diario-${entry.created_at.slice(0, 10)}.pdf`;

      const res = await fetch("/api/send-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          filename,
          pdfBase64,
          entry: {
            emotions: entry.emotions,
            intensity: entry.intensity,
            created_at: entry.created_at,
          },
          userName,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Falha ao enviar.");
      }

      setSent(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-600/40 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-soft-lg p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl">
            Compartilhar como PDF
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-cream-200 flex items-center justify-center hover:bg-cream-100 transition"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-ink-400 font-display mb-4">
          Vamos gerar um PDF deste registro e enviar para o email que você quiser.
        </p>

        <button
          type="button"
          onClick={handleDownload}
          className="btn-secondary w-full mb-4"
        >
          <Download className="w-4 h-4" />
          Só baixar o PDF
        </button>

        <div className="text-center text-xs font-display text-ink-400 mb-3">
          — ou enviar por email —
        </div>

        <form onSubmit={handleSend} className="space-y-3">
          <label className="block">
            <span className="text-sm font-display font-semibold text-ink-500 ml-2">
              Para qual email?
            </span>
            <div className="relative mt-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blush-300" />
              <input
                type="email"
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="destinatario@email.com"
                className="input-field pl-12"
              />
            </div>
          </label>

          {error && (
            <p className="text-sm text-blush-500 bg-blush-100 rounded-2xl px-4 py-3 font-display">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="btn-primary w-full"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Enviando…
              </>
            ) : sent ? (
              <>
                <Check className="w-4 h-4" /> Enviado!
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Enviar por email
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
