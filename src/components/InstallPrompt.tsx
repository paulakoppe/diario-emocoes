"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

// Tipo do evento beforeinstallprompt (não está no DOM lib do TS)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "android" | "ios" | "desktop" | "other";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "other";
  const ua = window.navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  return "desktop";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

const DISMISS_KEY = "install-prompt-dismissed-at";
const DISMISS_DAYS = 7;

export default function InstallPrompt() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // já instalado

    // Respeita "não mostrar de novo" por 7 dias
    const dismissedAt = window.localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const days = (Date.now() - Number(dismissedAt)) / 86400000;
      if (days < DISMISS_DAYS) return;
    }

    const plat = detectPlatform();
    setPlatform(plat);

    // Android: aguarda evento beforeinstallprompt
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      setShow(true);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS: não tem evento — mostra após 3s se for iOS Safari
    if (plat === "ios") {
      const t = setTimeout(() => setShow(true), 3000);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  function dismiss() {
    setShow(false);
    setShowIosInstructions(false);
    window.localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }

  async function handleInstall() {
    if (platform === "ios") {
      setShowIosInstructions(true);
      return;
    }
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") {
      setShow(false);
    } else {
      dismiss();
    }
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md animate-slide-up">
      <div className="card flex items-start gap-3 shadow-soft-lg border border-blush-200">
        <div className="w-10 h-10 rounded-full bg-blush-100 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-blush-500" />
        </div>
        <div className="flex-1 min-w-0">
          {showIosInstructions ? (
            <>
              <p className="font-display font-bold text-ink-600 text-sm">
                Instalar no iPhone 🌷
              </p>
              <p className="text-xs text-soft font-display mt-0.5">
                Toque em <strong>Compartilhar</strong> (ícone abaixo) e depois{" "}
                <strong>Adicionar à Tela de Início</strong>.
              </p>
            </>
          ) : (
            <>
              <p className="font-display font-bold text-ink-600 text-sm">
                Instalar o Diário?
              </p>
              <p className="text-xs text-soft font-display mt-0.5">
                Tenha o app sempre à mão, em tela cheia, na sua home.
              </p>
              <button
                type="button"
                onClick={handleInstall}
                className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-blush-400 text-white font-display font-semibold text-xs hover:bg-blush-500 transition"
              >
                <Download className="w-3 h-3" />
                Instalar
              </button>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="w-8 h-8 rounded-full hover:bg-cream-200 flex items-center justify-center shrink-0 text-soft"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
