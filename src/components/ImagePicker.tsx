"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

const HARD_LIMIT_MB = 25; // Limite absoluto antes mesmo de tentar comprimir
const COMPRESS_THRESHOLD_BYTES = 800 * 1024; // Comprime tudo acima de 800KB
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

async function compressImage(file: File): Promise<File> {
  // Pequena ou tipo não-imagem padrão: passa direto
  if (file.size <= COMPRESS_THRESHOLD_BYTES) return file;
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const ratio = Math.min(
      MAX_DIMENSION / bitmap.width,
      MAX_DIMENSION / bitmap.height,
      1,
    );
    const width = Math.round(bitmap.width * ratio);
    const height = Math.round(bitmap.height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file; // se o browser não suportar, sobe original
  }
}

export default function ImagePicker({
  userId,
  images,
  onChange,
  maxImages = 3,
}: Props) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<"idle" | "compressing" | "uploading">(
    "idle",
  );
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = maxImages - images.length;
    const accepted = files.slice(0, remaining);
    if (accepted.length === 0) return;

    setError(null);
    setProgress({ done: 0, total: accepted.length });

    const newUrls: string[] = [];
    const erros: string[] = [];

    for (let i = 0; i < accepted.length; i++) {
      const original = accepted[i];

      if (!original.type.startsWith("image/")) {
        erros.push(`${original.name}: só imagens.`);
        continue;
      }
      if (original.size > HARD_LIMIT_MB * 1024 * 1024) {
        erros.push(`${original.name}: foto muito grande (acima de ${HARD_LIMIT_MB}MB).`);
        continue;
      }

      try {
        setStage("compressing");
        const file = await compressImage(original);

        setStage("uploading");
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${userId}/${Date.now()}-${i}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("diary-images")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        const { data } = supabase.storage
          .from("diary-images")
          .getPublicUrl(path);
        newUrls.push(data.publicUrl);
      } catch (err) {
        erros.push(
          err instanceof Error ? err.message : "Erro ao enviar imagem.",
        );
      }

      setProgress({ done: i + 1, total: accepted.length });
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }
    if (erros.length > 0) {
      setError(erros.join(" "));
    }

    setStage("idle");
    setProgress(null);
    // Reset input pra permitir reescolher o mesmo arquivo
    if (fileRef.current) fileRef.current.value = "";
  }

  const uploading = stage !== "idle";

  function removeImage(url: string) {
    onChange(images.filter((u) => u !== url));
  }

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url) => (
            <div
              key={url}
              className="relative aspect-square rounded-2xl overflow-hidden bg-cream-200"
            >
              <Image
                src={url}
                alt="Foto anexada"
                fill
                sizes="(max-width: 768px) 33vw, 200px"
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 w-7 h-7 rounded-full bg-ink-600/70 text-white flex items-center justify-center hover:bg-ink-600 transition"
                aria-label="Remover foto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-full bg-cream-200 text-ink-500 hover:bg-blush-100 hover:text-blush-500 px-4 py-2 font-display font-semibold text-sm transition active:scale-95 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {stage === "compressing" ? "Otimizando…" : "Enviando…"}
              {progress && progress.total > 1 && (
                <span className="text-xs font-normal">
                  {progress.done}/{progress.total}
                </span>
              )}
            </>
          ) : (
            <>
              <ImagePlus className="w-4 h-4" />
              Adicionar foto
              <span className="text-xs font-normal text-soft">
                ({images.length}/{maxImages})
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {error && (
        <p className="text-xs font-display text-blush-500">{error}</p>
      )}
    </div>
  );
}
