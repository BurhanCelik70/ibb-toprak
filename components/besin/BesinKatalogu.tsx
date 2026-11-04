'use client';
/**
 * Besinleri tanıyalım: element tabloları, ayrıntı penceresi, azotun yolculuğu ve gübre torbası hesaplayıcısı.
 */
import Link from 'next/link';
import { ArrowRight, Droplets, Leaf, Mountain, Package, Sprout, TriangleAlert, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AZOT_YOLU,
  BESINLER,
  DIGER_BESINLER,
  GRUP_ACIKLAMA,
  GRUP_ADI,
  HAVA_SU,
  K2O_K,
  P2O5_P,
  besinBul,
  type Besin,
  type BesinGrubu,
} from '@/lib/besinler';
import { URUNLER } from '@/lib/igsas';
import { BITKI_KISA, NOKSANLIKLAR, noksanlikGorseli } from '@/lib/noksanliklar';

const kisaAd = (b: string) => BITKI_KISA[b] ?? b;
const GRUPLAR: BesinGrubu[] = ['birincil', 'ikincil', 'mikro', 'faydali'];
const fmt = (n: number, d = 1) => n.toLocaleString('tr-TR', { maximumFractionDigits: d, minimumFractionDigits: 0 });
const marka = (ad: string) => (/^KIANA/i.test(ad) ? 'KIANA' : 'İGSAŞ');

const HAREKET: Record<Besin['hareket'], { ad: string; metin: string }> = {
  hareketli: { ad: 'Bitki içinde hareketli', metin: 'Eksik kalınca bitki onu yaşlı yapraktan alıp gence taşır; belirti önce alt yapraklarda.' },
  'az hareketli': { ad: 'Bitki içinde az hareketli', metin: 'Kısmen taşınır; belirti genç ve orta yapraklarda.' },
  hareketsiz: { ad: 'Bitki içinde hareketsiz', metin: 'Bir kez yerleşince taşınmaz; belirti önce genç yaprak, uç ve meyvede.' },
};

/* ---------- Element kutusu ---------- */
function BesinKutusu({ b, onAc }: { b: Besin; onAc: () => void }) {
  return (
    <button
      type="button"
      onClick={onAc}
      className="group relative flex aspect-square flex-col sm:aspect-[4/3] justify-between overflow-hidden rounded-[22px] bg-[#0f1511] p-4 text-left text-white ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(10,14,10,.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f8f57]"
      aria-label={`${b.ad} (${b.sembol}) hakkında`}
    >
      {b.resim && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={b.resim} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.05] group-hover:opacity-95" />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
      <span className="relative flex items-start justify-between">
        <span className="font-display text-4xl font-semibold leading-none drop-shadow sm:text-5xl">{b.sembol}</span>
        <span className="rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-semibold tabular-nums backdrop-blur">{b.atomNo}</span>
      </span>
      <span className="relative">
        <span className="block text-base font-bold sm:text-lg">{b.ad}</span>
        <span className="mt-0.5 line-clamp-2 hidden text-xs leading-5 text-white/80 sm:block">{b.kisa}</span>
      </span>
      <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: b.renk }} />
    </button>
  );
}

