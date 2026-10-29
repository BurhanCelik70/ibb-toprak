'use client';
/**
 * Bitki besin noksanlıkları kataloğu: bitki seç → kartlar → kart detayı (büyük resim, belirtiler, neden, ne yapmalı).
 */
import { ArrowDown, ArrowUp, Leaf, Search, ShieldAlert, Sprout, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BESIN_RENK,
  BITKI_KISA,
  BITKI_SIRASI,
  NOKSANLIKLAR,
  noksanlikGorseli,
  type Noksanlik,
} from '@/lib/noksanliklar';

const kisaAd = (b: string) => BITKI_KISA[b] ?? b;
const YAPRAK_ETIKET: Record<Noksanlik['yaprak'], string> = {
  yaşlı: 'Alt (yaşlı) yapraklarda başlar',
  genç: 'Üst (genç) yapraklarda başlar',
  meyve: 'Meyvede görülür',
  yumru: 'Yumruda ve genç yapraklarda',
  tabla: 'Tablada ve genç yapraklarda',
};

export function BesinRozeti({ n, buyuk = false }: { n: Pick<Noksanlik, 'sembol' | 'besin'>; buyuk?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold text-white ${buyuk ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'}`}
      style={{ background: BESIN_RENK[n.sembol] ?? '#3e5248' }}
    >
      <span className="font-display">{n.sembol}</span>
      <span className="font-semibold opacity-90">{n.besin}</span>
    </span>
  );
}

export function NoksanlikKarti({ n, onAc, bitkiGoster = false }: { n: Noksanlik; onAc: () => void; bitkiGoster?: boolean }) {
  return (
    <button
      type="button"
      onClick={onAc}
      className="group flex flex-col overflow-hidden rounded-[22px] border border-[#e3dccb] bg-white text-left shadow-[0_1px_0_rgba(0,0,0,.03)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(30,45,35,.45)]"
    >
      <span className="relative block aspect-[4/3] overflow-hidden bg-[#e9e3d4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={noksanlikGorseli(n.id)}
          alt={`${kisaAd(n.bitki)} bitkisinde ${n.besin.toLocaleLowerCase('tr-TR')} noksanlığı`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3">
          <BesinRozeti n={n} />
        </span>
      </span>
      <span className="flex flex-1 flex-col p-4">
        {bitkiGoster && <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a877e]">{kisaAd(n.bitki)}</span>}
        <span className="font-display text-xl font-medium leading-tight text-[#17352a]">{n.besin} noksanlığı</span>
        <span className="mt-1.5 text-sm leading-6 text-[#4f6158]">{n.kisa}</span>
        <span className="mt-auto pt-3 text-xs font-semibold text-[#2f8f57]">Belirtiler ve çözüm →</span>
      </span>
    </button>
  );
}

export function NoksanlikDetayi({ n, onKapat }: { n: Noksanlik; onKapat: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onKapat();
    document.addEventListener('keydown', k);
    const eski = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', k);
      document.body.style.overflow = eski;
    };
  }, [onKapat]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0e1510]/70 backdrop-blur-sm sm:items-center sm:p-6" onClick={onKapat} role="dialog" aria-modal aria-label={`${n.besin} noksanlığı`}>
      <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-[28px] bg-[#fbf8f1] sm:rounded-[28px]" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={noksanlikGorseli(n.id)} alt="" className="aspect-[4/3] w-full object-cover sm:aspect-[16/9]" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-5 pb-5 pt-16 sm:px-8">
            <BesinRozeti n={n} buyuk />
            <h2 className="mt-2 font-display text-3xl font-medium text-white sm:text-4xl">
              {kisaAd(n.bitki)}: {n.besin.toLocaleLowerCase('tr-TR')} noksanlığı
            </h2>
          </div>
          <button type="button" onClick={onKapat} aria-label="Kapat" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:p-8 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#ece5d4] px-3 py-1 text-xs font-semibold text-[#5a4a2a]">
              {n.yaprak === 'yaşlı' ? <ArrowDown size={14} /> : <ArrowUp size={14} />} {YAPRAK_ETIKET[n.yaprak]}
            </p>
            <h3 className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-[#7a877e]">Nasıl tanınır?</h3>
            <ul className="mt-2 space-y-2">
              {n.belirtiler.map((b) => (
                <li key={b} className="flex gap-2.5 text-[15px] leading-6 text-[#24342b]">
                  <Search size={16} className="mt-1 shrink-0 text-[#2f8f57]" /> {b}
                </li>
              ))}
            </ul>
            <h3 className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-[#7a877e]">Neden olur?</h3>
            <p className="mt-2 text-[15px] leading-6 text-[#24342b]">{n.neden}</p>
          </div>
          <div className="space-y-4">
            <div className="rounded-[20px] bg-[#e8f3e6] p-5">
              <h3 className="flex items-center gap-2 font-bold text-[#17352a]">
                <Sprout size={18} className="text-[#238f61]" /> Ne yapmalı?
              </h3>
              <ol className="mt-3 space-y-2.5">
                {n.cozum.map((c, i) => (
                  <li key={c} className="flex gap-3 text-sm leading-6 text-[#24342b]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#238f61] text-xs font-bold text-white">{i + 1}</span>
                    {c}
                  </li>
                ))}
              </ol>
            </div>
            {n.karisir && (
              <div className="rounded-[20px] border border-[#ecd9b0] bg-[#fbf1dc] p-4 text-sm leading-6 text-[#5a4a2a]">
                <span className="font-semibold">Karıştırmayın: </span>
                {n.karisir}
              </div>
            )}
            <p className="flex gap-2 text-xs leading-5 text-[#7a877e]">
              <ShieldAlert size={14} className="mt-0.5 shrink-0" />
              Belirtiler hastalık, ilaç yanığı ya da kuraklığa benzeyebilir. Kesin tanı için toprak ve yaprak analizi yaptırın; ilaç ve gübre dozlarında ürün etiketine uyun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NoksanlikKatalogu({ baslangicBitki, baslangicId, tarlaBitkileri = [] }: { baslangicBitki?: string; baslangicId?: string; tarlaBitkileri?: string[] }) {
  const ilk = baslangicId ? NOKSANLIKLAR.find((n) => n.id === baslangicId) : undefined;
  const [bitki, setBitki] = useState<string>(ilk?.bitki ?? baslangicBitki ?? tarlaBitkileri[0] ?? BITKI_SIRASI[0]);
  const [secili, setSecili] = useState<Noksanlik | undefined>(ilk);
  const [besin, setBesin] = useState<string>('hepsi');

  const kartlar = useMemo(() => NOKSANLIKLAR.filter((n) => n.bitki === bitki), [bitki]);
  const gorunen = besin === 'hepsi' ? kartlar : kartlar.filter((n) => n.sembol === besin);
  const besinler = useMemo(() => [...new Set(NOKSANLIKLAR.map((n) => n.sembol))], []);

  // Adres çubuğunu güncel tut (paylaşılabilir bağlantı)
  useEffect(() => {
    const u = new URL(window.location.href);
    u.searchParams.set('bitki', bitki);
    if (secili) u.searchParams.set('n', secili.id);
    else u.searchParams.delete('n');
    window.history.replaceState(null, '', u.toString());
  }, [bitki, secili]);

  const bitkiSec = (b: string) => {
    setBitki(b);
    setBesin('hepsi');
  };

  // Seçili bitki düğmesini (mobilde yatay kaydırmada) görünür yap
  const seritRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const kap = seritRef.current;
    const el = kap?.querySelector<HTMLElement>('[data-secili="1"]');
    if (kap && el && kap.scrollWidth > kap.clientWidth) kap.scrollTo({ left: el.offsetLeft - kap.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
  }, [bitki]);

  const sira = [...tarlaBitkileri, ...BITKI_SIRASI.filter((b) => !tarlaBitkileri.includes(b))];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="relative overflow-hidden rounded-[32px] bg-[#17352a] px-6 py-10 text-white sm:px-10 sm:py-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={noksanlikGorseli('misir-fe')} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f241b] via-[#0f241b]/80 to-transparent" />
        <div className="relative max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#bfe6a6] backdrop-blur">
            <Leaf size={14} /> Katalog
          </p>
          <h1 className="mt-4 font-display text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl">Bitki besin noksanlıkları</h1>
          <p className="mt-4 text-base leading-7 text-white/80">
            Bitkinizi seçin, yaprağınıza en çok benzeyen resmi bulun. Her kartta nasıl tanınacağı, neden olduğu ve ne yapılacağı yazıyor.
          </p>
        </div>
      </header>

      {/* Önce hangi yaprağa bakın */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="flex gap-4 rounded-[22px] border border-[#e3dccb] bg-white p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f3ead6] text-[#8a6a2c]">
            <ArrowDown size={22} />
          </span>
          <div>
            <p className="font-bold text-[#17352a]">Alt (yaşlı) yapraklarda başlıyorsa</p>
            <p className="mt-1 text-sm leading-6 text-[#5b6f65]">Bitki bu besinleri yaşlı yapraktan gence taşır: büyük ihtimalle <b>azot, fosfor, potasyum</b> ya da <b>magnezyum</b>.</p>
          </div>
        </div>
        <div className="flex gap-4 rounded-[22px] border border-[#e3dccb] bg-white p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e3eef7] text-[#3b6ea5]">
            <ArrowUp size={22} />
          </span>
          <div>
            <p className="font-bold text-[#17352a]">Üst (genç) yapraklarda başlıyorsa</p>
            <p className="mt-1 text-sm leading-6 text-[#5b6f65]">Bu besinler taşınamaz: <b>demir, çinko, mangan, kükürt, bor</b> ya da <b>kalsiyum</b>. Kireçli topraklarda demir ve çinko en sık görülenlerdir.</p>
          </div>
        </div>
      </div>

      {/* Bitki seçimi */}
      <div className="mt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7a877e]">Bitki seçin</p>
        <div ref={seritRef} className="relative -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible">
          {sira.map((b) => {
            const on = b === bitki;
            const sayi = NOKSANLIKLAR.filter((n) => n.bitki === b).length;
            return (
              <button
                key={b}
                type="button"
                onClick={() => bitkiSec(b)}
                data-secili={on ? '1' : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                  on ? 'border-[#17352a] bg-[#17352a] text-white' : 'border-[#ddd5c3] bg-white text-[#2c3d33] hover:border-[#238f61]'
                }`}
              >
                {kisaAd(b)}
                <span className={`rounded-full px-1.5 text-xs ${on ? 'bg-white/20' : 'bg-[#f0ebe0] text-[#7a877e]'}`}>{sayi}</span>
                {tarlaBitkileri.includes(b) && <span className={`text-[10px] font-bold uppercase ${on ? 'text-[#bfe6a6]' : 'text-[#2f8f57]'}`}>tarlanız</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Besin filtresi */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setBesin('hepsi')} className={`rounded-full px-3 py-1.5 text-xs font-bold ${besin === 'hepsi' ? 'bg-[#2c3d33] text-white' : 'bg-[#ebe5d8] text-[#4f6158]'}`}>
          Hepsi
        </button>
        {besinler
          .filter((s) => kartlar.some((n) => n.sembol === s))
          .map((s) => {
            const n = kartlar.find((x) => x.sembol === s)!;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setBesin(s)}
                className="rounded-full px-3 py-1.5 text-xs font-bold transition"
                style={besin === s ? { background: BESIN_RENK[s], color: '#fff' } : { background: '#ebe5d8', color: '#4f6158' }}
              >
                {n.besin}
              </button>
            );
          })}
      </div>

      <h2 className="mt-8 font-display text-3xl font-medium text-[#17352a]">
        {kisaAd(bitki)} <span className="text-[#7a877e]">· {gorunen.length} noksanlık</span>
      </h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {gorunen.map((n) => (
          <NoksanlikKarti key={n.id} n={n} onAc={() => setSecili(n)} />
        ))}
      </div>

      <p className="mt-10 rounded-[20px] bg-[#efe8d8] p-5 text-sm leading-6 text-[#5a4a2a]">
        Resimler belirtileri tanımaya yardımcı olmak için hazırlanmış örnek görsellerdir. Aynı noksanlık çeşide, toprağa ve havaya göre farklı görünebilir;
        birden fazla noksanlık aynı anda da olabilir. Toprak analiziniz bu tahmini doğrulamanın en kolay yoludur.
      </p>

      {secili && <NoksanlikDetayi n={secili} onKapat={() => setSecili(undefined)} />}
    </div>
  );
}
