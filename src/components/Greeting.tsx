"use client";

import { useEffect, useState } from "react";

function greetingForHour(h: number): string {
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

interface Props {
  firstName?: string;
}

export default function Greeting({ firstName }: Props) {
  // mounted força um re-render após hydration, garantindo que usamos
  // a hora local do navegador (não a UTC do servidor Vercel).
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const greeting = mounted
    ? greetingForHour(new Date().getHours())
    : "Olá";

  return (
    <h1 className="text-3xl font-display font-bold">
      {greeting}
      {firstName ? `, ${firstName}` : ""} 🌷
    </h1>
  );
}
