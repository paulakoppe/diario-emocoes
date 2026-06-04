import jsPDF from "jspdf";
import { emotionById, getEntryEmotions } from "./emotions";
import type { DiaryEntry } from "@/types/database.types";

export interface PdfMeta {
  userName?: string | null;
  userEmail?: string | null;
}

export function buildEntryPdf(entry: DiaryEntry, meta: PdfMeta): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
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
  const emotionLabel = metas.length
    ? metas.map((m) => `${m.emoji}  ${m.label}`).join("    ")
    : emotionIds.join(", ");
  const emotionLines = doc.splitTextToSize(emotionLabel, pageWidth - margin * 2);
  doc.text(emotionLines, margin, 196);

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
    "Feito com carinho 🌸  ·  Diário de Emoções",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 30,
    { align: "center" },
  );

  return doc;
}

export function pdfToBase64(doc: jsPDF): string {
  return doc.output("datauristring").split(",")[1];
}

export function downloadPdf(doc: jsPDF, filename: string) {
  doc.save(filename);
}
