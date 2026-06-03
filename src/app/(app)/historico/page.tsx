import { createClient } from "@/lib/supabase/server";
import HistoryList from "./HistoryList";
import EmotionStats from "@/components/EmotionStats";

export default async function HistoricoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: entries }, { data: profile }] = await Promise.all([
    supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("name, email")
      .eq("id", user!.id)
      .single(),
  ]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold">Seu histórico</h1>
        <p className="text-ink-400 font-display text-sm mt-1">
          Cada registro é um pedacinho de você.
        </p>
      </header>

      <EmotionStats entries={entries ?? []} />

      <HistoryList
        entries={entries ?? []}
        userName={profile?.name ?? null}
        userEmail={profile?.email ?? user!.email ?? null}
      />
    </div>
  );
}
