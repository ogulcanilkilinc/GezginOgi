-- GezginOgi: kullanıcı hesapları (Supabase Auth) için tablolar, güvenlik kuralları ve özel fotoğraf deposu.
-- Eski ortak-parola tabloları (user_place_state, user_custom_places, user_documents) bu göçte değişmez.

-- ---------------------------------------------------------------- kullanıcıya özel veri
create table if not exists public.gz_place_state (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  place_id text not null,
  visited boolean not null default false,
  visited_date text not null default '',
  favorite boolean not null default false,
  user_rating integer not null default 0,
  user_notes text not null default '',
  user_photos jsonb not null default '[]'::jsonb,
  checklist jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

create table if not exists public.gz_custom_places (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.gz_documents (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------------------------------------------------------------- yöneticiler, öneriler, ortak rehber
create table if not exists public.gz_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.gz_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.gz_admins where user_id = auth.uid());
$$;

create table if not exists public.gz_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('new_place', 'edit')),
  place_id text,
  payload jsonb not null check (pg_column_size(payload) < 30000),
  note text not null default '' check (char_length(note) <= 1000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- Onaylanan öneriler: herkes okur, yalnızca yönetici yazar
create table if not exists public.gz_community (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('new_place', 'edit')),
  place_id text,
  data jsonb not null,
  suggestion_id uuid references public.gz_suggestions(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- satır düzeyinde güvenlik
alter table public.gz_place_state enable row level security;
alter table public.gz_custom_places enable row level security;
alter table public.gz_documents enable row level security;
alter table public.gz_admins enable row level security;
alter table public.gz_suggestions enable row level security;
alter table public.gz_community enable row level security;

do $$
declare t text;
begin
  foreach t in array array['gz_place_state', 'gz_custom_places', 'gz_documents'] loop
    execute format('drop policy if exists "sahip okur" on public.%I', t);
    execute format('drop policy if exists "sahip ekler" on public.%I', t);
    execute format('drop policy if exists "sahip günceller" on public.%I', t);
    execute format('drop policy if exists "sahip siler" on public.%I', t);
    execute format('create policy "sahip okur" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('create policy "sahip ekler" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "sahip günceller" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "sahip siler" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

drop policy if exists "yönetici kaydını görür" on public.gz_admins;
create policy "yönetici kaydını görür" on public.gz_admins for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "öneri ekler" on public.gz_suggestions;
drop policy if exists "öneri okur" on public.gz_suggestions;
drop policy if exists "yönetici inceler" on public.gz_suggestions;
drop policy if exists "öneri siler" on public.gz_suggestions;
create policy "öneri ekler" on public.gz_suggestions for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'pending' and review_note = '' and reviewed_at is null);
create policy "öneri okur" on public.gz_suggestions for select to authenticated
  using ((select auth.uid()) = user_id or public.gz_is_admin());
create policy "yönetici inceler" on public.gz_suggestions for update to authenticated
  using (public.gz_is_admin()) with check (public.gz_is_admin());
create policy "öneri siler" on public.gz_suggestions for delete to authenticated
  using (((select auth.uid()) = user_id and status = 'pending') or public.gz_is_admin());

drop policy if exists "herkes okur" on public.gz_community;
drop policy if exists "yönetici yazar" on public.gz_community;
create policy "herkes okur" on public.gz_community for select to anon, authenticated using (true);
create policy "yönetici yazar" on public.gz_community for all to authenticated
  using (public.gz_is_admin()) with check (public.gz_is_admin());

-- ---------------------------------------------------------------- özel fotoğraf deposu
-- Özel (public = false), 1 MB üst sınır, yalnızca JPEG; her kullanıcı yalnızca kendi klasöründe, en çok 300 dosya.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gz_photos', 'gz_photos', false, 1048576, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 1048576, allowed_mime_types = array['image/jpeg'];

drop policy if exists "gz_photos okur" on storage.objects;
drop policy if exists "gz_photos yükler" on storage.objects;
drop policy if exists "gz_photos siler" on storage.objects;
create policy "gz_photos okur" on storage.objects for select to authenticated
  using (bucket_id = 'gz_photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "gz_photos yükler" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'gz_photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.gz_photo_count() < 300
  );
create policy "gz_photos siler" on storage.objects for delete to authenticated
  using (bucket_id = 'gz_photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Kota sayımı kuralın içinde storage.objects'i sorgularsa sonsuz özyineleme olur; bu yüzden ayrı güvenli işlev.
create or replace function public.gz_photo_count()
returns integer
language sql
stable
security definer
set search_path = public, storage
as $$
  select count(*)::integer from storage.objects
  where bucket_id = 'gz_photos' and (storage.foldername(name))[1] = auth.uid()::text;
$$;
revoke execute on function public.gz_is_admin() from public, anon;
grant execute on function public.gz_is_admin() to authenticated;
revoke execute on function public.gz_photo_count() from public, anon;
grant execute on function public.gz_photo_count() to authenticated;
