import { createClient } from "@/lib/supabase/server";
import DiaryForm from "./DiaryForm";
import Greeting from "@/components/Greeting";

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

  const firstName = (profile?.name || "").split(" ")[0];

  return (
    <div>
      <header className="mb-6">
        <Greeting firstName={firstName} />
        <p className="text-ink-400 font-display text-sm mt-1">
          Como você está se sentindo agora?
        </p>
      </header>

      <DiaryForm />
    </div>
  );
}
