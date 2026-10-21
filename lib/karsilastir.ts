/**
 * Aynı tarlanın iki analizini karşılaştırır.
 * "İyileşme" = değer uygun aralığa yaklaştı; "kötüleşme" = uzaklaştı.
 * Uygun aralığı olmayan değerler (bünye vb.) yalnızca değişim olarak gösterilir.
 */
import { PARAMS, uygunFark, type ParamKey, type SoilReport } from './toprak';

export type Degisim = {
  key: ParamKey;
  ad: string;
  birim: string;
  once: number;
  simdi: number;
  fark: number;
  yuzde: number | null;
  yon: 'artti' | 'azaldi' | 'ayni';
  sonuc: 'iyilesti' | 'kotulesti' | 'ayni' | 'uygun' | 'bilgi';
};

/** Uygun aralıktan uzaklık (aralık içindeyse 0). */
function uzaklik(key: ParamKey, v: number): number | undefined {
  const r = PARAMS[key].uygun;
  if (!r) return undefined;
  const f = uygunFark(key, v);
  return f.durum === 'uygun' ? 0 : f.miktar ?? 0;
}

export function karsilastir(once: SoilReport, simdi: SoilReport): Degisim[] {
  const out: Degisim[] = [];
  (Object.keys(PARAMS) as ParamKey[]).forEach((key) => {
    const a = once.values?.[key];
    const b = simdi.values?.[key];
    if (a === undefined || b === undefined) return;
    const fark = b - a;
    const esik = Math.max(Math.abs(a) * 0.02, 1e-9); // %2'den küçük değişim "aynı" sayılır
    const yon = Math.abs(fark) <= esik ? 'ayni' : fark > 0 ? 'artti' : 'azaldi';
    const ua = uzaklik(key, a);
    const ub = uzaklik(key, b);
    let sonuc: Degisim['sonuc'] = 'bilgi';
    if (ua !== undefined && ub !== undefined) {
      if (yon === 'ayni') sonuc = 'ayni';
      else if (ua === 0 && ub === 0) sonuc = 'uygun'; // değişti ama iki ölçüm de uygun aralıkta
      else if (Math.abs(ub - ua) <= esik) sonuc = 'ayni';
      else sonuc = ub < ua ? 'iyilesti' : 'kotulesti';
    } else if (yon === 'ayni') sonuc = 'ayni';
    out.push({
      key,
      ad: PARAMS[key].label,
      birim: PARAMS[key].unit,
      once: a,
      simdi: b,
      fark,
      yuzde: a !== 0 ? Math.round((fark / Math.abs(a)) * 100) : null,
      yon,
      sonuc,
    });
  });
  return out;
}

export function ozetle(d: Degisim[]) {
  return {
    iyilesen: d.filter((x) => x.sonuc === 'iyilesti').length,
    kotulesen: d.filter((x) => x.sonuc === 'kotulesti').length,
    ayni: d.filter((x) => x.sonuc === 'ayni').length,
    uygun: d.filter((x) => x.sonuc === 'uygun').length,
  };
}
