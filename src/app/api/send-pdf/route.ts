import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { emotionById } from "@/lib/emotions";

interface Body {
  to: string;
  filename: string;
  pdfBase64: string;
  entry: {
    emotions: string[];
    intensity: number;
    created_at: string;
  };
  userName: string | null;
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

  const { to, filename, pdfBase64, entry, userName } = body;

  if (!to || !filename || !pdfBase64 || !entry) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  // Validação simples de email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  const metas = entry.emotions
    .map((id) => emotionById(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));
  const emotionDisplay = metas.length
    ? metas.map((m) => `${m.emoji} ${m.label}`).join(" · ")
    : entry.emotions.join(", ");
  const date = new Date(entry.created_at).toLocaleDateString("pt-BR");
  const author = userName || user.email || "Alguém";

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject: `${author} compartilhou um registro do diário 🌷`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #FFF8F3; border-radius: 16px; color: #4A4440;">
          <h1 style="margin: 0 0 8px; color: #DC6E85; font-size: 22px;">Diário de Emoções 🌸</h1>
          <p style="margin: 0 0 16px; color: #7A7470; font-size: 14px;">
            <strong>${escapeHtml(author)}</strong> compartilhou um registro com você.
          </p>
          <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <p style="margin: 0 0 4px; font-size: 13px; color: #7A7470;">${escapeHtml(date)}</p>
            <p style="margin: 0; font-size: 16px;">
              <strong>${escapeHtml(emotionDisplay)}</strong>
              <br/>
              <span style="font-size: 13px; color: #7A7470;">Intensidade ${entry.intensity}/10</span>
            </p>
          </div>
          <p style="margin: 0; font-size: 13px; color: #7A7470;">
            O registro completo está no PDF em anexo.
          </p>
          <p style="margin: 24px 0 0; font-size: 11px; color: #B4AEAA; text-align: center;">
            Feito com carinho 🌸
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
