/**
 * Prof. Dr. Metin Turan'ın HUMINTECH atlasındaki uygulama programı (public/atlas/program.json).
 * Veri atlastan çıkarılır: `python3 scripts/atlas-program.py`.
 *
 * Buradaki `hocaEvreUygulamalari`, atlasın kendi `progApps` fonksiyonunun birebir karşılığıdır
 * (public/atlas/index.html, "soil transformation of a stage programme"): toprak tipine göre ürün değişimi,
 * doz çarpanı, damlada mineral gübrede −%35 ve toprağa özel ek ürünler. Böylece rapordaki liste,
 * gömülü atlasın "Program" sekmesinde görünenle aynı olur.
 */
import type { SulamaYontemi } from './sulama';

export type Uyg = [urun: string, doz: string | null, nasil: string | null, alt: 0 | 1];
type Kosul = { modes?: string[]; q?: string[]; lime?: number };
export type HocaToprak = {
  ad: [string, string];
  /** Sezon öncesi toprak düzeltmesi */
  on: ({ p: string; d: string; alt: 0 | 1; t: [string, string] } & Kosul)[];
  yerine: Record<string, string | null>;
  carpan: Record<string, number>;
  ek: ({ p: string; d: string; n?: string; col: number; stages: number[] | 'foliar' } & Kosul)[];
};
export type Program = {
  /** kod → [Türkçe ad, İngilizce ad, tür]; tür H/B = Humintech ürünü, M/G = mineral gübre, S = toprak düzenleyici */
  urun: Record<string, [string, string, string]>;
  nasil: Record<string, [string, string]>;
  basliklar: Record<string, [string[], string[]]>;
  toprak?: Record<string, HocaToprak>;
  bitki: Record<
    string,
    { modlar: string[]; q?: string; kirec?: number; evreler: { ad: [string, string]; bbch?: string; P: Record<string, { u: Uyg[][]; not: [string, string] | null }> }[] }
  >;
};

/** Tarlanın sulama yöntemi → atlasın rejimi ve gösterilecek sütunlar */
export function rejimSec(modlar: string[], y?: SulamaYontemi): { mod: string; sutun: number[] } {
  const ilk = (...a: string[]) => a.find((m) => modlar.includes(m));
  if (y === 'kuru') return { mod: ilk('dry', 'dryp') ?? modlar[0], sutun: [0, 1, 2] };
  if (y === 'salma') return { mod: ilk('salma', 'flood', 'irr') ?? modlar[0], sutun: [0, 1, 2] };
  const mod = ilk('irr', 'pivot', 'orch', 'palm') ?? modlar[0];
  if (mod !== 'irr') return { mod, sutun: [0, 1, 2] };
  return { mod, sutun: y === 'damla' ? [0, 2] : y === 'yagmurlama' || y === 'pivot' ? [1, 2] : [0, 1, 2] };
}

export type HocaUyg = {
  p: string;
  d: string | null;
  n: string | null;
  alt: boolean;
  /** Toprak tipi yüzünden yerine geçtiği ürünün kodu */
  yerine?: string;
  /** Toprak tipi doz çarpanı (ör. 1,5) */
  carpan?: number;
  /** Damlada mineral gübre −%35 uygulandı */
  damla?: boolean;
  /** Toprak tipinin eklediği ürün */
  ek?: boolean;
};

const DAMLA_MOD = ['irr', 'palm'];
const INDIRIM_DISI = ['LIME', 'GYP', 'S0', 'BCH', 'FEG', 'FE', 'ZNMN', 'ME', 'MEMO', 'BORG', 'HNO3', 'H3PO4', 'CAB'];

/** Atlastaki mulDose: dozdaki sayıları çarpar, atlasın yuvarlamasıyla */
export function dozCarp(d: string, k: number): string {
  return d.replace(/(\d+(?:\.\d+)?)/g, (m) => {
    const v = parseFloat(m) * k;
    return String(v >= 100 ? Math.round(v / 10) * 10 : v >= 20 ? Math.round(v / 5) * 5 : v >= 5 ? Math.round(v) : Math.round(v * 2) / 2);
  });
}

const kosulUygun = (r: Kosul, mod: string, b: { q?: string; kirec?: number }) =>
  !(r.modes && !r.modes.includes(mod)) && !(r.q && !r.q.includes(b.q ?? '')) && !(r.lime && (b.kirec ?? 0) < r.lime);

/** Bir dönemin üç uygulama yolu; toprak tipine göre düzeltilmiş (atlasın progApps fonksiyonu) */
export function hocaEvreUygulamalari(prog: Program, kod: string, mod: string, toprakId: string | undefined, i: number): HocaUyg[][] {
  const b = prog.bitki[kod];
  const e = b?.evreler[i];
  const cikti: HocaUyg[][] = [[], [], []];
  if (!b || !e) return cikti;
  const taban = (e.P[mod] ?? e.P[b.modlar[0]])?.u ?? [];
  const S = (toprakId && prog.toprak?.[toprakId]) || undefined;
  const mineral = (p: string) => {
    const t = prog.urun[p]?.[2];
    return (t === 'M' || t === 'G') && !INDIRIM_DISI.includes(p);
  };
  taban.forEach((sutun, ci) =>
    sutun.forEach(([p0, d0, n, alt]) => {
      const x: HocaUyg = { p: p0, d: d0, n, alt: !!alt };
      if (S && ci < 2 && S.yerine[x.p] !== undefined && !(mod === 'flood' && x.p === 'UREA')) {
        const yeni = S.yerine[x.p];
        if (yeni === null) return;
        x.yerine = x.p;
        x.p = yeni;
      }
      if (S?.carpan[x.p] && x.d) {
        x.d = dozCarp(x.d, S.carpan[x.p]);
        x.carpan = S.carpan[x.p];
      }
      if (ci === 0 && DAMLA_MOD.includes(mod) && x.d && mineral(x.p) && /^\d[\d.–]*\s*(kg|L)\/ha$/.test(x.d)) {
        x.d = dozCarp(x.d, 0.65);
        x.damla = true;
      }
      const onceki = cikti[ci][cikti[ci].length - 1];
      if (onceki && onceki.p === x.p) return;
      cikti[ci].push(x);
    }),
  );
  S?.ek.forEach((r) => {
    if (!kosulUygun(r, mod, b)) return;
    const evreler = r.stages === 'foliar' ? (cikti[2].length ? [i] : []) : r.stages;
    if (!evreler.includes(i)) return;
    if (cikti[r.col].some((x) => x.p === r.p)) return;
    cikti[r.col].push({ p: r.p, d: r.d || null, n: r.n ?? null, alt: false, ek: true });
  });
  return cikti;
}

