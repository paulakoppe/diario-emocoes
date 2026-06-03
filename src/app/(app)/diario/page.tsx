import { createClient } from "@/lib/supabase/server";
import DiaryForm from "./DiaryForm";

export default async function DiarioPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user!.id)
    .single();

  const greeting = greetingForHour(new Date().getHours());
  const firstName = (profile?.name || "").split(" ")[0];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold">
          {greeting}
          {firstName ? `, ${firstName}` : ""} 🌷
        </h1>
        <p className="text-ink-400 font-display text-sm mt-1">
          Como você está se sentindo agora?
        </p>
      </header>

      <DiaryForm />
    </div>
  );
}

function greetingForHour(h: number): string {
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
