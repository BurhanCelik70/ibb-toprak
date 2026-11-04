/**
 * Bitkinin dönem dönem su ihtiyacı (FAO-56).
 *  - ETo (iklimin buharlaştırma gücü): FAO-56 Hargreaves eşitliği (Denklem 52), yalnızca sıcaklık ve enlemle.
 *  - ETc = ETo × Kc. Kc değerleri FAO-56 Tablo 12'den (başlangıç / gelişmenin en yoğun dönemi / son).
 *  - Etkili yağış: USDA-SCS yaklaşımıyla aylık yağıştan.
 * Değerler ilin ortalama yılı içindir; kurak ya da yağışlı yıllarda değişir. 1 mm su = dekara 1 m³.
 * ⚠️ Kc'nin dönemlere dağıtımı ve tabloda bulunmayan bitkilerin (yaklaşık: true) katsayıları danışman onayına sunulacaktır.
 */
import { IL_IKLIM } from './iklim';
import { donemAylari } from './sulama';
import type { ZKart } from './zkartlar';

type Kc = { ini: number; mid: number; end: number; yaklasik?: boolean };

/** FAO-56 Tablo 12 (Z-kart bitki adlarıyla) */
export const KC: Record<string, Kc> = {
  'Mısır (dane)': { ini: 0.3, mid: 1.2, end: 0.6 },
  Buğday: { ini: 0.4, mid: 1.15, end: 0.3 },
  Arpa: { ini: 0.3, mid: 1.15, end: 0.25 },
  Kanola: { ini: 0.35, mid: 1.1, end: 0.35 },
  Bezelye: { ini: 0.5, mid: 1.15, end: 1.1 },
  Susam: { ini: 0.35, mid: 1.1, end: 0.25 },
  Ayçiçeği: { ini: 0.35, mid: 1.1, end: 0.35 },
  'Çeltik (pirinç)': { ini: 1.05, mid: 1.2, end: 0.9 },
  Pamuk: { ini: 0.35, mid: 1.18, end: 0.6 },
  'Şeker pancarı': { ini: 0.35, mid: 1.2, end: 0.7 },
  Tütün: { ini: 0.5, mid: 1.05, end: 0.9, yaklasik: true },
  Nar: { ini: 0.5, mid: 0.85, end: 0.6, yaklasik: true },
  'Üzüm (bağ)': { ini: 0.3, mid: 0.85, end: 0.45 },
  Elma: { ini: 0.45, mid: 0.95, end: 0.7 },
  'Şeftali / nektarin': { ini: 0.45, mid: 0.9, end: 0.65 },
  Kayısı: { ini: 0.45, mid: 0.9, end: 0.65 },
  Fındık: { ini: 0.4, mid: 0.9, end: 0.65, yaklasik: true },
  'Narenciye (mandalina)': { ini: 0.7, mid: 0.65, end: 0.7 },
  İncir: { ini: 0.5, mid: 0.8, end: 0.6, yaklasik: true },
  Zeytin: { ini: 0.65, mid: 0.7, end: 0.7 },
  Patates: { ini: 0.5, mid: 1.15, end: 0.75 },
  Domates: { ini: 0.6, mid: 1.15, end: 0.8 },
  Salatalık: { ini: 0.6, mid: 1.0, end: 0.75 },
  Soğan: { ini: 0.7, mid: 1.05, end: 0.75 },
  Çay: { ini: 0.95, mid: 1.0, end: 1.0 },
};

const GUN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const ORTA_GUN = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349];

/** Atmosfer dışı radyasyon, mm/gün eşdeğeri (FAO-56 Denklem 21 × 0,408) */
function ra(enlem: number, ay: number) {
  const fi = (enlem * Math.PI) / 180;
  const J = ORTA_GUN[ay];
  const dr = 1 + 0.033 * Math.cos(((2 * Math.PI) / 365) * J);
  const d = 0.409 * Math.sin(((2 * Math.PI) / 365) * J - 1.39);
  const ws = Math.acos(Math.max(-1, Math.min(1, -Math.tan(fi) * Math.tan(d))));
  const raMJ = ((24 * 60) / Math.PI) * 0.082 * dr * (ws * Math.sin(fi) * Math.sin(d) + Math.cos(fi) * Math.cos(d) * Math.sin(ws));
  return 0.408 * raMJ;
}

/** FAO-56 Hargreaves ETo (mm/gün) */
export function etoAylik(il: string): number[] | undefined {
  const k = IL_IKLIM[il];
  if (!k) return undefined;
  return k.t.map((t, i) => Math.max(0, 0.0023 * (t + 17.8) * Math.sqrt(Math.max(0, k.fark[i])) * ra(k.enlem, i)));
}

/** Aylık etkili yağış (mm/ay), USDA-SCS */
function etkiliYagis(mmAy: number) {
  return mmAy <= 250 ? (mmAy * (125 - 0.2 * mmAy)) / 125 : 125 + 0.1 * mmAy;
}

export type EvreSuyu = { evre: number; kc: number; gunluk: number; toplam: number; yagis: number; sulama: number };
export type SuIhtiyaci = { il: string; evreler: EvreSuyu[]; sezon: { toplam: number; yagis: number; sulama: number }; yaklasik: boolean };

/**
 * Dönemlere Kc dağıtımı (FAO-56 Şekil 34'teki eğrinin basitleştirilmiş hâli):
 * ilk dönem başlangıç, ikinci dönem gelişme (başlangıç ile en yoğunun ortası), aradakiler en yoğun,
 * son dönem geç dönem (en yoğun ile sonun ortası; Kc dönem boyunca en yoğundan son değere iner).
 */
function evreKc(k: Kc, i: number, n: number) {
  if (n === 1) return k.mid;
  if (i === 0) return k.ini;
  if (i === n - 1) return (k.mid + k.end) / 2;
  if (n >= 4 && i === 1) return (k.ini + k.mid) / 2;
  return k.mid;
}

export function suIhtiyaci(zkart: ZKart, il?: string | null): SuIhtiyaci | undefined {
  if (!il) return undefined;
  const iklim = IL_IKLIM[il];
  const eto = etoAylik(il);
  const kc = KC[zkart.bitki];
  if (!iklim || !eto || !kc) return undefined;

  const aylar = zkart.evreler.map((e) => donemAylari(e.donem));
  // Aynı ay birden fazla dönemde geçiyorsa o ay dönemler arasında eşit paylaştırılır (çift sayılmasın)
  const paylasim = new Array(12).fill(0);
  aylar.forEach((as) => as.forEach((m) => (paylasim[m] += 1)));

  const n = zkart.evreler.length;
  const evreler: EvreSuyu[] = zkart.evreler.map((_, i) => {
    const c = evreKc(kc, i, n);
    let toplam = 0;
    let yagis = 0;
    let gun = 0;
    for (const m of aylar[i]) {
      const w = 1 / paylasim[m];
      toplam += GUN[m] * eto[m] * c * w;
      yagis += etkiliYagis(GUN[m] * iklim.yagis[m]) * w;
      gun += GUN[m] * w;
    }
    const y = Math.min(yagis, toplam);
    return { evre: i, kc: c, gunluk: gun ? toplam / gun : 0, toplam, yagis: y, sulama: Math.max(0, toplam - y) };
  });
  const sezon = evreler.reduce((s, e) => ({ toplam: s.toplam + e.toplam, yagis: s.yagis + e.yagis, sulama: s.sulama + e.sulama }), { toplam: 0, yagis: 0, sulama: 0 });
  return { il, evreler, sezon, yaklasik: !!kc.yaklasik };
}
