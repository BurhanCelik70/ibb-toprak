-- =============================================================================
-- Tarım 4.0 – veritabanı şeması (Supabase / PostgreSQL)
-- Supabase panelinde: SQL Editor → New query → bu dosyanın tamamını yapıştır → Run
-- Tekrar çalıştırılabilir (idempotent).
-- =============================================================================

-- Kullanıcı profili (auth.users ile bire bir)
create table if not exists public.profiller (
  id uuid primary key references auth.users (id) on delete cascade,
  ad_soyad text,
  telefon text,
  olusturma timestamptz not null default now()
);

-- Tarlalar
create table if not exists public.tarlalar (
  id uuid primary key default gen_random_uuid(),
  kullanici_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  ad text not null check (char_length(ad) between 1 and 80),
  il text,
  ilce text,
  konum text,
  alan_dekar numeric(10, 2) check (alan_dekar is null or alan_dekar > 0),
  bitki text,
  sulama text not null default 'damla' check (sulama in ('damla', 'yagmurlama', 'pivot', 'salma', 'kuru')),
  sulama_suresi_saat numeric(5, 2) check (sulama_suresi_saat is null or sulama_suresi_saat > 0),
  notlar text,
  olusturma timestamptz not null default now(),
  guncelleme timestamptz not null default now()
);
create index if not exists tarlalar_kullanici_idx on public.tarlalar (kullanici_id);
-- Türkiye geneli: il sütunu (eski kurulumlarda sonradan eklenir)
alter table public.tarlalar add column if not exists il text;

-- Analizler (her tarlanın birden çok analizi olabilir)
create table if not exists public.analizler (
  id uuid primary key default gen_random_uuid(),
  tarla_id uuid not null references public.tarlalar (id) on delete cascade,
  kullanici_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  analiz_tarihi date not null default current_date,
  rapor_no text,
  kaynak text not null default 'manuel' check (kaynak in ('dosya', 'manuel')),
  rapor jsonb not null, -- SoilReport (değerler, laboratuvar değerlendirmeleri, ek değerler)
  indeks smallint check (indeks between 0 and 100),
  cozum jsonb, -- yapay zekanın çözüm planı (tekrar ücret ödememek için saklanır)
  cozum_tarihi timestamptz,
  olusturma timestamptz not null default now()
);
create index if not exists analizler_tarla_idx on public.analizler (tarla_id, analiz_tarihi desc);

-- Güncelleme zamanı
create or replace function public.guncelleme_zamani() returns trigger
language plpgsql as $$
begin
  new.guncelleme = now();
  return new;
end $$;
drop trigger if exists tarlalar_guncelleme on public.tarlalar;
create trigger tarlalar_guncelleme before update on public.tarlalar
  for each row execute function public.guncelleme_zamani();

-- Analiz eklenen tarlanın sahibiyle analiz sahibi aynı olmalı
create or replace function public.analiz_sahip_kontrol() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.tarlalar t where t.id = new.tarla_id and t.kullanici_id = new.kullanici_id) then
    raise exception 'Bu tarlaya analiz ekleme yetkiniz yok';
  end if;
  return new;
end $$;
drop trigger if exists analizler_sahip on public.analizler;
create trigger analizler_sahip before insert or update on public.analizler
  for each row execute function public.analiz_sahip_kontrol();

-- Yeni kullanıcıda otomatik profil
create or replace function public.yeni_kullanici() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiller (id, telefon) values (new.id, new.phone) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists yeni_kullanici_profil on auth.users;
create trigger yeni_kullanici_profil after insert on auth.users
  for each row execute function public.yeni_kullanici();

-- -----------------------------------------------------------------------------
-- Satır düzeyi güvenlik: herkes YALNIZCA kendi verisini görür ve değiştirir
-- -----------------------------------------------------------------------------
alter table public.profiller enable row level security;
alter table public.tarlalar enable row level security;
alter table public.analizler enable row level security;

-- Data API erişimi: yalnızca giriş yapmış kullanıcılar (satır kuralları ayrıca uygulanır).
-- "Automatically expose new tables" kapalı olsa da uygulama çalışsın diye açıkça veriliyor.
grant usage on schema public to anon, authenticated;
revoke all on public.profiller, public.tarlalar, public.analizler from anon;
grant select, insert, update, delete on public.profiller, public.tarlalar, public.analizler to authenticated;

drop policy if exists "profil kendi" on public.profiller;
create policy "profil kendi" on public.profiller
  for all to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "tarla kendi" on public.tarlalar;
create policy "tarla kendi" on public.tarlalar
  for all to authenticated using (kullanici_id = (select auth.uid())) with check (kullanici_id = (select auth.uid()));

drop policy if exists "analiz kendi" on public.analizler;
create policy "analiz kendi" on public.analizler
  for all to authenticated using (kullanici_id = (select auth.uid())) with check (kullanici_id = (select auth.uid()));
