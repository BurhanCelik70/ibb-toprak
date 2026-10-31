/**
 * Sulama suyu analizi: birim çevirme, hesaplanan göstergeler ve sınıflandırma.
 *
 * Dayanaklar
 * - ABD Tuzluluk Laboratuvarı (Richards, 1954, USDA Handbook 60): C1–C4 tuzluluk ve S1–S4 sodyum sınıfları
 *   (S sınırları diyagramdaki eğik çizgiler: SAR = a − b·log10(EC µS/cm)).
 * - FAO Sulama ve Drenaj Yayını 29 (Ayers ve Westcot, 1985): Tablo 1 (kısıtlama derecesi), Tablo 4 (bitki tuz toleransı),
 *   Tablo 16 (bitki bor toleransı), yıkama ihtiyacı LR = ECw / (5·ECe − ECw).
 * - Kalıntı sodyum karbonat (RSC): Eaton (1950); <1,25 güvenli, 1,25–2,5 dikkat, >2,5 uygun değil.
 * - Damlada tıkanma riski (pH): Nakayama ve Bucks (1991) — pH <7 düşük, 7–8 orta, >8 yüksek.
 * Hesaplar kodda yapılır; yapay zeka yalnızca sonucu sade dille anlatır.
 */
import { zkartBul } from './igsas';
import type { SulamaYontemi } from './sulama';

export type Ton = 'iyi' | 'dikkat' | 'sorun' | 'bilgi';

/** Kayıtta saklanan değerler (standart birimlerde) */
export type SuDegerleri = {
  ec?: number; // µS/cm
  ph?: number;
  na?: number; // me/l
  ca?: number; // me/l
  mg?: number; // me/l
  caMg?: number; // me/l (laboratuvar yalnızca Ca+Mg verdiyse)
  k?: number; // me/l
  co3?: number; // me/l
  hco3?: number; // me/l
  cl?: number; // me/l
  so4?: number; // me/l
  b?: number; // mg/l
  no3n?: number; // mg/l (nitrat azotu)
  sarLab?: number; // laboratuvarın yazdığı SAR (hesaplanamazsa kullanılır)
};

export type SuRaporu = {
  raporNo?: string;
  raporTarihi?: string;
  kaynakAdi?: string; // kuyu, kanal, dere…
  labSinif?: string; // laboratuvarın yazdığı sınıf, ör. "C3S1"
  degerler: SuDegerleri;
};

export type SuAlan = keyof Omit<SuDegerleri, 'sarLab'>;

/** Elle giriş alanları; eşdeğer ağırlık mg/l → me/l çevirmek için */
export const SU_ALANLARI: { key: SuAlan; ad: string; kisa: string; tip: 'ec' | 'ph' | 'iyon' | 'mgl'; esdeger?: number; ipucu: string }[] = [
  { key: 'ec', ad: 'Elektriksel iletkenlik (EC)', kisa: 'EC', tip: 'ec', ipucu: 'Suyun tuzluluğu. Raporda µS/cm, mmhos/cm ya da dS/m yazar.' },
  { key: 'ph', ad: 'pH', kisa: 'pH', tip: 'ph', ipucu: 'Genelde 6,5–8,5 arası.' },
  { key: 'na', ad: 'Sodyum (Na)', kisa: 'Na', tip: 'iyon', esdeger: 22.99, ipucu: '' },
  { key: 'ca', ad: 'Kalsiyum (Ca)', kisa: 'Ca', tip: 'iyon', esdeger: 20.04, ipucu: '' },
  { key: 'mg', ad: 'Magnezyum (Mg)', kisa: 'Mg', tip: 'iyon', esdeger: 12.15, ipucu: 'Raporda yalnızca "Ca+Mg" varsa aşağıdaki kutuya yazın.' },
  { key: 'caMg', ad: 'Kalsiyum + Magnezyum (Ca+Mg)', kisa: 'Ca+Mg', tip: 'iyon', esdeger: 16.5, ipucu: 'Yalnızca Ca ve Mg ayrı yazmıyorsa.' },
  { key: 'k', ad: 'Potasyum (K)', kisa: 'K', tip: 'iyon', esdeger: 39.1, ipucu: '' },
  { key: 'co3', ad: 'Karbonat (CO₃)', kisa: 'CO₃', tip: 'iyon', esdeger: 30.0, ipucu: 'Çoğu suda 0 ya da çok düşüktür.' },
  { key: 'hco3', ad: 'Bikarbonat (HCO₃)', kisa: 'HCO₃', tip: 'iyon', esdeger: 61.02, ipucu: '' },
  { key: 'cl', ad: 'Klorür (Cl)', kisa: 'Cl', tip: 'iyon', esdeger: 35.45, ipucu: '' },
  { key: 'so4', ad: 'Sülfat (SO₄)', kisa: 'SO₄', tip: 'iyon', esdeger: 48.03, ipucu: '' },
  { key: 'b', ad: 'Bor (B)', kisa: 'B', tip: 'mgl', ipucu: 'mg/l ile ppm aynıdır.' },
  { key: 'no3n', ad: 'Nitrat azotu (NO₃-N)', kisa: 'NO₃-N', tip: 'mgl', ipucu: 'Raporda nitrat (NO₃) yazıyorsa 4,43’e bölün.' },
];

export type EcBirim = 'µS/cm' | 'dS/m';
export type IyonBirim = 'me/l' | 'mg/l';

