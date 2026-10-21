import { ChevronLeft, ChevronRight, FilePlus2, Pencil } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IndeksSeyri, Karsilastirma, SulamaRecetesi } from '@/components/analiz/Sonuc';
import { AppHeader, SiteFooter } from '@/components/site';
import { SINIFLAR, kaliteIndeksi } from '@/lib/indeks';
import { SULAMA_YONTEMLERI } from '@/lib/sulama';
import { oturumKullanici } from '@/lib/supabase/server';
import { PARAMS, classify, formatNumber } from '@/lib/toprak';
import { tarihYaz, type Analiz, type Tarla } from '@/lib/veri';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await oturumKullanici();
  const { data } = await supabase.from('tarlalar').select('ad').eq('id', id).maybeSingle();
  return { title: data?.ad ?? 'Tarla' };
}

export default async function TarlaSayfasi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await oturumKullanici();
  const [{ data: tarla }, { data: analizData }] = await Promise.all([
    supabase.from('tarlalar').select('*').eq('id', id).maybeSingle<Tarla>(),
    supabase
      .from('analizler')
      .select('id, tarla_id, analiz_tarihi, rapor_no, kaynak, rapor, indeks, olusturma')
      .eq('tarla_id', id)
      .order('analiz_tarihi', { ascending: false })
      .order('olusturma', { ascending: false }),
  ]);
  if (!tarla) notFound();
  const analizler = (analizData ?? []) as Analiz[];
  const son = analizler[0];
  const onceki = analizler[1];
  const sinif = son?.indeks != null ? SINIFLAR.find((s) => son.indeks! >= s.min) : undefined;
  const sorunlar = son ? classify(son.rapor).filter((r) => r.classification?.tone === 'sorun' || r.classification?.tone === 'dikkat') : [];
  const seyir = [...analizler]
    .reverse()
    .filter((a) => a.indeks != null)
    .map((a) => ({ tarih: new Date(a.analiz_tarihi).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }), indeks: a.indeks! }));

  return (
    <div className="flex min-h-screen flex-col bg-[#f7faf5]">
      <AppHeader aktif="tarlalar" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8">
        <Link href="/tarlalar" className="inline-flex items-center gap-1 text-sm font-semibold text-[#476456]">
          <ChevronLeft size={16} /> Tarlalarım
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{tarla.ad}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              {tarla.bitki && <span className="rounded-full bg-[#e8f3e6] px-3 py-1 text-[#1f6f4a]">{tarla.bitki}</span>}
              <span className="rounded-full bg-[#e3f0f6] px-3 py-1 text-[#2c5566]">
                {SULAMA_YONTEMLERI[tarla.sulama].ad}
                {tarla.sulama_suresi_saat ? ` · ${formatNumber(tarla.sulama_suresi_saat, 1)} saat` : ''}
              </span>
              {tarla.alan_dekar && <span className="rounded-full bg-[#f3efe6] px-3 py-1 text-[#6b5520]">{formatNumber(tarla.alan_dekar, 1)} dekar</span>}
              {(tarla.ilce || tarla.konum) && (
                <span className="rounded-full bg-white px-3 py-1 text-[#51675d] ring-1 ring-[#dfe9df]">{[tarla.konum, tarla.ilce].filter(Boolean).join(', ')}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/tarlalar/${tarla.id}/duzenle`} className="inline-flex items-center gap-2 rounded-full border border-[#dfe9df] bg-white px-4 py-2.5 text-sm font-semibold text-[#3e5248] hover:bg-[#f2f7f3]">
              <Pencil size={16} /> Düzenle
            </Link>
            <Link href={`/tarlalar/${tarla.id}/analiz/yeni`} className="inline-flex items-center gap-2 rounded-full bg-[#238f61] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1d7d54]">
              <FilePlus2 size={16} /> Analiz ekle
            </Link>
          </div>
        </div>

        {!son ? (
          <Link
            href={`/tarlalar/${tarla.id}/analiz/yeni`}
            className="mt-8 flex flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-[#b9d9ae] bg-white px-6 py-12 text-center hover:border-[#238f61]"
          >
            <FilePlus2 size={32} className="text-[#238f61]" />
            <span className="mt-4 text-lg font-bold">İlk toprak analizini ekleyin</span>
            <span className="mt-1 max-w-sm text-sm text-[#64766c]">Raporu yükleyin; kalite indeksi ve size özel reçete bu tarlaya kaydedilsin.</span>
          </Link>
        ) : (
          <>
            <section className="mt-8 grid gap-4 md:grid-cols-[1fr_1.4fr]">
              <Link href={`/tarlalar/${tarla.id}/analiz/${son.id}`} className="group rounded-[26px] border border-[#dfe9df] bg-white p-6 hover:border-[#9aca89]">
                <div className="text-sm font-semibold text-[#64766c]">Son analiz · {tarihYaz(son.analiz_tarihi)}</div>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-5xl font-extrabold leading-none" style={{ color: sinif?.renk }}>{son.indeks ?? kaliteIndeksi(son.rapor)?.yuzde ?? '—'}</span>
                  <span className="pb-1 text-sm text-[#6b7d72]">/ 100 · {sinif?.ad ?? 'Kalite indeksi'}</span>
                </div>
                <div className="mt-4 text-sm">
                  {sorunlar.length === 0 ? (
                    <span className="text-[#1f7a45]">Belirgin bir sorun yok.</span>
                  ) : (
                    <span className="text-[#5b6f65]">
                      İlgi bekleyen:{' '}
                      <strong className="text-[#17352a]">
                        {sorunlar.slice(0, 3).map((x) => PARAMS[x.key].label).join(', ')}
                        {sorunlar.length > 3 ? ` ve ${sorunlar.length - 3} konu daha` : ''}
                      </strong>
                    </span>
                  )}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#238f61]">
                  Analizi ve reçeteyi aç <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              {seyir.length >= 2 ? (
                <IndeksSeyri noktalar={seyir} />
              ) : (
                <div className="flex items-center rounded-[26px] border border-dashed border-[#cfe0ca] bg-white p-6 text-sm leading-6 text-[#64766c]">
                  Bir sonraki analizinizi eklediğinizde kalite indeksinin seyri ve değişen değerler burada görünecek.
                </div>
              )}
            </section>

            {onceki && (
              <Karsilastirma once={onceki.rapor} simdi={son.rapor} onceTarih={tarihYaz(onceki.analiz_tarihi)} simdiTarih={tarihYaz(son.analiz_tarihi)} />
            )}

            <section className="mt-10" aria-labelledby="gecmis">
              <h2 id="gecmis" className="text-xl font-bold">Analiz geçmişi</h2>
              <ul className="mt-4 divide-y divide-[#edf2ee] overflow-hidden rounded-[22px] border border-[#dfe9df] bg-white">
                {analizler.map((a) => {
                  const s = a.indeks != null ? SINIFLAR.find((x) => a.indeks! >= x.min) : undefined;
                  return (
                    <li key={a.id}>
                      <Link href={`/tarlalar/${tarla.id}/analiz/${a.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#f7faf5]">
                        <span>
                          <span className="block font-semibold">{tarihYaz(a.analiz_tarihi)}</span>
                          <span className="block text-xs text-[#6b7d72]">
                            {[a.rapor_no, a.kaynak === 'dosya' ? 'Dosyadan' : 'Elle girildi'].filter(Boolean).join(' · ')}
                          </span>
                        </span>
                        <span className="flex items-center gap-3">
                          {a.indeks != null && (
                            <span className="text-lg font-extrabold" style={{ color: s?.renk }}>{a.indeks}</span>
                          )}
                          <ChevronRight size={18} className="text-[#9aa7a0]" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}

        <SulamaRecetesi tarla={tarla} />
      </main>
      <SiteFooter />
    </div>
  );
}
