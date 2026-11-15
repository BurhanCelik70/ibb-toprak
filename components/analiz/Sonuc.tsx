'use client';
/**
 * Analiz sonucu: kalite indeksi, analiz tablosu, çözüm planı, karşılaştırma ve sulama reçetesi.
 */
import { useTx } from '@/components/DilSaglayici';
import { DILLER, modullerAcik, type Dil } from '@/lib/dil';
import { aralikMetni, birimGoster, degerGoster, etiketGoster, farkMetni } from '@/lib/birimler';
import { ArrowDownRight, ArrowUpRight, CalendarDays, CirclePlay, ClipboardList, Droplets, FlaskConical, Gauge, Minus, ShieldCheck, Sprout } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { evreGorseli } from '@/lib/bitkiGorsel';
import { zkartBul } from '@/lib/bitki';
import { ORGANIK_MADDE_PROTOKOLU, urunBilgisi } from '@/lib/igsas';
import { SezonToplami, UrunRozeti, YorumBolumu } from './RaporParcalari';
import { SuSutunu } from './SuSutunu';
import { AtlasKarti } from './AtlasKarti';
import { atlasAdresi, atlasToprak } from '@/lib/atlas';
import { almanMi } from '@/lib/almanya';
import { dunyaIli, ilGoster, takvimAyi } from '@/lib/dunya';
import { SINIFLAR, kaliteIndeksi, type IndeksSonucu } from '@/lib/indeks';
import { tahilMi } from '@/lib/tahilSulama';
import { suIhtiyaci } from '@/lib/suIhtiyaci';
import { TahilSuPlani } from './TahilSuPlani';
import { ParKarti } from '@/components/ParKarti';
import { bolunmusMu, onerilenAralik, sezonTakvimi, sezonTanimi } from '@/lib/sulamaTakvimi';
import { karsilastir, ozetle } from '@/lib/karsilastir';
import {
  KURALLAR,
  SULAMA_YONTEMLERI,
  evreUygulamalari,
  pencereHizi,
  pivotEnjeksiyon,
  simdikiEvreler,
  toplamMiktar,
  zamanCizelgesi,
  type SulamaYontemi,
} from '@/lib/sulama';
import {
  GROUP_LABELS,
  PARAMS,
  classify,
  formatNumber,
  uygunFark,
  type ParamGroup,
  type ParamKey,
  type ParamResult,
  type SoilReport,
  type Tone,
} from '@/lib/toprak';
import type { CozumPlani, UrunOnerisi } from '@/lib/veri';
import { VIDEOLAR, youtubeId } from '@/lib/videolar';
import { RaporNoksanliklari } from '@/components/noksanlik/RaporNoksanlik';

export type SonucTarla = {
  ad: string;
  bitki: string | null;
  sulama: SulamaYontemi;
  alan_dekar: number | null;
  sulama_suresi_saat: number | null;
  konum?: string | null;
  il?: string | null;
  ilce?: string | null;
};

export const TONE_STYLE: Record<Tone, { dot: string; text: string; bar: string; label: string }> = {
  iyi: { dot: 'bg-[#2e9e5b]', text: 'text-[#1f7a45]', bar: 'bg-[#2e9e5b]', label: 'Uygun' },
  dikkat: { dot: 'bg-[#d99a00]', text: 'text-[#8a5a00]', bar: 'bg-[#d99a00]', label: 'Dikkat' },
  sorun: { dot: 'bg-[#cf4a35]', text: 'text-[#a83422]', bar: 'bg-[#cf4a35]', label: 'İyileştirilmeli' },
  bilgi: { dot: 'bg-[#5b8aa3]', text: 'text-[#3d6478]', bar: 'bg-[#5b8aa3]', label: 'Bilgi' },
};

const GROUP_ORDER: ParamGroup[] = ['temel', 'besin', 'mikro', 'yapi'];

/** Değerin uygun aralığa göre konumunu gösteren ince çubuk. */
function RangeBar({ k, value, tone }: { k: ParamKey; value: number; tone: Tone }) {
  const r = PARAMS[k].uygun;
  if (!r) return null;
  const lo = k === 'ph' ? 3 : 0;
  const ref = r.max ?? (r.min ?? 1) * 2;
  const hi = k === 'ph' ? 10 : Math.max(value, ref) * 1.25;
  const pct = (x: number) => Math.min(100, Math.max(0, ((x - lo) / (hi - lo)) * 100));
  const from = pct(r.min ?? lo);
  const to = pct(r.max ?? hi);
  return (
    <div className="relative mt-2 h-1.5 w-full max-w-[140px] rounded-full bg-[#e7ece8]" aria-hidden>
      <div className="absolute inset-y-0 rounded-full bg-[#bfe3c4]" style={{ left: `${from}%`, width: `${to - from}%` }} />
      <div
        className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${TONE_STYLE[tone].bar}`}
        style={{ left: `${pct(value)}%` }}
      />
    </div>
  );
}

function StatusCell({ tone, label, fark, lab }: { tone: Tone; label: string; fark?: string; lab?: boolean }) {
  const tx = useTx();
  const s = TONE_STYLE[tone];
  return (
    <div>
      <div className={`flex items-center gap-2 font-semibold ${s.text}`}>
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
        {tx(label)}
      </div>
      {fark && <div className="mt-0.5 text-xs text-[#51675d]">{tx(fark)}</div>}
      {lab && <div className="mt-0.5 hidden text-[11px] text-[#8a978f] sm:block">{tx("Laboratuvar değerlendirmesi")}</div>}
    </div>
  );
}

function AnalysisTable({ report, results }: { report: SoilReport; results: ParamResult[] }) {
  const tx = useTx();
  const byGroup = GROUP_ORDER.map((g) => ({ g, rows: results.filter((r) => PARAMS[r.key].group === g) })).filter(
    (x) => x.rows.length > 0,
  );
  const ek = report.ekDegerler ?? [];

  const groupHeader = (title: string) => (
    <tr className="bg-[#f3f7f2]">
      <th colSpan={4} scope="colgroup" className="px-3 py-2 sm:px-4 text-left text-xs font-bold text-[#476456]">
        {tx(title)}
      </th>
    </tr>
  );

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#dfe9df] bg-white">
      <table className="w-full border-collapse text-[13px] sm:text-sm">
        <thead>
          <tr className="border-b border-[#dfe9df] text-left text-xs text-[#6b7d72]">
            <th scope="col" className="px-3 py-3 sm:px-4 font-semibold">{tx("Parametre")}</th>
            <th scope="col" className="px-3 py-3 sm:px-4 font-semibold">{tx("Sonuç")}</th>
            <th scope="col" className="hidden px-3 py-3 sm:px-4 font-semibold sm:table-cell">{tx("Uygun aralık")}</th>
            <th scope="col" className="px-3 py-3 sm:px-4 font-semibold">{tx("Durum ve fark")}</th>
          </tr>
        </thead>
        {byGroup.map(({ g, rows }) => (
          <tbody key={g} className="divide-y divide-[#edf2ee]">
            {groupHeader(GROUP_LABELS[g])}
            {g === 'yapi' && report.bunyeSinifi && (
              <tr>
                <th scope="row" className="px-3 py-3 sm:px-4 text-left font-semibold">{tx("Bünye sınıfı")}</th>
                <td className="px-3 py-3 sm:px-4 font-bold">{tx(report.bunyeSinifi)}</td>
                <td className="hidden px-3 py-3 sm:px-4 text-[#8a978f] sm:table-cell">—</td>
                <td className="px-3 py-3 sm:px-4">
                  <StatusCell tone="bilgi" label={tx("Bilgi")} lab={!!report.labDegerlendirme.bunye} />
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const def = PARAMS[r.key];
              const c = r.classification!;
              const fark = uygunFark(r.key, r.value);
              const isTexture = r.key === 'kum' || r.key === 'silt' || r.key === 'kil';
              return (
                <tr key={r.key} className="align-top">
                  <th scope="row" className="px-3 py-3 sm:px-4 text-left font-semibold">
                    {tx(etiketGoster(r.key, tx.dil))}
                    {birimGoster(r.key, tx.dil) && <span className="block text-xs font-normal text-[#8a978f]">{tx(birimGoster(r.key, tx.dil))}</span>}
                  </th>
                  <td className="px-3 py-3 sm:px-4">
                    <span className="text-base font-bold tabular-nums">{tx(formatNumber(degerGoster(r.key, r.value, tx.dil), 4))}</span>
                    <RangeBar k={r.key} value={r.value} tone={c.tone} />
                    {def.uygun && (
                      <span className="mt-1 block text-xs text-[#8a978f] sm:hidden">{tx("Uygun:")}{' '}{tx(aralikMetni(r.key, tx.dil))}</span>
                    )}
                  </td>
                  <td className="hidden px-3 py-3 sm:px-4 tabular-nums text-[#51675d] sm:table-cell">{tx(aralikMetni(r.key, tx.dil))}</td>
                  <td className="px-3 py-3 sm:px-4">
                    {isTexture ? (
                      <StatusCell tone="bilgi" label={tx("Bilgi")} />
                    ) : (
                      <StatusCell
                        tone={c.tone}
                        label={tx(c.label)}
                        fark={fark.durum === 'eksik' || fark.durum === 'fazla' ? tx(farkMetni(r.key, r.value, tx.dil)) : undefined}
                        lab={r.source === 'laboratuvar'}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        ))}
        {ek.length > 0 && (
          <tbody className="divide-y divide-[#edf2ee]">
            {groupHeader(tx("Diğer ölçümler"))}
            {ek.map((e, i) => (
              <tr key={`ek-${i}`} className="align-top">
                <th scope="row" className="px-3 py-3 sm:px-4 text-left font-semibold">
                  {tx(e.ad)}
                  {e.birim && <span className="block text-xs font-normal text-[#8a978f]">{tx(e.birim)}</span>}
                </th>
                <td className="px-3 py-3 sm:px-4 text-base font-bold tabular-nums">{tx(formatNumber(e.deger, 4))}</td>
                <td className="hidden px-3 py-3 sm:px-4 text-[#8a978f] sm:table-cell">—</td>
                <td className="px-3 py-3 sm:px-4">
                  <StatusCell tone="bilgi" label={tx(e.labDegerlendirme) || tx("Bilgi")} lab={!!e.labDegerlendirme} />
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}

const PUAN_RENK = ['#c9412b', '#c9412b', '#e07b28', '#d4a017', '#5aa832', '#1f8a4c'];

/** 0–5 puanı 5 parçalı çubukla gösterir. */
function PuanCubugu({ puan }: { puan: number }) {
  return (
    <div className="flex gap-1" aria-label={`${puan} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-2 w-5 rounded-full sm:w-6"
          style={{ background: i <= puan ? PUAN_RENK[puan] : '#e4ebe5' }}
        />
      ))}
    </div>
  );
}

