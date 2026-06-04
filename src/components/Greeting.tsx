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
  // Inicializa com hora atual (pode ser do servidor em UTC no primeiro render)
  const [greeting, setGreeting] = useState(() =>
    greetingForHour(new Date().getHours()),
  );

  // Recalcula no cliente com hora local
  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

  return (
    <h1
      className="text-3xl font-display font-bold"
      suppressHydrationWarning
    >
      {greeting}
      {firstName ? `, ${firstName}` : ""} 🌷
    </h1>
  );
}
