'use client';
/**
 * Rapor ekranının yeni parçaları:
 *  - YorumBolumu: yapay zekâ yorumu, "Toprağınız hakkında" özet kartı ve animasyonlu sorun kartları
 *  - SorunSahnesi: element toprağa iner → kök gelişir → bitki yeşerir (public/sorun/<anahtar>-once|sonra.webp varsa resimle)
 *  - UrunRozeti: İGSAŞ / KIANA / saf besin rozetleri
 *  - SezonToplami: sezon boyu toplam İGSAŞ / KIANA ürün miktarı (Z-kart + yapay zekâ planı)
 */
import { useTx } from '@/components/DilSaglayici';
import { ArrowUpRight, Leaf, Loader2, ShoppingBag, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { atlasBitkiKodu } from '@/lib/atlas';
import { alanBirimi } from '@/lib/dil';
import { besinBul } from '@/lib/besinler';
import { HOCA_URUN_ROL, derisimOku, hocaHumintechToplami, type Program } from '@/lib/hocaProgram';

/**
 * Hocanın atlas programı Humintech ürünleriyle yazılı; İGSAŞ sürümünde sezon listesi Z-karttan (İGSAŞ) hesaplanır.
 * Atlas programı İGSAŞ ürünlerine çevrilince true yapın.
 */
const HOCA_PROGRAMI = false as boolean;
import { igsasUrunBul, satinAlmaLinki, urunBilgisi, urunGorselleri, type IgsasUrun } from '@/lib/igsas';
import { dozOku, evreUygulamalari, type SulamaYontemi } from '@/lib/sulama';
import type { ZKart } from '@/lib/zkartlar';
import type { CozumPlani } from '@/lib/veri';
import type { SoilReport } from '@/lib/toprak';
import { hocaProgramiYukle } from './HocaProgrami';

/* -------------------------------------------------------------------------- */
/* Besin ve sorun kimlikleri                                                   */
/* -------------------------------------------------------------------------- */

type BesinKimlik = { sembol: string; renk: string; ad: string };

/** Markasız besin satırlarının sembol ve rengi */
export const BESIN_KIMLIK: Record<string, BesinKimlik> = {
  'Azot (N)': { sembol: 'N', renk: '#3567b5', ad: 'Azot' },
  'Fosfor (P₂O₅)': { sembol: 'P', renk: '#c7731b', ad: 'Fosfor' },
  'Potasyum (K₂O)': { sembol: 'K', renk: '#7b4bb3', ad: 'Potasyum' },
  'Magnezyum (MgO)': { sembol: 'Mg', renk: '#2f8f57', ad: 'Magnezyum' },
  'Kükürt (S)': { sembol: 'S', renk: '#b8920f', ad: 'Kükürt' },
  'Çinko (Zn)': { sembol: 'Zn', renk: '#5f7894', ad: 'Çinko' },
};

/**
 * anahtar: public/sorun/<anahtar>-once|sonra.webp çifti (yoksa `cift` ile benzer görünümlü çift kullanılır)
 * foto: tek fotoğraf (public/besin); önce soluk, sonra canlı renkle açılır
 */
type SorunKimlik = { anahtar: string; sembol: string; renk: string; cift?: string; foto?: string };

/** Sorun başlığından sahne kimliği (resim dosyası adı, sembol, renk) */
export function sorunKimligi(parametre: string): SorunKimlik {
  const p = parametre.toLocaleLowerCase('tr-TR');
  const tablo: [RegExp, SorunKimlik][] = [
    [/organik|organisch|humus/, { anahtar: 'organik-madde', sembol: 'OM', renk: '#7a5230' }],
    [/çinko|zink|zn\b/, { anahtar: 'cinko', sembol: 'Zn', renk: '#5f7894' }],
    [/demir|eisen|fe\b/, { anahtar: 'demir', sembol: 'Fe', renk: '#b4532a' }],
    [/fosfor|phosphor/, { anahtar: 'fosfor', sembol: 'P', renk: '#c7731b' }],
    [/potasyum|kalium/, { anahtar: 'potasyum', sembol: 'K', renk: '#7b4bb3', foto: '/besin/k.webp' }],
    [/azot|stickstoff/, { anahtar: 'azot', sembol: 'N', renk: '#3567b5', foto: '/besin/n.webp' }],
    // Mangan noksanlığı demirinkine benzer (genç yapraklarda damar arası sararma)
    [/mangan/, { anahtar: 'mangan', sembol: 'Mn', renk: '#8a4f7d', cift: 'demir' }],
    [/bor\b|bor /, { anahtar: 'bor', sembol: 'B', renk: '#4f8a8b', cift: 'fosfor' }],
    [/magnezyum|magnesium/, { anahtar: 'magnezyum', sembol: 'Mg', renk: '#2f8f57', foto: '/besin/mg.webp' }],
    [/kalsiyum|calcium|kalzium/, { anahtar: 'kalsiyum', sembol: 'Ca', renk: '#8c8577', cift: 'fosfor' }],
    [/kükürt|schwefel/, { anahtar: 'kukurt', sembol: 'S', renk: '#b8920f', foto: '/besin/s.webp' }],
    [/bakır|kupfer/, { anahtar: 'bakir', sembol: 'Cu', renk: '#b06b3a', cift: 'cinko' }],
    [/kireç|kalk/, { anahtar: 'kirec', sembol: 'CaCO₃', renk: '#9c917c', cift: 'organik-madde' }],
    [/tuz|salz|ec\b|sodyum|natrium/, { anahtar: 'tuz', sembol: 'EC', renk: '#6f8796', cift: 'organik-madde' }],
    [/ph/, { anahtar: 'ph', sembol: 'pH', renk: '#3f8a93', cift: 'organik-madde' }],
  ];
  for (const [re, k] of tablo) if (re.test(p)) return k;
  return { anahtar: 'genel', sembol: '✦', renk: '#2f7a4f', cift: 'organik-madde' };
}

/* -------------------------------------------------------------------------- */
/* Rozetler                                                                    */
/* -------------------------------------------------------------------------- */

/** İGSAŞ / KIANA ürünü: marka rozeti (KIANA yeşil yapraklı, İGSAŞ koyu yeşil). Saf besin: element sembollü renkli rozet. */
export function UrunRozeti({ ad, koyu = false }: { ad: string; koyu?: boolean }) {
  const tx = useTx();
  const { marka, besin } = urunBilgisi(ad);
  if (marka)
    return marka === 'KIANA' ? (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-[#e3f3df] to-[#d3ecd0] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#1f6f4a] ring-1 ring-[#b9dfb5]">
        <Leaf size={11} strokeWidth={2.4} /> KIANA
      </span>
    ) : (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#1C4734] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white ring-1 ring-[#1C4734]">
        İGSAŞ
      </span>
    );
  if (besin) {
    const k = BESIN_KIMLIK[ad];
    if (!k) return null;
    return (
      <span
        className="inline-flex shrink-0 items-center gap-1 rounded-full py-0.5 pl-0.5 pr-2 text-[10px] font-bold tracking-wide"
        style={
          koyu
            ? { background: `${k.renk}40`, color: '#ffffff', boxShadow: `inset 0 0 0 1px ${k.renk}99` }
            : { background: `${k.renk}14`, color: k.renk, boxShadow: `inset 0 0 0 1px ${k.renk}33` }
        }
        title={tx("Markasız saf besin miktarı")}
      >
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] text-white" style={{ background: k.renk }}>
          {tx(k.sembol)}
        </span>
        
        {tx("saf besin")}
      </span>
    );
  }
  return null;
}

/** Ürün ambalaj görseli: sitedeki kopya → üreticinin görseli → baş harfli yedek kutu */
export function UrunGorseli({ urun, className = '' }: { urun: IgsasUrun; className?: string }) {
  const tx = useTx();
  const kaynaklar = urunGorselleri(urun);
  const [i, setI] = useState(0);
  const kaynak = kaynaklar[i];
  return (
    <span className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-[#1d2a22]/8 ${className}`}>
      {kaynak ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={kaynak}
          src={kaynak}
          alt=""
          title={tx("{a} ambalajı", { a: urun.ad })}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setI((x) => x + 1)}
          className="h-full w-full object-contain p-1.5"
        />
      ) : (
        <span className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#e3f3df] to-[#cbe8c5] text-[#1f6f4a]">
          <Leaf size={18} />
          <span className="mt-0.5 text-[9px] font-bold tracking-wide">{tx(urun.ad.split(' ')[0])}</span>
        </span>
      )}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Sorun sahnesi                                                               */
/* -------------------------------------------------------------------------- */

function useGorunur<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [gorunur, setGorunur] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setGorunur(true);
          io.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, gorunur };
}