/**
 * Yazıyı sayıya çevirir. Türkçede ondalık virgüldür; "1.340" gibi binlik noktalı yazım 1340 sayılır,
 * "1,34" ise 1,34. (Laboratuvar raporlarında EC sık sık "1.340" diye yazılır.)
 */
export function sayiCoz(x: unknown): number | undefined {
  if (typeof x === 'number') return Number.isFinite(x) ? x : undefined;
  if (typeof x !== 'string') return undefined;
  const t = x.replace(/[^\d.,-]/g, '');
  if (!t || t === '-') return undefined;
  if (/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(t)) return Number(t.replace(/\./g, ''));
  const n = Number(t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t);
  return Number.isFinite(n) ? n : undefined;
}

/** Girilen değeri standart birime çevirir */
export function standartla(key: SuAlan, deger: number, ecBirim: EcBirim, iyonBirim: IyonBirim): number {
  const a = SU_ALANLARI.find((x) => x.key === key)!;
  if (a.tip === 'ec') return ecBirim === 'dS/m' ? deger * 1000 : deger;
  if (a.tip === 'iyon' && iyonBirim === 'mg/l' && a.esdeger) return deger / a.esdeger;
  return deger;
}

/** Birim yazısından (raporu okurken) çevirme */
export function birimdenStandart(key: SuAlan, deger: number, birim?: string): number {
  const b = (birim ?? '').toLocaleLowerCase('tr-TR').replace(/\s/g, '');
  const a = SU_ALANLARI.find((x) => x.key === key)!;
  if (a.tip === 'ec') {
    if (/ds\/m|ms\/cm|mmho/.test(b)) return deger * 1000;
    // Sulama suyunun EC'si pratikte 20 µS/cm'nin altında olmaz: bu kadar küçük sayı dS/m (mmhos/cm) yazılmış demektir
    return deger < 20 ? deger * 1000 : deger;
  }
  if (a.tip === 'iyon') {
    if (/mg\/l|ppm|mg\/lt/.test(b) && a.esdeger) return deger / a.esdeger;
    return deger; // me/l, meq/l, mmolc/l
  }
  return deger;
}

// ───────────── Hesaplanan göstergeler ─────────────

export function caMgToplam(d: SuDegerleri): number | undefined {
  if (d.ca !== undefined && d.mg !== undefined) return d.ca + d.mg;
  return d.caMg;
}

/** SAR = Na / √((Ca+Mg)/2), me/l */
export function sarHesapla(d: SuDegerleri): number | undefined {
  const cm = caMgToplam(d);
  if (d.na === undefined || cm === undefined || cm <= 0) return d.sarLab;
  return d.na / Math.sqrt(cm / 2);
}

/** RSC = (CO₃ + HCO₃) − (Ca + Mg), me/l */
export function rscHesapla(d: SuDegerleri): number | undefined {
  const cm = caMgToplam(d);
  if (d.hco3 === undefined || cm === undefined) return undefined;
  return (d.co3 ?? 0) + d.hco3 - cm;
}

/** Sodyum yüzdesi */
export function naYuzde(d: SuDegerleri): number | undefined {
  const cm = caMgToplam(d);
  if (d.na === undefined || cm === undefined) return undefined;
  const top = d.na + cm + (d.k ?? 0);
  return top > 0 ? ((d.na + (d.k ?? 0)) / top) * 100 : undefined;
}

// ───────────── ABD Tuzluluk Laboratuvarı (C–S) ─────────────

export const C_SINIFLARI = [
  { sinif: 'C1', ust: 250, ad: 'Az tuzlu', aciklama: 'Hemen her bitkide ve toprakta kullanılabilir.', ton: 'iyi' as Ton },
  { sinif: 'C2', ust: 750, ad: 'Orta tuzlu', aciklama: 'Biraz yıkama ile çoğu bitkide kullanılabilir; tuza çok hassas bitkilerde dikkat.', ton: 'iyi' as Ton },
  { sinif: 'C3', ust: 2250, ad: 'Yüksek tuzlu', aciklama: 'Drenajı iyi toprakta, tuza dayanıklı bitkilerde ve düzenli yıkama ile kullanılabilir.', ton: 'dikkat' as Ton },
  { sinif: 'C4', ust: Infinity, ad: 'Çok yüksek tuzlu', aciklama: 'Normal koşullarda sulamaya uygun değildir; ancak çok dayanıklı bitkilerde, bol yıkama ile.', ton: 'sorun' as Ton },
];
export const S_SINIFLARI = [
  { sinif: 'S1', ad: 'Az sodyumlu', aciklama: 'Toprağın yapısına zarar vermez.', ton: 'iyi' as Ton },
  { sinif: 'S2', ad: 'Orta sodyumlu', aciklama: 'İnce bünyeli (killi) topraklarda zamanla sıkışma yapabilir.', ton: 'dikkat' as Ton },
  { sinif: 'S3', ad: 'Yüksek sodyumlu', aciklama: 'Toprağı bozar; jips (alçı taşı) ve organik madde gerekir.', ton: 'sorun' as Ton },
  { sinif: 'S4', ad: 'Çok yüksek sodyumlu', aciklama: 'Genelde sulamaya uygun değildir.', ton: 'sorun' as Ton },
];

/** S sınırları (Richards diyagramı): SAR = a − b·log10(EC) */
export const S_CIZGILERI = [
  { a: 18.87, b: 4.44 }, // S1 / S2
  { a: 31.31, b: 6.66 }, // S2 / S3
  { a: 43.75, b: 8.87 }, // S3 / S4
];
export const sSiniri = (i: number, ec: number) => S_CIZGILERI[i].a - S_CIZGILERI[i].b * Math.log10(Math.max(100, ec));

