import { ceviriAl } from '@/lib/dilSunucu';
import { ChevronLeft, ChevronRight, Droplets, FilePlus2, Pencil } from 'lucide-react';
import { DILLER } from '@/lib/dil';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IndeksSeyri, Karsilastirma, SulamaRecetesi } from '@/components/analiz/Sonuc';
import { ParKarti } from '@/components/ParKarti';
import { dunyaIklimleri } from '@/lib/dunyaIklim';
import { ilGoster } from '@/lib/dunya';
import { IklimKaydi } from '@/components/IklimKaydi';
import { AppHeader, SiteFooter } from '@/components/site';
import { SINIFLAR, kaliteIndeksi } from '@/lib/indeks';
import { SULAMA_YONTEMLERI } from '@/lib/sulama';
import { oturumKullanici } from '@/lib/supabase/server';
import { PARAMS, classify, formatNumber } from '@/lib/toprak';
import { SU_TON, suDegerlendir } from '@/lib/su';
import { tarihYaz, type Analiz, type SuAnalizi, type Tarla } from '@/lib/veri';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await oturumKullanici();
  const { data } = await supabase.from('tarlalar').select('ad').eq('id', id).maybeSingle();
  const { tx } = await ceviriAl();
  return { title: data?.ad ?? tx('Tarla') };
}