/** public/sorun/<anahtar>-once.webp ve -sonra.webp ikisi de varsa true */
function useResimCifti(anahtar: string) {
  const [var_, setVar] = useState(false);
  useEffect(() => {
    let iptal = false;
    let yuklenen = 0;
    for (const s of ['once', 'sonra']) {
      const img = new Image();
      img.onload = () => {
        yuklenen += 1;
        if (yuklenen === 2 && !iptal) setVar(true);
      };
      img.src = `/sorun/${anahtar}-${s}.webp`;
    }
    return () => {
      iptal = true;
    };
  }, [anahtar]);
  return var_;
}

/** Görünür olunca oynar; sonra belli aralıklarla önce hâline döner ve yeniden oynar */
function useDongu(gorunur: boolean, aralikMs = 7500, donusMs = 1100) {
  const [canli, setCanli] = useState(false);
  useEffect(() => {
    if (!gorunur) return;
    let t2: ReturnType<typeof setTimeout> | undefined;
    const t0 = setTimeout(() => setCanli(true), 0);
    const azalt = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = azalt
      ? undefined
      : setInterval(() => {
          setCanli(false);
          t2 = setTimeout(() => setCanli(true), donusMs);
        }, aralikMs);
    return () => {
      clearTimeout(t0);
      if (t) clearInterval(t);
      if (t2) clearTimeout(t2);
    };
  }, [gorunur, aralikMs, donusMs]);
  return canli;
}