export function cSinifi(ec?: number) {
  if (ec === undefined) return undefined;
  return C_SINIFLARI.find((c) => ec < c.ust)!;
}
export function sSinifi(sar?: number, ec?: number) {
  if (sar === undefined) return undefined;
  const e = ec ?? 100;
  const i = S_CIZGILERI.findIndex((_, j) => sar < sSiniri(j, e));
  return S_SINIFLARI[i === -1 ? 3 : i];
}

// ───────────── Bitki toleransları (FAO Tablo 4 ve 16) ─────────────

/** ECw (dS/m): %100, %90, %75, %50 verim ve büyümenin durduğu nokta (FAO Tablo 4) */
const TUZ_TABLO: Record<string, [number, number, number, number, number]> = {
  Buğday: [4.0, 4.9, 6.3, 8.7, 13],
  Arpa: [5.3, 6.7, 8.7, 12, 19],
  'Mısır (dane)': [1.1, 1.7, 2.5, 3.9, 6.7],
  Pamuk: [5.1, 6.4, 8.4, 12, 18],
  'Şeker pancarı': [4.7, 5.8, 7.5, 10, 16],
  'Çeltik (pirinç)': [2.0, 2.6, 3.4, 4.8, 7.6],
  Patates: [1.1, 1.7, 2.5, 3.9, 6.7],
  Domates: [1.7, 2.3, 3.4, 5.0, 8.4],
  Salatalık: [1.7, 2.2, 2.9, 4.2, 6.8],
  Soğan: [0.8, 1.2, 1.8, 2.9, 5.0],
  'Üzüm (bağ)': [1.0, 1.7, 2.7, 4.5, 7.9],
  'Şeftali / nektarin': [1.1, 1.5, 1.9, 2.7, 4.3],
  Kayısı: [1.1, 1.3, 1.8, 2.5, 3.8],
  'Narenciye (mandalina)': [1.1, 1.6, 2.2, 3.2, 5.3],
  Keten: [1.1, 1.7, 2.5, 3.9, 6.7],
};
/** Sayısal değeri olmayan bitkiler için göreli tolerans (FAO Tablo 5) */
const TUZ_GORELI: Record<string, string> = {
  Ayçiçeği: 'orta derecede hassas',
  Susam: 'hassas',
  Elma: 'hassas',
  Zeytin: 'orta derecede dayanıklı',
  İncir: 'orta derecede dayanıklı',
  Nar: 'orta derecede dayanıklı',
};
/** Bor toleransı (mg/l): [uyarı başlangıcı, sorun sınırı] (FAO Tablo 16, aralığın alt ve üst ucu) */
const BOR_TABLO: Record<string, [number, number, string]> = {
  Buğday: [0.75, 1.0, 'hassas'],
  Arpa: [0.75, 1.0, 'hassas'],
  Ayçiçeği: [0.75, 1.0, 'hassas'],
  Susam: [0.75, 1.0, 'hassas'],
  'Mısır (dane)': [2.0, 4.0, 'orta derecede dayanıklı'],
  Tütün: [2.0, 4.0, 'orta derecede dayanıklı'],
  Pamuk: [6.0, 15.0, 'çok dayanıklı'],
  'Şeker pancarı': [4.0, 6.0, 'dayanıklı'],
  Domates: [4.0, 6.0, 'dayanıklı'],
  Patates: [1.0, 2.0, 'orta derecede hassas'],
  Salatalık: [1.0, 2.0, 'orta derecede hassas'],
  Soğan: [0.5, 0.75, 'hassas'],
  'Üzüm (bağ)': [0.5, 0.75, 'hassas'],
  'Şeftali / nektarin': [0.5, 0.75, 'hassas'],
  Kayısı: [0.5, 0.75, 'hassas'],
  'Narenciye (mandalina)': [0.5, 0.75, 'hassas'],
  İncir: [0.5, 0.75, 'hassas'],
};

export function katalogBitki(bitki?: string | null): string | undefined {
  if (!bitki) return undefined;
  if (/keten/i.test(bitki)) return 'Keten';
  return zkartBul(bitki)?.bitki;
}
const bitkiKisa = (b: string) => b.replace(/\s*\(.*\)/, '').replace(/\s*\/.*$/, '');

/** Bu tuzlulukta beklenen verim (%); tablo yoksa undefined */
export function tuzVerimi(bitki: string | undefined, ecUs?: number): number | undefined {
  if (!bitki || ecUs === undefined) return undefined;
  const t = TUZ_TABLO[bitki];
  if (!t) return undefined;
  const ec = ecUs / 1000;
  const noktalar: [number, number][] = [[t[0], 100], [t[1], 90], [t[2], 75], [t[3], 50], [t[4], 0]];
  if (ec <= t[0]) return 100;
  for (let i = 1; i < noktalar.length; i++) {
    const [e1, y1] = noktalar[i - 1];
    const [e2, y2] = noktalar[i];
    if (ec <= e2) return Math.round(y1 + ((ec - e1) / (e2 - e1)) * (y2 - y1));
  }
  return 0;
}

/** Yıkama ihtiyacı (FAO 29): LR = ECw / (5·ECe − ECw), ECe ≈ 1,5 × ECw(%100) */
export function yikamaIhtiyaci(bitki: string | undefined, ecUs?: number): number | undefined {
  if (!bitki || ecUs === undefined) return undefined;
  const t = TUZ_TABLO[bitki];
  if (!t) return undefined;
  const ecw = ecUs / 1000;
  const ece = t[0] * 1.5;
  const lr = ecw / (5 * ece - ecw);
  return lr > 0 && lr < 1 ? lr : undefined;
}

