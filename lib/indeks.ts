/**
 * Toprak Kalite İndeksi (TKİ)
 *
 * Kaynak: "Toprak_kalite_indeksi_tablo.xlsx" (proje danışmanının tablosu).
 * Her parametre 0–5 arası puanlanır (5 = en iyi). İndeks, ölçülen parametrelerin puan
 * ortalamasıdır ve 100 üzerinden gösterilir.
 *
 * İBB raporuyla birim farkları:
 *  - Fosfor: İBB "P₂O₅ kg/da" verir; tablo "P mg/kg" ister → P = P₂O₅(kg/da) / (0,2 × 2,29)
 *  - Potasyum: İBB "K₂O kg/da" verir; tablo "K me/100 g" ister → K = K₂O(kg/da) / (0,2 × 1,205) / 391
 *    (0,2: 0–20 cm katman ve 1 g/cm³ hacim ağırlığı varsayımıyla 1 mg/kg = 0,2 kg/da)
 *  - EC: İBB saturasyon çamurunda ölçer; tablo farklı bir ekstraksiyona göre (eşik 0–500 µS/cm).
 *    Doğrudan karşılaştırılamadığı için varsayılan olarak indekse KATILMAZ (EC_INDEKSE_DAHIL).
 * ⚠️ Toplam azot satırındaki ilk iki aralık tabloda yazım hatalı görünüyor; 0,0125 / 0,025 alındı.
 */
import { type SoilReport } from './toprak';

export const EC_INDEKSE_DAHIL = false;

type Kural =
  | { tip: 'artan'; alt: number[] } // puan i: değer >= alt[i] (alt[0] = 0)
  | { tip: 'azalan'; ust: number[] } // puan i: değer <= ust[5-i] ... düşük değer iyi
  | { tip: 'ph' };

type IndeksParam = { ad: string; birim: string; kural: Kural };

/** Tablodaki sınıf alt sınırları (puan 0 … 5). */
const T: Record<string, IndeksParam> = {
  ph: { ad: 'pH', birim: '', kural: { tip: 'ph' } },
  ec: { ad: 'EC', birim: 'µS/cm', kural: { tip: 'azalan', ust: [20, 50, 100, 250, 500] } },
  organikMadde: { ad: 'Organik madde', birim: '%', kural: { tip: 'artan', alt: [0, 0.75, 1, 1.5, 2, 2.5] } },
  organikKarbon: { ad: 'Organik karbon', birim: '%', kural: { tip: 'artan', alt: [0, 0.25, 0.5, 1, 1.5, 2] } },
  azot: { ad: 'Toplam azot', birim: '%', kural: { tip: 'artan', alt: [0, 0.0125, 0.025, 0.05, 0.075, 0.1] } },
  no3: { ad: 'NO₃-N', birim: 'mg/kg', kural: { tip: 'artan', alt: [0, 25, 50, 75, 100, 200] } },
  nh4: { ad: 'NH₄-N', birim: 'mg/kg', kural: { tip: 'artan', alt: [0, 25, 50, 75, 100, 200] } },
  fosfor: { ad: 'Fosfor (P)', birim: 'mg/kg', kural: { tip: 'artan', alt: [0, 2, 4, 6, 8, 10] } },
  sodyum: { ad: 'Sodyum (Na)', birim: 'me/100 g', kural: { tip: 'azalan', ust: [0.1, 0.25, 0.5, 0.75, 1] } },
  potasyum: { ad: 'Potasyum (K)', birim: 'me/100 g', kural: { tip: 'artan', alt: [0, 0.5, 1, 1.25, 1.5, 2] } },
  kalsiyum: { ad: 'Kalsiyum (Ca)', birim: 'me/100 g', kural: { tip: 'artan', alt: [0, 0.5, 1, 1.25, 1.5, 2] } },
  magnezyum: { ad: 'Magnezyum (Mg)', birim: 'me/100 g', kural: { tip: 'artan', alt: [0, 0.5, 1, 1.25, 1.5, 2] } },
  kukurt: { ad: 'Kükürt (S)', birim: 'mg/kg', kural: { tip: 'artan', alt: [0, 25, 50, 75, 125, 150] } },
  demir: { ad: 'Demir (Fe)', birim: 'mg/kg', kural: { tip: 'artan', alt: [0, 0.5, 1, 1.5, 5, 7.5] } },
  bakir: { ad: 'Bakır (Cu)', birim: 'mg/kg', kural: { tip: 'artan', alt: [0, 0.5, 1, 1.5, 5, 7.5] } },
  mangan: { ad: 'Mangan (Mn)', birim: 'mg/kg', kural: { tip: 'artan', alt: [0, 0.5, 1, 1.5, 5, 7.5] } },
  cinko: { ad: 'Çinko (Zn)', birim: 'mg/kg', kural: { tip: 'artan', alt: [0, 0.5, 1, 1.5, 5, 7.5] } },
  bor: { ad: 'Bor (B)', birim: 'mg/kg', kural: { tip: 'artan', alt: [0, 0.01, 0.025, 0.05, 0.1, 0.5] } },
  kursun: { ad: 'Kurşun (Pb)', birim: 'mg/kg', kural: { tip: 'azalan', ust: [0.01, 0.025, 0.05, 0.1, 0.5] } },
  kadmiyum: { ad: 'Kadmiyum (Cd)', birim: 'mg/kg', kural: { tip: 'azalan', ust: [0.01, 0.025, 0.05, 0.1, 0.5] } },
  krom: { ad: 'Krom (Cr)', birim: 'mg/kg', kural: { tip: 'azalan', ust: [0.01, 0.025, 0.05, 0.1, 0.5] } },
  nikel: { ad: 'Nikel (Ni)', birim: 'mg/kg', kural: { tip: 'azalan', ust: [0.01, 0.025, 0.05, 0.1, 0.5] } },
  kirec: { ad: 'Kireç', birim: '%', kural: { tip: 'artan', alt: [0, 1, 2, 3, 4, 5] } },
  kdk: { ad: 'Katyon değişim kapasitesi', birim: 'cmol/kg', kural: { tip: 'artan', alt: [0, 5, 7.5, 10, 20, 30] } },
};

