import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { emotionById } from "@/lib/emotions";

interface EntryPayload {
  emotions: string[];
  intensity: number;
  created_at: string;
}

interface Body {
  to: string;
  filename: string;
  pdfBase64: string;
  entries?: EntryPayload[];
  entry?: EntryPayload; // retrocompat com chamadas antigas
  userName: string | null;
}

function formatEmotions(emotions: string[]): string {
  const metas = emotions
    .map((id) => emotionById(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));
  return metas.length
    ? metas.map((m) => `${m.emoji} ${m.label}`).join(" · ")
    : emotions.join(", ");
}

function formatDateTime(iso: string): { date: string; time: string } {
  const date = new Date(iso).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = new Date(iso).toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
  return { date, time };
}

export async function POST(request: Request) {
  // Auth check: usuário precisa estar logado para usar o endpoint
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY não configurada no servidor." },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { to, filename, pdfBase64, entries, entry, userName } = body;

  // Aceita tanto `entries` (novo) quanto `entry` (retrocompat)
  const entryList: EntryPayload[] = Array.isArray(entries) && entries.length
    ? entries
    : entry
      ? [entry]
      : [];

  if (!to || !filename || !pdfBase64 || entryList.length === 0) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  // Validação simples de email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  const author = userName || user.email || "Alguém";
  const isMulti = entryList.length > 1;

  const subject = isMulti
    ? `${author} compartilhou ${entryList.length} registros do diário`
    : `${author} compartilhou um registro do diário`;

  let entriesHtml: string;
  if (isMulti) {
    const rows = entryList
      .map((e) => {
        const { date, time } = formatDateTime(e.created_at);
        const emoLabel = formatEmotions(e.emotions);
        return `
          <div style="background: white; border-radius: 12px; padding: 12px 16px; margin-bottom: 8px;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #7A7470;">${escapeHtml(date)} · ${escapeHtml(time)}</p>
            <p style="margin: 0; font-size: 14px; line-height: 1.4;">
              <strong>${escapeHtml(emoLabel)}</strong>
              <span style="color: #7A7470; font-weight: normal;"> — intensidade ${e.intensity}/10</span>
            </p>
          </div>
        `;
      })
      .join("");
    entriesHtml = `
      <p style="margin: 0 0 12px; font-size: 13px; color: #7A7470;">
        ${entryList.length} registros incluídos:
      </p>
      ${rows}
    `;
  } else {
    const e = entryList[0];
    const { date, time } = formatDateTime(e.created_at);
    const emoLabel = formatEmotions(e.emotions);
    entriesHtml = `
      <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 6px; font-size: 13px; color: #7A7470;">${escapeHtml(date)} · ${escapeHtml(time)}</p>
        <p style="margin: 0; font-size: 16px; line-height: 1.5;">
          <strong>${escapeHtml(emoLabel)}</strong>
        </p>
        <p style="margin: 6px 0 0; font-size: 13px; color: #7A7470;">
          Intensidade ${e.intensity}/10
        </p>
      </div>
    `;
  }

  const intro = isMulti
    ? `<strong>${escapeHtml(author)}</strong> compartilhou ${entryList.length} registros com você.`
    : `<strong>${escapeHtml(author)}</strong> compartilhou um registro com você.`;

  const footer = isMulti
    ? "Os registros completos estão no PDF em anexo (um por página)."
    : "O registro completo está no PDF em anexo.";

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #FFF8F3; border-radius: 16px; color: #4A4440;">
          <h1 style="margin: 0 0 8px; color: #DC6E85; font-size: 22px;">Diário de Emoções</h1>
          <p style="margin: 0 0 16px; color: #7A7470; font-size: 14px;">
            ${intro}
          </p>
          ${entriesHtml}
          <p style="margin: 0; font-size: 13px; color: #7A7470;">
            ${footer}
          </p>
        </div>
      `,
      attachments: [
        {
          filename,
          content: pdfBase64,
        },
      ],
    });

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Erro do provedor de email." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro inesperado." },
      { status: 500 },
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