// ───────────── Değerlendirme ─────────────

export type Bulgu = {
  id: string;
  baslik: string;
  deger: string;
  ton: Ton;
  durum: string; // "Kısıtlama yok", "Hafif–orta" …
  aciklama: string;
  oneri?: string;
  kaynak: string;
};

export type YontemUygunlugu = {
  yontem: Exclude<SulamaYontemi, 'kuru'>;
  ton: Ton;
  etiket: 'Önerilir' | 'Uygun' | 'Dikkatli kullanın' | 'Önerilmez';
  nedenler: string[];
};

export type SuDegerlendirmesi = {
  sar?: number;
  rsc?: number;
  naYuzde?: number;
  c?: (typeof C_SINIFLARI)[number];
  s?: (typeof S_SINIFLARI)[number];
  sinif?: string; // "C3S1"
  genel: { ton: Ton; baslik: string; cumle: string };
  bulgular: Bulgu[];
  yontemler: YontemUygunlugu[];
  onerilen?: YontemUygunlugu['yontem'];
  bitki?: string;
  verim?: number;
  yikama?: number;
  yapilacaklar: string[];
};

const f = (n: number, d = 2) => n.toLocaleString('tr-TR', { maximumFractionDigits: d });
const TON_SIRA: Record<Ton, number> = { iyi: 0, bilgi: 0, dikkat: 1, sorun: 2 };
const enKotu = (t: Ton[]) => t.reduce<Ton>((a, b) => (TON_SIRA[b] > TON_SIRA[a] ? b : a), 'iyi');
const FAO = 'FAO 29, Tablo 1';

const ACIK_ALAN = new Set(['Buğday', 'Arpa', 'Mısır (dane)', 'Ayçiçeği', 'Şeker pancarı', 'Pamuk', 'Susam', 'Keten', 'Çeltik (pirinç)']);

