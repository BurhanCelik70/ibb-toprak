'use client';
/**
 * Sulama suyu karnesi: sınıf (ABD Tuzluluk Lab. C–S), FAO 29'a göre sorunlar, RSC, bitkiye etkisi ve sulama yöntemi önerisi.
 * Tüm sınıflandırma lib/su.ts'te; yapay zeka (varsa) yalnızca sade özeti yazar.
 */
import { AlertTriangle, BookOpen, CheckCircle2, ChevronDown, Droplets, FlaskConical, Loader2, MapPin, RefreshCw, Sprout, XCircle } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { SULAMA_YONTEMLERI, type SulamaYontemi } from '@/lib/sulama';
import {
  C_SINIFLARI,
  SU_ALANLARI,
  SU_TON,
  S_SINIFLARI,
  YONTEM_AD,
  sSiniri,
  suDegerlendir,
  type Bulgu,
  type SuDegerlendirmesi,
  type SuRaporu,
  type Ton,
  type YontemUygunlugu,
} from '@/lib/su';
import type { SuYorumu } from '@/lib/veri';

export type SuTarla = { ad: string; bitki: string | null; sulama: SulamaYontemi; konum?: string | null };

const f = (n: number, d = 2) => n.toLocaleString('tr-TR', { maximumFractionDigits: d });

/* ───────── Su damlası ───────── */
const DAMLA_RENK: Record<Ton, [string, string]> = {
  iyi: ['#7fd3f7', '#1e88c7'],
  bilgi: ['#7fd3f7', '#1e88c7'],
  dikkat: ['#b9dccf', '#4f9a8a'],
  sorun: ['#d9cfa6', '#9a8a4f'],
};
function SuDamlasi({ ton, sinif, boyut = 190 }: { ton: Ton; sinif?: string; boyut?: number }) {
  const [a, b] = DAMLA_RENK[ton];
  return (
    <svg viewBox="0 0 200 260" width={boyut} height={(boyut * 260) / 200} role="img" aria-label={`Su sınıfı ${sinif ?? ''}`}>
      <defs>
        <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <clipPath id="dc">
          <path d="M100 8 C100 8 22 108 22 165 a78 78 0 0 0 156 0 C178 108 100 8 100 8Z" />
        </clipPath>
      </defs>
      <path d="M100 8 C100 8 22 108 22 165 a78 78 0 0 0 156 0 C178 108 100 8 100 8Z" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.55)" strokeWidth="3" />
      <g clipPath="url(#dc)">
        <g className="su-dalga">
          <path d="M-200 78 q25 -12 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 V300 H-200Z" fill="url(#dg)" opacity=".95" />
        </g>
        <g className="su-dalga2">
          <path d="M-200 88 q25 10 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 V300 H-200Z" fill={b} opacity=".35" />
        </g>
        {[
          [70, 200, 5],
          [128, 220, 4],
          [110, 175, 3],
          [80, 150, 3],
          [140, 160, 5],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="rgba(255,255,255,.55)" className="su-kabarcik" style={{ animationDelay: `${i * 0.7}s` }} />
        ))}
      </g>
      <path d="M74 72 C62 90 52 108 47 128" stroke="rgba(255,255,255,.55)" strokeWidth="6" strokeLinecap="round" fill="none" />
      {sinif && (
        <text x="100" y="192" textAnchor="middle" fontSize={sinif.length > 3 ? 40 : 46} fontWeight="800" fill="#fff" letterSpacing="1" style={{ fontFamily: 'var(--font-sans)', textShadow: '0 2px 8px rgba(0,0,0,.25)' }}>
          {sinif}
        </text>
      )}
      <style>{`
        .su-dalga{animation:dalga 6s linear infinite}
        .su-dalga2{animation:dalga 9s linear infinite reverse}
        .su-kabarcik{animation:kabarcik 4s ease-in infinite}
        @keyframes dalga{from{transform:translateX(0)}to{transform:translateX(100px)}}
        @keyframes kabarcik{0%{transform:translateY(0);opacity:0}20%{opacity:.8}100%{transform:translateY(-80px);opacity:0}}
        @media (prefers-reduced-motion: reduce){.su-dalga,.su-dalga2,.su-kabarcik{animation:none}}
      `}</style>
    </svg>
  );
}

