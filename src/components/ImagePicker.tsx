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

const MAX_SIZE_MB = 5;

export default function ImagePicker({
  userId,
  images,
  onChange,
  maxImages = 3,
}: Props) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = maxImages - images.length;
    const accepted = files.slice(0, remaining);

    setError(null);
    setUploading(true);

    const newUrls: string[] = [];

    for (const file of accepted) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Cada foto precisa ter menos de ${MAX_SIZE_MB}MB.`);
        continue;
      }
      if (!file.type.startsWith("image/")) {
        setError("Só imagens.");
        continue;
      }
      try {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${userId}/${Date.now()}-${Math.random()
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
        setError(
          err instanceof Error ? err.message : "Erro ao enviar imagem.",
        );
      }
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }

    setUploading(false);
    // Reset input pra permitir reescolher o mesmo arquivo
    if (fileRef.current) fileRef.current.value = "";
  }

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
              Enviando…
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
