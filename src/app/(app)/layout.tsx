import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";
import InstallPrompt from "@/components/InstallPrompt";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen pb-28 bg-cream-100 dark:bg-[rgb(30,26,32)]">
      <main className="max-w-2xl mx-auto px-4 pt-8 pb-4 animate-fade-in">
        {children}
      </main>
      <InstallPrompt />
      <BottomNav />
    </div>
  );
}