export function suDegerlendir(rapor: SuRaporu, opts: { bitki?: string | null; yontem?: SulamaYontemi | null } = {}): SuDegerlendirmesi {
  const d = rapor.degerler;
  const bitki = katalogBitki(opts.bitki);
  const yontem = opts.yontem ?? undefined;
  const sar = sarHesapla(d);
  const rsc = rscHesapla(d);
  const c = cSinifi(d.ec);
  const s = sSinifi(sar, d.ec);
  const ecDs = d.ec !== undefined ? d.ec / 1000 : undefined;
  const bulgular: Bulgu[] = [];

  // 1) Tuzluluk
  if (ecDs !== undefined) {
    const ton: Ton = ecDs < 0.7 ? 'iyi' : ecDs <= 3 ? 'dikkat' : 'sorun';
    const verim = tuzVerimi(bitki, d.ec);
    const goreli = bitki ? TUZ_GORELI[bitki] : undefined;
    let bitkiCumle = '';
    const kucuk = bitki ? bitkiKisa(bitki).toLocaleLowerCase('tr-TR') : '';
    if (bitki && verim !== undefined)
      bitkiCumle = verim >= 100 ? ` ${bitkiKisa(bitki)} bu tuzluluktan etkilenmez.` : ` Bu tuzlulukta ${kucuk} için beklenen verim yaklaşık %${verim} (tuzsuz suya göre).`;
    else if (bitki && goreli) bitkiCumle = ` ${bitkiKisa(bitki)} tuza ${goreli}.`;
    bulgular.push({
      id: 'tuz',
      baslik: 'Tuzluluk',
      deger: `${f(d.ec!, 0)} µS/cm (${f(ecDs)} dS/m)`,
      ton,
      durum: ton === 'iyi' ? 'Kısıtlama yok' : ton === 'dikkat' ? 'Hafif–orta kısıtlama' : 'Şiddetli kısıtlama',
      aciklama: (ton === 'iyi' ? 'Suyun tuzu düşük, bitkinin su almasını zorlaştırmaz.' : 'Tuz, bitkinin topraktan su almasını zorlaştırır; zamanla toprakta birikir.') + bitkiCumle,
      oneri: ton === 'iyi' ? undefined : 'Toprağı kurutmadan, düzenli sulayın ve ara ara fazladan yıkama suyu verin. Drenajın iyi olması gerekir.',
      kaynak: `${FAO}; Tablo 4`,
    });
  }

  // 2) Suyun toprağa işlemesi (SAR + EC birlikte)
  if (sar !== undefined && ecDs !== undefined) {
    const sinirlar: [number, number, number][] = [
      [3, 0.7, 0.2],
      [6, 1.2, 0.3],
      [12, 1.9, 0.5],
      [20, 2.9, 1.3],
      [40, 5.0, 2.9],
    ];
    const satir = sinirlar.find((x) => sar <= x[0]) ?? sinirlar[4];
    const ton: Ton = ecDs > satir[1] ? 'iyi' : ecDs >= satir[2] ? 'dikkat' : 'sorun';
    bulgular.push({
      id: 'gecirgenlik',
      baslik: 'Suyun toprağa işlemesi',
      deger: `SAR ${f(sar, 1)} · EC ${f(ecDs)} dS/m`,
      ton,
      durum: ton === 'iyi' ? 'Kısıtlama yok' : ton === 'dikkat' ? 'Hafif–orta kısıtlama' : 'Şiddetli kısıtlama',
      aciklama:
        ton === 'iyi'
          ? 'Su toprağa rahatça işler; kaymak bağlama beklenmez.'
          : 'Sodyum, tuzu az olan suyla birleşince toprak dağılır, yüzeyde kaymak bağlar ve su toprağa zor işler.',
      oneri: ton === 'iyi' ? undefined : 'Toprağa jips (alçı taşı) ve organik madde verin; kaymağı çapayla kırın.',
      kaynak: FAO,
    });
  }

  // 3) Sodyum (yönteme göre)
  const yagmur = yontem === 'yagmurlama' || yontem === 'pivot';
  if (yagmur && d.na !== undefined) {
    const ton: Ton = d.na < 3 ? 'iyi' : 'dikkat';
    bulgular.push({
      id: 'sodyum',
      baslik: 'Sodyum (yaprağa değen su)',
      deger: `${f(d.na)} me/l`,
      ton,
      durum: ton === 'iyi' ? 'Kısıtlama yok' : 'Hafif–orta kısıtlama',
      aciklama: ton === 'iyi' ? 'Yağmurlamada yaprak yanığı beklenmez.' : 'Yağmurlamada sodyum yapraktan emilir, kenarları yakabilir.',
      oneri: ton === 'iyi' ? undefined : 'Gündüz, sıcak ve rüzgârlı saatlerde sulamayın; akşam ya da gece sulayın.',
      kaynak: FAO,
    });
  } else if (sar !== undefined) {
    const ton: Ton = sar < 3 ? 'iyi' : sar <= 9 ? 'dikkat' : 'sorun';
    bulgular.push({
      id: 'sodyum',
      baslik: 'Sodyum (kökten alınan)',
      deger: `SAR ${f(sar, 1)}`,
      ton,
      durum: ton === 'iyi' ? 'Kısıtlama yok' : ton === 'dikkat' ? 'Hafif–orta kısıtlama' : 'Şiddetli kısıtlama',
      aciklama: ton === 'iyi' ? 'Sodyum zararı beklenmez.' : 'Hassas bitkilerde (özellikle meyve ağaçları) yaprak kenarında yanıklık yapabilir.',
      oneri: ton === 'iyi' ? undefined : 'Toprağa jips verin; meyve bahçelerinde yaprak kenarlarını izleyin.',
      kaynak: FAO,
    });
  }

  // 4) Klorür (yönteme göre)
  if (d.cl !== undefined) {
    const ton: Ton = yagmur ? (d.cl < 3 ? 'iyi' : 'dikkat') : d.cl < 4 ? 'iyi' : d.cl <= 10 ? 'dikkat' : 'sorun';
    bulgular.push({
      id: 'klorur',
      baslik: yagmur ? 'Klorür (yaprağa değen su)' : 'Klorür',
      deger: `${f(d.cl)} me/l (${f(d.cl * 35.45, 0)} mg/l)`,
      ton,
      durum: ton === 'iyi' ? 'Kısıtlama yok' : ton === 'dikkat' ? 'Hafif–orta kısıtlama' : 'Şiddetli kısıtlama',
      aciklama:
        ton === 'iyi'
          ? 'Klorür zararı beklenmez.'
          : yagmur
            ? 'Yağmurlamada klorür yaprak kenarlarını yakar; sıcak ve kuru havada daha çok.'
            : 'Klorür yapraklarda birikir; hassas bitkilerde uçtan ve kenardan yanıklık yapar.',
      oneri: ton === 'iyi' ? undefined : yagmur ? 'Gündüz, sıcak ve rüzgârlı saatlerde sulamayın; akşam ya da gece sulayın.' : 'Klorlu gübreden (potasyum klorür) kaçının.',
      kaynak: FAO,
    });
  }

  // 5) Bor (bitkiye göre)
  if (d.b !== undefined) {
    const t = bitki ? BOR_TABLO[bitki] : undefined;
    const [alt, ust] = t ? [t[0], t[1]] : [0.7, 3.0];
    const ton: Ton = d.b <= alt ? 'iyi' : d.b <= ust ? 'dikkat' : 'sorun';
    const bitkiAd = bitki ? bitkiKisa(bitki) : undefined;
    bulgular.push({
      id: 'bor',
      baslik: 'Bor',
      deger: `${f(d.b)} mg/l`,
      ton,
      durum: ton === 'iyi' ? 'Kısıtlama yok' : ton === 'dikkat' ? 'Hafif–orta kısıtlama' : 'Şiddetli kısıtlama',
      aciklama:
        (t && bitkiAd ? `${bitkiAd} bora ${t[2]} (sınır ${f(alt)}–${f(ust)} mg/l). ` : '') +
        (ton === 'iyi' ? 'Bor zehirlenmesi beklenmez.' : 'Fazla bor yaprak uçlarında ve kenarlarında sararma, sonra kahverengi yanık yapar.'),
      oneri: ton === 'iyi' ? undefined : 'Bor içeren gübre ve yaprak gübresi kullanmayın; yıkama suyu verin. Mümkünse daha iyi bir su kaynağıyla karıştırın.',
      kaynak: t ? 'FAO 29, Tablo 16' : FAO,
    });
  }

  // 6) Kalıntı sodyum karbonat
  if (rsc !== undefined) {
    const ton: Ton = rsc < 1.25 ? 'iyi' : rsc <= 2.5 ? 'dikkat' : 'sorun';
    bulgular.push({
      id: 'rsc',
      baslik: 'Kalıntı sodyum karbonat (RSC)',
      deger: `${f(rsc)} me/l`,
      ton,
      durum: ton === 'iyi' ? 'Güvenle kullanılabilir' : ton === 'dikkat' ? 'Dikkatli kullanılmalı' : 'Sulamaya uygun değil',
      aciklama:
        ton === 'iyi'
          ? 'Karbonat ve bikarbonat, kalsiyum ve magnezyumdan fazla değil; sodyum karbonat birikmez.'
          : 'Karbonat ve bikarbonat kalsiyumu çöktürür; geriye kalan sodyum toprağın pH’ını yükseltir, toprak kaymak gibi olur.',
      oneri:
        ton === 'iyi'
          ? undefined
          : `Toprağa ya da suya jips verin: her 1 me/l RSC için 1.000 m³ suya yaklaşık 86 kg saf jips (sizde ≈ ${f(Math.max(0, rsc) * 86, 0)} kg / 1.000 m³).`,
      kaynak: 'Eaton (1950)',
    });
  }

  // 7) Bikarbonat (yağmurlamada leke) ve damlada tıkanma
  if (yagmur && d.hco3 !== undefined) {
    const gorunus = !bitki || !ACIK_ALAN.has(bitki); // meyve ve sebzede görünüş önemli
    const ham: Ton = d.hco3 < 1.5 ? 'iyi' : d.hco3 <= 8.5 ? 'dikkat' : 'sorun';
    const ton: Ton = ham !== 'iyi' && !gorunus ? 'bilgi' : ham;
    bulgular.push({
      id: 'hco3',
      baslik: 'Bikarbonat (yaprak ve meyvede leke)',
      deger: `${f(d.hco3)} me/l (${f(d.hco3 * 61.02, 0)} mg/l)`,
      ton,
      durum: ton === 'iyi' ? 'Kısıtlama yok' : ton === 'bilgi' ? 'Yalnızca görünüş' : ton === 'dikkat' ? 'Hafif–orta kısıtlama' : 'Şiddetli kısıtlama',
      aciklama:
        ton === 'iyi'
          ? 'Yaprakta ve meyvede kireç lekesi beklenmez.'
          : ton === 'bilgi'
            ? 'Yaprakta beyaz kireç lekesi bırakabilir; tarla bitkilerinde verime etkisi yoktur.'
            : 'Su kuruyunca yaprak ve meyvede beyaz kireç lekesi bırakır; elma, üzüm gibi meyvelerde satış değerini düşürür.',
      oneri: ton === 'iyi' || ton === 'bilgi' ? undefined : 'Gündüz sulamayın; meyve bahçesinde ağaç altı yağmurlama ya da damla tercih edin.',
      kaynak: FAO,
    });
  }
  if (yontem === 'damla' && (d.ph !== undefined || d.hco3 !== undefined)) {
    const ph = d.ph ?? 7;
    const ton: Ton = ph > 8 || (d.hco3 ?? 0) > 8.5 ? 'sorun' : ph >= 7 || (d.hco3 ?? 0) > 2 ? 'dikkat' : 'iyi';
    bulgular.push({
      id: 'tikanma',
      baslik: 'Damlatıcı tıkanma riski',
      deger: [d.ph !== undefined ? `pH ${f(d.ph, 1)}` : '', d.hco3 !== undefined ? `HCO₃ ${f(d.hco3)} me/l` : ''].filter(Boolean).join(' · '),
      ton,
      durum: ton === 'iyi' ? 'Düşük' : ton === 'dikkat' ? 'Orta' : 'Yüksek',
      aciklama: ton === 'iyi' ? 'Kireçlenme ile tıkanma beklenmez.' : 'pH ve bikarbonat yüksek olunca damlatıcıların içinde kireç birikir, zamanla tıkanır ve su eşit dağılmaz.',
      oneri: ton === 'iyi' ? undefined : 'Sezonda birkaç kez sulama suyuna asit (nitrik ya da fosforik asit) verip hatları yıkayın; filtreyi düzenli temizleyin.',
      kaynak: 'Nakayama ve Bucks (1991)',
    });
  }

  // 8) Nitrat azotu
  if (d.no3n !== undefined) {
    const ton: Ton = d.no3n < 5 ? 'iyi' : d.no3n <= 30 ? 'bilgi' : 'dikkat';
    bulgular.push({
      id: 'nitrat',
      baslik: 'Nitrat azotu',
      deger: `${f(d.no3n, 1)} mg/l`,
      ton,
      durum: ton === 'iyi' ? 'Önemsiz' : ton === 'bilgi' ? 'Gübre etkisi var' : 'Yüksek',
      aciklama: ton === 'iyi' ? 'Suyla gelen azot önemsizdir.' : 'Su azot taşıyor: bu ücretsiz gübre demektir, ama hassas bitkilerde fazla vejetatif büyüme ve geç olgunlaşma yapabilir.',
      oneri: ton === 'iyi' ? undefined : 'Azotlu gübre miktarını biraz azaltın; her 1.000 m³ su ≈ ' + f(d.no3n, 0) + ' kg azot getirir.',
      kaynak: FAO,
    });
  }

  // 9) pH
  if (d.ph !== undefined) {
    const ton: Ton = d.ph >= 6.5 && d.ph <= 8.4 ? 'iyi' : 'dikkat';
    bulgular.push({
      id: 'ph',
      baslik: 'pH',
      deger: f(d.ph, 1),
      ton,
      durum: ton === 'iyi' ? 'Normal aralıkta' : 'Normal aralığın dışında',
      aciklama: ton === 'iyi' ? 'Normal aralık 6,5–8,4.' : d.ph > 8.4 ? 'Su bazik; genelde yüksek bikarbonat ya da sodyum karbonata işaret eder.' : 'Su asidik; borularda korozyon yapabilir.',
      kaynak: FAO,
    });
  }

  // ───── Sulama yöntemi uygunluğu ─────
  const yontemler = yontemUygunlugu(d, { sar, rsc, ecDs, bitki, gecirgenlik: bulgular.find((b) => b.id === 'gecirgenlik')?.ton });
  const sira: Record<YontemUygunlugu['etiket'], number> = { Önerilir: 0, Uygun: 1, 'Dikkatli kullanın': 2, Önerilmez: 3 };
  const enIyi = [...yontemler].sort((a, b) => sira[a.etiket] - sira[b.etiket])[0];

  // ───── Genel ─────
  const tonlar = bulgular.filter((b) => b.id !== 'ph' && b.id !== 'nitrat').map((b) => b.ton);
  const g = enKotu(tonlar.length ? tonlar : ['bilgi']);
  const sinif = c && s ? `${c.sinif}${s.sinif}` : c?.sinif;
  const genel = !tonlar.length
    ? { ton: 'bilgi' as Ton, baslik: 'Değerlendirme için değer yok', cumle: 'En azından EC (tuzluluk) değeri girildiğinde suyunuzu değerlendirebiliriz.' }
    : g === 'iyi'
      ? { ton: g, baslik: 'Suyunuz sulamaya uygun', cumle: 'Ölçülen değerlerde bitkiye ya da toprağa zarar verecek bir şey görünmüyor.' }
      : g === 'dikkat'
        ? { ton: g, baslik: 'Dikkatli kullanılabilir', cumle: 'Su kullanılabilir, ama aşağıdaki önlemleri alırsanız verim kaybı ve toprak bozulması olmaz.' }
        : { ton: g, baslik: 'Sorunlu su', cumle: 'Bu su olduğu gibi kullanılırsa verim düşer ve toprak zamanla bozulur. Önlemleri mutlaka uygulayın.' };

  const yapilacaklar = [...new Set(bulgular.filter((b) => b.oneri && b.ton !== 'iyi').sort((a, b) => TON_SIRA[b.ton] - TON_SIRA[a.ton]).map((b) => b.oneri!))];
  const yikama = yikamaIhtiyaci(bitki, d.ec);
  if (yikama && ecDs !== undefined && ecDs >= 0.7) yapilacaklar.unshift(`Bitkinin ihtiyacından yaklaşık %${Math.round(yikama * 100)} fazla su verin (yıkama suyu); tuz kök bölgesinden uzaklaşır.`);
  if (yontem && yontem !== 'kuru' && enIyi && enIyi.yontem !== yontem && enIyi.etiket === 'Önerilir') {
    const mevcut = yontemler.find((y) => y.yontem === yontem);
    if (mevcut && sira[mevcut.etiket] >= 2) yapilacaklar.push(`Bu su için ${YONTEM_AD[enIyi.yontem].toLocaleLowerCase('tr-TR')} sulama daha uygun; imkânınız varsa geçmeyi düşünün.`);
  }

  return {
    sar,
    rsc,
    naYuzde: naYuzde(d),
    c,
    s,
    sinif,
    genel,
    bulgular,
    yontemler,
    onerilen: enIyi?.yontem,
    bitki,
    verim: tuzVerimi(bitki, d.ec),
    yikama,
    yapilacaklar,
  };
}