export function puanla(key: keyof typeof T, v: number): number {
  const k = T[key].kural;
  if (k.tip === 'ph') return Math.max(0, Math.min(5, 5 - Math.round(Math.abs(v - 7))));
  if (k.tip === 'artan') {
    let p = 0;
    k.alt.forEach((a, i) => {
      if (v >= a) p = i;
    });
    return p;
  }
  // azalan: ust = [5 puan sınırı, 4, 3, 2, 1]; üstündeyse 0
  const i = k.ust.findIndex((u) => v <= u);
  return i < 0 ? 0 : 5 - i;
}

export type IndeksSatiri = { key: string; ad: string; deger: number; birim: string; puan: number; not?: string };
export type IndeksSonucu = { satirlar: IndeksSatiri[]; ortalama: number; yuzde: number; sinif: string; renk: string };

export const SINIFLAR = [
  { min: 80, ad: 'Çok iyi', renk: '#1f8a4c' },
  { min: 60, ad: 'İyi', renk: '#5aa832' },
  { min: 40, ad: 'Orta', renk: '#d4a017' },
  { min: 20, ad: 'Zayıf', renk: '#e07b28' },
  { min: 0, ad: 'Çok zayıf', renk: '#c9412b' },
];

/** Ek değer adından indeks anahtarı bulur (yalnızca uygun birimde). */
function ekEslestir(ad: string, birim = ''): keyof typeof T | undefined {
  const a = ad.toLocaleLowerCase('tr-TR');
  const b = birim.toLocaleLowerCase('tr-TR').replace(/\s/g, '');
  const me = b.includes('me/100') || b.includes('meq') || b.includes('cmol');
  const mg = b.includes('mg/kg') || b.includes('ppm') || b === '';
  if (/kalsiyum|\(ca\)/.test(a)) return me ? 'kalsiyum' : undefined;
  if (/magnezyum|\(mg\)/.test(a)) return me ? 'magnezyum' : undefined;
  if (/sodyum|\(na\)/.test(a)) return me ? 'sodyum' : undefined;
  if (/potasyum|\(k\)/.test(a)) return me ? 'potasyum' : undefined;
  if (/kükürt|kukurt|\(s\)/.test(a)) return mg ? 'kukurt' : undefined;
  if (/kurşun|kursun|\(pb\)/.test(a)) return mg ? 'kursun' : undefined;
  if (/kadmiyum|\(cd\)/.test(a)) return mg ? 'kadmiyum' : undefined;
  if (/krom|\(cr\)/.test(a)) return mg ? 'krom' : undefined;
  if (/nikel|\(ni\)/.test(a)) return mg ? 'nikel' : undefined;
  if (/organik karbon/.test(a)) return 'organikKarbon';
  if (/no3|nitrat/.test(a)) return mg ? 'no3' : undefined;
  if (/nh4|amonyum/.test(a)) return mg ? 'nh4' : undefined;
  if (/katyon|kdk|cec/.test(a)) return 'kdk';
  return undefined;
}

export function kaliteIndeksi(r: SoilReport): IndeksSonucu | undefined {
  const v = r.values;
  const satirlar: IndeksSatiri[] = [];
  const ekle = (key: keyof typeof T, deger: number | undefined, not?: string) => {
    if (deger === undefined || !Number.isFinite(deger)) return;
    if (satirlar.some((s) => s.key === key)) return;
    satirlar.push({ key, ad: T[key].ad, deger, birim: T[key].birim, puan: puanla(key, deger), not });
  };

  ekle('ph', v.ph);
  if (EC_INDEKSE_DAHIL) ekle('ec', v.ec);
  ekle('organikMadde', v.organikMadde);
  ekle('azot', v.azot);
  if (v.fosfor !== undefined) ekle('fosfor', v.fosfor / (0.2 * 2.29), `${v.fosfor} kg/da P₂O₅ → mg/kg P`);
  if (v.potasyum !== undefined) ekle('potasyum', v.potasyum / (0.2 * 1.205) / 391, `${v.potasyum} kg/da K₂O → me/100 g K`);
  ekle('kirec', v.kirec);
  ekle('demir', v.demir);
  ekle('bakir', v.bakir);
  ekle('mangan', v.mangan);
  ekle('cinko', v.cinko);
  ekle('bor', v.bor);
  for (const e of r.ekDegerler ?? []) {
    const k = ekEslestir(e.ad, e.birim);
    if (k) ekle(k, e.deger);
  }

  if (satirlar.length === 0) return undefined;
  const ortalama = satirlar.reduce((s, x) => s + x.puan, 0) / satirlar.length;
  const yuzde = Math.round((ortalama / 5) * 100);
  const s = SINIFLAR.find((c) => yuzde >= c.min)!;
  return { satirlar, ortalama, yuzde, sinif: s.ad, renk: s.renk };
}
