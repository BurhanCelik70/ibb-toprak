'use client';
/**
 * Analiz sonucu: kalite indeksi, analiz tablosu, çözüm planı, karşılaştırma ve sulama reçetesi.
 */
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, CirclePlay, ClipboardList, Droplets, FlaskConical, Gauge, Info, Loader2, MapPin, Minus, ShieldCheck, Sprout } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { evreGorseli } from '@/lib/bitkiGorsel';
import { ORGANIK_MADDE_PROTOKOLU, zkartBul } from '@/lib/igsas';
import { SINIFLAR, kaliteIndeksi, type IndeksSonucu } from '@/lib/indeks';
import { karsilastir, ozetle } from '@/lib/karsilastir';
import {
  KURALLAR,
  SULAMA_YONTEMLERI,
  evreUygulamalari,
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
  uygunAralikMetni,
  uygunFark,
  type ParamGroup,
  type ParamKey,
  type ParamResult,
  type SoilReport,
  type Tone,
} from '@/lib/toprak';
import type { CozumPlani, UrunOnerisi } from '@/lib/veri';
import { VIDEOLAR, youtubeId } from '@/lib/videolar';

export type SonucTarla = {
  ad: string;
  bitki: string | null;
  sulama: SulamaYontemi;
  alan_dekar: number | null;
  sulama_suresi_saat: number | null;
  konum?: string | null;
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
  const s = TONE_STYLE[tone];
  return (
    <div>
      <div className={`flex items-center gap-2 font-semibold ${s.text}`}>
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
        {label}
      </div>
      {fark && <div className="mt-0.5 text-xs text-[#51675d]">{fark}</div>}
      {lab && <div className="mt-0.5 hidden text-[11px] text-[#8a978f] sm:block">Laboratuvar değerlendirmesi</div>}
    </div>
  );
}

