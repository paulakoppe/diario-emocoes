"use client";

import { useEffect, useState } from "react";

function greetingForHour(h: number): string {
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function emojiForHour(h: number): string {
  if (h < 5) return "🌙";
  if (h < 12) return "☀️";
  if (h < 18) return "☀️";
  return "🌙";
}

interface Props {
  firstName?: string;
}

export default function Greeting({ firstName }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hour = mounted ? new Date().getHours() : 0;
  const greeting = mounted ? greetingForHour(hour) : "Olá";
  const emoji = mounted ? emojiForHour(hour) : "";

  return (
    <h1 className="text-3xl font-display font-bold">
      {greeting}
      {firstName ? `, ${firstName}` : ""}
      {emoji && <span className="ml-2">{emoji}</span>}
    </h1>
  );
}