/* ───────── ABD Tuzluluk Laboratuvarı diyagramı ───────── */
function CSDiyagrami({ ec, sar }: { ec?: number; sar?: number }) {
  const W = 520;
  const H = 340;
  const L = 52;
  const R = 16;
  const T = 16;
  const B = 44;
  const lx = (e: number) => L + ((Math.log10(e) - 2) / (Math.log10(5000) - 2)) * (W - L - R);
  const ly = (s: number) => T + (1 - s / 32) * (H - T - B);
  const cSinir = [100, 250, 750, 2250, 5000];
  const cRenk = ['#e6f4ea', '#eef6e0', '#fbf1dc', '#fbe6e1'];
  const egri = (i: number) =>
    Array.from({ length: 30 }, (_, k) => {
      const e = 10 ** (2 + (k / 29) * (Math.log10(5000) - 2));
      return `${k ? 'L' : 'M'}${lx(e).toFixed(1)} ${ly(Math.max(0, sSiniri(i, e))).toFixed(1)}`;
    }).join(' ');
  const nokta = ec !== undefined && sar !== undefined ? { x: lx(Math.min(5000, Math.max(100, ec))), y: ly(Math.min(32, Math.max(0, sar))) } : undefined;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="ABD Tuzluluk Laboratuvarı sulama suyu sınıflandırma diyagramı">
      {cRenk.map((r, i) => (
        <rect key={i} x={lx(cSinir[i])} y={T} width={lx(cSinir[i + 1]) - lx(cSinir[i])} height={H - T - B} fill={r} />
      ))}
      {[0, 1, 2].map((i) => (
        <path key={i} d={egri(i)} stroke="#7a877e" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />
      ))}
      {cSinir.slice(1, 4).map((e) => (
        <line key={e} x1={lx(e)} x2={lx(e)} y1={T} y2={H - B} stroke="#c9c1ad" />
      ))}
      <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="none" stroke="#b9b09a" />
      {['C1', 'C2', 'C3', 'C4'].map((c, i) => (
        <text key={c} x={(lx(cSinir[i]) + lx(cSinir[i + 1])) / 2} y={H - B - 8} textAnchor="middle" fontSize="12" fontWeight="700" fill="#5a4a2a">
          {c}
        </text>
      ))}
      {[
        ['S1', 6],
        ['S2', 13],
        ['S3', 21],
        ['S4', 29],
      ].map(([s, y]) => (
        <text key={s} x={lx(140)} y={ly(Number(y))} fontSize="12" fontWeight="700" fill="#3d6478">
          {s}
        </text>
      ))}
      {[100, 250, 750, 2250, 5000].map((e) => (
        <text key={e} x={lx(e)} y={H - B + 16} textAnchor="middle" fontSize="11" fill="#5b6f65">
          {e.toLocaleString('tr-TR')}
        </text>
      ))}
      <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#5b6f65">
        Tuzluluk (EC, µS/cm) →
      </text>
      {[0, 8, 16, 24, 32].map((s) => (
        <text key={s} x={L - 8} y={ly(s) + 4} textAnchor="end" fontSize="11" fill="#5b6f65">
          {s}
        </text>
      ))}
      <text transform={`translate(14 ${(T + H - B) / 2}) rotate(-90)`} textAnchor="middle" fontSize="11" fill="#5b6f65">
        Sodyum oranı (SAR) →
      </text>
      {nokta && (
        <g>
          <circle cx={nokta.x} cy={nokta.y} r="16" fill="#1e88c7" opacity=".18">
            <animate attributeName="r" values="10;20;10" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx={nokta.x} cy={nokta.y} r="7" fill="#1e88c7" stroke="#fff" strokeWidth="2.5" />
          <text x={nokta.x + 12} y={nokta.y - 10} fontSize="12" fontWeight="700" fill="#17352a">
            Suyunuz
          </text>
        </g>
      )}
    </svg>
  );
}

/* ───────── Küçük parçalar ───────── */
function TonRozet({ ton, metin }: { ton: Ton; metin: string }) {
  const t = SU_TON[ton];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: t.acik, color: t.yazi }}>
      <span className="h-2 w-2 rounded-full" style={{ background: t.renk }} />
      {metin}
    </span>
  );
}