export default async function TarlaSayfasi({ params }: { params: Promise<{ id: string }> }) {
  const { tx } = await ceviriAl();
  const { id } = await params;
  const { supabase } = await oturumKullanici();
  const [{ data: tarla }, { data: analizData }, { data: suData }] = await Promise.all([
    supabase.from('tarlalar').select('*').eq('id', id).maybeSingle<Tarla>(),
    supabase
      .from('analizler')
      .select('id, tarla_id, analiz_tarihi, rapor_no, kaynak, rapor, indeks, olusturma')
      .eq('tarla_id', id)
      .order('analiz_tarihi', { ascending: false })
      .order('olusturma', { ascending: false }),
    // Tablo henüz kurulmadıysa hata döner; o durumda su bölümü boş görünür
    supabase
      .from('su_analizleri')
      .select('id, tarla_id, analiz_tarihi, rapor_no, kaynak, rapor, sinif, olusturma')
      .eq('tarla_id', id)
      .order('analiz_tarihi', { ascending: false })
      .order('olusturma', { ascending: false }),
  ]);
  if (!tarla) notFound();
  // Dünya tarlasında iklim NASA POWER'dan (Türkiye/Almanya/İspanya'da boş döner)
  const iklim = await dunyaIklimleri([tarla.il]);
  const suAnalizleri = (suData ?? []) as SuAnalizi[];
  const sonSu = suAnalizleri[0];
  const sonSuD = sonSu ? suDegerlendir(sonSu.rapor, { bitki: tarla.bitki, yontem: tarla.sulama }) : undefined;
  const analizler = (analizData ?? []) as Analiz[];
  const son = analizler[0];
  const onceki = analizler[1];
  const sinif = son?.indeks != null ? SINIFLAR.find((s) => son.indeks! >= s.min) : undefined;
  const sorunlar = son ? classify(son.rapor).filter((r) => r.classification?.tone === 'sorun' || r.classification?.tone === 'dikkat') : [];
  const seyir = [...analizler]
    .reverse()
    .filter((a) => a.indeks != null)
    .map((a) => ({ tarih: new Date(a.analiz_tarihi).toLocaleDateString(DILLER[tx.dil].locale, { month: 'short', year: 'numeric' }), indeks: a.indeks! }));

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e6]">
      <AppHeader aktif="tarlalar" />
      <IklimKaydi iklim={iklim}>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8">
        <Link href="/tarlalar" className="inline-flex items-center gap-1 text-sm font-semibold text-[#476456]">
          <ChevronLeft size={16} /> {' '}{tx("Tarlalarım")}
        </Link>

        <div className="relative mt-3 overflow-hidden rounded-[32px] bg-[#121410] text-white">
          <div className="absolute inset-0 bg-[url('/toprak.jpg')] bg-cover bg-center" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-r from-[#121410]/95 via-[#121410]/65 to-[#121410]/30" aria-hidden />
          <div className="relative flex flex-wrap items-end justify-between gap-6 p-6 sm:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#e2b65c]">{tx("Tarla")}</p>
              <h1 className="mt-2 font-display text-4xl font-medium tracking-[-0.02em] sm:text-5xl">{tx(tarla.ad)}</h1>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                {[
                  tx(tarla.bitki),
                  `${tx(SULAMA_YONTEMLERI[tarla.sulama].ad)}${tarla.sulama_suresi_saat ? tx(" · {a} saat", { a: formatNumber(tarla.sulama_suresi_saat, 1) }) : ''}`,
                  tarla.alan_dekar ? tx.alan(tarla.alan_dekar) : null,
                  [tarla.konum, tarla.ilce, ilGoster(tarla.il, tx.dil)].filter(Boolean).join(', ') || null,
                ]
                  .filter(Boolean)
                  .map((b) => (
                    <span key={b as string} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
                      {b}
                    </span>
                  ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/tarlalar/${tarla.id}/duzenle`}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/20"
              >
                <Pencil size={16} /> {' '}{tx("Düzenle")}
              </Link>
              <Link
                href={`/tarlalar/${tarla.id}/analiz/yeni`}
                className="inline-flex items-center gap-2 rounded-full bg-[#f5f0e6] px-5 py-2.5 text-sm font-bold text-[#121410] hover:bg-white"
              >
                <FilePlus2 size={16} /> {' '}{tx("Toprak analizi ekle")}
              </Link>
              <Link
                href={`/tarlalar/${tarla.id}/su/yeni`}
                className="inline-flex items-center gap-2 rounded-full bg-[#7fd3f7] px-5 py-2.5 text-sm font-bold text-[#0b3a52] hover:bg-[#a6e2fa]"
              >
                <Droplets size={16} /> {' '}{tx("Su analizi ekle")}
              </Link>
            </div>
          </div>
        </div>

        {!son ? (
          <Link
            href={`/tarlalar/${tarla.id}/analiz/yeni`}
            className="mt-8 flex flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-[#b9d9ae] bg-white px-6 py-12 text-center hover:border-[#238f61]"
          >
            <FilePlus2 size={32} className="text-[#238f61]" />
            <span className="mt-4 text-lg font-bold">{tx("İlk toprak analizini ekleyin")}</span>
            <span className="mt-1 max-w-sm text-sm text-[#64766c]">{tx("Raporu yükleyin; kalite indeksi ve size özel reçete bu tarlaya kaydedilsin.")}</span>
          </Link>
        ) : (
          <>
            <section className="mt-8 grid gap-4 md:grid-cols-[1fr_1.4fr]">
              <Link href={`/tarlalar/${tarla.id}/analiz/${son.id}`} className="group rounded-[26px] border border-[#dfe9df] bg-white p-6 hover:border-[#9aca89]">
                <div className="text-sm font-semibold text-[#64766c]">{tx("Son analiz ·")}{' '}{tarihYaz(son.analiz_tarihi, tx.dil)}</div>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-5xl font-extrabold leading-none" style={{ color: sinif?.renk }}>{son.indeks ?? kaliteIndeksi(son.rapor)?.yuzde ?? '—'}</span>
                  <span className="pb-1 text-sm text-[#6b7d72]">/ 100 · {sinif?.ad ? tx(sinif.ad) : tx("Kalite indeksi")}</span>
                </div>
                <div className="mt-4 text-sm">
                  {sorunlar.length === 0 ? (
                    <span className="text-[#1f7a45]">{tx("Belirgin bir sorun yok.")}</span>
                  ) : (
                    <span className="text-[#5b6f65]">
                      
                      {tx("İlgi bekleyen:")}{' '}
                      <strong className="text-[#17352a]">
                        {sorunlar.slice(0, 3).map((x) => PARAMS[x.key].label).join(', ')}
                        {sorunlar.length > 3 ? tx(" ve {a} konu daha", { a: sorunlar.length - 3 }) : ''}
                      </strong>
                    </span>
                  )}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#238f61]">
                  
                  {tx("Analizi ve reçeteyi aç")}{' '}<ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              {seyir.length >= 2 ? (
                <IndeksSeyri noktalar={seyir} />
              ) : (
                <div className="flex items-center rounded-[26px] border border-dashed border-[#cfe0ca] bg-white p-6 text-sm leading-6 text-[#64766c]">
                  
                  {tx("Bir sonraki analizinizi eklediğinizde kalite indeksinin seyri ve değişen değerler burada görünecek.")}
                </div>
              )}
            </section>

            {onceki && (
              <Karsilastirma once={onceki.rapor} simdi={son.rapor} onceTarih={tarihYaz(onceki.analiz_tarihi, tx.dil)} simdiTarih={tarihYaz(son.analiz_tarihi, tx.dil)} />
            )}

            <section className="mt-10" aria-labelledby={tx("gecmis")}>
              <h2 id="gecmis" className="text-xl font-bold">{tx("Analiz geçmişi")}</h2>
              <ul className="mt-4 divide-y divide-[#edf2ee] overflow-hidden rounded-[22px] border border-[#dfe9df] bg-white">
                {analizler.map((a) => {
                  const s = a.indeks != null ? SINIFLAR.find((x) => a.indeks! >= x.min) : undefined;
                  return (
                    <li key={a.id}>
                      <Link href={`/tarlalar/${tarla.id}/analiz/${a.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#f7faf5]">
                        <span>
                          <span className="block font-semibold">{tarihYaz(a.analiz_tarihi, tx.dil)}</span>
                          <span className="block text-xs text-[#6b7d72]">
                            {[a.rapor_no, a.kaynak === 'dosya' ? tx("Dosyadan") : tx("Elle girildi")].filter(Boolean).join(' · ')}
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

        <ParKarti il={tarla.il} bitki={tarla.bitki} className="mt-10" />

        {/* Sulama suyu */}
        <section className="mt-10" aria-labelledby="su-baslik">
          <h2 id="su-baslik" className="flex items-center gap-2 text-xl font-bold">
            <Droplets size={20} className="text-[#1e88c7]" /> {' '}{tx("Sulama suyu")}
          </h2>
          {!sonSu || !sonSuD ? (
            <Link
              href={`/tarlalar/${tarla.id}/su/yeni`}
              className="mt-4 flex flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-[#a9d6ea] bg-white px-6 py-10 text-center hover:border-[#1e88c7]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/su/damla.webp" alt="" aria-hidden className="h-24 w-40 rounded-2xl object-cover" />
              <span className="mt-4 text-lg font-bold">{tx("Su analizinizi ekleyin")}</span>
              <span className="mt-1 max-w-md text-sm text-[#64766c]">
                
                {tx("Tuzluluk, sodyum ve bikarbonatı FAO ölçütleriyle değerlendirelim; suyunuza en uygun sulama yöntemini söyleyelim.")}
              </span>
            </Link>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_1fr]">
              <Link
                href={`/tarlalar/${tarla.id}/su/${sonSu.id}`}
                className="group relative overflow-hidden rounded-[26px] p-6 text-white"
                style={{ background: '#0b3a52' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/su/damla.webp" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(8,42,60,.94) 0%,rgba(10,52,72,.78) 55%,rgba(12,70,90,.35) 100%)' }} aria-hidden />
                <div className="relative">
                <div className="text-sm text-white/75">{tx("Son su analizi ·")}{' '}{tarihYaz(sonSu.analiz_tarihi, tx.dil)}</div>
                <div className="mt-3 flex items-end gap-3">
                  <span className="font-display text-5xl leading-none">{sonSuD.sinif ?? '—'}</span>
                  <span className="pb-1 text-sm text-white/80">{tx(sonSuD.genel.baslik)}</span>
                </div>
                <div className="mt-3 text-sm text-white/85">
                  
                  {tx("Önerilen yöntem:")}{' '}<b>{sonSuD.onerilen ? { damla: tx("Damla"), yagmurlama: tx("Yağmurlama"), pivot: tx("Pivot"), salma: tx("Salma") }[sonSuD.onerilen] : '—'}</b>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#9fe3f2]">
                  
                  {tx("Su karnesini aç")}{' '}<ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
                </div>
              </Link>
              <ul className="divide-y divide-[#edf2ee] overflow-hidden rounded-[22px] border border-[#dfe9df] bg-white">
                {suAnalizleri.map((a) => {
                  const g = suDegerlendir(a.rapor, { bitki: tarla.bitki, yontem: tarla.sulama }).genel;
                  return (
                    <li key={a.id}>
                      <Link href={`/tarlalar/${tarla.id}/su/${a.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#f5fafc]">
                        <span>
                          <span className="block font-semibold">{tarihYaz(a.analiz_tarihi, tx.dil)}</span>
                          <span className="block text-xs text-[#6b7d72]">{[a.rapor.kaynakAdi, a.kaynak === 'dosya' ? tx("Dosyadan") : tx("Elle girildi")].filter(Boolean).join(' · ')}</span>
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: SU_TON[g.ton].acik, color: SU_TON[g.ton].yazi }}>
                            {a.sinif ?? g.baslik}
                          </span>
                          <ChevronRight size={18} className="text-[#9aa7a0]" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

        <SulamaRecetesi tarla={tarla} report={son?.rapor} />
      </main>
      </IklimKaydi>
      <SiteFooter />
    </div>
  );
}