export const YONTEM_AD: Record<YontemUygunlugu['yontem'], string> = { damla: 'Damla', yagmurlama: 'Yağmurlama', pivot: 'Pivot (center pivot)', salma: 'Salma / karık' };

function yontemUygunlugu(
  d: SuDegerleri,
  x: { sar?: number; rsc?: number; ecDs?: number; bitki?: string; gecirgenlik?: Ton },
): YontemUygunlugu[] {
  const out: YontemUygunlugu[] = [];
  const tuzlu = (x.ecDs ?? 0) >= 0.7;
  const cokTuzlu = (x.ecDs ?? 0) > 3;
  const yaprakZarar = (d.cl ?? 0) >= 3 || (d.na ?? 0) >= 3;
  const leke = (d.hco3 ?? 0) >= 1.5;
  const tikanma = (d.ph ?? 0) > 8 || (d.hco3 ?? 0) > 8.5;
  const tikanmaOrta = !tikanma && ((d.ph ?? 0) >= 7.5 || (d.hco3 ?? 0) > 2);
  const meyve = x.bitki ? !ACIK_ALAN.has(x.bitki) : false;
  const tarla = x.bitki ? ACIK_ALAN.has(x.bitki) : false;

  // Damla
  {
    const n: string[] = [];
    let ton: Ton = 'iyi';
    if (tuzlu) n.push('Tuzlu suda en güvenli yöntem: toprak sürekli nemli kalır, tuz ıslak alanın kenarına itilir, yaprak ıslanmaz.');
    if (yaprakZarar) n.push('Su yaprağa değmediği için sodyum ve klorür yaprağı yakmaz.');
    if (tikanma) {
      ton = 'dikkat';
      n.push('pH / bikarbonat yüksek: damlatıcılar tıkanabilir, düzenli asitle yıkama şart.');
    } else if (tikanmaOrta) n.push('Damlatıcılarda kireçlenmeye karşı sezonda birkaç kez asitle yıkama yapın.');
    if (!n.length) n.push(meyve ? 'Sebze ve meyvede su ve gübreden en çok tasarruf sağlayan yöntem.' : 'Sudan ve gübreden en çok tasarruf sağlayan yöntem.');
    out.push({ yontem: 'damla', ton, etiket: ton === 'dikkat' ? 'Dikkatli kullanın' : tuzlu || yaprakZarar || meyve ? 'Önerilir' : 'Uygun', nedenler: n });
  }
  // Yağmurlama ve pivot
  for (const y of ['yagmurlama', 'pivot'] as const) {
    const n: string[] = [];
    let ton: Ton = 'iyi';
    if (cokTuzlu) {
      ton = 'sorun';
      n.push('Çok tuzlu su yaprağa değince yapraklar yanar.');
    }
    if (yaprakZarar) {
      ton = ton === 'sorun' ? 'sorun' : 'dikkat';
      n.push(`Sodyum ya da klorür yüksek (${[d.na !== undefined ? `Na ${f(d.na)}` : '', d.cl !== undefined ? `Cl ${f(d.cl)}` : ''].filter(Boolean).join(', ')} me/l): yaprak yanığı yapabilir; yalnızca akşam ve gece sulayın.`);
    }
    if (leke && meyve) {
      ton = ton === 'sorun' ? 'sorun' : 'dikkat';
      n.push('Bikarbonat meyvede beyaz kireç lekesi bırakır.');
    }
    if (tuzlu && !cokTuzlu && !yaprakZarar) n.push('Tuz orta düzeyde; sıcak ve rüzgârlı saatlerde sulamayın.');
    if (!n.length) n.push(y === 'pivot' ? 'Büyük ve düz tarlalarda az işçilikle eşit sulama yapar.' : 'Tarla bitkilerinde pratik; suyunuz yaprağa zarar vermez.');
    const etiket: YontemUygunlugu['etiket'] =
      ton === 'sorun' ? 'Önerilmez' : ton === 'dikkat' ? 'Dikkatli kullanın' : tarla && !tuzlu ? (y === 'pivot' ? 'Uygun' : 'Uygun') : 'Uygun';
    out.push({ yontem: y, ton, etiket, nedenler: n });
  }
  // Salma
  {
    const n: string[] = [];
    let ton: Ton = 'iyi';
    if (x.gecirgenlik === 'sorun') {
      ton = 'sorun';
      n.push('Su toprağa zor işliyor: salmada göllenme ve kaymak bağlama olur.');
    } else if (x.gecirgenlik === 'dikkat') {
      ton = 'dikkat';
      n.push('Suyun toprağa işlemesi biraz zayıf; salmada yüzey kaymak bağlayabilir.');
    }
    if (tuzlu) {
      ton = ton === 'sorun' ? 'sorun' : 'dikkat';
      n.push('Tuz karık sırtlarında birikir; drenaj iyi değilse toprak tuzlanır.');
    }
    if (!n.length) n.push('Suyunuz salmaya uygun; ama en çok su harcayan yöntemdir.');
    out.push({ yontem: 'salma', ton, etiket: ton === 'sorun' ? 'Önerilmez' : ton === 'dikkat' ? 'Dikkatli kullanın' : 'Uygun', nedenler: n });
  }
  // Su iyi ve tarla bitkisiyse pivot/yağmurlamayı da öner
  if (!tuzlu && !yaprakZarar && tarla) {
    const p = out.find((o) => o.yontem === 'pivot');
    if (p && p.ton === 'iyi') p.etiket = 'Önerilir';
  }
  return out;
}

