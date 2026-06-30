import jsPDF from "jspdf";
import { emotionById, getEntryEmotions } from "./emotions";
import type { DiaryEntry } from "@/types/database.types";

export interface PdfMeta {
  userName?: string | null;
  userEmail?: string | null;
}

async function imageUrlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao carregar imagem");
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Falha ao ler imagem"));
    reader.readAsDataURL(blob);
  });
}

function detectImageFormat(dataUrl: string): "JPEG" | "PNG" | "WEBP" {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  if (dataUrl.startsWith("data:image/webp")) return "WEBP";
  return "JPEG";
}

async function drawEntryOnDoc(doc: jsPDF, entry: DiaryEntry, meta: PdfMeta) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 56;

  // Fundo
  doc.setFillColor(255, 248, 243); // cream-100
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

  // Faixa decorativa
  doc.setFillColor(244, 182, 194); // blush-300
  doc.rect(0, 0, pageWidth, 8, "F");

  // Cabeçalho
  doc.setTextColor(74, 68, 64);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Diário de Emoções", margin, 70);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(122, 116, 112);
  const author = meta.userName || meta.userEmail || "Anônimo";
  doc.text(`Por: ${author}`, margin, 88);

  // Linha divisória
  doc.setDrawColor(250, 207, 215);
  doc.setLineWidth(1);
  doc.line(margin, 104, pageWidth - margin, 104);

  // Data
  const date = new Date(entry.created_at);
  const dateStr = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.setFontSize(11);
  doc.setTextColor(122, 116, 112);
  doc.text(`${dateStr} · ${timeStr}`, margin, 130);

  // Emoções (pode ter várias) — usa helper resiliente
  const emotionIds = getEntryEmotions(entry);
  const metas = emotionIds
    .map((id) => emotionById(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(74, 68, 64);
  doc.text("Como me sentia", margin, 170);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(74, 68, 64);

  if (metas.length) {
    const circleR = 6;
    const labelGap = 10;
    const itemGap = 24;
    const lineHeight = 26;
    const baselineY = 196;
    const maxX = pageWidth - margin;

    let x = margin;
    let y = baselineY;

    metas.forEach((m) => {
      const labelW = doc.getTextWidth(m.label);
      const itemW = circleR * 2 + labelGap + labelW;

      if (x + itemW > maxX && x > margin) {
        x = margin;
        y += lineHeight;
      }

      const [r, g, b] = m.pdfColor;
      doc.setFillColor(r, g, b);
      doc.circle(x + circleR, y - 4, circleR, "F");

      doc.text(m.label, x + circleR * 2 + labelGap, y);

      x += itemW + itemGap;
    });
  } else {
    const fallback = emotionIds.join(", ");
    const lines = doc.splitTextToSize(fallback, pageWidth - margin * 2);
    doc.text(lines, margin, 196);
  }

  // Intensidade
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Intensidade", margin, 236);

  // Barra de intensidade
  const barX = margin;
  const barY = 252;
  const barW = pageWidth - margin * 2;
  const barH = 14;
  doc.setFillColor(253, 232, 236);
  doc.roundedRect(barX, barY, barW, barH, 7, 7, "F");
  doc.setFillColor(220, 110, 133);
  doc.roundedRect(barX, barY, (barW * entry.intensity) / 10, barH, 7, 7, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(122, 116, 112);
  doc.text(`${entry.intensity} de 10`, margin, barY + barH + 18);

  // Texto livre
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(74, 68, 64);
  doc.text("O que eu escrevi", margin, 320);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const body = entry.text?.trim() || "(sem texto)";
  const lines = doc.splitTextToSize(body, pageWidth - margin * 2);
  doc.text(lines, margin, 344);

  // Rodapé
  doc.setFontSize(9);
  doc.setTextColor(180, 174, 170);
  doc.text(
    "Diário de Emoções",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 30,
    { align: "center" },
  );

  // Imagens (página dedicada, se houver)
  if (entry.images && entry.images.length > 0) {
    doc.addPage();

    // Fundo + faixa
    doc.setFillColor(255, 248, 243);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");
    doc.setFillColor(244, 182, 194);
    doc.rect(0, 0, pageWidth, 8, "F");

    // Header da página de fotos
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(74, 68, 64);
    doc.text("Fotos do registro", margin, 70);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(122, 116, 112);
    doc.text(`${dateStr} · ${timeStr}`, margin, 88);

    // Grid 2 colunas
    const imgSize = 220;
    const gap = 20;
    const startY = 110;

    for (let i = 0; i < entry.images.length; i++) {
      try {
        const dataUrl = await imageUrlToDataUrl(entry.images[i]);
        const fmt = detectImageFormat(dataUrl);
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = margin + col * (imgSize + gap);
        const y = startY + row * (imgSize + gap);
        doc.addImage(dataUrl, fmt, x, y, imgSize, imgSize);
      } catch {
        // Imagem inacessível — pula silenciosamente
      }
    }

    // Rodapé
    doc.setFontSize(9);
    doc.setTextColor(180, 174, 170);
    doc.text(
      "Diário de Emoções",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 30,
      { align: "center" },
    );
  }
}

export async function buildEntryPdf(
  entry: DiaryEntry,
  meta: PdfMeta,
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  await drawEntryOnDoc(doc, entry, meta);
  return doc;
}

export async function buildEntriesPdf(
  entries: DiaryEntry[],
  meta: PdfMeta,
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  for (let i = 0; i < entries.length; i++) {
    if (i > 0) doc.addPage();
    await drawEntryOnDoc(doc, entries[i], meta);
  }
  return doc;
}

export function pdfToBase64(doc: jsPDF): string {
  return doc.output("datauristring").split(",")[1];
}

export function downloadPdf(doc: jsPDF, filename: string) {
  doc.save(filename);
}