/* ---------- Ayrıntı penceresi ---------- */
function Bilgi({ ikon: Ikon, baslik, renk, children }: { ikon: typeof Leaf; baslik: string; renk: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-[#1d2a22]/8">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: renk }}>
        <Ikon size={15} /> {baslik}
      </p>
      <div className="mt-1.5 text-sm leading-6 text-[#33463c]">{children}</div>
    </div>
  );
}

function BesinDetayi({ b, onKapat }: { b: Besin; onKapat: () => void }) {
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

  const noksanliklar = NOKSANLIKLAR.filter((n) => n.sembol === b.sembol);
  const urunler = b.urunler.map((ad) => URUNLER.find((u) => u.ad === ad)).filter((u): u is (typeof URUNLER)[number] => !!u);
  const h = HAREKET[b.hareket];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0e1510]/70 backdrop-blur-sm sm:items-center sm:p-6" onClick={onKapat} role="dialog" aria-modal aria-label={b.ad}>
      <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-[28px] bg-[#fbf8f1] sm:rounded-[28px]" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          {b.resim && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.resim} alt={`${b.ad} temsili görseli`} className="aspect-[4/3] w-full object-cover sm:aspect-[16/8]" />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pb-5 pt-20 sm:px-8">
            <div className="flex items-end gap-4">
              <span className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/25 bg-black/40 text-white backdrop-blur sm:h-24 sm:w-24">
                <span className="self-end pr-2 text-[11px] font-semibold tabular-nums text-white/70">{b.atomNo}</span>
                <span className="-mt-1 font-display text-4xl font-semibold leading-none sm:text-5xl">{b.sembol}</span>
                <span className="mt-1 h-1 w-8 rounded-full" style={{ background: b.renk }} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{GRUP_ADI[b.grup]}</p>
                <h2 className="mt-1 font-display text-3xl font-medium text-white sm:text-4xl">{b.ad}</h2>
                <p className="mt-1 text-sm leading-6 text-white/85">{b.kisa}</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={onKapat} aria-label="Kapat" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-5 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Bilgi renk={b.renk} ikon={Sprout} baslik="Bitkide ne işe yarar">
              <ul className="space-y-1">
                {b.gorevler.map((g) => (
                  <li key={g} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: b.renk }} />
                    {g}
                  </li>
                ))}
              </ul>
            </Bilgi>
            <Bilgi renk={b.renk} ikon={Leaf} baslik="Eksikse nerede görülür">
              <p className="font-semibold text-[#17352a]">{h.ad}</p>
              <p className="text-xs leading-5 text-[#6b7d72]">{h.metin}</p>
              <p className="mt-1.5">{b.noksanlikYeri}</p>
            </Bilgi>
            <Bilgi renk={b.renk} ikon={Mountain} baslik="Toprakta">
              <p>{b.toprakta}</p>
              <p className="mt-1.5 text-xs leading-5 text-[#6b7d72]">Kökün aldığı şekli: {b.alinanSekil}</p>
            </Bilgi>
            <Bilgi renk={b.renk} ikon={TriangleAlert} baslik="Alımını ne bozar">
              {b.alimiBozan}
            </Bilgi>
            <Bilgi renk={b.renk} ikon={Droplets} baslik="Ne zaman verilir">
              {b.neZaman}
            </Bilgi>
            <Bilgi renk={b.renk} ikon={TriangleAlert} baslik="Fazlası">
              {b.fazlasi}
            </Bilgi>
          </div>

          {urunler.length > 0 && (
            <section>
              <h3 className="font-display text-xl font-medium text-[#17352a]">{b.ad} içeren İGSAŞ ve KIANA ürünleri</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {urunler.map((u) => {
                  const m = marka(u.ad);
                  return (
                    <li key={u.ad} className="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-[#1d2a22]/8">
                      <span className="flex items-center gap-2">
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${m === 'KIANA' ? 'bg-[#e6f4e4] text-[#1f6f4a]' : 'bg-[#e4eef5] text-[#2c5566]'}`}>{m}</span>
                        <span className="font-semibold text-[#17352a]">{u.ad}</span>
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-[#6b7d72]">{u.rol}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-xs text-[#7a877e]">Hangi üründen ne kadar verileceği toprak analizinize ve bitkinize göre tarlanızın raporunda hesaplanır.</p>
            </section>
          )}

          {noksanliklar.length > 0 && (
            <section>
              <h3 className="font-display text-xl font-medium text-[#17352a]">{b.ad} noksanlığı tarlada nasıl görünür</h3>
              <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
                {noksanliklar.map((n) => (
                  <Link
                    key={n.id}
                    href={`/noksanliklar?bitki=${encodeURIComponent(n.bitki)}&n=${n.id}`}
                    className="group w-40 shrink-0 snap-start overflow-hidden rounded-2xl bg-white ring-1 ring-[#1d2a22]/8 sm:w-44"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={noksanlikGorseli(n.id)} alt={`${kisaAd(n.bitki)} bitkisinde ${b.ad.toLocaleLowerCase('tr-TR')} noksanlığı`} loading="lazy" className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.04]" />
                    <span className="block px-3 py-2 text-sm font-semibold text-[#17352a]">{kisaAd(n.bitki)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Gübre torbası hesaplayıcı ---------- */
const HAZIR = [
  { ad: '15-15-15', n: 15, p: 15, k: 15 },
  { ad: '20-20-0', n: 20, p: 20, k: 0 },
  { ad: 'DAP 18-46-0', n: 18, p: 46, k: 0 },
  { ad: 'Üre 46-0-0', n: 46, p: 0, k: 0 },
  { ad: 'AS 21-0-0', n: 21, p: 0, k: 0 },
  { ad: '12-40-12', n: 12, p: 40, k: 12 },
  { ad: 'K₂SO₄ 0-0-50', n: 0, p: 0, k: 50 },
];

function SayiKutusu({ etiket, deger, setDeger, renk }: { etiket: string; deger: number; setDeger: (v: number) => void; renk: string }) {
  return (
    <label className="flex flex-col items-center gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: renk }}>
        {etiket}
      </span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        max={100}
        value={deger}
        onChange={(e) => setDeger(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
        className="w-20 rounded-xl border-2 bg-white px-2 py-2 text-center font-display text-2xl tabular-nums text-[#17352a] outline-none focus:ring-2 focus:ring-[#2f8f57]/30"
        style={{ borderColor: renk }}
      />
    </label>
  );
}

function TorbaHesabi() {
  const [n, setN] = useState(15);
  const [p, setP] = useState(15);
  const [k, setK] = useState(15);
  const [kg, setKg] = useState(50);
  const toplam = n + p + k;
  const asim = toplam > 100;
  const geri = Math.max(0, 100 - toplam);
  const kgN = (kg * n) / 100;
  const kgP2O5 = (kg * p) / 100;
  const kgK2O = (kg * k) / 100;
  const seri = [
    { ad: 'Azot (N)', yuzde: n, renk: '#2f7d4f' },
    { ad: 'Fosfor (P₂O₅)', yuzde: p, renk: '#7b4fa3' },
    { ad: 'Potasyum (K₂O)', yuzde: k, renk: '#b5651d' },
  ];

  return (
    <section id="torba" className="scroll-mt-24 rounded-[28px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-8" aria-labelledby="torba-baslik">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a87a2a]">Gübre torbasını okuyun</p>
      <h2 id="torba-baslik" className="mt-1 font-display text-3xl font-medium text-[#17352a]">15-15-15 ne demek?</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#4b5f55]">
        Torbadaki üç sayı her zaman aynı sırayla yazılır: <b>azot – fosfor – potasyum</b>, yüzde olarak. Fosfor <b>P₂O₅</b>, potasyum <b>K₂O</b> cinsinden
        yazılır. Kendi torbanızın sayılarını girin, içinde ne kadar besin olduğunu görün.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {HAZIR.map((h) => {
          const on = h.n === n && h.p === p && h.k === k;
          return (
            <button
              key={h.ad}
              type="button"
              onClick={() => {
                setN(h.n);
                setP(h.p);
                setK(h.k);
              }}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${on ? 'bg-[#17352a] text-white' : 'bg-[#f1ede2] text-[#3e5248] hover:bg-[#e8e2d2]'}`}
            >
              {h.ad}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start">
        <div className="flex flex-wrap items-end justify-center gap-3 rounded-2xl bg-[#f8f5ec] p-4 sm:justify-start">
          <SayiKutusu etiket="N" deger={n} setDeger={setN} renk="#2f7d4f" />
          <span className="hidden pb-3 text-2xl text-[#b8b09a] sm:inline">–</span>
          <SayiKutusu etiket="P₂O₅" deger={p} setDeger={setP} renk="#7b4fa3" />
          <span className="hidden pb-3 text-2xl text-[#b8b09a] sm:inline">–</span>
          <SayiKutusu etiket="K₂O" deger={k} setDeger={setK} renk="#b5651d" />
          <label className="ml-0 flex flex-col items-center gap-1 sm:ml-3">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#6b7d72]">Torba (kg)</span>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              value={kg}
              onChange={(e) => setKg(Math.max(1, Math.min(2000, Number(e.target.value) || 1)))}
              className="w-24 rounded-xl border-2 border-[#d9d2bf] bg-white px-2 py-2 text-center font-display text-2xl tabular-nums text-[#17352a] outline-none focus:ring-2 focus:ring-[#2f8f57]/30"
            />
          </label>
        </div>

        <div>
          {/* Torba çubuğu */}
          <div className="flex h-10 overflow-hidden rounded-xl ring-1 ring-[#1d2a22]/10" role="img" aria-label={`Torbanın %${fmt(Math.min(toplam, 100))} kadarı besin`}>
            {seri.map((s) =>
              s.yuzde > 0 ? (
                <span key={s.ad} className="flex items-center justify-center text-xs font-bold text-white" style={{ width: `${(s.yuzde / Math.max(100, toplam)) * 100}%`, background: s.renk }}>
                  {s.yuzde >= 6 ? `%${fmt(s.yuzde)}` : ''}
                </span>
              ) : null,
            )}
            {geri > 0 && (
              <span className="flex flex-1 items-center justify-center bg-[repeating-linear-gradient(45deg,#ece6d6,#ece6d6_6px,#f5f1e6_6px,#f5f1e6_12px)] text-xs font-semibold text-[#7a6f55]">
                %{fmt(geri)} geri kalan
              </span>
            )}
          </div>

          {asim ? (
            <p className="mt-3 rounded-xl bg-[#fdeeee] px-3 py-2 text-sm text-[#9a3434]">Üç sayının toplamı 100’ü geçemez. Torbadaki sayıları kontrol edin.</p>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { ad: 'Azot', kg: kgN, alt: 'saf azot (N)', renk: '#2f7d4f' },
                  { ad: 'Fosfor', kg: kgP2O5, alt: `P₂O₅ · saf fosfor ≈ ${fmt(kgP2O5 * P2O5_P)} kg`, renk: '#7b4fa3' },
                  { ad: 'Potasyum', kg: kgK2O, alt: `K₂O · saf potasyum ≈ ${fmt(kgK2O * K2O_K)} kg`, renk: '#b5651d' },
                ].map((s) => (
                  <div key={s.ad} className="rounded-2xl bg-[#f8f5ec] p-4">
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: s.renk }}>
                      {s.ad}
                    </p>
                    <p className="mt-0.5 font-display text-3xl tabular-nums text-[#17352a]">
                      {fmt(s.kg)} <span className="text-base text-[#6b7d72]">kg</span>
                    </p>
                    <p className="text-xs text-[#6b7d72]">{s.alt}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm leading-6 text-[#33463c]">
                {fmt(kg, 0)} kg’lık torbada toplam <b>{fmt((kg * toplam) / 100)} kg</b> besin var.
                {geri > 0 && (
                  <>
                    {' '}Geri kalan <b>%{fmt(geri)}</b> ({fmt((kg * geri) / 100)} kg) boşa değil: fosfor ve potasyumun oksit yazımındaki oksijen, besinlere eşlik eden
                    iyonlar (sülfat, klorür, kalsiyum gibi) ve gübreyi taneli hâle getiren taşıyıcı ile dolgu maddesidir.
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Ana bileşen ---------- */
export function BesinKatalogu({ baslangic }: { baslangic?: string }) {
  const [secili, setSecili] = useState<Besin | undefined>(() => besinBul(baslangic));
  const kapat = useCallback(() => setSecili(undefined), []);
  const gruplar = useMemo(() => GRUPLAR.map((g) => ({ g, liste: BESINLER.filter((b) => b.grup === g) })), []);

  useEffect(() => {
    const u = new URL(window.location.href);
    if (secili) u.searchParams.set('b', secili.sembol.toLowerCase());
    else u.searchParams.delete('b');
    window.history.replaceState(null, '', u.toString());
  }, [secili]);

  return (
    <>
      {/* 17 element özeti */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8" aria-labelledby="on-yedi">
        <div className="grid gap-6 rounded-[28px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 id="on-yedi" className="font-display text-2xl font-medium text-[#17352a] sm:text-3xl">Bitki 17 elemente ihtiyaç duyar</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4b5f55]">
              Üçünü havadan ve sudan kendisi alır. Kalan 14’ünü kökleriyle topraktan alır; gübreyle tamamladığımız besinler bunlardır. Birinin eksikliği,
              diğerleri bol olsa bile verimi sınırlar: fıçının en kısa tahtası gibi.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {HAVA_SU.map((e) => (
              <span key={e.sembol} className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-[#eef4f6] text-[#2c5566]" title={`${e.ad}: ${e.kaynak}`}>
                <span className="font-display text-2xl font-semibold leading-none">{e.sembol}</span>
                <span className="mt-1 text-[10px] font-semibold">{e.ad}</span>
              </span>
            ))}
            <span className="flex h-16 items-center rounded-2xl bg-[#e8f3e6] px-4 text-sm font-bold text-[#1f6f4a]">+ 14 topraktan</span>
          </div>
        </div>
      </section>

      {/* Gruplar */}
      {gruplar.map(({ g, liste }) => (
        <section key={g} className="mx-auto mt-12 max-w-6xl px-5 sm:px-8" aria-labelledby={`grup-${g}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 id={`grup-${g}`} className="font-display text-2xl font-medium text-[#17352a] sm:text-3xl">
              {GRUP_ADI[g]}
            </h2>
            <p className="max-w-xl text-sm leading-6 text-[#5e6a60]">{GRUP_ACIKLAMA[g]}</p>
          </div>
          <div className={`mt-5 grid gap-4 ${g === 'mikro' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {liste.map((b) => (
              <BesinKutusu key={b.sembol} b={b} onAc={() => setSecili(b)} />
            ))}
            {g === 'mikro' &&
              DIGER_BESINLER.map((d) => (
                <div key={d.sembol} className="flex min-h-full flex-col gap-2 justify-between rounded-[22px] border border-dashed border-[#cfc6ae] bg-[#fbf8f1] p-4">
                  <span className="flex items-start justify-between">
                    <span className="font-display text-4xl font-semibold leading-none text-[#5e6a60]">{d.sembol}</span>
                    <span className="text-[11px] font-semibold tabular-nums text-[#8a8270]">{d.atomNo}</span>
                  </span>
                  <span>
                    <span className="block text-base font-bold text-[#3e5248]">{d.ad}</span>
                    <span className="mt-0.5 line-clamp-3 block text-xs leading-5 text-[#6b7d72]" title={d.metin}>
                      {d.metin}
                    </span>
                  </span>
                </div>
              ))}
          </div>
        </section>
      ))}

      {/* Azotun yolculuğu */}
      <section className="mx-auto mt-14 max-w-6xl px-5 sm:px-8" aria-labelledby="azot-yolu">
        <div className="overflow-hidden rounded-[28px] bg-[#10201a] p-5 text-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9bdd68]">Gübreden bitkiye</p>
          <h2 id="azot-yolu" className="mt-1 font-display text-3xl font-medium">Ürenin toprakta yolculuğu</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75">
            Bitki üreyi doğrudan pek kullanmaz. Toprağa düşen üre önce amonyuma, sonra nitrata dönüşür. Ilık ve nemli toprakta bu yaklaşık şöyle olur; soğukta
            yavaşlar. Bu yüzden üre, ihtiyaçtan birkaç gün önce verilmeli ve yüzeyde kalmamalıdır.
          </p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {AZOT_YOLU.map((a, i) => (
              <li key={a.ad} className="relative rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                {a.sure && <span className="mb-2 inline-block rounded-full bg-[#9bdd68] px-2.5 py-0.5 text-xs font-bold text-[#10201a]">{a.sure} sonra</span>}
                {!a.sure && <span className="mb-2 inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold">Başlangıç</span>}
                <p className="font-display text-2xl">{a.ad}</p>
                <p className="font-mono text-sm text-[#9bdd68]">{a.formul}</p>
                <p className="mt-1 text-sm text-white/75">{a.not}</p>
                {i < AZOT_YOLU.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-[#9bdd68] sm:block" size={22} />}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs leading-5 text-white/55">
            Amonyum sülfat (AS 21) doğrudan amonyum adımından, potasyum nitrat ve magnezyum nitrat doğrudan nitrat adımından başlar; bu yüzden etkileri daha
            hızlıdır.
          </p>
        </div>
      </section>

      <div className="mx-auto mt-14 max-w-6xl px-5 sm:px-8">
        <TorbaHesabi />
      </div>

      <section className="mx-auto mt-14 max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-4 rounded-[28px] bg-[#e8f3e6] p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="font-display text-2xl font-medium text-[#17352a]">Toprağınızda hangisi eksik?</h2>
            <p className="mt-1 text-sm leading-6 text-[#3e5248]">Toprak analizinizi yükleyin; eksik besinler ve hangi gübrenin ne zaman verileceği tarlanıza göre çıksın.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/ornek" className="inline-flex items-center gap-1.5 rounded-full bg-[#238f61] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1d7d54]">
              Örnek raporu gör <ArrowRight size={16} />
            </Link>
            <Link href="/noksanliklar" className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#17352a] ring-1 ring-[#1d2a22]/10 hover:bg-[#f6f9f6]">
              <Package size={16} /> Noksanlık kataloğu
            </Link>
          </div>
        </div>
      </section>

      {secili && <BesinDetayi b={secili} onKapat={kapat} />}
    </>
  );
}
