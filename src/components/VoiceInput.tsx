"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

function getRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function VoiceInput({ onTranscript, disabled = false }: Props) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const r = new Ctor();
    r.lang = "pt-BR";
    r.interimResults = true;
    r.continuous = true;

    r.onresult = (event) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalChunk += transcript;
        } else {
          interimChunk += transcript;
        }
      }
      if (finalChunk) {
        onTranscript(finalChunk);
      }
      setInterim(interimChunk);
    };

    r.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Permissão de microfone negada.");
      } else if (event.error === "no-speech") {
        setError("Nenhuma fala detectada.");
      } else if (event.error === "audio-capture") {
        setError("Microfone não encontrado.");
      } else {
        setError("Erro ao gravar.");
      }
      setListening(false);
    };

    r.onend = () => {
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = r;

    return () => {
      try {
        r.abort();
      } catch {
        // ignore
      }
    };
  }, [onTranscript]);

  function toggle() {
    if (!recognitionRef.current) return;
    setError(null);
    if (listening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        setError("Não consegui iniciar a gravação.");
      }
    }
  }

  if (!supported) {
    return (
      <p className="text-xs font-display text-soft italic">
        Gravação de voz não disponível neste navegador. Tente Chrome, Edge ou
        Safari.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-display font-semibold text-sm transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
          listening
            ? "bg-blush-400 text-white hover:bg-blush-500 animate-pulse"
            : "bg-cream-200 text-ink-500 hover:bg-blush-100 hover:text-blush-500"
        }`}
        aria-label={listening ? "Parar gravação" : "Gravar voz"}
      >
        {listening ? (
          <>
            <MicOff className="w-4 h-4" />
            Parar
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            Gravar voz
          </>
        )}
      </button>

      {listening && (
        <div className="flex items-center gap-2 text-xs font-display text-blush-500">
          <Loader2 className="w-3 h-3 animate-spin" />
          Ouvindo… fala que eu vou escrevendo.
        </div>
      )}

      {interim && (
        <p className="text-xs font-display text-soft italic">
          {interim}
        </p>
      )}

      {error && (
        <p className="text-xs font-display text-blush-500">{error}</p>
      )}
    </div>
  );
}
