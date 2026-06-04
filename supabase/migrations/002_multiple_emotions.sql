-- Migração: múltiplas emoções por entrada
-- Antes: emotion text NOT NULL (1 emoção por registro)
-- Depois: emotions text[] NOT NULL (várias emoções por registro)
-- Rode no SQL Editor do Supabase uma vez.

-- 1) Adiciona nova coluna array
alter table public.diary_entries
  add column if not exists emotions text[];

-- 2) Migra dados existentes: cada emotion vira um array com 1 elemento
update public.diary_entries
  set emotions = array[emotion]
  where emotions is null and emotion is not null;

-- 3) Torna a nova coluna NOT NULL
alter table public.diary_entries
  alter column emotions set not null;

-- 4) Remove a coluna antiga
alter table public.diary_entries
  drop column if exists emotion;

-- 5) (Opcional) Adiciona um check para garantir pelo menos 1 emoção
alter table public.diary_entries
  drop constraint if exists emotions_not_empty;
alter table public.diary_entries
  add constraint emotions_not_empty check (array_length(emotions, 1) >= 1);