export function SorunSahnesi({ parametre, gecikme = 0 }: { parametre: string; gecikme?: number }) {
  const k = sorunKimligi(parametre);
  const { ref, gorunur } = useGorunur<HTMLDivElement>();
  const kendi = useResimCifti(k.anahtar);
  const yedek = useResimCifti(k.cift ?? k.anahtar);
  const cift = kendi ? k.anahtar : yedek ? (k.cift ?? k.anahtar) : undefined;
  const canli = useDongu(gorunur, 7500 + gecikme);

  return (
    <div ref={ref} className={`relative h-full min-h-[210px] overflow-hidden ${canli ? 'canli' : ''}`} aria-hidden>
      {cift ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/sorun/${cift}-once.webp`} alt="" className="absolute inset-0 h-full w-full object-cover" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/sorun/${cift}-sonra.webp`} alt="" className="ss-sonra absolute inset-0 h-full w-full object-cover" />
        </>
      ) : k.foto ? (
        <>
          {/* Tek fotoğraf: önce soluk ve sararmış, sonra canlı renkle aşağıdan yukarı açılır */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={k.foto} alt="" className="absolute inset-0 h-full w-full object-cover [filter:grayscale(.75)_sepia(.45)_brightness(.92)_contrast(.9)]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={k.foto} alt="" className="ss-sonra absolute inset-0 h-full w-full object-cover [filter:saturate(1.15)]" />
        </>
      ) : (
        <CizimSahne renk={k.renk} />
      )}
      <div
        className="ss-isik pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(60% 50% at 50% 62%, ${k.renk}55, transparent 70%)` }}
      />
      {/* İnen element */}
      <span
        className="ss-orb absolute left-1/2 top-[58%] flex h-12 w-12 items-center justify-center rounded-full font-display text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,.5)] ring-2 ring-white/70"
        style={{ background: `radial-gradient(circle at 35% 30%, ${k.renk}cc, ${k.renk})` }}
      >
        {k.sembol}
      </span>
      <span className="ss-halka absolute left-1/2 top-[62%] h-16 w-16 rounded-full border-2" style={{ borderColor: `${k.renk}` }} />
      <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
        {k.sembol} · {parametre}
      </span>
    </div>
  );
}