function BulguKarti({ b }: { b: Bulgu }) {
  const t = SU_TON[b.ton];
  return (
    <div className="flex flex-col rounded-[22px] border bg-white p-5" style={{ borderColor: b.ton === 'iyi' || b.ton === 'bilgi' ? '#e3dccb' : t.renk + '66' }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-[#17352a]">{b.baslik}</p>
          <p className="mt-0.5 font-display text-xl text-[#24342b]">{b.deger}</p>
        </div>
        <TonRozet ton={b.ton} metin={b.durum} />
      </div>
      <p className="mt-3 text-sm leading-6 text-[#4f6158]">{b.aciklama}</p>
      {b.oneri && (
        <p className="mt-3 rounded-xl px-3 py-2 text-sm leading-6" style={{ background: t.acik, color: t.yazi }}>
          <span className="font-semibold">Ne yapmalı: </span>
          {b.oneri}
        </p>
      )}
      <p className="mt-auto pt-3 text-[11px] text-[#9aa39b]">Kaynak: {b.kaynak}</p>
    </div>
  );
}

const ETIKET_TON: Record<YontemUygunlugu['etiket'], { bg: string; fg: string; ikon: ReactNode }> = {
  Önerilir: { bg: '#238f61', fg: '#fff', ikon: <CheckCircle2 size={15} /> },
  Uygun: { bg: '#e6f4ea', fg: '#1f6b3f', ikon: <CheckCircle2 size={15} /> },
  'Dikkatli kullanın': { bg: '#fbf1dc', fg: '#7a5310', ikon: <AlertTriangle size={15} /> },
  Önerilmez: { bg: '#fbe6e1', fg: '#8f2f1f', ikon: <XCircle size={15} /> },
};

function YontemKarti({ y, mevcut, enIyi }: { y: YontemUygunlugu; mevcut: boolean; enIyi: boolean }) {
  const e = ETIKET_TON[y.etiket];
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[22px] border bg-white ${enIyi ? 'border-[#238f61] ring-2 ring-[#238f61]/25' : 'border-[#e3dccb]'}`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-[#e9e3d4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SULAMA_YONTEMLERI[y.yontem].gorsel} alt="" className={`h-full w-full object-cover ${y.etiket === 'Önerilmez' ? 'grayscale-[60%]' : ''}`} />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm" style={{ background: e.bg, color: e.fg }}>
          {e.ikon} {y.etiket}
        </span>
        {mevcut && <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">Şu an kullandığınız</span>}
      </div>
      <div className="flex-1 p-4">
        <p className="font-display text-lg font-medium text-[#17352a]">{YONTEM_AD[y.yontem]}</p>
        <ul className="mt-2 space-y-1.5">
          {y.nedenler.map((n) => (
            <li key={n} className="text-sm leading-5 text-[#4f6158]">
              {n}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Detay({ baslik, children }: { baslik: string; children: ReactNode }) {
  const [acik, setAcik] = useState(false);
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#e3dccb] bg-white">
      <button type="button" onClick={() => setAcik(!acik)} className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-[#17352a]">
        {baslik}
        <ChevronDown size={18} className={`transition ${acik ? 'rotate-180' : ''}`} />
      </button>
      {acik && <div className="border-t border-[#efe9dc] px-5 py-4">{children}</div>}
    </div>
  );
}

/* ───────── Ana bileşen ───────── */
export function SuKarnesi({
  rapor,
  tarla,
  tarih,
  yorum,
  yorumDurumu = 'idle',
  onYorumYenile,
  baslikUstu,
  eylemler,
}: {
  rapor: SuRaporu;
  tarla: SuTarla;
  tarih?: string;
  yorum?: SuYorumu | null;
  yorumDurumu?: 'idle' | 'loading' | 'error';
  onYorumYenile?: () => void;
  baslikUstu?: ReactNode;
  eylemler?: ReactNode;
}) {
  const v: SuDegerlendirmesi = suDegerlendir(rapor, { bitki: tarla.bitki, yontem: tarla.sulama });
  const d = rapor.degerler;
  const ozetKutulari = [
    { ad: 'Tuzluluk', deger: d.ec !== undefined ? `${f(d.ec, 0)}` : '—', birim: 'µS/cm', ton: v.bulgular.find((b) => b.id === 'tuz')?.ton ?? 'bilgi', alt: v.c?.ad },
    { ad: 'Sodyum oranı', deger: v.sar !== undefined ? f(v.sar, 1) : '—', birim: 'SAR', ton: v.s?.ton ?? 'bilgi', alt: v.s?.ad },
    { ad: 'Sodyum bikarbonat', deger: v.rsc !== undefined ? f(v.rsc, 2) : '—', birim: 'RSC me/l', ton: v.bulgular.find((b) => b.id === 'rsc')?.ton ?? 'bilgi', alt: v.bulgular.find((b) => b.id === 'rsc')?.durum },
    { ad: 'Bor', deger: d.b !== undefined ? f(d.b, 2) : '—', birim: 'mg/l', ton: v.bulgular.find((b) => b.id === 'bor')?.ton ?? 'bilgi', alt: v.bulgular.find((b) => b.id === 'bor')?.durum },
  ];
  const sirali = [...v.bulgular].sort((a, b) => ({ sorun: 0, dikkat: 1, bilgi: 2, iyi: 3 })[a.ton] - ({ sorun: 0, dikkat: 1, bilgi: 2, iyi: 3 })[b.ton]);
  const yontemSira: Record<YontemUygunlugu['etiket'], number> = { Önerilir: 0, Uygun: 1, 'Dikkatli kullanın': 2, Önerilmez: 3 };
  const yontemler = [...v.yontemler].sort((a, b) => yontemSira[a.etiket] - yontemSira[b.etiket]);
  const mevcutY = tarla.sulama === 'kuru' ? undefined : v.yontemler.find((y) => y.yontem === tarla.sulama);
  const yapilacaklar = yorum?.yapilacaklar?.length ? yorum.yapilacaklar : v.yapilacaklar;

  return (
    <div className="mx-auto max-w-5xl">
      {baslikUstu && <div className="mb-4">{baslikUstu}</div>}

      {/* Kapak */}
      <section className="relative overflow-hidden rounded-[32px] text-white" style={{ background: 'linear-gradient(135deg,#0b3a52 0%,#0f5a73 45%,#1b7f86 100%)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/su/kapak.webp" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-right" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(8,42,60,.96) 0%,rgba(10,52,72,.88) 38%,rgba(12,70,90,.55) 70%,rgba(12,70,90,.25) 100%)' }} aria-hidden />
        <div className="relative grid items-center gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-10">
          <div className="mx-auto">
            <SuDamlasi ton={v.genel.ton} sinif={v.sinif} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9fe3f2]">Sulama suyu karnesi</p>
            <h1 className="mt-2 font-display text-4xl font-medium leading-tight tracking-[-0.02em] sm:text-5xl">{v.genel.baslik}</h1>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-white/85">{v.genel.cumle}</p>
            {v.c && (
              <p className="mt-3 text-sm text-white/80">
                <span className="font-semibold text-white">{v.sinif}</span> = {v.c.ad.toLocaleLowerCase('tr-TR')}
                {v.s ? `, ${v.s.ad.toLocaleLowerCase('tr-TR')}` : ''} su
                {rapor.labSinif && rapor.labSinif.replace(/\s/g, '') !== v.sinif ? ` (laboratuvar: ${rapor.labSinif})` : ''}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
              {[tarla.ad, tarla.bitki, SULAMA_YONTEMLERI[tarla.sulama].ad, tarla.konum, rapor.kaynakAdi, tarih].filter(Boolean).map((x) => (
                <span key={x as string} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur">
                  {x}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-2 gap-px border-t border-white/15 bg-white/10 sm:grid-cols-4">
          {ozetKutulari.map((k) => (
            <div key={k.ad} className="bg-[#0b3a52]/40 px-5 py-4 backdrop-blur">
              <p className="text-xs text-white/70">{k.ad}</p>
              <p className="mt-1 font-display text-2xl">
                {k.deger} <span className="text-xs font-sans text-white/60">{k.birim}</span>
              </p>
              {k.alt && (
                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold" style={{ color: k.ton === 'iyi' || k.ton === 'bilgi' ? '#9be7b4' : k.ton === 'dikkat' ? '#ffd27a' : '#ffa48f' }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {k.alt}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Ne yapmalı */}
      <section className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <div className="rounded-[26px] border border-[#e3dccb] bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-2xl font-medium text-[#17352a]">
              <Sprout size={22} className="text-[#238f61]" /> Ne yapmalısınız?
            </h2>
            {onYorumYenile && yorumDurumu !== 'loading' && (
              <button type="button" onClick={onYorumYenile} className="inline-flex items-center gap-1 text-xs font-semibold text-[#476456] hover:text-[#17352a] print:hidden">
                <RefreshCw size={13} /> Yenile
              </button>
            )}
          </div>
          {yorumDurumu === 'loading' && !yorum && (
            <p className="mt-3 flex items-center gap-2 text-sm text-[#64766c]">
              <Loader2 size={16} className="animate-spin" /> Sonuçlarınız sade bir dille özetleniyor…
            </p>
          )}
          {yorum?.ozet && <p className="mt-3 text-[15px] leading-7 text-[#24342b]">{yorum.ozet}</p>}
          {yorumDurumu === 'error' && !yorum && <p className="mt-3 text-sm text-[#8f2f1f]">Özet şu anda hazırlanamadı; aşağıdaki adımlar analizinize göre hesaplandı.</p>}
          {yapilacaklar.length > 0 ? (
            <ol className="mt-4 space-y-3">
              {yapilacaklar.map((x, i) => (
                <li key={x} className="flex gap-3 text-[15px] leading-6 text-[#24342b]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#238f61] text-sm font-bold text-white">{i + 1}</span>
                  {x}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-[15px] leading-6 text-[#1f6b3f]">Suyunuz için özel bir önlem gerekmiyor. Sulamaya normal programınızla devam edin.</p>
          )}
          {yorum?.bitkiNotu && <p className="mt-4 rounded-xl bg-[#eef6ec] px-4 py-3 text-sm leading-6 text-[#24452f]">{yorum.bitkiNotu}</p>}
        </div>

        {/* Bitkiye etkisi */}
        <div className="flex flex-col rounded-[26px] border border-[#e3dccb] bg-white p-6">
          <h2 className="flex items-center gap-2 font-display text-2xl font-medium text-[#17352a]">
            <Droplets size={22} className="text-[#1e88c7]" /> Bitkinize etkisi
          </h2>
          {v.bitki && v.verim !== undefined ? (
            <>
              <p className="mt-2 text-sm text-[#5b6f65]">Bu tuzlulukta {v.bitki.replace(/\s*\(.*\)/, '').toLocaleLowerCase('tr-TR')} için beklenen verim (FAO 29, Tablo 4)</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="font-display text-6xl leading-none" style={{ color: v.verim >= 95 ? '#238f61' : v.verim >= 80 ? '#d99a1e' : '#d1513a' }}>
                  %{v.verim}
                </span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#efe9dc]">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${v.verim}%`, background: v.verim >= 95 ? '#2e9e5b' : v.verim >= 80 ? '#d99a1e' : '#d1513a' }} />
              </div>
              {v.yikama !== undefined && (d.ec ?? 0) >= 700 && (
                <p className="mt-4 text-sm leading-6 text-[#4f6158]">
                  Tuzu kök bölgesinden uzaklaştırmak için bitkinin ihtiyacından yaklaşık <b>%{Math.round(v.yikama * 100)}</b> fazla su verin (yıkama suyu).
                </p>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[#5b6f65]">
              {v.bitki ? 'Bu bitki için sayısal tuz toleransı tablosu yok; aşağıdaki bor ve tuz değerlendirmelerine bakın.' : 'Tarlanıza bitki eklerseniz suyun o bitkinin verimine etkisini de gösteririz.'}
            </p>
          )}
          {v.bitki && v.bulgular.find((b) => b.id === 'bor') && (
            <p className="mt-4 border-t border-[#efe9dc] pt-4 text-sm leading-6 text-[#4f6158]">{v.bulgular.find((b) => b.id === 'bor')!.aciklama}</p>
          )}
        </div>
      </section>

      {/* Sulama yöntemi */}
      <section className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7a877e]">Sulama yöntemi önerisi</p>
        <h2 className="mt-1 font-display text-3xl font-medium text-[#17352a]">
          Bu su için önerimiz: <span className="text-[#238f61]">{v.onerilen ? YONTEM_AD[v.onerilen] : '—'}</span>
        </h2>
        {yorum?.yontemNotu ? (
          <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#4f6158]">{yorum.yontemNotu}</p>
        ) : mevcutY ? (
          <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#4f6158]">
            Şu an {SULAMA_YONTEMLERI[tarla.sulama].ad.toLocaleLowerCase('tr-TR')} kullanıyorsunuz: bu su için <b>{mevcutY.etiket.toLocaleLowerCase('tr-TR')}</b>.
          </p>
        ) : null}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {yontemler.map((y) => (
            <YontemKarti key={y.yontem} y={y} mevcut={y.yontem === tarla.sulama} enIyi={y.yontem === v.onerilen} />
          ))}
        </div>
      </section>

      {/* Ayrıntılı değerlendirme */}
      <section className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7a877e]">FAO 29’a göre ayrıntılı değerlendirme</p>
        <h2 className="mt-1 font-display text-3xl font-medium text-[#17352a]">Suyunuz ne anlatıyor?</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {sirali.map((b) => (
            <BulguKarti key={b.id} b={b} />
          ))}
        </div>
      </section>

      {/* Diyagram */}
      <section className="mt-10 grid gap-5 rounded-[26px] border border-[#e3dccb] bg-white p-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="font-display text-2xl font-medium text-[#17352a]">Suyunuzun sınıf haritasındaki yeri</h2>
          <p className="mt-1 text-sm text-[#5b6f65]">ABD Tuzluluk Laboratuvarı (Richards, 1954) diyagramı. Türkiye’de laboratuvarların yazdığı “C3S1” gibi sınıflar buradan gelir.</p>
          <div className="mt-4">
            <CSDiyagrami ec={d.ec} sar={v.sar} />
          </div>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-bold text-[#17352a]">Tuzluluk sınıfları</p>
            <ul className="mt-2 space-y-1.5">
              {C_SINIFLARI.map((c, i) => (
                <li key={c.sinif} className={`flex gap-2 rounded-lg px-2 py-1 ${v.c?.sinif === c.sinif ? 'bg-[#e8f3f8] font-semibold' : ''}`}>
                  <span className="w-7 shrink-0 font-bold text-[#5a4a2a]">{c.sinif}</span>
                  <span className="text-[#4f6158]">
                    {i === 0 ? '0–250' : i === 1 ? '250–750' : i === 2 ? '750–2.250' : '>2.250'} µS/cm · {c.ad}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold text-[#17352a]">Sodyum sınıfları</p>
            <ul className="mt-2 space-y-1.5">
              {S_SINIFLARI.map((s) => (
                <li key={s.sinif} className={`flex gap-2 rounded-lg px-2 py-1 ${v.s?.sinif === s.sinif ? 'bg-[#e8f3f8] font-semibold' : ''}`}>
                  <span className="w-7 shrink-0 font-bold text-[#3d6478]">{s.sinif}</span>
                  <span className="text-[#4f6158]">
                    {s.ad} · {s.aciklama}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-[#7a877e]">Sodyum sınırları tuzlulukla birlikte değişir (diyagramdaki eğik çizgiler).</p>
          </div>
        </div>
      </section>

      {/* Detaylar */}
      <section className="mt-10 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7a877e]">Detaylar</h2>
        <Detay baslik="Laboratuvar değerleri">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[#7a877e]">
                <th className="py-2">Ölçüm</th>
                <th className="py-2 text-right">Değer</th>
                <th className="py-2 text-right">Diğer birim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ebe0]">
              {SU_ALANLARI.filter((a) => d[a.key] !== undefined).map((a) => {
                const x = d[a.key]!;
                const birinci = a.tip === 'ec' ? `${f(x, 0)} µS/cm` : a.tip === 'ph' ? f(x, 2) : a.tip === 'iyon' ? `${f(x)} me/l` : `${f(x)} mg/l`;
                const ikinci = a.tip === 'ec' ? `${f(x / 1000)} dS/m` : a.tip === 'iyon' && a.esdeger ? `${f(x * a.esdeger, 1)} mg/l` : '';
                return (
                  <tr key={a.key}>
                    <td className="py-2 text-[#24342b]">{a.ad}</td>
                    <td className="py-2 text-right font-semibold">{birinci}</td>
                    <td className="py-2 text-right text-[#7a877e]">{ikinci}</td>
                  </tr>
                );
              })}
              {v.sar !== undefined && (
                <tr>
                  <td className="py-2">SAR (hesaplanan)</td>
                  <td className="py-2 text-right font-semibold">{f(v.sar, 2)}</td>
                  <td className="py-2 text-right text-[#7a877e]">Na / √((Ca+Mg)/2)</td>
                </tr>
              )}
              {v.rsc !== undefined && (
                <tr>
                  <td className="py-2">RSC (hesaplanan)</td>
                  <td className="py-2 text-right font-semibold">{f(v.rsc, 2)} me/l</td>
                  <td className="py-2 text-right text-[#7a877e]">(CO₃+HCO₃) − (Ca+Mg)</td>
                </tr>
              )}
              {v.naYuzde !== undefined && (
                <tr>
                  <td className="py-2">Sodyum yüzdesi (Na%)</td>
                  <td className="py-2 text-right font-semibold">%{f(v.naYuzde, 1)}</td>
                  <td className="py-2 text-right text-[#7a877e]" />
                </tr>
              )}
            </tbody>
          </table>
        </Detay>
        <Detay baslik="Su analizi nasıl yaptırılır?">
          <SuAnaliziRehberi />
        </Detay>
        <Detay baslik="Kaynaklar">
          <ul className="space-y-2 text-sm text-[#4f6158]">
            <li className="flex gap-2">
              <BookOpen size={15} className="mt-1 shrink-0" /> Ayers, R.S. ve Westcot, D.W. (1985). Water Quality for Agriculture. FAO Sulama ve Drenaj Yayını 29 (Tablo 1, 4, 16).
            </li>
            <li className="flex gap-2">
              <BookOpen size={15} className="mt-1 shrink-0" /> Richards, L.A. (1954). Diagnosis and Improvement of Saline and Alkali Soils. USDA El Kitabı 60 (C–S diyagramı).
            </li>
            <li className="flex gap-2">
              <BookOpen size={15} className="mt-1 shrink-0" /> Eaton, F.M. (1950). Significance of carbonates in irrigation waters. Soil Science 69 (RSC).
            </li>
            <li className="flex gap-2">
              <BookOpen size={15} className="mt-1 shrink-0" /> Nakayama, F.S. ve Bucks, D.A. (1991). Water quality in drip/trickle irrigation (damlatıcı tıkanma riski).
            </li>
          </ul>
        </Detay>
      </section>

      {eylemler && <div className="mt-10 flex flex-col gap-3 sm:flex-row print:hidden">{eylemler}</div>}
    </div>
  );
}

/** Su analizi yaptırma rehberi (rapor ve ekleme ekranında kullanılır) */
export function SuAnaliziRehberi() {
  return (
    <div className="grid gap-4 text-sm leading-6 text-[#4f6158] md:grid-cols-3">
      <div>
        <p className="flex items-center gap-2 font-bold text-[#17352a]">
          <FlaskConical size={16} className="text-[#1e88c7]" /> Nerede?
        </p>
        <p className="mt-1">Toprak analizini yapan laboratuvarlar (Tarım ve Orman Bakanlığı araştırma enstitüleri, il ve ilçe laboratuvarları, ziraat fakülteleri, özel laboratuvarlar) su da analiz eder. “Standart sulama suyu analizi” isteyin.</p>
      </div>
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/su/numune.webp" alt="Kuyu başında su örneği şişesi" loading="lazy" className="mb-3 aspect-[16/9] w-full rounded-xl object-cover" />
        <p className="flex items-center gap-2 font-bold text-[#17352a]">
          <Droplets size={16} className="text-[#1e88c7]" /> Örnek nasıl alınır?
        </p>
        <ol className="mt-1 list-decimal space-y-1 pl-4">
          <li>Temiz bir pet şişe alın, aynı suyla 4–5 kez çalkalayın.</li>
          <li>Kuyudan alıyorsanız pompayı 15–20 dakika çalıştırın; kanal ya da dereden kıyıdan değil, akışın ortasından alın.</li>
          <li>1,5–2 litre doldurun, etiketleyin, aynı gün ya da ertesi gün götürün.</li>
          <li>Örneği sulama mevsiminde alın; su kalitesi mevsime göre değişir.</li>
        </ol>
      </div>
      <div>
        <p className="flex items-center gap-2 font-bold text-[#17352a]">
          <MapPin size={16} className="text-[#1e88c7]" /> Ne tutar, neler ölçülür?
        </p>
        <p className="mt-1">
          Bakanlık enstitülerinde 2026 fiyatıyla yaklaşık 2.000–2.500 TL. Paket genelde 11 ölçüm içerir: pH, EC, kalsiyum, magnezyum, sodyum, potasyum, bor, karbonat, bikarbonat, klorür, sülfat. SAR ve RSC’yi
          bu değerlerden biz hesaplarız.
        </p>
      </div>
    </div>
  );
}
