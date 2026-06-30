-- Migração: imagens opcionais por entrada do diário
-- Rode no SQL Editor do Supabase uma vez.

-- 1) Coluna nova (array de URLs públicas, opcional)
alter table public.diary_entries
  add column if not exists images text[];

-- 2) Bucket para as imagens (público — segurança via path-prefix com user_id,
--    igual ao bucket avatars; UUID no path torna impossível adivinhar)
insert into storage.buckets (id, name, public)
values ('diary-images', 'diary-images', true)
on conflict (id) do nothing;

-- 3) Policies: leitura pública (URL contém UUID, igual avatars),
--    escrita/exclusão apenas pelo dono do path
drop policy if exists "diary_images_public_read" on storage.objects;
create policy "diary_images_public_read" on storage.objects
  for select using (bucket_id = 'diary-images');

drop policy if exists "diary_images_insert_own" on storage.objects;
create policy "diary_images_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'diary-images' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "diary_images_update_own" on storage.objects;
create policy "diary_images_update_own" on storage.objects
  for update using (
    bucket_id = 'diary-images' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "diary_images_delete_own" on storage.objects;
create policy "diary_images_delete_own" on storage.objects
  for delete using (
    bucket_id = 'diary-images' and (storage.foldername(name))[1] = auth.uid()::text
  );