/** Yarım daire gösterge (0–100). */
export function IndeksGostergesi({ yuzde, renk, koyu = false }: { yuzde: number; renk: string; koyu?: boolean }) {
  const tx = useTx();
  const r = 80;
  const c = Math.PI * r;
  return (
    <svg viewBox="0 0 200 116" className="w-full max-w-[240px]" role="img" aria-label={tx("Kalite indeksi {a} / 100", { a: yuzde })}>
      <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke={koyu ? 'rgba(255,255,255,.18)' : '#e4ebe5'} strokeWidth="16" strokeLinecap="round" />
      <path
        d="M20 100 A80 80 0 0 1 180 100"
        fill="none"
        stroke={renk}
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray={`${(c * yuzde) / 100} ${c}`}
      />
      <text x="100" y="88" textAnchor="middle" fontSize="40" fontWeight="800" fill={koyu ? '#ffffff' : '#17352a'}>
        {yuzde}
      </text>
      <text x="100" y="108" textAnchor="middle" fontSize="12" fill={koyu ? 'rgba(255,255,255,.6)' : '#6b7d72'}>
        / 100
      </text>
    </svg>
  );
}

export function KaliteIndeksi({ indeks, sade = false }: { indeks: IndeksSonucu; sade?: boolean }) {
  const tx = useTx();
  const sirali = [...indeks.satirlar].sort((a, b) => a.puan - b.puan);
  if (sade)
    return (
      <section className="mt-4 rounded-[24px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-6" aria-labelledby={tx("tki")}>
        <h3 id="tki" className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#6d786f]">
          <Gauge size={16} className="text-[#2f7a4f]" />{' '}{tx("Kalite indeksi neye göre hesaplandı?")}
        </h3>
        <p className="mt-1 text-xs text-[#8a968d]">
          {indeks.satirlar.length}{' '}{tx("parametrenin 0–5 puan ortalaması:")}{' '}{tx(formatNumber(indeks.ortalama, 1))} / 5 → {indeks.yuzde} / 100
        </p>
        <ul className="mt-3 grid gap-x-10 md:grid-cols-2">
          {sirali.map((x) => (
            <li key={x.key} className="flex items-center justify-between gap-3 border-b border-[#1d2a22]/6 py-2.5">
              <span className="min-w-0 text-sm">
                <span className="font-semibold">{tx(x.ad)}</span>
                <span className="ml-2 tabular-nums text-xs text-[#8a968d]">
                  {tx(formatNumber(x.deger, 3))} {tx(x.birim)}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <PuanCubugu puan={x.puan} />
                <span className="w-8 text-right text-sm font-bold tabular-nums" style={{ color: PUAN_RENK[x.puan] }}>
                  {x.puan}/5
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    );
  return (
    <section className="mt-8 overflow-hidden rounded-[28px] border border-[#dfe9df] bg-white" aria-labelledby={tx("tki")}>
      <div className="grid gap-6 p-5 sm:p-8 md:grid-cols-[260px_1fr] md:gap-10">
        <div className="flex flex-col items-center justify-center text-center">
          <h2 id="tki" className="flex items-center gap-2 text-lg font-bold">
            <Gauge size={20} className="text-[#238f61]" />
            
            {tx("Toprak Kalite İndeksi")}
          </h2>
          <div className="mt-3 w-full">
            <IndeksGostergesi yuzde={indeks.yuzde} renk={indeks.renk} />
          </div>
          <div className="mt-1 rounded-full px-4 py-1 text-sm font-bold text-white" style={{ background: indeks.renk }}>
            {tx(indeks.sinif)}
          </div>
          <p className="mt-3 text-xs leading-5 text-[#75867a]">
            {indeks.satirlar.length}{' '}{tx("parametrenin 0–5 puan ortalaması (")}{tx(formatNumber(indeks.ortalama, 1))} / 5)
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#51675d]">{tx("Parametre puanları")}</h3>
          <ul className="mt-3 divide-y divide-[#edf2ee]">
            {sirali.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0 text-sm">
                  <span className="font-semibold">{tx(s.ad)}</span>
                  <span className="ml-2 tabular-nums text-xs text-[#8a978f]">
                    {tx(formatNumber(s.deger, 3))} {tx(s.birim)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <PuanCubugu puan={s.puan} />
                  <span className="w-8 text-right text-sm font-bold tabular-nums" style={{ color: PUAN_RENK[s.puan] }}>
                    {s.puan}/5
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function UrunKarti({ u }: { u: UrunOnerisi }) {
  const tx = useTx();
  return (
    <li className="rounded-2xl border border-[#e1ebdf] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="flex flex-wrap items-center gap-2 font-bold tracking-tight text-[#17352a]">
          <UrunRozeti ad={u.urun} />
          {tx(u.urun)}
        </span>
        <span className="rounded-full bg-[#edf7ed] px-2.5 py-1 text-xs font-bold text-[#1f7a45]">{tx.doz(u.doz)}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-[#4b5f55]">{tx(u.aciklama)}</p>
    </li>
  );
}

function UrunBolumu({ icon, title, items }: { icon: ReactNode; title: string; items: UrunOnerisi[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="flex items-center gap-2 font-bold">
        <span className="text-[#238f61]">{icon}</span>
        {title}
      </h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((u, i) => (
          <UrunKarti key={i} u={u} />
        ))}
      </ul>
    </div>
  );
}

/** Açılır-kapanır detay kutusu (varsayılan kapalı) */
function Detay({ baslik, alt, children }: { baslik: string; alt?: string; children: ReactNode }) {
  const tx = useTx();
  return (
    <details className="group rounded-2xl bg-white ring-1 ring-[#1d2a22]/8 open:pb-4 print:open">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block font-semibold text-[#17352a]">{tx(baslik)}</span>
          {alt && <span className="block text-xs text-[#7a877e]">{tx(alt)}</span>}
        </span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f1efe8] text-[#476456] transition group-open:rotate-45">+</span>
      </summary>
      <div className="px-3 sm:px-5">{children}</div>
    </details>
  );
}

export function SolutionPlan({
  report,
  ai,
  aiState,
  onRetryAi,
  omDusuk,
}: {
  report: SoilReport;
  ai: CozumPlani | null;
  aiState: 'idle' | 'loading' | 'error';
  onRetryAi: () => void;
  omDusuk: boolean;
}) {
  const tx = useTx();
  // Özet ve "önce bunları yapın" listesi artık OncelikliIsler bileşeninde; burada yalnızca ürün grupları var.
  void report;
  void onRetryAi;
  if (!ai && !(omDusuk && aiState !== 'loading')) return null;
  return (
    <section className="mt-10 rounded-[28px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-8" aria-labelledby={tx("cozum")}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">{tx("Sezon boyunca")}</p>
      <h2 id="cozum" className="mt-2 flex items-center gap-2 font-display text-3xl font-medium tracking-[-0.01em] sm:text-4xl">
        <ClipboardList size={26} className="text-[#2f7a4f]" />
        
        {tx("Ürün önerileri")}
      </h2>

      {!ai && omDusuk && <OrganikMaddeProtokolu />}

      {ai && (
        <div className="mt-5 space-y-9">
          {omDusuk && <OrganikMaddeProtokolu />}
          <UrunBolumu icon={<Sprout size={20} />} title={tx("Kök gelişimi ve toprak canlılığı")} items={ai.kokGelisimi} />
          <UrunBolumu icon={<ShieldCheck size={20} />} title={tx("İklim stresine karşı koruma (don, sıcak, kuraklık)")} items={ai.iklimKoruma} />
          <UrunBolumu icon={<FlaskConical size={20} />} title={tx("Toprağınıza göre gübreleme")} items={ai.gubreleme} />
          {ai.sulamaNotlari && ai.sulamaNotlari.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-bold">
                <Droplets size={20} className="text-[#2f7f9a]" />{' '}{tx("Sulama yönteminize göre")}
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#3e5248]">
                {ai.sulamaNotlari.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f7f9a]" />
                    {tx(t)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** Organik madde düşükse sabit protokol (yapay zekadan bağımsız, her zaman doğru doz). */
function OrganikMaddeProtokolu() {
  const tx = useTx();
  return (
    <div className="mt-5 rounded-[24px] border border-[#e6dcc4] bg-[#fdf9ef] p-5 sm:p-6">
      <h3 className="font-bold text-[#5c4410]">{tx("Organik madde düşük: uygulama protokolü")}</h3>
      <ul className="mt-3 divide-y divide-[#efe5cd] text-sm">
        {ORGANIK_MADDE_PROTOKOLU.map((p) => (
          <li key={p.urun} className="grid gap-1 py-2.5 sm:grid-cols-[1.3fr_0.8fr_1.5fr] sm:items-baseline sm:gap-4">
            <span className="font-bold text-[#3f300b]">{tx(p.urun)}</span>
            <span className="font-semibold tabular-nums text-[#1f7a45]">{tx.doz(p.doz)}</span>
            <span className="text-[#5b4a22]">{tx(p.uygulama)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Videolar({ bitki }: { bitki?: string }) {
  const tx = useTx();
  const list = VIDEOLAR.filter((v) => !v.bitki || v.bitki === bitki);
  if (!list.length) return null;
  return (
    <section className="mt-10 print:hidden" aria-labelledby={tx("video")}>
      <h2 id="video" className="flex items-center gap-2 text-xl font-bold">
        <CirclePlay size={22} className="text-[#238f61]" />
        
        {tx("Uygulama videoları")}
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {list.map((v) => {
          const id = youtubeId(v.url);
          return (
            <figure key={v.url} className="overflow-hidden rounded-[22px] border border-[#dfe9df] bg-white">
              {id ? (
                <iframe
                  className="aspect-video w-full"
                  src={`https://www.youtube-nocookie.com/embed/${id}`}
                  title={tx(v.baslik)}
                  loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : null}
              <figcaption className="px-4 py-3 text-sm font-semibold">{tx(v.baslik)}</figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Sulama yöntemine göre uygulama reçetesi                                     */
/* -------------------------------------------------------------------------- */

const DILIM_RENK = { su: '#bfdbe8', gubre: '#2f8f57', temiz: '#dbeef5' } as const;

const BASLANGIC_SAATLERI = ['05:00', '06:00', '07:00', '17:00', '18:00', '19:00'];

/** "06:00" + dakika → "07:30" (gece yarısını geçerse "+1" günü göstermeden saat döner) */
function saatEkle(bas: string, dakika: number) {
  const [h, m] = bas.split(':').map(Number);
  const t = (((h * 60 + m + Math.round(dakika)) % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}
const dkOku = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

/** Küçük analog saat: pencerenin kadrandaki yayı + başlangıç saatini gösteren ibreler */
function SaatKadrani({ bas, bit, renk }: { bas: string; bit: string; renk: string }) {
  const c = 32, r = 26;
  const aci = (t: string) => ((dkOku(t) % 720) / 720) * 360; // 12 saatlik kadran
  const nokta = (deg: number, rr: number) => [c + rr * Math.sin((deg * Math.PI) / 180), c - rr * Math.cos((deg * Math.PI) / 180)];
  const sure = (((dkOku(bit) - dkOku(bas)) % 1440) + 1440) % 1440;
  const a1 = aci(bas);
  const a2 = a1 + Math.min(359.9, (sure / 720) * 360);
  const [x1, y1] = nokta(a1, r - 4);
  const [x2, y2] = nokta(a2, r - 4);
  const buyuk = a2 - a1 > 180 ? 1 : 0;
  const [hx, hy] = nokta(a1, 12);
  const [mx, my] = nokta(((dkOku(bas) % 60) / 60) * 360, 19);
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0" aria-hidden>
      <circle cx={c} cy={c} r={r + 3} fill="#fff" stroke="#d9e4dc" strokeWidth="1.5" />
      <path d={`M${c} ${c} L${x1} ${y1} A${r - 4} ${r - 4} 0 ${buyuk} 1 ${x2} ${y2} Z`} fill={renk} opacity="0.85" />
      {Array.from({ length: 12 }, (_, i) => {
        const [ax, ay] = nokta(i * 30, r);
        const [bx, by] = nokta(i * 30, r - (i % 3 === 0 ? 4 : 2));
        return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke="#9aa89f" strokeWidth={i % 3 === 0 ? 1.6 : 1} />;
      })}
      <line x1={c} y1={c} x2={hx} y2={hy} stroke="#17352a" strokeWidth="2.6" strokeLinecap="round" />
      <line x1={c} y1={c} x2={mx} y2={my} stroke="#17352a" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx={c} cy={c} r="2.2" fill="#17352a" />
    </svg>
  );
}

type ProgramUrunu = { urun: string; doz: string; grup: string };
type ProgramAdimi = {
  bas?: string;
  bit?: string;
  zamanNotu?: string;
  tur: 'su' | 'gubre' | 'temiz';
  baslik: string;
  aciklama: string;
  liste?: ProgramUrunu[];
  pencereSaat?: number;
  bosMesaj?: string;
};

function ProgramUrunKarti({ u, alan, pencereSaat, pivotSure }: { u: ProgramUrunu; alan?: number | null; pencereSaat?: number; pivotSure?: number }) {
  const tx = useTx();
  const { besin, rol } = urunBilgisi(u.urun);
  const top = toplamMiktar(u.doz, alan);
  // Saf besin miktarı gübre miktarı değildir; enjeksiyon hızı yalnızca ürünler için hesaplanır.
  const hiz = besin ? undefined : pivotSure ? pivotEnjeksiyon(u.doz, alan, pivotSure) : pencereSaat ? pencereHizi(u.doz, alan, pencereSaat) : undefined;
  return (
    <li className="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-[#1d2a22]/8">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <UrunRozeti ad={u.urun} />
        <span className="font-semibold text-[#17352a]">{tx(u.urun)}</span>
        <span className="font-bold text-[#1f7a45]">{tx.doz(u.doz)}</span>
      </div>
      {rol && <p className="mt-0.5 text-xs text-[#6b7d72]">{tx(rol)}</p>}
      {(top || hiz) && (
        <p className="mt-1 text-xs font-medium text-[#3e5248]">
          {top && <>{tx("Tarlanız için")}{' '}<span className="font-semibold">{tx(top)}{besin ? tx(" saf besin") : ''}</span></>}
          {top && hiz ? ' · ' : ''}
          {hiz && <>{tx("enjeksiyon")}{' '}<span className="font-semibold">{tx(hiz)}</span></>}
        </p>
      )}
    </li>
  );
}

const AY_ADLARI = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
/** Ay adı: Almancada tarayıcının ay adları kullanılır (sözlükte "Ekim" ekim/aussaat anlamına da gelir) */
const ayAdi = (i: number, dil: string) => (dil !== 'tr' && dil in DILLER ? new Date(2000, i, 1).toLocaleDateString(DILLER[dil as Dil].locale, { month: 'long' }) : AY_ADLARI[i]);
const tarihUzun = (d: Date, tx?: { dil: string }) => `${d.getDate()}${tx?.dil === 'de' ? '.' : ''} ${ayAdi(d.getMonth(), tx?.dil ?? 'tr')}`;

/** Sezon boyu sulama takvimi: kaçıncı su, yaklaşık tarih, gübreli/boş ve gübreli sularda ne verileceği */
function SezonTakvimiKarti({ yontem, zkart, alan, il }: { yontem: SulamaYontemi; zkart?: ReturnType<typeof zkartBul>; alan?: number | null; il?: string | null }) {
  const tx = useTx();
  const tanim = sezonTanimi(zkart?.bitki);
  const { gun: varsayilan, bolge } = onerilenAralik(zkart?.bitki, yontem, il);
  const [aralikGun, setAralikGun] = useState(varsayilan);
  if (!zkart || yontem === 'kuru') return null;
  const fertigasyon = (g: string) => g === 'Damla sulama' || g === 'Yağmurlama';
  const suylaMi = yontem !== 'salma';
  const evreUrunleri = (ei: number) =>
    evreUygulamalari(zkart.evreler[ei], yontem)
      .filter((g) => (suylaMi ? fertigasyon(g.yontem) : g.yontem !== 'Yapraktan'))
      .flatMap((g) => g.urunler);
  const tk = sezonTakvimi(
    zkart,
    yontem,
    (ei) => evreUrunleri(ei).length > 0,
    (ei) => evreUrunleri(ei).some((u) => bolunmusMu(u.doz)),
    undefined,
    aralikGun,
    bolge,
  );
  if (!tk) return null;

  if (tk.goller)
    return (
      <div className="rounded-[24px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f7f9a]">{tx("Sezon boyu sulama")}</p>
        <h4 className="mt-1 font-display text-2xl font-medium">{tx("Sürekli göllendirme")}</h4>
        <p className="mt-2 text-sm leading-6 text-[#4b5f55]">{tx(tk.not)}</p>
      </div>
    );

  const toplam = tk.sular.length;
  const gubreli = tk.sular.filter((x) => x.gubreli).length;
  const kritik = !!tanim?.kritikEvreler && yontem !== 'damla';
  void alan;

  // Zaman şeridi: dönem başları (dönem adındaki ilk aydan) ve suların tarihleri aynı eksende
  const yil = tk.sular[0]?.tarih.getFullYear() ?? new Date().getFullYear();
  const ilkAyi = (donem: string) => {
    const k = donem.toLocaleLowerCase('tr-TR');
    const i = AY_ADLARI.findIndex((a) => k.includes(a.toLocaleLowerCase('tr-TR')));
    return i < 0 ? undefined : i;
  };
  const aylar0 = zkart.evreler.map((e) => ilkAyi(e.donem));
  const ilkAy = aylar0.find((a) => a !== undefined) ?? tk.sular[0]?.tarih.getMonth() ?? 3;
  const evreBas = aylar0.map((a) => (a === undefined ? undefined : new Date(yil, a < ilkAy ? a + 12 : a, 1)));
  const bas = evreBas.find(Boolean) ?? tk.sular[0]?.tarih ?? new Date(yil, ilkAy, 1);
  const sonSu = tk.sular[tk.sular.length - 1]?.tarih;
  const sonEvre = [...evreBas].reverse().find(Boolean);
  const bitAday = new Date(Math.max(sonSu ? sonSu.getTime() + 10 * 864e5 : 0, sonEvre ? new Date(sonEvre.getFullYear(), sonEvre.getMonth() + 1, 1).getTime() : 0));
  const bit = new Date(bitAday.getFullYear(), bitAday.getMonth() + 1, 1);
  const yuzde = (d: Date) => Math.min(100, Math.max(0, ((d.getTime() - bas.getTime()) / (bit.getTime() - bas.getTime())) * 100));
  const aySinirlari: Date[] = [];
  for (let d = new Date(bas.getFullYear(), bas.getMonth(), 1); d < bit; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) aySinirlari.push(d);
  const ortalama = tk.sular.length > 1 && sonSu ? Math.round((sonSu.getTime() - tk.sular[0].tarih.getTime()) / 864e5 / (tk.sular.length - 1)) : undefined;

  return (
    <div className="overflow-hidden rounded-[24px] bg-white ring-1 ring-[#1d2a22]/8">
      {/* Özet */}
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 p-5 sm:p-6">
        <div className="flex items-end gap-4">
          <p className="font-display text-6xl font-medium leading-none tracking-[-0.03em] text-[#17352a]">{toplam}</p>
          <div className="pb-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f7f9a]">{tx("Sezonda su")}</p>
            <p className="mt-1 text-sm text-[#4b5f55]">
              <span className="font-semibold text-[#1f7a45]">{gubreli}{' '}{tx("gübreli")}</span> · {toplam - gubreli}{' '}{tx("yalnızca su")}
              {ortalama ? <>{' '}{tx("· ortalama")}{' '}{ortalama}{' '}{tx("günde bir")}</> : null}
            </p>
          </div>
        </div>
        {!kritik && (
          <label className="flex items-center gap-2 text-sm text-[#5b6f65]">
            
            {tx("Sıcak aylarda")}
            <select
              value={aralikGun}
              onChange={(e) => setAralikGun(Number(e.target.value))}
              className="rounded-full border-0 bg-[#f1efe8] px-3 py-1.5 font-semibold text-[#17352a] print:hidden"
            >
              {Array.from({ length: 19 }, (_, i) => i + 2).map((g) => (
                <option key={g} value={g}>
                  {g}{' '}{tx("günde bir")}{g === varsayilan ? tx(" (önerilen)") : ''}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Sezon film şeridi: dönem fotoğrafları yan yana, sular yukarıdan iner */}
      <div className="overflow-x-auto">
        <div className="relative h-[240px] min-w-[720px] bg-[#0d120f] sm:h-[270px]">
          {zkart.evreler.map((e, i) => {
            const b0 = evreBas[i];
            if (!b0) return null;
            const sonraki = evreBas.slice(i + 1).find(Boolean) ?? bit;
            const sol = yuzde(b0);
            const gen = yuzde(sonraki) - sol;
            const g = evreGorseli(zkart.bitki, i, zkart.evreler.length);
            return (
              <div key={i} className="absolute inset-y-0 overflow-hidden border-r border-black/40" style={{ left: `${sol}%`, width: `${gen}%` }}>
                {g ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80" />
                ) : (
                  <div className="absolute inset-0 bg-[url('/toprak.jpg')] bg-cover bg-bottom opacity-60" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/80" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">{tx(e.donem)}</p>
                  <p className="line-clamp-2 font-display text-[15px] font-medium leading-tight text-white">{tx(e.evre)}</p>
                </div>
              </div>
            );
          })}

          {/* Sular */}
          {tk.sular.map((x, i) => (
            <div
              key={x.no}
              className="group absolute top-0 flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${yuzde(x.tarih)}%`, height: '58%' }}
              title={tx("{a}. su · {b} civarı{c}", { a: x.no, b: tarihUzun(x.tarih, tx), c: x.gubreli ? tx(' · gübreli') : '' })}
            >
              <span
                className="w-[2px] flex-1 origin-top rounded-full [animation:suIn_.9s_cubic-bezier(.3,.7,.3,1)_both]"
                style={{
                  animationDelay: `${i * 70}ms`,
                  background: x.gubreli
                    ? 'linear-gradient(to bottom, rgba(95,208,138,0), #5fd08a)'
                    : 'linear-gradient(to bottom, rgba(169,220,243,0), rgba(214,240,252,.95))',
                }}
              />
              <svg viewBox="0 0 24 30" className="-mt-1 h-5 w-4 [animation:fadeIn_.6s_ease_both]" style={{ animationDelay: `${i * 70 + 500}ms` }} aria-hidden>
                <path
                  d="M12 1.5C8.4 7.4 3 12.8 3 18.6a9 9 0 0 0 18 0C21 12.8 15.6 7.4 12 1.5Z"
                  fill={x.gubreli ? '#5fd08a' : '#e3f4fc'}
                  style={{ filter: x.gubreli ? 'drop-shadow(0 0 6px rgba(95,208,138,.9))' : 'drop-shadow(0 0 4px rgba(214,240,252,.6))' }}
                />
              </svg>
              <span className="pointer-events-none mt-1 whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                {tx(tarihUzun(x.tarih, tx))}
              </span>
            </div>
          ))}

          {/* Ay çizgileri */}
          {aySinirlari.slice(1).map((d) => (
            <span key={d.getTime()} className="pointer-events-none absolute top-2 text-[10px] font-semibold uppercase tracking-wider text-white/45" style={{ left: `calc(${yuzde(d)}% + 6px)` }}>
              {tx(ayAdi(d.getMonth(), tx.dil).slice(0, 3))}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-5 py-3.5 text-xs text-[#6b7d72] sm:px-6">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2f9a58] shadow-[0_0_6px_#5fd08a]" />{' '}{tx("gübreli su")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#bfe3f4] ring-1 ring-[#8fbcd2]" />{' '}{tx("yalnızca su")}
        </span>
        <span className="text-[#8a968e]">
          {tx("Tarihler yaklaşık; yağış olursa o su atlanır.")}
        </span>
      </div>
    </div>
  );
}

/** Bir sulamada adım adım ne yapılacağı: gerçek saatlerle, kadranlarla, İGSAŞ ürünleri ve yapraktan uygulamayla */
function SulamaProgrami({
  yontem,
  sure,
  zkart,
  alan,
  ai,
  il,
}: {
  yontem: SulamaYontemi;
  sure?: number;
  zkart?: ReturnType<typeof zkartBul>;
  alan?: number | null;
  ai?: CozumPlani | null;
  il?: string | null;
}) {
  const tx = useTx();
  const fertigasyon = (g: string) => g === 'Damla sulama' || g === 'Yağmurlama';
  const evreler = zkart?.evreler ?? [];
  const simdi = zkart ? simdikiEvreler(zkart, takvimAyi(il)) : [];
  const ilkUygun = (() => {
    const s = simdi.find((i) => evreUygulamalari(evreler[i], yontem).length > 0);
    if (s !== undefined) return s;
    const j = evreler.findIndex((e) => evreUygulamalari(e, yontem).length > 0);
    return j >= 0 ? j : 0;
  })();
  const [evreNo, setEvreNo] = useState(ilkUygun);
  const [baslangic, setBaslangic] = useState('06:00');

  const evre = evreler[evreNo];
  const tum = evre ? evreUygulamalari(evre, yontem) : [];
  const duz = (gs: typeof tum) => gs.flatMap((g) => g.urunler.map((u) => ({ ...u, grup: g.yontem })));
  const suyla = yontem === 'damla' || yontem === 'yagmurlama' || yontem === 'pivot';
  const suUrunleri = duz(tum.filter((g) => fertigasyon(g.yontem)));
  const topragaUrunler = duz(tum.filter((g) => !fertigasyon(g.yontem) && g.yontem !== 'Yapraktan'));
  const yaprakUrunleri = duz(tum.filter((g) => g.yontem === 'Yapraktan'));

  const adimlar: ProgramAdimi[] = [];
  const dilimler = sure ? zamanCizelgesi(yontem, sure) : undefined;
  const bitis = sure ? saatEkle(baslangic, sure * 60) : baslangic;

  if (suyla && topragaUrunler.length > 0) {
    adimlar.push({
      bas: saatEkle(baslangic, -30),
      bit: baslangic,
      tur: 'gubre',
      baslik: tx("Sulamadan önce serpin"),
      aciklama: tx("Bu gübreler suyla verilmez. Sulamadan hemen önce toprağa serpin; ardından gelen su gübreyi kök bölgesine indirir."),
      liste: topragaUrunler,
    });
  }

  if (dilimler && yontem !== 'pivot') {
    adimlar.push(
      ...dilimler.map((d) => {
        const bas = saatEkle(baslangic, dkOku(d.bas));
        const bit = saatEkle(baslangic, dkOku(d.bit));
        const pencere = (dkOku(d.bit) - dkOku(d.bas)) / 60;
        return {
          bas,
          bit,
          tur: d.tur,
          baslik: d.tur === 'su' ? tx("Sadece su verin") : d.tur === 'gubre' ? tx("Gübreyi enjekte edin") : tx("Temiz suyla bitirin"),
          aciklama:
            d.tur === 'gubre'
              ? tx("Aşağıdaki besinleri ve ürünleri tanka hazırlayın ve {a}–{b} arasında, {c} saatte eşit hızla enjekte edin. Kalsiyumlu gübreleri sülfatlı ve fosfatlı olanlarla aynı tanka koymayın.", { a: bas, b: bit, c: formatNumber(pencere, 1) })
              : d.aciklama,
          liste: d.tur === 'gubre' ? suUrunleri : undefined,
          pencereSaat: d.tur === 'gubre' ? pencere : undefined,
          bosMesaj: d.tur === 'gubre' ? tx("Bu dönemde suyla verilecek gübre yok; sadece sulama yapın.") : undefined,
        } as ProgramAdimi;
      }),
    );
  } else if (yontem === 'pivot' && sure) {
    adimlar.push(
      { bas: baslangic, bit: saatEkle(baslangic, 15), tur: 'su', baslik: tx("Pivotu çalıştırın"), aciklama: tx("Hat dolsun ve tüm nozullardan su gelsin; tur hızını ayarlayın.") },
      {
        bas: saatEkle(baslangic, 15),
        bit: bitis,
        tur: 'gubre',
        baslik: tx("Tur boyunca sabit enjeksiyon"),
        aciklama: tx("Gübreyi tur boyunca aynı hızla enjekte edin; böylece tarlanın her yerine eşit düşer."),
        liste: suUrunleri,
        bosMesaj: tx("Bu dönemde suyla verilecek gübre yok; sadece sulama yapın."),
      },
      { tur: 'temiz', baslik: tx("Hattı yıkayın"), aciklama: tx("Tur bitince enjektörü kapatın, birkaç dakika temiz su vererek hattı yıkayın.") },
    );
  } else if (yontem === 'salma') {
    adimlar.push(
      {
        tur: 'gubre',
        baslik: tx("Gübreyi serpin"),
        aciklama: tx("Taban gübresini ekimde toprağa karıştırın; baş gübreyi karık diplerine ya da tava yüzeyine eşit serpin."),
        liste: topragaUrunler,
        bosMesaj: tx("Bu dönemde toprağa verilecek gübre yok."),
      },
      { tur: 'su', baslik: tx("Hemen sulayın"), aciklama: tx("Gübreyi serptikten sonra aynı gün suyu salın; su gübreyi kök bölgesine taşır.") },
      { tur: 'temiz', baslik: tx("Su göllenmesin"), aciklama: tx("Karık sonunda biriken suyu açın; uzun süre göllenen su gübreyi derine yıkar.") },
    );
  } else if (yontem === 'kuru') {
    adimlar.push(
      { tur: 'su', baslik: tx("Hava tahminine bakın"), aciklama: tx("Önümüzdeki 1–2 gün içinde yağış beklenen bir zaman seçin.") },
      {
        tur: 'gubre',
        baslik: tx("Gübreyi doğru zamanda verin"),
        aciklama: tx("Taban gübresini ekimle birlikte toprağa verin; baş gübreyi yağmurdan hemen önce serpin ki yağış toprağa işlesin."),
        liste: topragaUrunler,
        bosMesaj: tx("Bu dönemde toprağa verilecek gübre yok."),
      },
      { tur: 'temiz', baslik: tx("Kuru toprağa vermeyin"), aciklama: tx("Yağış gelmezse gübre toprak yüzeyinde kalır ve azot kaybolur.") },
    );
  }

  if (yaprakUrunleri.length > 0) {
    const bitDk = dkOku(bitis);
    const ayniGun = suyla && sure ? bitDk <= 16 * 60 && bitDk >= dkOku(baslangic) : true;
    adimlar.push({
      bas: ayniGun ? '18:00' : '07:00',
      bit: ayniGun ? '20:00' : '09:00',
      zamanNotu: suyla && sure ? (ayniGun ? tx("aynı gün akşam") : tx("ertesi sabah")) : tx("serin saat"),
      tur: 'temiz',
      baslik: tx("Yapraktan uygulama: pülverizatör ya da drone"),
      aciklama:
        tx("Sulamadan sonra yapraklar kuruyunca, rüzgârsız ve serin bir saatte püskürtün. Drone ile uygulama da önerilir: daha az su kullanılır, geniş tarlada hızlı ve eşit dağılır; ürün dozu aynı kalır."),
      liste: yaprakUrunleri,
    });
  }

  void ai;

  if (adimlar.length === 0) return null;

  return (
    <div className="rounded-[24px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f7f9a]">{tx("Adım adım sulama programı")}</p>
          <h4 className="mt-1 font-display text-2xl font-medium">
            {yontem === 'pivot' && sure ? tx("Bir tur · {a} saat", { a: formatNumber(sure, 1) }) : tx(sure && dilimler ? tx("Bir sulama · {a} saat", { a: formatNumber(sure, 1) }) : tx("Bir uygulama"))}
          </h4>
        </div>
        {suyla && sure && (
          <label className="flex items-center gap-2 text-sm text-[#4b5f55]">
            
            {tx("Sulamaya başlama saati")}
            <select
              value={baslangic}
              onChange={(e) => setBaslangic(e.target.value)}
              className="rounded-xl border border-[#d6e2d9] bg-[#f8faf7] px-3 py-1.5 font-semibold text-[#17352a] print:hidden"
            >
              {BASLANGIC_SAATLERI.map((t) => (
                <option key={t}>{tx(t)}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {evreler.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2 print:hidden" role="tablist" aria-label={tx("Dönem")}>
          {evreler.map((e, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === evreNo}
              onClick={() => setEvreNo(i)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${i === evreNo ? 'bg-[#1d2a22] text-white' : 'bg-[#f1efe8] text-[#476456] hover:bg-[#e7e3d8]'}`}
            >
              {i + 1}. {tx(e.evre)}
              {simdi.includes(i) ? tx(" · şu an") : ''}
            </button>
          ))}
        </div>
      )}
      {evre && (
        <div className="relative mt-4 aspect-[21/8] overflow-hidden rounded-[20px] bg-[#1d2a22]">
          {(() => {
            const g = zkart ? evreGorseli(zkart.bitki, evreNo, evreler.length) : undefined;
            return g ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={g} src={g} alt="" className="absolute inset-0 h-full w-full object-cover [animation:fadeIn_.5s_ease]" />
            ) : (
              <div className="absolute inset-0 bg-[url('/toprak.jpg')] bg-cover bg-bottom opacity-80" />
            );
          })()}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 p-4 text-white sm:p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">{evreNo + 1}{tx(". dönem ·")}{' '}{tx(evre.donem)}</p>
              <p className="font-display text-2xl font-medium leading-tight sm:text-3xl">{tx(evre.evre)}</p>
            </div>
            {simdi.includes(evreNo) && <span className="rounded-full bg-[#e2b65c] px-2.5 py-1 text-[11px] font-bold text-[#121410]">{tx("Şu an bu dönem")}</span>}
          </div>
        </div>
      )}
      {suyla && (
        <p className="mt-2 rounded-xl bg-[#f1f7fa] px-3 py-2 text-xs leading-5 text-[#2c5566]">
          
          {tx("Bu program")}{' '}<span className="font-semibold">{tx("gübreli bir su")}</span>{' '}{tx("içindir. Takvimdeki boş sularda gübre adımında da yalnızca su verin.")}
        </p>
      )}

      <ol className="mt-4 space-y-3">
        {adimlar.map((x, i) => (
          <li
            key={i}
            className="flex gap-4 rounded-2xl p-3 sm:p-4"
            style={{ background: x.liste && x.tur === 'gubre' ? '#eef7ef' : x.tur === 'su' ? '#f1f7fa' : x.liste ? '#f4f1fa' : '#f7f6f1' }}
          >
            {x.bas && x.bit ? (
              <SaatKadrani bas={x.bas} bit={x.bit} renk={x.liste && x.tur === 'temiz' ? '#9b87c9' : tx(DILIM_RENK[x.tur])} />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white font-display text-2xl text-[#17352a] ring-1 ring-[#d9e4dc]">
                {i + 1}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b7d72]">
                {i + 1}{tx(". adım")}{x.zamanNotu ? tx(` · ${x.zamanNotu}`) : ''}
              </p>
              <p className="mt-0.5 flex flex-wrap items-baseline gap-x-3 font-semibold text-[#17352a]">
                {x.bas && x.bit && <span className="font-display text-xl tabular-nums">{tx(x.bas)} – {tx(x.bit)}</span>}
                <span>{tx(x.baslik)}</span>
              </p>
              <p className="mt-1 text-sm leading-6 text-[#4b5f55]">{tx(x.aciklama)}</p>
              {x.liste &&
                (x.liste.length > 0 ? (
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {x.liste.map((u, j) => (
                      <ProgramUrunKarti key={j} u={u} alan={alan} pencereSaat={x.pencereSaat} pivotSure={yontem === 'pivot' && x.tur === 'gubre' ? sure : undefined} />
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-[#6b7d72]">{tx(x.bosMesaj) ?? (evre ? '' : tx("Bitki seçilmediği için ürün listesi yok."))}</p>
                ))}
            </div>
          </li>
        ))}
      </ol>

    </div>
  );
}

export function SulamaRecetesi({ tarla, ai, report }: { tarla: SonucTarla; ai?: CozumPlani | null; report?: SoilReport | null }) {
  const tx = useTx();
  const zkart = zkartBul(tarla.bitki ?? undefined);
  const tahil = tahilMi(zkart?.bitki);
  const suI = zkart ? suIhtiyaci(zkart, tarla.il, tarla.ilce) : undefined;
  const mm = (x: number) => Math.round(x).toLocaleString('tr-TR');
  const y = SULAMA_YONTEMLERI[tarla.sulama];
  const sure = tarla.sulama_suresi_saat ?? y.varsayilanSure;
  const simdi = zkart ? simdikiEvreler(zkart, takvimAyi(tarla.il)) : [];
  // Su takvimi, bitkinin su tüketimi (ETc) ve dönem su kartları rapordan çıkarıldı: çiftçi suyu tarlada görüyor,
  // rapor doğrudan ne verileceğini göstersin. Geri açmak için true yapın.
  const SU_BOLUMU = false as boolean;

  return (
    <section className="mt-10" aria-labelledby={tx("recete")}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">{tx("Tohumdan hasada")}</p>
      <h2 id="recete" className="mt-2 flex items-center gap-2 font-display text-3xl font-medium tracking-[-0.01em] sm:text-4xl">
        <CalendarDays size={26} className="text-[#2f7a4f]" />
        
        {tx("Dönem dönem uygulama reçetesi")}
      </h2>
      <details className="mt-3 max-w-[75ch] text-xs leading-5 text-[#4a3d22]">
        <summary className="cursor-pointer font-semibold text-[#8a6a2a]">{tx("İGSAŞ ve KIANA etiketleri ne demek?")}</summary>
        <p className="mt-2 rounded-xl bg-[#f6efe2] px-3 py-2">
        <span className="font-semibold">İGSAŞ</span>{' '}{tx("etiketli satırlar İstanbul Gübre Sanayii’nin taban, damla ve yaprak gübreleridir (DAP, NPK, UAN-32, KNO₃ …).")}{' '}
        <span className="font-semibold">KIANA</span>{' '}{tx("etiketli ürünler kök bölgesi mikroorganizmaları, stres koruması ve su tutma desteğidir.")}{' '}
        {tx("Dozlar dekar başınadır ve Prof. Dr. Metin Turan’ın İGSAŞ dönem programından (Z-kart) gelir.")}
      </p>
      </details>

      <div className="mt-5 space-y-5">
        {/* Sulama sisteminiz: tek satır; ayrıntı isteyene açılır */}
        <details className="group rounded-2xl bg-white ring-1 ring-[#1d2a22]/8">
          <summary className="flex cursor-pointer list-none items-center gap-3 p-3 pr-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={y.gorsel} alt="" loading="lazy" className="h-12 w-16 shrink-0 rounded-xl object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2f7f9a]">{tx("Sulama sisteminiz")}</span>
              <span className="block font-bold text-[#17352a]">
                {tx(y.ad)}
                {sure && y.sureEtiketi ? <span className="font-medium text-[#6b7d72]"> · {tx(formatNumber(sure, 1))}{' '}{tx("saat")}</span> : null}
              </span>
            </span>
            <span className="text-xs font-semibold text-[#2f7f9a] group-open:hidden">{tx("Nasıl uygulanır?")}</span>
          </summary>
          <p className="border-t border-[#1d2a22]/8 px-4 py-3 text-sm leading-6 text-[#3e5248]">{tx(y.tarif)}</p>
        </details>

        {zkart && tahil ? (
          <TahilSuPlani key={`th-${tarla.sulama}-${zkart.bitki}`} zkart={zkart} yontem={tarla.sulama} sure={sure} alan={tarla.alan_dekar} report={report} />
        ) : (
          <>
            {SU_BOLUMU && <SezonTakvimiKarti key={`tk-${tarla.sulama}-${zkart?.bitki ?? ""}-${tarla.il ?? ""}`} yontem={tarla.sulama} zkart={zkart} alan={tarla.alan_dekar} il={tarla.il} />}

            {zkart && sure && (tarla.sulama === 'damla' || tarla.sulama === 'yagmurlama') ? (
              <SuSutunu key={`su-${tarla.sulama}-${zkart.bitki}`} yontem={tarla.sulama} sure={sure} zkart={zkart} alan={tarla.alan_dekar} il={tarla.il} />
            ) : (
              <SulamaProgrami key={`${tarla.sulama}-${zkart?.bitki ?? ''}`} yontem={tarla.sulama} sure={sure} zkart={zkart} alan={tarla.alan_dekar} ai={ai} il={tarla.il} />
            )}
          </>
        )}

        {!zkart && (
          <p className="rounded-2xl border border-[#e1e9df] bg-[#f8fbf7] p-4 text-sm text-[#4b5f55]">
            {tarla.bitki ? tx("\"{a}\" için dönem dönem program (Z-kart) henüz yok.", { a: tarla.bitki }) : tx("Tarlanıza bitki ekleyin.")}{' '}{tx("Genel sulama kuralları aşağıdadır.")}
          </p>
        )}

        {SU_BOLUMU && zkart && suI && (
          <div className="rounded-2xl border border-[#cfe3ee] bg-[#f1f8fb] px-4 py-4 text-sm text-[#2c5566] sm:px-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2f7f9a]">{tx("Bitkinin su tüketimi · Evapotranspirasyon (ETc)")}</p>
              {suI.etoKaynak.tagem && (
                <span className="rounded-full bg-[#1f6f8f] px-2.5 py-0.5 text-[11px] font-bold text-white">
                  
                  {tx("TAGEM-SUET ·")}{' '}
                  {suI.etoKaynak.ilce ? tx("{a} → {b} istasyonu", { a: suI.etoKaynak.ilce, b: suI.etoKaynak.istasyonlar[0] }) : tx("{a} MGM istasyonu", { a: suI.etoKaynak.istasyonlar.length })}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="flex items-center gap-2 font-semibold text-[#17435a]">
                <Droplets size={18} className="text-[#1e88c7]" />{' '}{tx("Sezonda ETc ≈")}{' '}{tx(mm(suI.sezon.toplam))}{' '}{tx("mm")}
              </span>
              <span>{tx("Etkili yağışla karşılanan ≈")}{' '}{tx(mm(suI.sezon.yagis))}{' '}{tx("mm")}</span>
              <span className="font-semibold text-[#17435a]">{tx("Sulamayla verilmesi gereken ≈")}{' '}{tx(mm(suI.sezon.sulama))}{' '}{tx("mm")}</span>
            </div>
            <div className="mt-3 grid gap-2 text-xs leading-5 sm:grid-cols-3">
              <p className="rounded-xl bg-white px-3 py-2 ring-1 ring-[#d6e9f2]">
                <b className="text-[#17435a]">{tx("Transpirasyon:")}</b>{' '}{tx("bitkinin terlemesi. Kökün aldığı su, yapraktaki gözeneklerden (stoma) buhar olarak çıkar; gözenek açıkken fotosentez için CO₂ girer.")}
              </p>
              <p className="rounded-xl bg-white px-3 py-2 ring-1 ring-[#d6e9f2]">
                <b className="text-[#17435a]">{tx("Evaporasyon:")}</b>{' '}{tx("toprak yüzeyinden doğrudan buharlaşma. İkisinin toplamı")}{' '}
                <b className="text-[#17435a]">{tx("evapotranspirasyon")}</b>{tx("dur.")}
              </p>
              <p className="rounded-xl bg-white px-3 py-2 ring-1 ring-[#d6e9f2]">
                <b className="text-[#17435a]">{tx("ETc = ETo × Kc.")}</b>{' '}{tx("ETo iklimin buharlaştırma gücü, Kc bitkinin o evredeki katsayısı. Yaprak alanı büyüdükçe Kc ve terleme artar.")}
              </p>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-[#5b7a88]">
              {suI.etoKaynak.tagem
                ? tx(suI.etoKaynak.ilce
                  ? tx("ETo: TAGEM-SUET, Standart Penman-Monteith; {a} için en yakın MGM istasyonu {b} (30 yıllık ortalama).", { a: suI.etoKaynak.ilce, b: suI.etoKaynak.istasyonlar[0] })
                  : tx("ETo: TAGEM-SUET, Standart Penman-Monteith (MGM {a} istasyonları ortalaması, 30 yıl).", { a: suI.etoKaynak.istasyonlar.join(', ') }))
                : almanMi(suI.il)
                  ? tx("ETo: Makkink eşitliği (DWD'nin çim referansı), {a} için DWD 1991–2020 iklim normalleri ve güneşlenme süresi.", { a: suI.il })
                  : dunyaIli(suI.il)
                    ? tx("ETo: FAO-56 Hargreaves, {a} için NASA POWER uydu iklim ortalaması (bölge merkezi, yaklaşık).", { a: ilGoster(suI.il, tx.dil) })
                    : tx("ETo: FAO-56 Hargreaves, {a} için NASA POWER 2001–2025 iklim ortalaması.", { a: suI.il })}{' '}
              {suI.kcTagem ? tx("Kc: TAGEM-SUET bitki verileri (TAGEM 2017 rehberi), FAO-56 dört dönemli Kc eğrisi.") : tx("Kc: FAO-56 Tablo 12.")}{' '}{tx("Etkili yağış: USDA-SCS. 1 mm = dekara 1 m³ su.")}
              {suI.yaklasik ? tx(" Bu bitkinin katsayısı FAO tablosunda yok; yaklaşık değer kullanıldı.") : ''}{' '}{tx("Yağışlı ya da kurak yıllarda değişir.")}
            </p>
          </div>
        )}
        {SU_BOLUMU && zkart && (
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {zkart.evreler.map((e, i) => {
              const suAn = simdi.includes(i);
              return (
                <li
                  key={i}
                  className={`flex flex-col overflow-hidden rounded-[22px] border bg-white ${suAn ? 'border-[#2f8f57] ring-2 ring-[#cde9d4]' : 'border-[#dfe9df]'}`}
                >
                  <div className="relative aspect-video overflow-hidden bg-[#0b0c09]">
                    {(() => {
                      const gorsel = evreGorseli(zkart.bitki, i, zkart.evreler.length);
                      if (gorsel)
                        // eslint-disable-next-line @next/next/no-img-element
                        return <img src={gorsel} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />;
                      // Bu bitkinin görseli yok: toprak + evreyle büyüyen filiz simgesi
                      const oran = zkart.evreler.length > 1 ? i / (zkart.evreler.length - 1) : 0.5;
                      return (
                        <>
                          <div className="absolute inset-0 bg-[url('/toprak.jpg')] bg-cover bg-bottom opacity-90" />
                          <div className="absolute inset-0 flex items-center justify-center pb-8">
                            <Sprout
                              strokeWidth={1.4}
                              className="text-[#9bdd68] drop-shadow-[0_0_18px_rgba(155,221,104,.45)]"
                              style={{ width: 28 + oran * 56, height: 28 + oran * 56, color: oran > 0.85 ? '#e2b65c' : undefined }}
                            />
                          </div>
                        </>
                      );
                    })()}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b0c09] via-[#0b0c09]/70 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4 text-white">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f5f0e6] font-display text-base font-semibold text-[#121410]">
                        {i + 1}
                      </span>
                      <span className="flex-1 font-display text-lg font-medium leading-6">{tx(e.evre)}</span>
                    </div>
                    {suAn && (
                      <span className="absolute right-3 top-3 rounded-full bg-[#e2b65c] px-2.5 py-1 text-[11px] font-bold text-[#121410] shadow">{tx("Şu an bu dönem")}</span>
                    )}
                  </div>
                  {suI && suI.evreler[i] && (
                    <div className="flex items-center gap-3 border-b border-[#d6e9f2] bg-[#eef7fb] px-4 py-2.5">
                      <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0" aria-hidden>
                        <path d="M12 2.5C9 7 5.5 10.6 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10.6 15 7 12 2.5Z" fill="#1e88c7" />
                        <path d="M9 15.5a3 3 0 0 0 3 3" stroke="#bfe6fb" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                      </svg>
                      <div className="min-w-0 text-[#17435a]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2f7f9a]">
                          
                          {tx("Evapotranspirasyon (ETc) · Kc")}{' '}{tx(suI.evreler[i].kc.toLocaleString('tr-TR', { maximumFractionDigits: 2, minimumFractionDigits: 2 }))}
                        </p>
                        <p className="text-sm font-bold leading-5">
                          
                          {tx("Günde ≈")}{' '}{tx(suI.evreler[i].gunluk.toLocaleString('tr-TR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }))}{' '}{tx("mm")}
                          <span className="font-semibold text-[#2c5566]">{' '}{tx("· dönemde ≈")}{' '}{tx(mm(suI.evreler[i].toplam))}{' '}{tx("mm")}</span>
                        </p>
                        <p className="text-[11px] leading-4 text-[#4a6b7a]">
                          {suI.evreler[i].sulama < 5
                            ? tx("Yağış ≈ {a} mm · ortalama yılda yağış yeterli", { a: mm(suI.evreler[i].yagis) })
                            : tx("Yağış ≈ {a} mm → sulamayla ≈ {b} mm", { a: mm(suI.evreler[i].yagis), b: mm(suI.evreler[i].sulama) })}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="px-4 py-3">
                    <div className="text-xs text-[#7b8c82]">{tx([e.bbch && `BBCH ${e.bbch}`, tx(e.donem)].filter(Boolean).join(' · '))}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {SU_BOLUMU && (
        <div className="rounded-2xl border border-[#e1e9df] bg-[#f8fbf7] p-4 sm:p-5">
          <h4 className="flex items-center gap-2 font-bold text-[#17352a]">
            <Droplets size={18} className="text-[#2f7f9a]" /> {tx(y.ad)}{tx(": dikkat edilecekler")}
          </h4>
          <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#3e5248]">
            {KURALLAR[tarla.sulama].map((k) => (
              <li key={k} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f7f9a]" />
                {tx(k)}
              </li>
            ))}
          </ul>
        </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Karşılaştırma ve indeks seyri                                               */
/* -------------------------------------------------------------------------- */

export function Karsilastirma({
  once,
  simdi,
  onceTarih,
  simdiTarih,
}: {
  once: SoilReport;
  simdi: SoilReport;
  onceTarih: string;
  simdiTarih: string;
}) {
  const tx = useTx();
  const d = karsilastir(once, simdi);
  if (!d.length) return null;
  const o = ozetle(d);
  const ia = kaliteIndeksi(once)?.yuzde;
  const ib = kaliteIndeksi(simdi)?.yuzde;
  const SONUC = {
    iyilesti: { ad: tx("İyileşti"), cls: 'bg-[#e6f4ec] text-[#1f7a45]' },
    kotulesti: { ad: tx("Kötüleşti"), cls: 'bg-[#fdecea] text-[#a83422]' },
    ayni: { ad: tx("Değişmedi"), cls: 'bg-[#eef1ef] text-[#5b6f65]' },
    uygun: { ad: tx("Uygun kaldı"), cls: 'bg-[#eef7e9] text-[#3c7a2c]' },
    bilgi: { ad: tx("Değişti"), cls: 'bg-[#e8eff4] text-[#3d6478]' },
  } as const;

  return (
    <section className="mt-10" aria-labelledby={tx("karsilastirma")}>
      <h2 id="karsilastirma" className="text-xl font-bold">{tx("Önceki analizle karşılaştırma")}</h2>
      <p className="mt-1 text-sm text-[#64766c]">
        {tx(onceTarih)} → {tx(simdiTarih)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
        {ia !== undefined && ib !== undefined && (
          <span className="rounded-full border border-[#dfe9df] bg-white px-3 py-1.5">
            
            {tx("Kalite indeksi")}{' '}{ia} → <span className={ib > ia ? 'text-[#1f7a45]' : tx(ib < ia ? 'text-[#a83422]' : '')}>{ib}</span>
          </span>
        )}
        <span className="rounded-full bg-[#e6f4ec] px-3 py-1.5 text-[#1f7a45]">{o.iyilesen}{' '}{tx("iyileşti")}</span>
        <span className="rounded-full bg-[#fdecea] px-3 py-1.5 text-[#a83422]">{o.kotulesen}{' '}{tx("kötüleşti")}</span>
        <span className="rounded-full bg-[#eef1ef] px-3 py-1.5 text-[#5b6f65]">{o.ayni}{' '}{tx("değişmedi")}</span>
        {o.uygun > 0 && <span className="rounded-full bg-[#eef7e9] px-3 py-1.5 text-[#3c7a2c]">{o.uygun}{' '}{tx("uygun kaldı")}</span>}
      </div>
      <div className="mt-4 overflow-hidden rounded-[22px] border border-[#dfe9df] bg-white">
        <table className="w-full text-[13px] sm:text-sm">
          <thead>
            <tr className="border-b border-[#dfe9df] text-left text-xs text-[#6b7d72]">
              <th scope="col" className="px-3 py-3 font-semibold sm:px-4">{tx("Parametre")}</th>
              <th scope="col" className="px-3 py-3 text-right font-semibold sm:px-4">{tx("Önce")}</th>
              <th scope="col" className="px-3 py-3 text-right font-semibold sm:px-4">{tx("Şimdi")}</th>
              <th scope="col" className="px-3 py-3 font-semibold sm:px-4">{tx("Durum")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf2ee]">
            {d.map((x) => {
              const Ikon = x.yon === 'artti' ? ArrowUpRight : x.yon === 'azaldi' ? ArrowDownRight : Minus;
              return (
                <tr key={x.key}>
                  <th scope="row" className="px-3 py-2.5 text-left font-semibold sm:px-4">
                    {tx(etiketGoster(x.key, tx.dil))}
                    {birimGoster(x.key, tx.dil) && <span className="block text-xs font-normal text-[#8a978f]">{tx(birimGoster(x.key, tx.dil))}</span>}
                  </th>
                  <td className="px-3 py-2.5 text-right tabular-nums text-[#6b7d72] sm:px-4">{tx(formatNumber(degerGoster(x.key, x.once, tx.dil), 3))}</td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums sm:px-4">
                    <span className="inline-flex items-center gap-1">
                      <Ikon size={14} className="text-[#6b7d72]" />
                      {tx(formatNumber(degerGoster(x.key, x.simdi, tx.dil), 3))}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 sm:px-4">
                    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${SONUC[x.sonuc].cls}`}>{tx(SONUC[x.sonuc].ad)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Kalite indeksinin analizler boyunca seyri (en az 2 nokta). */
export function IndeksSeyri({ noktalar }: { noktalar: { tarih: string; indeks: number }[] }) {
  const tx = useTx();
  if (noktalar.length < 2) return null;
  const W = 560;
  const H = 180;
  const P = { l: 36, r: 16, t: 16, b: 34 };
  const x = (i: number) => P.l + (i * (W - P.l - P.r)) / (noktalar.length - 1);
  const y = (v: number) => P.t + ((100 - v) * (H - P.t - P.b)) / 100;
  const yol = noktalar.map((n, i) => `${i ? 'L' : 'M'}${x(i)},${y(n.indeks)}`).join(' ');
  return (
    <figure className="rounded-[22px] border border-[#dfe9df] bg-white p-4 sm:p-5">
      <figcaption className="text-sm font-bold text-[#17352a]">{tx("Kalite indeksi seyri")}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label={tx("Kalite indeksinin analizler boyunca değişimi")}>
        {[0, 20, 40, 60, 80, 100].map((v) => (
          <g key={v}>
            <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="#edf2ee" />
            <text x={P.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#8a978f">
              {v}
            </text>
          </g>
        ))}
        <path d={yol} fill="none" stroke="#2f8f57" strokeWidth="2.5" strokeLinejoin="round" />
        {noktalar.map((n, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(n.indeks)} r="5" fill="#fff" stroke="#2f8f57" strokeWidth="2.5" />
            <text x={x(i)} y={y(n.indeks) - 10} textAnchor="middle" fontSize="12" fontWeight="700" fill="#17352a">
              {n.indeks}
            </text>
            <text x={x(i)} y={H - 12} textAnchor="middle" fontSize="11" fill="#6b7d72">
              {tx(n.tarih)}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}


/* -------------------------------------------------------------------------- */
/* Rapor kapağı ve görsel göstergeler                                           */
/* -------------------------------------------------------------------------- */

const TON_RENK: Record<Tone, string> = { iyi: '#5fbf6a', dikkat: '#e2b65c', sorun: '#e0674f', bilgi: '#8fb8cc' };



const SINIF_ACIKLAMA: Record<string, string> = {
  'Çok iyi': 'Toprağınız çok sağlıklı. Mevcut programınızı koruyun.',
  İyi: 'Toprağınız genel olarak sağlıklı. Birkaç eksik giderilirse verim belirgin şekilde artar.',
  Orta: 'Toprağınız orta seviyede. Eksikler giderilmezse verim kaybı yaşanabilir.',
  Zayıf: 'Toprağınız zayıf. Aşağıdaki öneriler bu sezon için önemli.',
  'Çok zayıf': 'Toprağınız ciddi destek istiyor. Önerileri öncelikle uygulayın.',
};

/** Toprak karnesi göstergesi: 5 renkli dilim, ibre ve puan. İbre açılışta 0'dan değere döner. */
function KarneGostergesi({ yuzde, sinif, renk }: { yuzde: number; sinif: string; renk: string }) {
  const tx = useTx();
  const [gosterilen, setGosterilen] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setGosterilen(yuzde), 150);
    return () => clearTimeout(t);
  }, [yuzde]);
  const cx = 150, cy = 150, r = 118, kalinlik = 22, bosluk = 1.6; // derece
  const nokta = (aci: number, rr = r) => {
    const rad = (Math.PI * (180 - aci)) / 180;
    return [cx + rr * Math.cos(rad), cy - rr * Math.sin(rad)];
  };
  const yay = (a1: number, a2: number) => {
    const [x1, y1] = nokta(a1);
    const [x2, y2] = nokta(a2);
    return `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  const dilimler = [...SINIFLAR].reverse(); // 0-20, 20-40 …
  const ibreAci = (Math.min(100, Math.max(0, gosterilen)) / 100) * 180;
  return (
    <div className="relative w-full max-w-[340px]">
      <svg viewBox="0 0 300 172" className="w-full" role="img" aria-label={tx("Toprak kalite indeksi {a} / 100, {b}", { a: yuzde, b: tx(sinif) })}>
        {dilimler.map((d, i) => (
          <path
            key={d.ad}
            d={yay(i * 36 + (i ? bosluk : 0), (i + 1) * 36 - (i < 4 ? bosluk : 0))}
            fill="none"
            stroke={d.renk}
            strokeWidth={kalinlik}
            opacity={yuzde >= d.min && (i === 4 || yuzde < dilimler[i + 1].min) ? 1 : 0.35}
          />
        ))}
        {[0, 20, 40, 60, 80, 100].map((t) => {
          const [x, y] = nokta(t * 1.8, r - kalinlik / 2 - 12);
          return (
            <text key={t} x={x} y={y + 3} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,.45)">
              {t}
            </text>
          );
        })}
        <g style={{ transform: `rotate(${ibreAci - 90}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 1.4s cubic-bezier(.2,.8,.2,1)' }}>
          <path d={`M${cx - 5} ${cy} L${cx} ${cy - r + 8} L${cx + 5} ${cy} Z`} fill="#f5f0e6" />
        </g>
        <circle cx={cx} cy={cy} r="11" fill="#f5f0e6" />
        <circle cx={cx} cy={cy} r="5" fill="#121410" />
      </svg>
      <div className="-mt-1 text-center">
        <div className="font-display text-6xl font-medium leading-none tracking-[-0.03em] tabular-nums sm:text-7xl">
          {yuzde}
          <span className="ml-1 font-sans text-lg font-normal text-white/50">/100</span>
        </div>
        <span className="mt-3 inline-block rounded-full px-4 py-1 text-sm font-bold text-white" style={{ background: renk }}>
          {tx(sinif)}
        </span>
      </div>
    </div>
  );
}

function RaporKapagi({
  report,
  tarla,
  tarih,
  indeks,
  sorunlu = [],
}: {
  report: SoilReport;
  tarla: SonucTarla;
  tarih?: string;
  indeks?: IndeksSonucu | null;
  /** Laboratuvar sınıflandırmasında dikkat/sorun çıkan anahtarlar: güçlü yan olarak gösterilmez */
  sorunlu?: string[];
}) {
  const tx = useTx();
  const bilgiler = [tarih, report.raporNo && `Rapor ${report.raporNo}`, tarla.konum, tarla.bitki, SULAMA_YONTEMLERI[tarla.sulama]?.ad].filter(Boolean);
  const sirali = indeks ? [...indeks.satirlar].sort((a, b) => b.puan - a.puan) : [];
  const guclu = sirali.filter((x) => x.puan >= 4 && !sorunlu.includes(x.key)).slice(0, 3);
  const zayif = [...sirali].reverse().filter((x) => x.puan <= 2).slice(0, 3);

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-[#121410] text-white shadow-[0_40px_80px_-30px_rgba(18,20,16,.6)] print:rounded-none print:shadow-none">
      <div className="absolute inset-0 bg-[url('/toprak.jpg')] bg-cover bg-center" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-[#121410]/80 via-[#121410]/60 to-[#121410]/95" aria-hidden />

      <div className="relative p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#e2b65c]">{tx("Toprak karnesi")}</p>
        <h1 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-6xl">{tx(tarla.ad)}</h1>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
          {bilgiler.map((b) => (
            <span key={b as string} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
              {tx(b)}
            </span>
          ))}
        </div>

        {indeks ? (
          <div className="mt-8 grid items-center gap-8 md:grid-cols-[1fr_1.1fr] md:gap-12">
            <div className="flex flex-col items-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/55">{tx("Toprak kalite indeksi")}</p>
              <KarneGostergesi yuzde={indeks.yuzde} sinif={indeks.sinif} renk={indeks.renk} />
            </div>
            <div>
              <p className="font-display text-2xl leading-snug sm:text-3xl">{tx(SINIF_ACIKLAMA[indeks.sinif] ?? '')}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {guclu.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd18f]">{tx("Güçlü yanları")}</p>
                    <ul className="mt-2 space-y-1.5">
                      {guclu.map((x) => (
                        <li key={x.key} className="flex items-center justify-between gap-3 text-sm">
                          <span>{tx(x.ad)}</span>
                          <PuanNoktalari puan={x.puan} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {zayif.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f0a58f]">{tx("Geliştirilmesi gerekenler")}</p>
                    <ul className="mt-2 space-y-1.5">
                      {zayif.map((x) => (
                        <li key={x.key} className="flex items-center justify-between gap-3 text-sm">
                          <span>{tx(x.ad)}</span>
                          <PuanNoktalari puan={x.puan} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-6 max-w-md text-lg leading-7 text-white/80">{tx("Analiz değerleriniz aşağıda.")}</p>
        )}
      </div>

      {indeks && (
        <div className="relative grid grid-cols-3 border-t border-white/10 bg-[#121410]/70 backdrop-blur">
          {indeks.gruplar.map((g) => (
            <div key={g.grup} className="border-white/10 px-3 py-5 text-center [&:not(:first-child)]:border-l sm:px-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">{tx(g.ad)}</p>
              {g.yuzde !== null ? (
                <>
                  <p className="mt-1 font-display text-3xl tabular-nums">{g.yuzde}</p>
                  <div className="mx-auto mt-2 h-1.5 max-w-[120px] overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-[#e2b65c]" style={{ width: `${g.yuzde}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-white/45">{g.adet}{' '}{tx("ölçüm")}</p>
                </>
              ) : (
                <>
                  <p className="mt-1 font-display text-3xl text-white/30">–</p>
                  <p className="mt-1.5 text-[11px] leading-4 text-white/45">{tx("Ölçülmedi")}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** 0–5 puanı beş nokta olarak gösterir (koyu zemin) */
function PuanNoktalari({ puan }: { puan: number }) {
  return (
    <span className="flex shrink-0 items-center gap-1" aria-label={`${puan} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="h-2 w-2 rounded-full" style={{ background: i <= puan ? PUAN_RENK[puan] : 'rgba(255,255,255,.18)' }} />
      ))}
      <span className="ml-1 w-7 text-right text-xs tabular-nums text-white/60">{puan}/5</span>
    </span>
  );
}

/** 0–14 pH skalası, değerin üstünde işaret */
function PhSkalasi({ deger, etiket }: { deger: number; etiket: string }) {
  const tx = useTx();
  const renkler = ['#d7301f', '#ef6548', '#fc8d59', '#fdbb84', '#f6d55c', '#c2d65a', '#7fc45a', '#3fae6a', '#2a9d8f', '#2b8cbe', '#3f6fb5', '#5b54a8', '#7a3f9d', '#8e2c86', '#6e1f6b'];
  const pct = Math.min(100, Math.max(0, (deger / 14) * 100));
  return (
    <div className="rounded-[24px] bg-white p-5 ring-1 ring-[#1d2a22]/8">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6d786f]">{tx.dil === 'de' ? 'Bodenreaktion (pH CaCl₂)' : tx("Asitlik (pH)")}</h3>
        <span className="font-display text-3xl">{tx(formatNumber(degerGoster('ph', deger, tx.dil), 2))}</span>
      </div>
      <div className="relative mt-6">
        <div className="absolute -top-4 -translate-x-1/2" style={{ left: `${pct}%` }}>
          <div className="h-0 w-0 border-x-[7px] border-t-[9px] border-x-transparent border-t-[#1d2a22]" />
        </div>
        <div className="flex h-4 overflow-hidden rounded-full">
          {renkler.map((r, i) => (
            <span key={i} className="flex-1" style={{ background: r }} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] tabular-nums text-[#8a968d]">
          <span>{tx("0 asidik")}</span>
          <span>{tx("7 nötr")}</span>
          <span>{tx("14 bazik")}</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-[#1d2a22]">{tx(etiket)}</p>
      <p className="text-xs text-[#6d786f]">{tx("Uygun:")}{' '}{tx(aralikMetni('ph', tx.dil))}</p>
    </div>
  );
}

/** Kum / silt / kil yığılmış çubuk */
function BunyeCubugu({ kum, silt, kil, sinif }: { kum?: number; silt?: number; kil?: number; sinif?: string }) {
  const tx = useTx();
  const parcalar = [
    { ad: tx("Kum"), v: kum, renk: '#d9b98c' },
    { ad: tx("Silt"), v: silt, renk: '#a77f55' },
    { ad: tx("Kil"), v: kil, renk: '#6b4a2f' },
  ].filter((p) => p.v !== undefined) as { ad: string; v: number; renk: string }[];
  const toplam = parcalar.reduce((t, p) => t + p.v, 0) || 1;
  return (
    <div className="rounded-[24px] bg-white p-5 ring-1 ring-[#1d2a22]/8">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6d786f]">{tx("Toprağın yapısı (bünye)")}</h3>
      <p className="mt-1 font-display text-2xl leading-tight">{tx(sinif) ?? tx("Bünye")}</p>
      <div className="mt-4 flex h-10 overflow-hidden rounded-xl">
        {parcalar.map((p) => (
          <span
            key={p.ad}
            className="flex items-center justify-center text-[11px] font-bold text-white"
            style={{ width: `${(p.v / toplam) * 100}%`, background: p.renk }}
          >
            {p.v / toplam > 0.12 && tx('%{a}', { a: formatNumber(p.v, 0) })}
          </span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#5e6a60]">
        {parcalar.map((p) => (
          <span key={p.ad} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.renk }} /> {tx(p.ad)} {tx('%{a}', { a: formatNumber(p.v, 1) })}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Uygun aralığı gösteren yatay çubuk (kalın) */
function DegerCubugu({ r }: { r: ParamResult }) {
  const tx = useTx();
  const def = PARAMS[r.key];
  const u = def.uygun;
  const tone = r.classification?.tone ?? 'bilgi';
  const ref = u?.max ?? (u?.min ?? r.value) * 2;
  const hi = Math.max(r.value, ref) * 1.2 || 1;
  const pct = (x: number) => Math.min(100, Math.max(0, (x / hi) * 100));
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold uppercase tracking-wide text-[#3f4a42]">{tx(etiketGoster(r.key, tx.dil))}</span>
        <span className="text-sm tabular-nums">
          <span className="font-bold">{tx(formatNumber(degerGoster(r.key, r.value, tx.dil), 3))}</span> <span className="text-xs text-[#8a968d]">{tx(birimGoster(r.key, tx.dil))}</span>
        </span>
      </div>
      <div className="relative mt-1.5 h-3.5 overflow-hidden rounded-full bg-[#ece6da]">
        {u && <div className="absolute inset-y-0 bg-[#cfe6c6]" style={{ left: `${pct(u.min ?? 0)}%`, width: `${pct(u.max ?? hi) - pct(u.min ?? 0)}%` }} />}
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct(r.value)}%`, background: TON_RENK[tone] }} />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-[#8a968d]">
        <span style={{ color: tone === 'iyi' ? '#2f7a4f' : tone === 'sorun' ? '#b4432f' : tone === 'dikkat' ? '#9a6b12' : undefined }} className="font-semibold">
          {tx(r.classification?.label)}
        </span>
        {u && <span>{tx("Uygun:")}{' '}{tx(aralikMetni(r.key, tx.dil))}</span>}
      </div>
    </li>
  );
}

function Gostergeler({ report, results }: { report: SoilReport; results: ParamResult[] }) {
  const tx = useTx();
  const ph = results.find((r) => r.key === 'ph');
  const v = report.values;
  const bunyeVar = v.kum !== undefined || v.silt !== undefined || v.kil !== undefined;
  const cubuklar = results.filter((r) => !['ph', 'kum', 'silt', 'kil', 'doygunluk'].includes(r.key) && r.classification);
  if (!ph && !bunyeVar && cubuklar.length === 0) return null;
  return (
    <section className="mt-10" aria-labelledby={tx("gostergeler")}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">{tx("Bir bakışta")}</p>
      <h2 id="gostergeler" className="mt-2 font-display text-3xl font-medium tracking-[-0.01em] sm:text-4xl">{tx("Toprağınızın durumu")}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {ph?.classification && <PhSkalasi deger={ph.value} etiket={tx(ph.classification.label)} />}
        {bunyeVar && <BunyeCubugu kum={v.kum} silt={v.silt} kil={v.kil} sinif={report.bunyeSinifi} />}
      </div>
      {cubuklar.length > 0 && (
        <div className="mt-4 rounded-[24px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6d786f]">{tx("Besin ve kimyasal durum")}</h3>
          <ul className="mt-4 grid gap-x-10 gap-y-5 md:grid-cols-2">
            {cubuklar.map((r) => (
              <DegerCubugu key={r.key} r={r} />
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-2 text-[11px] text-[#8a968d]">
            <span className="h-2.5 w-5 rounded-full bg-[#cfe6c6]" />{' '}{tx("Açık yeşil alan: uygun aralık")}
          </p>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Sonuç ekranı                                                                */
/* -------------------------------------------------------------------------- */

export function SonucEkrani({
  report,
  ai,
  aiState,
  onRetryAi,
  tarla,
  onceki,
  baslikUstu,
  eylemler,
  tarih,
}: {
  report: SoilReport;
  ai: CozumPlani | null;
  aiState: 'idle' | 'loading' | 'error';
  onRetryAi: () => void;
  tarla: SonucTarla;
  onceki?: { rapor: SoilReport; tarih: string; simdiTarih: string } | null;
  baslikUstu?: ReactNode;
  eylemler?: ReactNode;
  tarih?: string;
}) {
  const tx = useTx();
  const results = classify(report);
    const ilgi = results
    .filter((r) => r.classification?.tone === 'sorun' || r.classification?.tone === 'dikkat')
    .sort((a, b) => (a.classification?.tone === 'sorun' ? 0 : 1) - (b.classification?.tone === 'sorun' ? 0 : 1))
    .map((r) => ({ key: r.key, ad: PARAMS[r.key].label.replace(/\s*\(.*\)/, ''), tone: r.classification!.tone, etiket: r.classification!.label }));
  const indeks = kaliteIndeksi(report);
  const omDusuk = report.values.organikMadde !== undefined && uygunFark('organikMadde', report.values.organikMadde).durum === 'eksik';

  return (
    <div className="mx-auto max-w-5xl">
      {baslikUstu && <div className="mb-4">{baslikUstu}</div>}
      <RaporKapagi report={report} tarla={tarla} tarih={tarih} indeks={indeks} sorunlu={ilgi.map((x) => x.key)} />

      {/* 1) Yapay zekâ yorumu: özet ve öncelikli adımlar */}
      <YorumBolumu report={report} ai={ai} aiState={aiState} onRetryAi={onRetryAi} ilgi={ilgi} />

      {/* 2) Eksiklikler: bitkide görülebilecek noksanlıklar (resimli) */}
      {/* Noksanlık kataloğu henüz yalnızca Türkçe: Almancada çevirisi gelene kadar gösterilmez */}
      {modullerAcik(tx.dil) && <RaporNoksanliklari report={report} bitki={tarla.bitki} />}

      {/* 3) Isı · ışık · gelişim + dönem gübresi: hocanın atlası (3B GDD, PAR, fotosentez, NDVI); atlasta olmayan bitkide il PAR kartı */}
      {atlasAdresi({ bitki: tarla.bitki }).bitkiVar ? (
        <AtlasKarti bitki={tarla.bitki} il={tarla.il} sulama={tarla.sulama} report={report} alan={tarla.alan_dekar} className="mt-10" />
      ) : (
        <ParKarti il={tarla.il} bitki={tarla.bitki} className="mt-10" />
      )}

      {/* 4) Sezon toplamı: alınacak İGSAŞ ürünleri */}
      <SezonToplami zkart={zkartBul(tarla.bitki ?? undefined)} yontem={tarla.sulama} alan={tarla.alan_dekar} ai={ai} toprak={atlasToprak(report)} />

      {/* 5) Dönem dönem program */}
      {/* Toprak analizi raporunda dönem reçetesi gösterilmez: dönem gübresi 3B atlasın altındaki panelde zaten var.
          Atlasta olmayan bitkide o panel çıkmadığı için reçete burada kalır. (Tarla sayfasında reçete durur.) */}
      {!atlasAdresi({ bitki: tarla.bitki }).bitkiVar && <SulamaRecetesi tarla={tarla} ai={ai} report={report} />}

      {/* 3) Değerler: tek görünüm */}
      <Gostergeler report={report} results={results} />

      {onceki && <Karsilastirma once={onceki.rapor} simdi={report} onceTarih={onceki.tarih} simdiTarih={onceki.simdiTarih} />}

      {/* Yorum gelmediyse organik madde protokolü (yapay zekâdan bağımsız) */}
      {!ai && <SolutionPlan report={report} ai={ai} aiState={aiState} onRetryAi={onRetryAi} omDusuk={omDusuk} />}

      {tx.dil === 'tr' && <Videolar bitki={zkartBul(tarla.bitki ?? undefined)?.bitki} />}

      {/* 5) Teknik detaylar: varsayılan kapalı */}
      <section className="mt-10 space-y-3" aria-labelledby={tx("detaylar")}>
        <h2 id="detaylar" className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7a877e]">
          
          {tx("Detaylar")}
        </h2>
        <Detay baslik={tx("Laboratuvar tablosu")} alt={tx("Tüm ölçümler, uygun aralıklar ve farklar")}>
          <AnalysisTable report={report} results={results} />
        </Detay>
        {indeks && (
          <Detay baslik={tx("Kalite indeksi nasıl hesaplandı?")} alt={tx("{a} ölçümün 0–5 puan ortalaması → {b}/100", { a: indeks.satirlar.length, b: indeks.yuzde })}>
            <KaliteIndeksi indeks={indeks} sade />
          </Detay>
        )}
        <Detay baslik={tx("Bu değerler ne anlama geliyor?")}>
          <dl className="space-y-3 px-2 text-sm">
            {results.map((r) => (
              <div key={r.key}>
                <dt className="font-semibold">{tx(PARAMS[r.key].label)}</dt>
                <dd className="text-[#5b6f65]">{tx(PARAMS[r.key].why)}</dd>
              </div>
            ))}
          </dl>
        </Detay>
      </section>

      {eylemler && <div className="mt-10 flex flex-col gap-3 sm:flex-row print:hidden">{eylemler}</div>}
    </div>
  );
}
