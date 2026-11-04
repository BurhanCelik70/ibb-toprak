/**
 * TAGEM-SUET (Tarım ve Orman Bakanlığı, Sulama Yönetimi ve Bitki Su Tüketimi Hesaplama Sistemi) verileri.
 *  - ETo: Standart Penman-Monteith, MGM istasyonlarının 30 yıllık günlük verisi. SUET'in istasyon grafiğinden
 *    (SVG dışa aktarımı) günlük değerler okunup aylık ortalamaya (mm/gün) çevrildi; yıllık toplam SUET'in
 *    gösterdiği değerle %1 içinde örtüşür.
 *  - Bitki verileri: SUET "Bitki Verileri (Kc–Ky)" ekranı; kaynağı TAGEM (2017) Türkiye'de Sulanan Bitkilerin
 *    Bitki Su Tüketimleri Rehberi.
 * https://tagemsuet.tarimorman.gov.tr
 */

export type TagemIstasyon = {
  ad: string;
  no?: number;
  il: string;
  /** Yıllık toplam ETo (mm); SUET ekranındaki değer, yoksa grafikten okunan toplam */
  yillik: number;
  /** Aylık ortalama ETo, mm/gün (Oca–Ara) */
  eto: number[];
};

export const TAGEM_ISTASYONLAR: TagemIstasyon[] = [
  { ad: 'Kumköy', no: 17059, il: 'İstanbul', yillik: 958.37, eto: [0.97, 1.2, 1.72, 2.51, 3.5, 4.59, 4.91, 4.43, 3.14, 1.96, 1.29, 1.05] },
  { ad: 'Bahçeköy', il: 'İstanbul', yillik: 852.0, eto: [0.62, 0.99, 1.6, 2.66, 3.58, 4.43, 4.37, 3.84, 2.78, 1.59, 0.83, 0.6] },
  { ad: 'Florya', il: 'İstanbul', yillik: 977.37, eto: [0.84, 1.13, 1.73, 2.72, 3.83, 4.79, 5.2, 4.61, 3.24, 1.88, 1.1, 0.86] },
  { ad: 'Kartal', il: 'İstanbul', yillik: 976.6, eto: [0.73, 1.09, 1.79, 2.91, 4.09, 5.02, 5.19, 4.58, 3.17, 1.78, 0.93, 0.69] },
  { ad: 'Kireçburnu', il: 'İstanbul', yillik: 914.1, eto: [0.78, 1.12, 1.75, 2.69, 3.68, 4.58, 4.58, 4.1, 3.01, 1.82, 1.02, 0.79] },
  { ad: 'Şile', il: 'İstanbul', yillik: 877.94, eto: [0.87, 1.12, 1.64, 2.39, 3.32, 4.3, 4.49, 4.06, 2.89, 1.74, 1.09, 0.88] },
  { ad: 'Göztepe', il: 'İstanbul', yillik: 975.27, eto: [0.83, 1.14, 1.77, 2.77, 3.9, 4.94, 5.2, 4.53, 3.17, 1.77, 1.03, 0.8] },
];

/**
 * İl için kullanılan istasyonlar. Birden fazlaysa aylık ortalamaları alınır.
 * İstanbul'da tarım alanları Silivri–Çatalca tarafında; o tarafa yakın istasyonlar eklendikçe burası güncellenir.
 */
const IL_ISTASYON: Record<string, string[]> = {
  İstanbul: ['Kumköy', 'Bahçeköy', 'Florya', 'Kartal', 'Kireçburnu', 'Göztepe', 'Şile'],
};

export function tagemEto(il?: string | null): { eto: number[]; istasyonlar: string[] } | undefined {
  if (!il) return undefined;
  const adlar = IL_ISTASYON[il] ?? TAGEM_ISTASYONLAR.filter((s) => s.il === il).map((s) => s.ad);
  const ist = adlar.map((a) => TAGEM_ISTASYONLAR.find((s) => s.ad === a)).filter((s): s is TagemIstasyon => !!s);
  if (ist.length === 0) return undefined;
  const eto = Array.from({ length: 12 }, (_, m) => ist.reduce((t, s) => t + s.eto[m], 0) / ist.length);
  return { eto, istasyonlar: ist.map((s) => s.ad) };
}

export type TagemBitki = {
  /** Ekim/dikim/uyanma: [ay (0–11), gün] */
  ekim: [number, number];
  /** I–IV dönem uzunlukları (gün): başlangıç, gelişme, orta, geç */
  donem: [number, number, number, number];
  kc1: number;
  kc3: number;
  kc4: number;
  ky?: number;
};

/** Anahtar: Z-kart bitki adı */
export const TAGEM_BITKI: Record<string, TagemBitki> = {
  'Mısır (dane)': { ekim: [4, 1], donem: [30, 40, 55, 35], kc1: 0.3, kc3: 1.16, kc4: 0.31, ky: 1.25 },
  // Kc eğrisinden okundu (SUET, Bahçeköy); SUET ETc 487,76 mm ile karşılaştırıldı
  Kanola: { ekim: [9, 1], donem: [30, 120, 55, 30], kc1: 0.94, kc3: 1.09, kc4: 0.29, ky: 0.8 },
  // SUET adı: domates (yer)
  Domates: { ekim: [3, 21], donem: [30, 30, 70, 35], kc1: 0.46, kc3: 1.09, kc4: 0.74, ky: 1.05 },
  // SUET adı: soğan (kuru)
  Soğan: { ekim: [3, 1], donem: [20, 30, 70, 35], kc1: 0.6, kc3: 1.0, kc4: 0.7, ky: 1.1 },
  // SUET adı: hıyar
  Salatalık: { ekim: [4, 1], donem: [25, 30, 50, 20], kc1: 0.51, kc3: 0.95, kc4: 0.7, ky: 1.3 },
  Ayçiçeği: { ekim: [3, 10], donem: [25, 29, 61, 30], kc1: 0.53, kc3: 1.07, kc4: 0.27 },
};

const AY_BAS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

/** FAO-56 dört dönemli Kc eğrisi, gün gün: her gün için takvim ayı (0–11) ve Kc */
export function tagemGunluk(b: TagemBitki): { ay: number; kc: number }[] {
  const [l1, l2, l3, l4] = b.donem;
  const toplam = l1 + l2 + l3 + l4;
  const bas = AY_BAS[b.ekim[0]] + b.ekim[1] - 1;
  const out: { ay: number; kc: number }[] = [];
  for (let d = 0; d < toplam; d++) {
    let k: number;
    if (d < l1) k = b.kc1;
    else if (d < l1 + l2) k = b.kc1 + ((d - l1 + 0.5) / l2) * (b.kc3 - b.kc1);
    else if (d < l1 + l2 + l3) k = b.kc3;
    else k = b.kc3 + ((d - l1 - l2 - l3 + 0.5) / l4) * (b.kc4 - b.kc3);
    const yilGunu = (bas + d) % 365;
    let m = 11;
    while (AY_BAS[m] > yilGunu) m--;
    out.push({ ay: m, kc: k });
  }
  return out;
}

/** Her takvim ayı için ortalama Kc ve o aydaki sezon günü sayısı */
export function tagemAylikKc(b: TagemBitki): { kc: number[]; gun: number[] } {
  const kcT = new Array(12).fill(0);
  const gun = new Array(12).fill(0);
  for (const g of tagemGunluk(b)) {
    kcT[g.ay] += g.kc;
    gun[g.ay] += 1;
  }
  return { kc: kcT.map((t, m) => (gun[m] ? t / gun[m] : 0)), gun };
}
