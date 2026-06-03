-- Migração: permite editar entradas do próprio diário
-- Rode no SQL Editor do Supabase uma vez.

drop policy if exists "diary_update_own" on public.diary_entries;
create policy "diary_update_own" on public.diary_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