/** Ton renkleri */
export const SU_TON: Record<Ton, { renk: string; acik: string; yazi: string; ad: string }> = {
  iyi: { renk: '#2e9e5b', acik: '#e6f4ea', yazi: '#1f6b3f', ad: 'İyi' },
  bilgi: { renk: '#5b8aa3', acik: '#e8f0f5', yazi: '#3d6478', ad: 'Bilgi' },
  dikkat: { renk: '#d99a1e', acik: '#fbf1dc', yazi: '#7a5310', ad: 'Dikkat' },
  sorun: { renk: '#d1513a', acik: '#fbe6e1', yazi: '#8f2f1f', ad: 'Sorun' },
};

/** Yapay zekaya gönderilecek özet */
export function suAiOzeti(r: SuRaporu, v: SuDegerlendirmesi, tarla: { bitki?: string | null; yontem?: string; il?: string | null }) {
  return {
    tarla,
    sinif: v.sinif,
    tuzlulukSinifi: v.c && `${v.c.sinif}: ${v.c.ad}`,
    sodyumSinifi: v.s && `${v.s.sinif}: ${v.s.ad}`,
    sar: v.sar && Number(v.sar.toFixed(2)),
    rsc: v.rsc !== undefined ? Number(v.rsc.toFixed(2)) : undefined,
    beklenenVerimYuzde: v.verim,
    yikamaIhtiyaciYuzde: v.yikama ? Math.round(v.yikama * 100) : undefined,
    genel: v.genel.baslik,
    bulgular: v.bulgular.map((b) => ({ konu: b.baslik, deger: b.deger, durum: b.durum, ton: b.ton })),
    sulamaYontemleri: v.yontemler.map((y) => ({ yontem: YONTEM_AD[y.yontem], durum: y.etiket })),
    onerilenYontem: v.onerilen && YONTEM_AD[v.onerilen],
    hamDegerler: r.degerler,
  };
}
