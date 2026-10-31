-- Tarım 4.0 güncellemesi: sulama suyu analizleri
-- Supabase → SQL Editor → New query → bu dosyanın tamamını yapıştırın → Run. Tekrar çalıştırmak zarar vermez.

create table if not exists public.su_analizleri (
  id uuid primary key default gen_random_uuid(),
  tarla_id uuid not null references public.tarlalar (id) on delete cascade,
  kullanici_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  analiz_tarihi date not null default current_date,
  rapor_no text,
  kaynak text not null default 'manuel' check (kaynak in ('dosya', 'manuel')),
  rapor jsonb not null, -- SuRaporu (standart birimlerde değerler)
  sinif text, -- ör. "C3S1"
  yorum jsonb, -- yapay zekanın sade anlatımı (tekrar ücret ödememek için saklanır)
  yorum_tarihi timestamptz,
  olusturma timestamptz not null default now()
);
create index if not exists su_analizleri_tarla_idx on public.su_analizleri (tarla_id, analiz_tarihi desc);

-- Su analizi eklenen tarlanın sahibiyle analiz sahibi aynı olmalı (toprak analizindeki kontrolün aynısı)
drop trigger if exists su_analizleri_sahip on public.su_analizleri;
create trigger su_analizleri_sahip before insert or update on public.su_analizleri
  for each row execute function public.analiz_sahip_kontrol();

alter table public.su_analizleri enable row level security;
revoke all on public.su_analizleri from anon;
grant select, insert, update, delete on public.su_analizleri to authenticated;

drop policy if exists "su analizi kendi" on public.su_analizleri;
create policy "su analizi kendi" on public.su_analizleri
  for all to authenticated using (kullanici_id = (select auth.uid())) with check (kullanici_id = (select auth.uid()));
