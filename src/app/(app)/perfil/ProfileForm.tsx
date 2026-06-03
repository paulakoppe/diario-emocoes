"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { Camera, User, Phone, Mail, Trash2, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  initialProfile: {
    id: string;
    name: string;
    phone: string;
    email: string;
    avatar_url: string | null;
  };
}

export default function ProfileForm({ initialProfile }: Props) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialProfile.name);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [email, setEmail] = useState(initialProfile.email);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialProfile.avatar_url,
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Imagem precisa ser menor que 5MB.");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${initialProfile.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  }

  async function removeAvatar() {
    setAvatarUrl(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSavedFlag(false);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: initialProfile.id,
          name: name || null,
          phone: phone || null,
          email: email || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
      setSavedFlag(true);
      setTimeout(() => setSavedFlag(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  const initial = (name || email || "?").trim().charAt(0).toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-blush-100 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-soft">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={112}
                height={112}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-4xl font-display font-bold text-blush-400">
                {initial}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-blush-400 text-white shadow-soft flex items-center justify-center hover:bg-blush-500 transition disabled:opacity-60"
            aria-label="Trocar foto"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {avatarUrl && (
          <button
            type="button"
            onClick={removeAvatar}
            className="mt-3 inline-flex items-center gap-1 text-xs font-display text-ink-400 hover:text-blush-500"
          >
            <Trash2 className="w-3 h-3" />
            Remover foto
          </button>
        )}

        {!avatarUrl && (
          <p className="mt-3 text-xs font-display text-ink-400">
            Sem foto? Sem problema 💕
          </p>
        )}
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-display font-semibold text-ink-500 ml-2">
            Nome
          </span>
          <div className="relative mt-1">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blush-300" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como você quer ser chamada(o)?"
              className="input-field pl-12"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-display font-semibold text-ink-500 ml-2">
            Telefone
          </span>
          <div className="relative mt-1">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blush-300" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="input-field pl-12"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-display font-semibold text-ink-500 ml-2">
            Email
          </span>
          <div className="relative mt-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blush-300" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="input-field pl-12"
            />
          </div>
        </label>
      </div>

      {error && (
        <p className="text-sm text-blush-500 bg-blush-100 rounded-2xl px-4 py-3 font-display">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="btn-primary w-full"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Salvando…
          </>
        ) : savedFlag ? (
          <>
            <Check className="w-5 h-5" /> Salvo!
          </>
        ) : (
          "Salvar alterações"
        )}
      </button>
    </form>
  );
}