/** Resim yokken kodla çizilen sahne: gökyüzü, toprak kesiti, kökler ve sararmış → yeşeren bitki */
function CizimSahne({ renk }: { renk: string }) {
  const tx = useTx();
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio={tx("xMidYMid slice")} className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="ssGok" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6efdc" />
          <stop offset="1" stopColor="#eadfc2" />
        </linearGradient>
        <linearGradient id="ssToprak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6d4a2c" />
          <stop offset="1" stopColor="#3b2716" />
        </linearGradient>
        <radialGradient id="ssGunes" cx="0.82" cy="0.12" r="0.5">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="260" fill="url(#ssGok)" />
      <rect width="400" height="260" fill="url(#ssGunes)" />
      <rect y="160" width="400" height="100" fill="url(#ssToprak)" />
      {/* toprak taneleri */}
      {Array.from({ length: 38 }, (_, i) => (
        <circle key={i} cx={(i * 97) % 400} cy={170 + ((i * 53) % 85)} r={1 + (i % 3)} fill="#2a1b0f" opacity={0.35} />
      ))}
      <path d="M0 160 Q 100 154 200 160 T 400 160" stroke="#8a6440" strokeWidth="3" fill="none" />
      {/* kökler */}
      <g className="ss-kok" stroke="#e9d9b8" strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path d="M200 162 C 200 190, 196 210, 190 236" />
        <path d="M200 170 C 210 188, 226 196, 240 214" />
        <path d="M200 172 C 188 186, 172 192, 158 206" />
        <path d="M198 196 C 186 206, 176 218, 170 232" />
        <path d="M203 200 C 214 210, 220 224, 226 240" />
      </g>
      {/* gövde ve yapraklar */}
      <path d="M200 160 C 200 140, 201 120, 200 92" stroke="#5f7d3a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path className="ss-yaprak" d="M200 132 C 176 126, 160 112, 152 94 C 176 96, 194 108, 200 132 Z" />
      <path className="ss-yaprak" d="M200 118 C 224 112, 240 98, 248 80 C 224 82, 206 94, 200 118 Z" />
      <path className="ss-yaprak" d="M200 100 C 188 92, 182 80, 182 66 C 194 74, 200 86, 200 100 Z" />
      <path className="ss-yaprak" d="M200 98 C 212 90, 220 78, 222 62 C 208 70, 201 84, 200 98 Z" />
      <circle cx="200" cy="162" r="40" fill={renk} opacity="0.08" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Yorum bölümü                                                                */
/* -------------------------------------------------------------------------- */

const TON = { sorun: '#d9573f', dikkat: '#e0a93a', iyi: '#4f9a5a' } as Record<string, string>;

export function YorumBolumu({
  report,
  ai,
  aiState,
  onRetryAi,
  ilgi,
}: {
  report: SoilReport;
  ai: CozumPlani | null;
  aiState: 'idle' | 'loading' | 'error';
  onRetryAi: () => void;
  ilgi: { key: string; ad: string; tone: string; etiket: string }[];
}) {
  const tx = useTx();
  return (
    <section className="mt-6 rounded-[28px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-8" aria-labelledby={tx("yorum")}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">
        <Sparkles size={14} />{' '}{tx("Yapay zekâ ile yorumlanmış rapor")}
      </p>
      <h2 id="yorum" className="mt-2 font-display text-3xl font-medium tracking-[-0.01em] sm:text-4xl">
        
        {tx("Toprağınızın uzman yorumu")}
      </h2>
      <p className="mt-2 max-w-[70ch] text-sm leading-6 text-[#5b6f65]">
        
        {tx("Laboratuvar değerleri; bitkiniz, bölgeniz ve sulama yönteminizle birlikte değerlendirildi.")}
      </p>

      {aiState === 'loading' && (
        <div className="mt-6 flex items-center gap-3 rounded-[24px] bg-[#f7f4ec] p-5 text-[#64766c]">
          <Loader2 className="animate-spin" size={20} />{' '}{tx("Raporunuz yorumlanıyor…")}
        </div>
      )}
      {aiState === 'error' && (
        <div className="mt-5 text-sm text-[#7a4b00]">
          
          {tx("Yorum şu anda hazırlanamadı.")}{' '}
          <button onClick={onRetryAi} className="font-bold underline">
            
            {tx("Tekrar dene")}
          </button>
        </div>
      )}

      {(ai || ilgi.length > 0) && (
        <div className="relative mt-6 overflow-hidden rounded-[26px] bg-[#16302a] p-6 text-white sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                'radial-gradient(70% 90% at 100% 0%, rgba(226,182,92,.28), transparent 60%), radial-gradient(60% 80% at 0% 100%, rgba(79,168,74,.28), transparent 60%)',
            }}
            aria-hidden
          />
          <div className="relative">
            <p className="font-display text-lg italic text-[#e2b65c]">{tx("Toprağınız hakkında")}</p>
            {ai ? (
              <p className="mt-3 max-w-[62ch] font-display text-xl font-normal leading-[1.45] tracking-[-0.005em] text-white/95 sm:text-[1.45rem]">
                {tx(ai.ozet)}
              </p>
            ) : (
              <p className="mt-3 text-white/70">{tx("Ölçümlerinizde dikkat isteyen değerler var; yorum hazırlanınca burada görünecek.")}</p>
            )}
            {ilgi.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {ilgi.map((x) => (
                  <li key={x.key} className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm ring-1 ring-white/15 backdrop-blur">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: TON[x.tone] ?? '#e0a93a' }} />
                    <span className="font-semibold">{tx(x.ad)}</span>
                    <span className="text-white/65">{tx(x.etiket)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {ai && ai.sorunlar?.length > 0 && (
        <>
          <h3 className="mt-9 font-display text-2xl font-medium">{tx("Öncelikli adımlar")}</h3>
          <ol className="mt-4 space-y-4">
            {ai.sorunlar.map((x, i) => (
              <li key={i} className="grid overflow-hidden rounded-[24px] bg-[#f7f4ec] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <div className="aspect-[16/9] md:aspect-auto">
                  <SorunSahnesi parametre={x.parametre} gecikme={i * 900} />
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1d2a22] text-sm font-bold text-white">{i + 1}</span>
                    <h4 className="font-display text-xl font-medium text-[#17352a]">{tx(x.parametre)}</h4>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#5b6f65]">{tx(x.etki)}</p>
                  <ul className="mt-4 space-y-2">
                    {x.urunler.map((u, j) => (
                      <li key={j} className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-[#1d2a22]/8">
                        {(() => {
                          const k = igsasUrunBul(u.urun);
                          return k ? <UrunGorseli urun={k} className="h-11 w-11 rounded-xl" /> : null;
                        })()}
                        <UrunRozeti ad={u.urun} />
                        <span className="font-semibold text-[#17352a]">{tx(u.urun)}</span>
                        <span className="ml-auto font-bold tabular-nums text-[#1f7a45]">{tx.doz(u.doz)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm leading-6 text-[#5b6f65]">
                    <span className="font-semibold text-[#2a3d36]">{tx("Ne zaman:")}{' '}</span>
                    {tx(x.zaman)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Sezon toplamı                                                               */
/* -------------------------------------------------------------------------- */

type Aralik = { min: number; max: number };
const topla = (a: Aralik | undefined, b: Aralik): Aralik => ({ min: (a?.min ?? 0) + b.min, max: (a?.max ?? 0) + b.max });
const sayi = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: n < 10 ? 1 : 0 });
/** 0,03 L → 30 ml, 0,25 kg → 250 g; küçük miktarlar yuvarlanıp kaybolmasın */
function aralikYaz(a: Aralik, birim: string) {
  let { min, max } = a;
  let b = birim;
  if ((birim === 'kg' || birim === 'L') && max < 1) {
    min *= 1000;
    max *= 1000;
    b = birim === 'kg' ? 'g' : 'ml';
    const y = (x: number) => Math.round(x / 5) * 5;
    min = y(min);
    max = y(max);
  }
  return Math.abs(min - max) < 0.05 * Math.max(1, max) ? `${sayi(max)} ${b}` : `${sayi(min)}–${sayi(max)} ${b}`;
}

/** Dozu kg ya da L cinsinden aralığa çevirir (g → kg, cc/ml → L) */
function kgL(doz: string): { a: Aralik; birim: 'kg' | 'L' } | undefined {
  const d = dozOku(doz);
  if (!d) return undefined;
  const c = d.birim === 'g' || d.birim === 'cc' ? 0.001 : 1;
  return { a: { min: d.min * c, max: d.max * c }, birim: d.birim === 'g' || d.birim === 'kg' ? 'kg' : 'L' };
}

type UrunToplam = { ad: string; a?: Aralik; birim?: 'kg' | 'L'; yaprak: number; yaprakDoz?: string; tohum?: string; toplamPlan?: boolean; onHazirlik?: boolean };

export function sezonToplami(zkart: ZKart | undefined, yontem: SulamaYontemi, ai?: CozumPlani | null) {
  const besin: Record<string, Aralik> = {};
  const urun = new Map<string, UrunToplam>();
  const urunAl = (ad: string) => {
    const k = igsasUrunBul(ad)?.ad ?? ad;
    if (!urun.has(k)) urun.set(k, { ad: k, yaprak: 0 });
    return urun.get(k)!;
  };

  for (const e of zkart?.evreler ?? []) {
    for (const g of evreUygulamalari(e, yontem)) {
      for (const u of g.urunler) {
        const bilgi = urunBilgisi(u.urun);
        const v = kgL(u.doz);
        if (bilgi.besin) {
          if (v && v.birim === 'kg') besin[u.urun] = topla(besin[u.urun], v.a);
          continue;
        }
        if (!bilgi.marka) continue;
        const t = urunAl(u.urun);
        if (/100 kg tohum/.test(u.doz)) t.tohum = u.doz;
        else if (v) {
          t.a = topla(t.a, v.a);
          t.birim = v.birim;
        } else {
          t.yaprak += 1;
          t.yaprakDoz = u.doz;
        }
      }
    }
  }

  // Yapay zekâ yorumundaki ürünler: "Toplam …" yazanlar sezon toplamı olarak alınır; programda olmayanlar eklenir
  const aiUrunler = ai
    ? [...(ai.sorunlar ?? []).flatMap((s) => s.urunler), ...(ai.kokGelisimi ?? []), ...(ai.iklimKoruma ?? [])]
    : [];
  for (const u of aiUrunler) {
    if (!igsasUrunBul(u.urun)) continue;
    const t = urunAl(u.urun);
    const v = kgL(u.doz);
    if (/toplam/i.test(u.doz) && v) {
      t.a = v.a;
      t.birim = v.birim;
      t.toplamPlan = true;
    } else if (!t.a && !t.yaprak && !t.tohum) {
      if (v) {
        t.a = v.a;
        t.birim = v.birim;
      } else {
        t.yaprak = 1;
        t.yaprakDoz = u.doz;
      }
    }
  }

  return { besin, urunler: [...urun.values()] };
}

const SIRA = ['Azot (N)', 'Fosfor (P₂O₅)', 'Potasyum (K₂O)', 'Magnezyum (MgO)', 'Kükürt (S)'];
/** Saf besinden örnek gübre miktarına çevirmek için yaygın oranlar (markasız) */
const ORNEK_ORAN: Record<string, { oran: number; metin: string }> = {
  'Azot (N)': { oran: 0.46, metin: '%46 azotlu gübreyle' },
  'Fosfor (P₂O₅)': { oran: 0.46, metin: '%46 fosforlu gübreyle' },
  'Potasyum (K₂O)': { oran: 0.5, metin: '%50 potasyumlu gübreyle' },
};

/** Hocanın atlasındaki toprak tipleri (lib/atlas.ts → atlasToprak) */
const TOPRAK_TIPI: Record<string, string> = { acid: 'asidik', alk: 'alkali', saline: 'tuzlu', calc: 'aşırı kireçli' };

export function SezonToplami({
  zkart,
  yontem,
  alan,
  ai,
  toprak,
  ek,
}: {
  zkart?: ZKart;
  yontem: SulamaYontemi;
  alan?: number | null;
  ai?: CozumPlani | null;
  /** Atlasın toprak tipi (acid, neutral, alk, saline, calc); hocanın programı buna göre düzeltilir */
  toprak?: string;
  ek?: ReactNode;
}) {
  const tx = useTx();
  // Bitki hocanın atlasında varsa liste atlasın programından gelir: gömülü atlasın "Program" sekmesiyle aynı ürün ve dozlar.
  const kod = atlasBitkiKodu(zkart?.bitki);
  const [prog, setProg] = useState<Program | null>();
  useEffect(() => {
    if (!kod || !HOCA_PROGRAMI) return;
    let iptal = false;
    hocaProgramiYukle()
      .then((v) => !iptal && setProg(v))
      .catch(() => !iptal && setProg(null));
    return () => {
      iptal = true;
    };
  }, [kod]);
  if (!zkart) return ek ? <>{ek}</> : null;
  if (HOCA_PROGRAMI && kod && prog === undefined) return ek ? <>{ek}</> : null; // program yükleniyor
  const hoca = HOCA_PROGRAMI && kod && prog?.bitki[kod] ? hocaHumintechToplami(prog, kod, yontem, toprak) : undefined;
  // Atlasta olmayan bitkide (ya da program yüklenemezse) eski liste: Z-kart + yapay zekâ planı
  const { besin, urunler: zkartUrunleri } = hoca ? { besin: {} as Record<string, Aralik>, urunler: [] } : sezonToplami(zkart, yontem, ai);
  const urunler: UrunToplam[] = hoca ?? zkartUrunleri;
  // Markasız besin listesi kapalı: İGSAŞ sürümünde mineral gübreler de ürün adıyla (DAP, NPK…) listelenir.
  // Mineral gübre programı hocanın atlasındaki "Dönem programı" sekmesindedir. Geri açmak için true yapın.
  const BESIN_LISTESI = false as boolean;
  const besinler = BESIN_LISTESI ? SIRA.filter((k) => besin[k] && besin[k].max > 0.04) : [];
  if (!besinler.length && !urunler.length) return ek ? <>{ek}</> : null;
  const tarla = (a: Aralik) => (alan && alan > 0 ? { min: a.min * alan, max: a.max * alan } : undefined);

  return (
    <section className="mt-10 rounded-[28px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-8" aria-labelledby={tx("toplam")}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">{tx("Sezon boyunca")}</p>
      <h2 id="toplam" className="mt-2 font-display text-3xl font-medium tracking-[-0.01em] sm:text-4xl">
        
        {alan ? tx("Tarlanız için İGSAŞ ürünleri") : tx("İGSAŞ ürünleri")}
      </h2>
      <p className="mt-2 max-w-[70ch] text-sm leading-6 text-[#5b6f65]">
        
        {hoca ? tx("Prof. Dr. Metin Turan'ın atlas programındaki bütün dönemlerin toplamı") : tx("Programdaki bütün dönemlerin toplamı")}{alan ? tx(", {a} dekarlık tarlanız için", { a: tx.alan(alan) }) : ''}{tx(". Alışverişi buna göre planlayabilirsiniz.")}
        {hoca && toprak && TOPRAK_TIPI[toprak] ? <>{' '}{tx("Dozlar toprak tipinize göre ayarlandı:")}{' '}<span className="font-semibold text-[#2a3d36]">{tx(TOPRAK_TIPI[toprak])}</span>.</> : null}
      </p>

      {besinler.length > 0 && (
        <>
          <h3 className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-[#6b7d72]">{tx("1 · Gübre olarak alınacak besinler")}</h3>
          <ul className="mt-3 divide-y divide-[#1d2a22]/8 overflow-hidden rounded-[22px] ring-1 ring-[#1d2a22]/10">
            {besinler.map((k) => {
              const a = besin[k];
              const kim = BESIN_KIMLIK[k];
              const t = tarla(a);
              const o = ORNEK_ORAN[k];
              const bilgi = besinBul(kim.sembol);
              const birimAlan = '/' + alanBirimi(tx.dil);
              return (
                <li key={k} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-1 px-4 py-3.5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-5">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#0d120f] sm:h-[72px] sm:w-[72px]">
                    {bilgi?.resim && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={bilgi.resim} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    )}
                    <span className="absolute inset-0 bg-black/35" />
                    <span className="absolute inset-0 flex items-center justify-center font-display text-2xl font-semibold text-white drop-shadow">{tx(kim.sembol)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-[#17352a]">{tx(k)}</p>
                    <p className="text-xs text-[#6b7d72]">
                      {t ? <>{tx(aralikYaz(tx.ha(a), 'kg'))}{birimAlan}</> : tx("saf besin")}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 sm:text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7d72]">{t ? tx("Tarlanız için toplam") : tx("Sezonda")}</p>
                    <p className="font-display text-3xl font-medium tabular-nums leading-tight" style={{ color: kim.renk }}>
                      {t ? tx(aralikYaz(t, 'kg')) : <>{tx(aralikYaz(tx.ha(a), 'kg'))}<span className="text-base">{birimAlan}</span></>}
                    </p>
                    {t && o && (
                      <p className="text-xs text-[#6b7d72]">
                        {tx(o.metin)} ≈ <span className="font-semibold text-[#2a3d36]">{tx(aralikYaz({ min: t.min / o.oran, max: t.max / o.oran }, 'kg'))}</span>
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {urunler.length > 0 && (
        <>
          <ul className="mt-3 divide-y divide-[#1d2a22]/8 overflow-hidden rounded-[22px] ring-1 ring-[#d7e8d3]">
            {urunler.map((u) => {
              const t = u.a ? tarla(u.a) : undefined;
              const kat = igsasUrunBul(u.ad);
              const rol = kat?.rol ?? HOCA_URUN_ROL[u.ad];
              const derisim = u.yaprakDoz ? derisimOku(u.yaprakDoz) : undefined;
              const miktar = u.a && u.birim ? (t ? tx(aralikYaz(t, u.birim)) : tx(aralikYaz(tx.ha(u.a), u.birim) + '/' + alanBirimi(tx.dil))) : undefined;
              const al = kat || hoca ? satinAlmaLinki(kat ?? { ad: u.ad }, { miktar, alan, bitki: zkart.bitki }) : undefined;
              return (
                <li key={u.ad} className="grid gap-3 bg-gradient-to-r from-[#f6fbf4] to-white px-4 py-4 sm:grid-cols-[auto_1.5fr_1fr_auto] sm:items-center sm:gap-5">
                  <div className="flex items-center gap-3 sm:contents">
                    {kat ? (
                      <UrunGorseli urun={kat} className="h-20 w-20 sm:h-24 sm:w-24" />
                    ) : null}
                    <div className="min-w-0">
                      <p className="font-semibold text-[#17352a]">{tx(u.ad)}</p>
                      {rol && <p className="text-xs leading-5 text-[#6b7d72]">{tx(rol)}</p>}
                    </div>
                  </div>
                  <div className="text-sm sm:text-right">
                    {t && u.birim ? (
                      <>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7d72]">{tx("Tarlanız için toplam")}</p>
                        <p className="font-display text-2xl font-medium tabular-nums leading-tight text-[#1f7a45]">{tx(aralikYaz(t, u.birim))}</p>
                        <p className="text-xs text-[#6b7d72]">{tx(aralikYaz(tx.ha(u.a!), u.birim) + '/' + alanBirimi(tx.dil))}</p>
                      </>
                    ) : u.a && u.birim ? (
                      <p className="font-bold tabular-nums text-[#1f7a45]">
                        {tx(aralikYaz(tx.ha(u.a), u.birim) + '/' + alanBirimi(tx.dil))}{' '}<span className="font-normal text-[#6b7d72]">{tx("sezonda")}</span>
                      </p>
                    ) : null}
                    {u.yaprak > 0 && (
                      <p className="text-[13px] text-[#2a3d36]">
                        <span className="font-bold">{u.yaprak}{' '}{tx("kez")}</span>{' '}{tx("yapraktan ·")}{' '}
                        {derisim ? tx("{s} L suya {m}", { s: derisim.su, m: derisim.miktar }) : tx.doz(u.yaprakDoz ?? '')}
                      </p>
                    )}
                    {u.onHazirlik && <p className="text-xs text-[#6b7d72]">{tx("sezon öncesi toprak düzeltmesi dahil")}</p>}
                    {u.tohum && <p className="text-[13px] text-[#2a3d36]">{tx("Tohuma:")}{' '}{tx(u.tohum)}</p>}
                  </div>
                  {(kat?.url || al) && (
                    <div className="flex gap-2 sm:flex-col sm:items-stretch">
                      {al && (
                        <a
                          href={al.href}
                          {...(al.dis ? { target: '_blank', rel: tx("noopener noreferrer") } : {})}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#1f7a45] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#186338]"
                        >
                          <ShoppingBag size={15} /> {tx(al.metin)}
                        </a>
                      )}
{kat?.url && (
                        <a
                          href={kat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex flex-1 items-center justify-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-[#1f6f4a] ring-1 ring-[#b9dfb5] transition hover:bg-[#eef8ec]"
                        >
                          
                          {tx("Ürün sayfası")}{' '}<ArrowUpRight size={14} />
                        </a>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      <p className="mt-5 text-xs leading-5 text-[#7a877e]">
        
        {tx("Yapraktan uygulamalarda miktar, kullandığınız ilaç suyuna göre hesaplanır. Dozlar Prof. Dr. Metin Turan’ın İGSAŞ dönem programından (Z-kart) gelir; ürün bilgileri İGSAŞ’a aittir.")}
      </p>
      {ek}
    </section>
  );
}
