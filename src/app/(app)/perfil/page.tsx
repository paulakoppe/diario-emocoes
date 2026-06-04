import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";

export default async function PerfilPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Seu perfil</h1>
          <p className="text-soft font-display text-sm">
            Suas informações.
          </p>
        </div>
        <LogoutButton />
      </header>

      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-sm font-display font-semibold text-soft">
          Aparência
        </span>
        <ThemeToggle />
      </div>

      <ProfileForm
        initialProfile={{
          id: user!.id,
          name: profile?.name ?? "",
          phone: profile?.phone ?? "",
          email: profile?.email ?? user!.email ?? "",
          avatar_url: profile?.avatar_url ?? null,
        }}
      />
    </div>
  );
}