function AnalysisTable({ report, results }: { report: SoilReport; results: ParamResult[] }) {
  const byGroup = GROUP_ORDER.map((g) => ({ g, rows: results.filter((r) => PARAMS[r.key].group === g) })).filter(
    (x) => x.rows.length > 0,
  );
  const ek = report.ekDegerler ?? [];

  const groupHeader = (title: string) => (
    <tr className="bg-[#f3f7f2]">
      <th colSpan={4} scope="colgroup" className="px-3 py-2 sm:px-4 text-left text-xs font-bold text-[#476456]">
        {title}
      </th>
    </tr>
  );

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#dfe9df] bg-white">
      <table className="w-full border-collapse text-[13px] sm:text-sm">
        <thead>
          <tr className="border-b border-[#dfe9df] text-left text-xs text-[#6b7d72]">
            <th scope="col" className="px-3 py-3 sm:px-4 font-semibold">Parametre</th>
            <th scope="col" className="px-3 py-3 sm:px-4 font-semibold">Sonuç</th>
            <th scope="col" className="hidden px-3 py-3 sm:px-4 font-semibold sm:table-cell">Uygun aralık</th>
            <th scope="col" className="px-3 py-3 sm:px-4 font-semibold">Durum ve fark</th>
          </tr>
        </thead>
        {byGroup.map(({ g, rows }) => (
          <tbody key={g} className="divide-y divide-[#edf2ee]">
            {groupHeader(GROUP_LABELS[g])}
            {g === 'yapi' && report.bunyeSinifi && (
              <tr>
                <th scope="row" className="px-3 py-3 sm:px-4 text-left font-semibold">Bünye sınıfı</th>
                <td className="px-3 py-3 sm:px-4 font-bold">{report.bunyeSinifi}</td>
                <td className="hidden px-3 py-3 sm:px-4 text-[#8a978f] sm:table-cell">—</td>
                <td className="px-3 py-3 sm:px-4">
                  <StatusCell tone="bilgi" label="Bilgi" lab={!!report.labDegerlendirme.bunye} />
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
                    {def.label}
                    {def.unit && <span className="block text-xs font-normal text-[#8a978f]">{def.unit}</span>}
                  </th>
                  <td className="px-3 py-3 sm:px-4">
                    <span className="text-base font-bold tabular-nums">{formatNumber(r.value, 4)}</span>
                    <RangeBar k={r.key} value={r.value} tone={c.tone} />
                    {def.uygun && (
                      <span className="mt-1 block text-xs text-[#8a978f] sm:hidden">Uygun: {uygunAralikMetni(r.key)}</span>
                    )}
                  </td>
                  <td className="hidden px-3 py-3 sm:px-4 tabular-nums text-[#51675d] sm:table-cell">{uygunAralikMetni(r.key)}</td>
                  <td className="px-3 py-3 sm:px-4">
                    {isTexture ? (
                      <StatusCell tone="bilgi" label="Bilgi" />
                    ) : (
                      <StatusCell
                        tone={c.tone}
                        label={c.label}
                        fark={fark.durum === 'eksik' || fark.durum === 'fazla' ? fark.metin : undefined}
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
            {groupHeader('Diğer ölçümler')}
            {ek.map((e, i) => (
              <tr key={`ek-${i}`} className="align-top">
                <th scope="row" className="px-3 py-3 sm:px-4 text-left font-semibold">
                  {e.ad}
                  {e.birim && <span className="block text-xs font-normal text-[#8a978f]">{e.birim}</span>}
                </th>
                <td className="px-3 py-3 sm:px-4 text-base font-bold tabular-nums">{formatNumber(e.deger, 4)}</td>
                <td className="hidden px-3 py-3 sm:px-4 text-[#8a978f] sm:table-cell">—</td>
                <td className="px-3 py-3 sm:px-4">
                  <StatusCell tone="bilgi" label={e.labDegerlendirme || 'Bilgi'} lab={!!e.labDegerlendirme} />
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
  const r = 80;
  const c = Math.PI * r;
  return (
    <svg viewBox="0 0 200 116" className="w-full max-w-[240px]" role="img" aria-label={`Kalite indeksi ${yuzde} / 100`}>
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
  const sirali = [...indeks.satirlar].sort((a, b) => a.puan - b.puan);
  if (sade)
    return (
      <section className="mt-4 rounded-[24px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-6" aria-labelledby="tki">
        <h3 id="tki" className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#6d786f]">
          <Gauge size={16} className="text-[#2f7a4f]" /> Kalite indeksi neye göre hesaplandı?
        </h3>
        <p className="mt-1 text-xs text-[#8a968d]">
          {indeks.satirlar.length} parametrenin 0–5 puan ortalaması: {formatNumber(indeks.ortalama, 1)} / 5 → {indeks.yuzde} / 100
        </p>
        <ul className="mt-3 grid gap-x-10 md:grid-cols-2">
          {sirali.map((x) => (
            <li key={x.key} className="flex items-center justify-between gap-3 border-b border-[#1d2a22]/6 py-2.5">
              <span className="min-w-0 text-sm">
                <span className="font-semibold">{x.ad}</span>
                <span className="ml-2 tabular-nums text-xs text-[#8a968d]">
                  {formatNumber(x.deger, 3)} {x.birim}
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
    <section className="mt-8 overflow-hidden rounded-[28px] border border-[#dfe9df] bg-white" aria-labelledby="tki">
      <div className="grid gap-6 p-5 sm:p-8 md:grid-cols-[260px_1fr] md:gap-10">
        <div className="flex flex-col items-center justify-center text-center">
          <h2 id="tki" className="flex items-center gap-2 text-lg font-bold">
            <Gauge size={20} className="text-[#238f61]" />
            Toprak Kalite İndeksi
          </h2>
          <div className="mt-3 w-full">
            <IndeksGostergesi yuzde={indeks.yuzde} renk={indeks.renk} />
          </div>
          <div className="mt-1 rounded-full px-4 py-1 text-sm font-bold text-white" style={{ background: indeks.renk }}>
            {indeks.sinif}
          </div>
          <p className="mt-3 text-xs leading-5 text-[#75867a]">
            {indeks.satirlar.length} parametrenin 0–5 puan ortalaması ({formatNumber(indeks.ortalama, 1)} / 5)
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#51675d]">Parametre puanları</h3>
          <ul className="mt-3 divide-y divide-[#edf2ee]">
            {sirali.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0 text-sm">
                  <span className="font-semibold">{s.ad}</span>
                  <span className="ml-2 tabular-nums text-xs text-[#8a978f]">
                    {formatNumber(s.deger, 3)} {s.birim}
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
  return (
    <li className="rounded-2xl border border-[#e1ebdf] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="font-bold tracking-tight text-[#17352a]">{u.urun}</span>
        <span className="rounded-full bg-[#edf7ed] px-2.5 py-1 text-xs font-bold text-[#1f7a45]">{u.doz}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-[#4b5f55]">{u.aciklama}</p>
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

/** Kapağın hemen altı: kısa özet ve sorun başına "ne, ne kadar, ne zaman" kartları */
function OncelikliIsler({
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
  ilgi: { key: ParamKey; ad: string; tone: Tone; etiket: string }[];
}) {
  return (
    <section className="mt-6 rounded-[28px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-8" aria-labelledby="oncelik">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">Bir bilenden tavsiyeler</p>
      <h2 id="oncelik" className="mt-2 font-display text-3xl font-medium tracking-[-0.01em] sm:text-4xl">
        Önce bunları yapın
      </h2>
      {ilgi.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[#5b6f65]">İlgilenmeniz gerekenler</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {ilgi.map((x) => (
              <li key={x.key} className="flex items-center gap-2 rounded-full bg-[#f7f4ec] px-3 py-1.5 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: TON_RENK[x.tone] }} />
                <span className="font-semibold text-[#17352a]">{x.ad}</span>
                <span className="text-[#6d786f]">{x.etiket}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {aiState === 'loading' && (
        <div className="mt-5 flex items-center gap-3 text-[#64766c]">
          <Loader2 className="animate-spin" size={20} /> Analiz sonuçlarınıza göre öneriler hazırlanıyor…
        </div>
      )}
      {aiState === 'error' && (
        <div className="mt-5 text-sm text-[#7a4b00]">
          Öneriler şu anda hazırlanamadı.{' '}
          <button onClick={onRetryAi} className="font-bold underline">
            Tekrar dene
          </button>
        </div>
      )}

      {ai && (
        <>
          <p className="mt-3 max-w-[70ch] text-base leading-7 text-[#2a3d36]">{ai.ozet}</p>

          {ai.sorunlar?.length > 0 && (
            <ol className="mt-5 space-y-3">
              {ai.sorunlar.map((x, i) => (
                <li key={i} className="flex gap-4 rounded-2xl bg-[#f7f4ec] p-4 sm:p-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1d2a22] text-sm font-bold text-white">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#17352a]">{x.parametre}</h3>
                    <p className="mt-0.5 text-sm leading-6 text-[#5b6f65]">{x.etki}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {x.urunler.map((u, j) => (
                        <li key={j} className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-[#1d2a22]/8">
                          <span className="font-semibold text-[#17352a]">{u.urun}</span>
                          <span className="ml-2 font-bold text-[#1f7a45]">{u.doz}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-sm text-[#5b6f65]">
                      <span className="font-semibold text-[#2a3d36]">Ne zaman: </span>
                      {x.zaman}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {(ai.bitkiUygunlugu && report.bitki) || ai.bolgeNotu ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {ai.bitkiUygunlugu && report.bitki && (
                <p className="flex gap-3 rounded-2xl bg-[#eef8ea] p-4 text-sm leading-6">
                  <Sprout size={18} className="mt-0.5 shrink-0 text-[#2f7a4f]" />
                  <span>
                    <span className="font-bold">{report.bitki}: </span>
                    {ai.bitkiUygunlugu}
                  </span>
                </p>
              )}
              {ai.bolgeNotu && (
                <p className="flex gap-3 rounded-2xl bg-[#f6efe2] p-4 text-sm leading-6 text-[#4a3d22]">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-[#a87a2a]" />
                  <span>
                    <span className="font-bold">{report.ilce ? `${report.ilce}: ` : 'Bölgeniz: '}</span>
                    {ai.bolgeNotu}
                  </span>
                </p>
              )}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

/** Açılır-kapanır detay kutusu (varsayılan kapalı) */
function Detay({ baslik, alt, children }: { baslik: string; alt?: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl bg-white ring-1 ring-[#1d2a22]/8 open:pb-4 print:open">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block font-semibold text-[#17352a]">{baslik}</span>
          {alt && <span className="block text-xs text-[#7a877e]">{alt}</span>}
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
  // Özet ve "önce bunları yapın" listesi artık OncelikliIsler bileşeninde; burada yalnızca ürün grupları var.
  void report;
  void onRetryAi;
  if (!ai && !(omDusuk && aiState !== 'loading')) return null;
  return (
    <section className="mt-10 rounded-[28px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-8" aria-labelledby="cozum">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">Sezon boyunca</p>
      <h2 id="cozum" className="mt-2 flex items-center gap-2 font-display text-3xl font-medium tracking-[-0.01em] sm:text-4xl">
        <ClipboardList size={26} className="text-[#2f7a4f]" />
        Ürün önerileri
      </h2>

      {!ai && omDusuk && <OrganikMaddeProtokolu />}

      {ai && (
        <div className="mt-5 space-y-9">
          {omDusuk && <OrganikMaddeProtokolu />}
          <UrunBolumu icon={<Sprout size={20} />} title="Kök gelişimi ve toprak canlılığı" items={ai.kokGelisimi} />
          <UrunBolumu icon={<ShieldCheck size={20} />} title="İklim stresine karşı koruma (don, sıcak, kuraklık)" items={ai.iklimKoruma} />
          <UrunBolumu icon={<FlaskConical size={20} />} title="Toprağınıza göre gübreleme" items={ai.gubreleme} />
          {ai.sulamaNotlari && ai.sulamaNotlari.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-bold">
                <Droplets size={20} className="text-[#2f7f9a]" /> Sulama yönteminize göre
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#3e5248]">
                {ai.sulamaNotlari.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f7f9a]" />
                    {t}
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
  return (
    <div className="mt-5 rounded-[24px] border border-[#e6dcc4] bg-[#fdf9ef] p-5 sm:p-6">
      <h3 className="font-bold text-[#5c4410]">Organik madde düşük: uygulama protokolü</h3>
      <ul className="mt-3 divide-y divide-[#efe5cd] text-sm">
        {ORGANIK_MADDE_PROTOKOLU.map((p) => (
          <li key={p.urun} className="grid gap-1 py-2.5 sm:grid-cols-[1.3fr_0.8fr_1.5fr] sm:items-baseline sm:gap-4">
            <span className="font-bold text-[#3f300b]">{p.urun}</span>
            <span className="font-semibold tabular-nums text-[#1f7a45]">{p.doz}</span>
            <span className="text-[#5b4a22]">{p.uygulama}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Videolar({ bitki }: { bitki?: string }) {
  const list = VIDEOLAR.filter((v) => !v.bitki || v.bitki === bitki);
  if (!list.length) return null;
  return (
    <section className="mt-10 print:hidden" aria-labelledby="video">
      <h2 id="video" className="flex items-center gap-2 text-xl font-bold">
        <CirclePlay size={22} className="text-[#238f61]" />
        Uygulama videoları
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
                  title={v.baslik}
                  loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : null}
              <figcaption className="px-4 py-3 text-sm font-semibold">{v.baslik}</figcaption>
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

function ZamanCizelgesi({ yontem, sure }: { yontem: SulamaYontemi; sure: number }) {
  const dilimler = zamanCizelgesi(yontem, sure);
  if (!dilimler) return null;
  const dk = (s: string) => {
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m;
  };
  const toplam = dk(dilimler[dilimler.length - 1].bit) || 1;
  return (
    <div className="rounded-2xl border border-[#dbe7ee] bg-[#f6fafc] p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-bold text-[#17352a]">
          {yontem === 'pivot' ? `Bir tur (${formatNumber(sure, 1)} saat)` : `${formatNumber(sure, 1)} saatlik bir sulama`}
        </h4>
        <span className="text-xs text-[#6b7d72]">Gübre yalnızca yeşil pencerede verilir</span>
      </div>
      <div className="mt-3 flex h-9 overflow-hidden rounded-xl" role="img" aria-label="Sulama zaman çizelgesi">
        {dilimler.map((d, i) => (
          <div
            key={i}
            className="flex items-center justify-center text-xs font-bold"
            style={{
              width: `${((dk(d.bit) - dk(d.bas)) / toplam) * 100}%`,
              background: DILIM_RENK[d.tur],
              color: d.tur === 'gubre' ? '#fff' : '#2c5566',
            }}
          >
            {d.bas}–{d.bit}
          </div>
        ))}
      </div>
      <ol className="mt-3 grid gap-2 sm:grid-cols-3">
        {dilimler.map((d, i) => (
          <li key={i} className="text-sm leading-5">
            <span className="flex items-center gap-2 font-semibold text-[#17352a]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: DILIM_RENK[d.tur] }} />
              {d.bas}–{d.bit} · {d.baslik}
            </span>
            <span className="text-xs text-[#5b6f65]">{d.aciklama}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function SulamaRecetesi({ tarla }: { tarla: SonucTarla }) {
  const zkart = zkartBul(tarla.bitki ?? undefined);
  const y = SULAMA_YONTEMLERI[tarla.sulama];
  const sure = tarla.sulama_suresi_saat ?? y.varsayilanSure;
  const simdi = zkart ? simdikiEvreler(zkart) : [];
  const fertigasyon = (g: string) => g === 'Damla sulama' || g === 'Yağmurlama';

  return (
    <section className="mt-10" aria-labelledby="recete">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">Tohumdan hasada</p>
      <h2 id="recete" className="mt-2 flex items-center gap-2 font-display text-3xl font-medium tracking-[-0.01em] sm:text-4xl">
        <CalendarDays size={26} className="text-[#2f7a4f]" />
        Dönem dönem uygulama reçetesi
      </h2>
      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-[#e8f3e6] px-3 py-1 text-[#1f6f4a]">{tarla.bitki ?? 'Bitki seçilmedi'}</span>
        <span className="rounded-full bg-[#e3f0f6] px-3 py-1 text-[#2c5566]">{y.ad}</span>
        {tarla.alan_dekar ? (
          <span className="rounded-full bg-[#f3efe6] px-3 py-1 text-[#6b5520]">{formatNumber(tarla.alan_dekar, 1)} dekar</span>
        ) : null}
      </div>

      <div className="mt-5 space-y-5">
        {sure && (tarla.sulama === 'damla' || tarla.sulama === 'yagmurlama' || tarla.sulama === 'pivot') && (
          <ZamanCizelgesi yontem={tarla.sulama} sure={sure} />
        )}

        {!zkart && (
          <p className="rounded-2xl border border-[#e1e9df] bg-[#f8fbf7] p-4 text-sm text-[#4b5f55]">
            {tarla.bitki ? `"${tarla.bitki}" için dönem dönem program (Z-kart) henüz yok.` : 'Tarlanıza bitki ekleyin.'} Genel sulama kuralları
            aşağıdadır.
          </p>
        )}

        {zkart && (
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {zkart.evreler.map((e, i) => {
              const gruplar = evreUygulamalari(e, tarla.sulama);
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
                      <span className="flex-1 font-display text-lg font-medium leading-6">{e.evre}</span>
                    </div>
                    {suAn && (
                      <span className="absolute right-3 top-3 rounded-full bg-[#e2b65c] px-2.5 py-1 text-[11px] font-bold text-[#121410] shadow">Şu an bu dönem</span>
                    )}
                  </div>
                  <div className="flex-1 px-4 py-3">
                    <div className="text-xs text-[#7b8c82]">{[e.bbch && `BBCH ${e.bbch}`, e.donem].filter(Boolean).join(' · ')}</div>
                    {gruplar.length === 0 ? (
                      <p className="mt-3 text-sm text-[#7b8c82]">Bu dönemde uygulama yok.</p>
                    ) : (
                      gruplar.map((g) => (
                        <div key={g.yontem} className="mt-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#2f7f9a]">
                            {g.yontem}
                            {fertigasyon(g.yontem) && tarla.sulama !== 'salma' && tarla.sulama !== 'kuru' && (
                              <span className="rounded-full bg-[#e6f4ec] px-2 py-0.5 text-[10px] font-semibold text-[#1f7a45]">
                                {tarla.sulama === 'pivot' ? 'tur boyunca' : 'gübre penceresinde'}
                              </span>
                            )}
                          </div>
                          {g.not && <p className="mt-1 text-[11px] leading-4 text-[#8a6d2c]">{g.not}</p>}
                          <ul className="mt-1 space-y-1.5">
                            {g.urunler.map((u, j) => {
                              const toplam = toplamMiktar(u.doz, tarla.alan_dekar);
                              const enj =
                                tarla.sulama === 'pivot' && fertigasyon(g.yontem) ? pivotEnjeksiyon(u.doz, tarla.alan_dekar, sure) : undefined;
                              return (
                                <li key={j} className="text-sm">
                                  <div className="flex items-baseline justify-between gap-3">
                                    <span className="font-semibold text-[#17352a]">{u.urun}</span>
                                    <span className="text-right text-xs font-bold tabular-nums text-[#1f7a45]">{u.doz}</span>
                                  </div>
                                  {(toplam || enj) && (
                                    <div className="text-right text-[11px] text-[#6b7d72]">
                                      {toplam && <>Tarlanız için {toplam}</>}
                                      {toplam && enj && ' · '}
                                      {enj}
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <div className="rounded-2xl border border-[#e1e9df] bg-[#f8fbf7] p-4 sm:p-5">
          <h4 className="flex items-center gap-2 font-bold text-[#17352a]">
            <Droplets size={18} className="text-[#2f7f9a]" /> {y.ad}: dikkat edilecekler
          </h4>
          <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#3e5248]">
            {KURALLAR[tarla.sulama].map((k) => (
              <li key={k} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f7f9a]" />
                {k}
              </li>
            ))}
          </ul>
        </div>
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
  const d = karsilastir(once, simdi);
  if (!d.length) return null;
  const o = ozetle(d);
  const ia = kaliteIndeksi(once)?.yuzde;
  const ib = kaliteIndeksi(simdi)?.yuzde;
  const SONUC = {
    iyilesti: { ad: 'İyileşti', cls: 'bg-[#e6f4ec] text-[#1f7a45]' },
    kotulesti: { ad: 'Kötüleşti', cls: 'bg-[#fdecea] text-[#a83422]' },
    ayni: { ad: 'Değişmedi', cls: 'bg-[#eef1ef] text-[#5b6f65]' },
    uygun: { ad: 'Uygun kaldı', cls: 'bg-[#eef7e9] text-[#3c7a2c]' },
    bilgi: { ad: 'Değişti', cls: 'bg-[#e8eff4] text-[#3d6478]' },
  } as const;

  return (
    <section className="mt-10" aria-labelledby="karsilastirma">
      <h2 id="karsilastirma" className="text-xl font-bold">Önceki analizle karşılaştırma</h2>
      <p className="mt-1 text-sm text-[#64766c]">
        {onceTarih} → {simdiTarih}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
        {ia !== undefined && ib !== undefined && (
          <span className="rounded-full border border-[#dfe9df] bg-white px-3 py-1.5">
            Kalite indeksi {ia} → <span className={ib > ia ? 'text-[#1f7a45]' : ib < ia ? 'text-[#a83422]' : ''}>{ib}</span>
          </span>
        )}
        <span className="rounded-full bg-[#e6f4ec] px-3 py-1.5 text-[#1f7a45]">{o.iyilesen} iyileşti</span>
        <span className="rounded-full bg-[#fdecea] px-3 py-1.5 text-[#a83422]">{o.kotulesen} kötüleşti</span>
        <span className="rounded-full bg-[#eef1ef] px-3 py-1.5 text-[#5b6f65]">{o.ayni} değişmedi</span>
        {o.uygun > 0 && <span className="rounded-full bg-[#eef7e9] px-3 py-1.5 text-[#3c7a2c]">{o.uygun} uygun kaldı</span>}
      </div>
      <div className="mt-4 overflow-hidden rounded-[22px] border border-[#dfe9df] bg-white">
        <table className="w-full text-[13px] sm:text-sm">
          <thead>
            <tr className="border-b border-[#dfe9df] text-left text-xs text-[#6b7d72]">
              <th scope="col" className="px-3 py-3 font-semibold sm:px-4">Parametre</th>
              <th scope="col" className="px-3 py-3 text-right font-semibold sm:px-4">Önce</th>
              <th scope="col" className="px-3 py-3 text-right font-semibold sm:px-4">Şimdi</th>
              <th scope="col" className="px-3 py-3 font-semibold sm:px-4">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf2ee]">
            {d.map((x) => {
              const Ikon = x.yon === 'artti' ? ArrowUpRight : x.yon === 'azaldi' ? ArrowDownRight : Minus;
              return (
                <tr key={x.key}>
                  <th scope="row" className="px-3 py-2.5 text-left font-semibold sm:px-4">
                    {x.ad}
                    {x.birim && <span className="block text-xs font-normal text-[#8a978f]">{x.birim}</span>}
                  </th>
                  <td className="px-3 py-2.5 text-right tabular-nums text-[#6b7d72] sm:px-4">{formatNumber(x.once, 3)}</td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums sm:px-4">
                    <span className="inline-flex items-center gap-1">
                      <Ikon size={14} className="text-[#6b7d72]" />
                      {formatNumber(x.simdi, 3)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 sm:px-4">
                    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${SONUC[x.sonuc].cls}`}>{SONUC[x.sonuc].ad}</span>
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
  if (noktalar.length < 2) return null;
  const W = 560;
  const H = 180;
  const P = { l: 36, r: 16, t: 16, b: 34 };
  const x = (i: number) => P.l + (i * (W - P.l - P.r)) / (noktalar.length - 1);
  const y = (v: number) => P.t + ((100 - v) * (H - P.t - P.b)) / 100;
  const yol = noktalar.map((n, i) => `${i ? 'L' : 'M'}${x(i)},${y(n.indeks)}`).join(' ');
  return (
    <figure className="rounded-[22px] border border-[#dfe9df] bg-white p-4 sm:p-5">
      <figcaption className="text-sm font-bold text-[#17352a]">Kalite indeksi seyri</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label="Kalite indeksinin analizler boyunca değişimi">
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
              {n.tarih}
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
      <svg viewBox="0 0 300 172" className="w-full" role="img" aria-label={`Toprak kalite indeksi ${yuzde} / 100, ${sinif}`}>
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
          {sinif}
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
  const bilgiler = [tarih, report.raporNo && `Rapor ${report.raporNo}`, tarla.konum, tarla.bitki, SULAMA_YONTEMLERI[tarla.sulama]?.ad].filter(Boolean);
  const sirali = indeks ? [...indeks.satirlar].sort((a, b) => b.puan - a.puan) : [];
  const guclu = sirali.filter((x) => x.puan >= 4 && !sorunlu.includes(x.key)).slice(0, 3);
  const zayif = [...sirali].reverse().filter((x) => x.puan <= 2).slice(0, 3);

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-[#121410] text-white shadow-[0_40px_80px_-30px_rgba(18,20,16,.6)] print:rounded-none print:shadow-none">
      <div className="absolute inset-0 bg-[url('/toprak.jpg')] bg-cover bg-center" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-[#121410]/80 via-[#121410]/60 to-[#121410]/95" aria-hidden />

      <div className="relative p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#e2b65c]">Toprak karnesi</p>
        <h1 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-6xl">{tarla.ad}</h1>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
          {bilgiler.map((b) => (
            <span key={b as string} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
              {b}
            </span>
          ))}
        </div>

        {indeks ? (
          <div className="mt-8 grid items-center gap-8 md:grid-cols-[1fr_1.1fr] md:gap-12">
            <div className="flex flex-col items-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Toprak kalite indeksi</p>
              <KarneGostergesi yuzde={indeks.yuzde} sinif={indeks.sinif} renk={indeks.renk} />
            </div>
            <div>
              <p className="font-display text-2xl leading-snug sm:text-3xl">{SINIF_ACIKLAMA[indeks.sinif] ?? ''}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {guclu.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fd18f]">Güçlü yanları</p>
                    <ul className="mt-2 space-y-1.5">
                      {guclu.map((x) => (
                        <li key={x.key} className="flex items-center justify-between gap-3 text-sm">
                          <span>{x.ad}</span>
                          <PuanNoktalari puan={x.puan} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {zayif.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f0a58f]">Geliştirilmesi gerekenler</p>
                    <ul className="mt-2 space-y-1.5">
                      {zayif.map((x) => (
                        <li key={x.key} className="flex items-center justify-between gap-3 text-sm">
                          <span>{x.ad}</span>
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
          <p className="mt-6 max-w-md text-lg leading-7 text-white/80">Analiz değerleriniz aşağıda.</p>
        )}
      </div>

      {indeks && (
        <div className="relative grid grid-cols-3 border-t border-white/10 bg-[#121410]/70 backdrop-blur">
          {indeks.gruplar.map((g) => (
            <div key={g.grup} className="border-white/10 px-3 py-5 text-center [&:not(:first-child)]:border-l sm:px-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">{g.ad}</p>
              {g.yuzde !== null ? (
                <>
                  <p className="mt-1 font-display text-3xl tabular-nums">{g.yuzde}</p>
                  <div className="mx-auto mt-2 h-1.5 max-w-[120px] overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-[#e2b65c]" style={{ width: `${g.yuzde}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-white/45">{g.adet} ölçüm</p>
                </>
              ) : (
                <>
                  <p className="mt-1 font-display text-3xl text-white/30">–</p>
                  <p className="mt-1.5 text-[11px] leading-4 text-white/45">Ölçülmedi</p>
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
  const renkler = ['#d7301f', '#ef6548', '#fc8d59', '#fdbb84', '#f6d55c', '#c2d65a', '#7fc45a', '#3fae6a', '#2a9d8f', '#2b8cbe', '#3f6fb5', '#5b54a8', '#7a3f9d', '#8e2c86', '#6e1f6b'];
  const pct = Math.min(100, Math.max(0, (deger / 14) * 100));
  return (
    <div className="rounded-[24px] bg-white p-5 ring-1 ring-[#1d2a22]/8">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6d786f]">Asitlik (pH)</h3>
        <span className="font-display text-3xl">{formatNumber(deger, 2)}</span>
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
          <span>0 asidik</span>
          <span>7 nötr</span>
          <span>14 bazik</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-[#1d2a22]">{etiket}</p>
      <p className="text-xs text-[#6d786f]">Uygun: {uygunAralikMetni('ph')}</p>
    </div>
  );
}

/** Kum / silt / kil yığılmış çubuk */
function BunyeCubugu({ kum, silt, kil, sinif }: { kum?: number; silt?: number; kil?: number; sinif?: string }) {
  const parcalar = [
    { ad: 'Kum', v: kum, renk: '#d9b98c' },
    { ad: 'Silt', v: silt, renk: '#a77f55' },
    { ad: 'Kil', v: kil, renk: '#6b4a2f' },
  ].filter((p) => p.v !== undefined) as { ad: string; v: number; renk: string }[];
  const toplam = parcalar.reduce((t, p) => t + p.v, 0) || 1;
  return (
    <div className="rounded-[24px] bg-white p-5 ring-1 ring-[#1d2a22]/8">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6d786f]">Toprağın yapısı (bünye)</h3>
      <p className="mt-1 font-display text-2xl leading-tight">{sinif ?? 'Bünye'}</p>
      <div className="mt-4 flex h-10 overflow-hidden rounded-xl">
        {parcalar.map((p) => (
          <span
            key={p.ad}
            className="flex items-center justify-center text-[11px] font-bold text-white"
            style={{ width: `${(p.v / toplam) * 100}%`, background: p.renk }}
          >
            {p.v / toplam > 0.12 && `%${formatNumber(p.v, 0)}`}
          </span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#5e6a60]">
        {parcalar.map((p) => (
          <span key={p.ad} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.renk }} /> {p.ad} %{formatNumber(p.v, 1)}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Uygun aralığı gösteren yatay çubuk (kalın) */
function DegerCubugu({ r }: { r: ParamResult }) {
  const def = PARAMS[r.key];
  const u = def.uygun;
  const tone = r.classification?.tone ?? 'bilgi';
  const ref = u?.max ?? (u?.min ?? r.value) * 2;
  const hi = Math.max(r.value, ref) * 1.2 || 1;
  const pct = (x: number) => Math.min(100, Math.max(0, (x / hi) * 100));
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold uppercase tracking-wide text-[#3f4a42]">{def.label}</span>
        <span className="text-sm tabular-nums">
          <span className="font-bold">{formatNumber(r.value, 3)}</span> <span className="text-xs text-[#8a968d]">{def.unit}</span>
        </span>
      </div>
      <div className="relative mt-1.5 h-3.5 overflow-hidden rounded-full bg-[#ece6da]">
        {u && <div className="absolute inset-y-0 bg-[#cfe6c6]" style={{ left: `${pct(u.min ?? 0)}%`, width: `${pct(u.max ?? hi) - pct(u.min ?? 0)}%` }} />}
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct(r.value)}%`, background: TON_RENK[tone] }} />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-[#8a968d]">
        <span style={{ color: tone === 'iyi' ? '#2f7a4f' : tone === 'sorun' ? '#b4432f' : tone === 'dikkat' ? '#9a6b12' : undefined }} className="font-semibold">
          {r.classification?.label}
        </span>
        {u && <span>Uygun: {uygunAralikMetni(r.key)}</span>}
      </div>
    </li>
  );
}

function Gostergeler({ report, results }: { report: SoilReport; results: ParamResult[] }) {
  const ph = results.find((r) => r.key === 'ph');
  const v = report.values;
  const bunyeVar = v.kum !== undefined || v.silt !== undefined || v.kil !== undefined;
  const cubuklar = results.filter((r) => !['ph', 'kum', 'silt', 'kil', 'doygunluk'].includes(r.key) && r.classification);
  if (!ph && !bunyeVar && cubuklar.length === 0) return null;
  return (
    <section className="mt-10" aria-labelledby="gostergeler">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">Bir bakışta</p>
      <h2 id="gostergeler" className="mt-2 font-display text-3xl font-medium tracking-[-0.01em] sm:text-4xl">Toprağınızın durumu</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {ph?.classification && <PhSkalasi deger={ph.value} etiket={ph.classification.label} />}
        {bunyeVar && <BunyeCubugu kum={v.kum} silt={v.silt} kil={v.kil} sinif={report.bunyeSinifi} />}
      </div>
      {cubuklar.length > 0 && (
        <div className="mt-4 rounded-[24px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6d786f]">Besin ve kimyasal durum</h3>
          <ul className="mt-4 grid gap-x-10 gap-y-5 md:grid-cols-2">
            {cubuklar.map((r) => (
              <DegerCubugu key={r.key} r={r} />
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-2 text-[11px] text-[#8a968d]">
            <span className="h-2.5 w-5 rounded-full bg-[#cfe6c6]" /> Açık yeşil alan: uygun aralık
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

      {/* 1) Ne yapmalı? */}
      <OncelikliIsler report={report} ai={ai} aiState={aiState} onRetryAi={onRetryAi} ilgi={ilgi} />

      {/* 2) Dönem dönem program */}
      <SulamaRecetesi tarla={tarla} />

      {/* 3) Değerler: tek görünüm */}
      <Gostergeler report={report} results={results} />

      {onceki && <Karsilastirma once={onceki.rapor} simdi={report} onceTarih={onceki.tarih} simdiTarih={onceki.simdiTarih} />}

      {/* 4) Diğer ürün önerileri */}
      <SolutionPlan report={report} ai={ai} aiState={aiState} onRetryAi={onRetryAi} omDusuk={omDusuk} />

      <Videolar bitki={zkartBul(tarla.bitki ?? undefined)?.bitki} />

      {/* 5) Teknik detaylar: varsayılan kapalı */}
      <section className="mt-10 space-y-3" aria-labelledby="detaylar">
        <h2 id="detaylar" className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7a877e]">
          Detaylar
        </h2>
        <Detay baslik="Laboratuvar tablosu" alt="Tüm ölçümler, uygun aralıklar ve farklar">
          <AnalysisTable report={report} results={results} />
        </Detay>
        {indeks && (
          <Detay baslik="Kalite indeksi nasıl hesaplandı?" alt={`${indeks.satirlar.length} ölçümün 0–5 puan ortalaması → ${indeks.yuzde}/100`}>
            <KaliteIndeksi indeks={indeks} sade />
          </Detay>
        )}
        <Detay baslik="Bu değerler ne anlama geliyor?">
          <dl className="space-y-3 px-2 text-sm">
            {results.map((r) => (
              <div key={r.key}>
                <dt className="font-semibold">{PARAMS[r.key].label}</dt>
                <dd className="text-[#5b6f65]">{PARAMS[r.key].why}</dd>
              </div>
            ))}
          </dl>
        </Detay>
      </section>

      {eylemler && <div className="mt-10 flex flex-col gap-3 sm:flex-row print:hidden">{eylemler}</div>}
    </div>
  );
}
