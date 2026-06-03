"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    window.localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  function toggle() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream-200 dark:bg-ink-500/30 font-display text-sm font-semibold transition hover:bg-blush-100 dark:hover:bg-blush-400/20"
      aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {mounted ? (
        theme === "dark" ? (
          <>
            <Sun className="w-4 h-4 text-butter-300" />
            <span>Claro</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-lavender-400" />
            <span>Escuro</span>
          </>
        )
      ) : (
        <span className="w-4 h-4" />
      )}
    </button>
  );
}
