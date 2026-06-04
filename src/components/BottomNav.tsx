"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, BookHeart, History } from "lucide-react";

const TABS = [
  { href: "/perfil", label: "Perfil", icon: User },
  { href: "/diario", label: "Diário", icon: BookHeart },
  { href: "/historico", label: "Histórico", icon: History },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-md">
      <div className="bg-white dark:bg-[rgb(44,38,48)] rounded-full shadow-soft px-2 py-2 flex items-center justify-around border border-[rgb(var(--border-soft))]">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center flex-1 py-2 rounded-full font-display text-xs transition ${
                active
                  ? "text-blush-500 dark:text-blush-300"
                  : "text-ink-400 dark:text-[rgb(188,178,184)] hover:text-blush-400"
              }`}
            >
              {active && (
                <span className="absolute inset-0 bg-blush-100 dark:bg-blush-400/20 rounded-full -z-10 animate-pop" />
              )}
              <Icon
                className="w-5 h-5 mb-0.5"
                fill={active ? "currentColor" : "none"}
                strokeWidth={active ? 0 : 2}
              />
              <span className={active ? "font-bold" : "font-medium"}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
