import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppHeader, SiteFooter } from '@/components/site';
import { SINIFLAR } from '@/lib/indeks';
import { SULAMA_YONTEMLERI } from '@/lib/sulama';
import { oturumKullanici } from '@/lib/supabase/server';
import { formatNumber } from '@/lib/toprak';
import { tarihYaz, type Tarla } from '@/lib/veri';

export const metadata = { title: 'Tarlalarım' };

type Satir = Tarla & { analizler: { id: string; indeks: number | null; analiz_tarihi: string }[] };

export default async function TarlalarSayfasi() {
  const { supabase, kullaniciId } = await oturumKullanici();
  if (!kullaniciId) redirect('/giris?sonra=/tarlalar');

  const [{ data: profil }, { data }] = await Promise.all([
    supabase.from('profiller').select('ad_soyad').eq('id', kullaniciId).maybeSingle(),
    supabase.from('tarlalar').select('*, analizler(id, indeks, analiz_tarihi)').order('olusturma', { ascending: false }),
  ]);
  const tarlalar = (data ?? []) as Satir[];

  return (
    <div className="flex min-h-screen flex-col bg-[#f7faf5]">
      <AppHeader aktif="tarlalar" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#2f8f57]">{profil?.ad_soyad ? `Merhaba ${profil.ad_soyad.split(' ')[0]}` : 'Hoş geldiniz'}</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Tarlalarım</h1>
          </div>
          <Link href="/tarlalar/yeni" className="inline-flex items-center gap-2 rounded-full bg-[#238f61] px-5 py-3 font-bold text-white hover:bg-[#1d7d54]">
            <Plus size={20} /> Tarla ekle
          </Link>
        </div>

        {tarlalar.length === 0 ? (
          <Link
            href="/tarlalar/yeni"
            className="mt-10 flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[#b9d9ae] bg-white px-6 py-16 text-center hover:border-[#238f61]"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf6e4] text-[#238f61]">
              <Plus size={32} />
            </span>
            <span className="mt-5 text-xl font-bold">İlk tarlanızı ekleyin</span>
            <span className="mt-2 max-w-sm text-sm leading-6 text-[#64766c]">
              Ad, alan, bitki ve sulama yöntemini bir kez girin. Analizleriniz bu tarlanın altında saklanır ve karşılaştırılır.
            </span>
          </Link>
        ) : (
          <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tarlalar.map((t) => {
              const sirali = [...t.analizler].sort((a, b) => b.analiz_tarihi.localeCompare(a.analiz_tarihi));
              const son = sirali[0];
              const onceki = sirali[1];
              const sinif = son?.indeks != null ? SINIFLAR.find((s) => son.indeks! >= s.min) : undefined;
              const fark = son?.indeks != null && onceki?.indeks != null ? son.indeks - onceki.indeks : null;
              return (
                <li key={t.id}>
                  <Link href={`/tarlalar/${t.id}`} className="group flex h-full flex-col rounded-[26px] border border-[#dfe9df] bg-white p-5 transition hover:border-[#9aca89] hover:shadow-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-lg font-extrabold">{t.ad}</div>
                        <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
                          {t.bitki && <span className="rounded-full bg-[#e8f3e6] px-2.5 py-0.5 text-[#1f6f4a]">{t.bitki}</span>}
                          <span className="rounded-full bg-[#e3f0f6] px-2.5 py-0.5 text-[#2c5566]">{SULAMA_YONTEMLERI[t.sulama].kisa}</span>
                          {t.alan_dekar && <span className="rounded-full bg-[#f3efe6] px-2.5 py-0.5 text-[#6b5520]">{formatNumber(t.alan_dekar, 1)} da</span>}
                        </div>
                      </div>
                      {son?.indeks != null && (
                        <div className="text-right">
                          <div className="text-3xl font-extrabold leading-none" style={{ color: sinif?.renk }}>{son.indeks}</div>
                          <div className="mt-1 text-[11px] font-semibold text-[#6b7d72]">
                            {fark !== null && fark !== 0 ? (fark > 0 ? `▲ ${fark}` : `▼ ${-fark}`) : sinif?.ad}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-5 text-sm text-[#64766c]">
                      <span>
                        {son ? `${t.analizler.length} analiz · son ${tarihYaz(son.analiz_tarihi)}` : 'Henüz analiz yok'}
                      </span>
                      <ChevronRight size={18} className="text-[#238f61] transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