/** Atlas ürün kodu → rapordaki Humintech kataloğu adı (lib/humintech.ts). Katalogda olmayanlar atlastaki adıyla gösterilir. */
const KATALOG_ADI: Record<string, string> = { SS: 'PERLHUMUS Granül', CAB: 'MICROSENSE Ca & B', SHL: 'FULVAGRA Liquid 25' };
/** Katalogda sayfası olmayan ürünlerin kısa görevi (hocanın atlasındaki açıklamalardan) */
export const HOCA_URUN_ROL: Record<string, string> = {
  'BIOHEALTH Myco': 'Kök bölgesine verilir: kök biyolojisini kurar, bağlı fosforu çözer, suyu daha derinden aldırır.',
  'MICROSENSE Silicium': 'Yapraktan, stres döneminden 5–10 gün önce: su kaybını azaltır, sıcak, kuraklık ve dona karşı korur.',
  OBM: 'Enzim bazlı (kitinaz + proteaz): hastalık ve zararlı programına eklenir.',
};
export const humintechMi = (prog: Program, p: string) => ['H', 'B'].includes(prog.urun[p]?.[2] ?? '');

export type HocaUrunToplami = {
  kod: string;
  ad: string;
  /** Sezon toplamı, dekar başına (atlas hektar verir: ÷10) */
  a?: { min: number; max: number };
  birim?: 'kg' | 'L';
  /** Suya karıştırılan (derişimle verilen) uygulama sayısı ve derişimi, ör. "1 L / 100 L" */
  yaprak: number;
  yaprakDoz?: string;
  /** Toplamın içinde sezon öncesi toprak düzeltmesi var */
  onHazirlik?: boolean;
};

/**
 * Sezon boyunca alınacak Humintech ürünleri: hocanın programındaki bütün dönemlerin toplamı.
 * Yalnız tarlanın sulama yöntemine uyan uygulama yolları sayılır (damla ile yağmurlama birbirinin seçeneğidir, ikisi birden toplanmaz).
 */
export function hocaHumintechToplami(prog: Program, kod: string, sulama: SulamaYontemi | undefined, toprakId?: string): HocaUrunToplami[] {
  const b = prog.bitki[kod];
  if (!b) return [];
  const { mod, sutun } = rejimSec(b.modlar, sulama);
  const yollar = DAMLA_MOD.includes(mod) && sutun.includes(0) && sutun.includes(1) ? sutun.filter((s) => s !== 1) : sutun;
  const liste = new Map<string, HocaUrunToplami>();
  const al = (p: string) => {
    if (!liste.has(p)) liste.set(p, { kod: p, ad: KATALOG_ADI[p] ?? prog.urun[p][0].replace(/\s*\(.*\)$/, ''), yaprak: 0 });
    return liste.get(p)!;
  };
  const ekle = (p: string, d: string | null, on = false) => {
    if (!humintechMi(prog, p) || !d) return;
    const t = al(p);
    const m = d.match(/^([\d.]+)(?:\s*–\s*([\d.]+))?\s*(kg|L)\/ha$/);
    if (m) {
      const min = parseFloat(m[1]) / 10;
      const max = (m[2] ? parseFloat(m[2]) : parseFloat(m[1])) / 10;
      t.a = { min: (t.a?.min ?? 0) + min, max: (t.a?.max ?? 0) + max };
      t.birim = m[3] as 'kg' | 'L';
      if (on) t.onHazirlik = true;
    } else {
      t.yaprak += 1;
      t.yaprakDoz = d;
    }
  };
  b.evreler.forEach((_, i) => {
    const u = hocaEvreUygulamalari(prog, kod, mod, toprakId, i);
    yollar.forEach((s) => u[s].forEach((x) => !x.alt && ekle(x.p, x.d)));
  });
  const S = (toprakId && prog.toprak?.[toprakId]) || undefined;
  S?.on.forEach((r) => !r.alt && !r.d.startsWith('×') && kosulUygun(r, mod, b) && ekle(r.p, r.d, true));
  const yuvarla = (x: number) => Math.round(x * 1000) / 1000;
  return [...liste.values()].map((t) => (t.a ? { ...t, a: { min: yuvarla(t.a.min), max: yuvarla(t.a.max) } } : t));
}

/** "1 L / 100 L" → { miktar: "1 L", su: "100" }; "100 g / 100 L (≈1 kg/ha)" da okunur */
export function derisimOku(d: string): { miktar: string; su: string } | undefined {
  const m = d.match(/^([\d.]+)\s*(L|ml|g|kg)\s*\/\s*(\d+)\s*L/);
  return m ? { miktar: `${m[1].replace('.', ',')} ${m[2]}`, su: m[3] } : undefined;
}
