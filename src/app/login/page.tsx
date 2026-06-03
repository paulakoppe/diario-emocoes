"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Heart, Mail, Lock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogle() {
    setError(null);
    setInfo(null);
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // O Supabase redireciona o navegador — não retorna aqui em caso de sucesso.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no login Google.");
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setInfo(
          "Conta criada! Verifique seu email para confirmar antes de entrar.",
        );
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // "Manter conectado": se desmarcado, limpa sessão ao fechar a aba.
        if (!remember && typeof window !== "undefined") {
          window.sessionStorage.setItem("ephemeral-session", "1");
          window.addEventListener("beforeunload", () => {
            supabase.auth.signOut();
          });
        }

        router.push("/diario");
        router.refresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Algo deu errado.";
      setError(traduzErro(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-b from-cream-100 via-blush-100 to-lavender-100">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 items-center justify-center rounded-full bg-white shadow-soft mb-4">
            <Heart className="w-10 h-10 text-blush-400" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-display font-bold text-ink-600">
            Diário de Emoções
          </h1>
          <p className="text-ink-400 mt-2 font-display">
            Um espaço só seu, com carinho.
          </p>
        </div>

        <div className="card animate-fade-in">
          <div className="flex bg-cream-200 rounded-full p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setInfo(null);
              }}
              className={`flex-1 py-2 rounded-full font-display font-semibold text-sm transition ${
                mode === "signin"
                  ? "bg-white text-ink-600 shadow-soft"
                  : "text-ink-400"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setInfo(null);
              }}
              className={`flex-1 py-2 rounded-full font-display font-semibold text-sm transition ${
                mode === "signup"
                  ? "bg-white text-ink-600 shadow-soft"
                  : "text-ink-400"
              }`}
            >
              Criar conta
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="btn-secondary w-full mb-4"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continuar com Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-blush-100" />
            <span className="text-xs font-display text-ink-400">ou</span>
            <div className="flex-1 h-px bg-blush-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-display font-semibold text-ink-500 ml-2">
                Email
              </span>
              <div className="relative mt-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blush-300" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  className="input-field pl-12"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-display font-semibold text-ink-500 ml-2">
                Senha
              </span>
              <div className="relative mt-1">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blush-300" />
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-12"
                />
              </div>
            </label>

            {mode === "signin" && (
              <label className="flex items-center gap-3 cursor-pointer select-none px-2 py-1">
                <span
                  className={`relative inline-flex h-6 w-11 rounded-full transition ${
                    remember ? "bg-blush-400" : "bg-cream-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="sr-only"
                  />
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
            )}

            {error && (
              <p className="text-sm text-blush-500 bg-blush-100 rounded-2xl px-4 py-3 font-display">
                {error}
              </p>
            )}
            {info && (
              <p className="text-sm text-mint-400 bg-mint-100 rounded-2xl px-4 py-3 font-display">
                {info}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Carregando…
                </>
              ) : mode === "signin" ? (
                "Entrar"
              ) : (
                "Criar conta"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-400 mt-6 font-display">
          Feito com carinho 🌸
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8L6.3 32.8C9.6 39.4 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2c-.4.4 6.7-4.9 6.7-14.9 0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

function traduzErro(msg: string): string {
  if (msg.includes("Invalid login")) return "Email ou senha inválidos.";
  if (msg.includes("already registered"))
    return "Esse email já tem uma conta. Tente entrar.";
  if (msg.includes("at least 6")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (msg.includes("Email not confirmed"))
    return "Confirme seu email antes de entrar (veja sua caixa de entrada).";
  return msg;
}
