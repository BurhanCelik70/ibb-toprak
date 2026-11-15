/**
 * Laboratuvar birimleri dile göre.
 *
 * Uygulama içinde değerler Türk laboratuvar birimleriyle saklanır ve sınıflandırılır:
 *   pH (saturasyon çamuru, suda) · P₂O₅ ve K₂O kg/da (Olsen / amonyum asetat).
 * Alman laboratuvarları (VDLUFA) farklı yöntem ve birim kullanır:
 *   pH (CaCl₂) · P₂O₅ ve K₂O mg/100 g Boden (CAL yöntemi).
 * Almancada değerler bu birimlerle girilir ve gösterilir; içeride Türk birimine çevrilir.
 * İspanyolca ve Arapçada fosfor ve potasyum mg/kg (Olsen P, amonyum asetat K) ile girilir (aşağıda MGKG).
 *
 * Yöntemler farklı olduğu için çeviri birebir kimyasal eşitlik değildir; gehaltsklasse sınırları
 * eşleştirilerek yapılır (VDLUFA sınıf C ↔ Türk "uygun" aralığı), sınıf ve öneriler doğru çıkar:
 *   P₂O₅ (CAL, mg/100 g): A 0–4 · B 5–7 · C 8–18 · D 19–30 · E >30   (VDLUFA 2018, Acker- und Grünland)
 *   K₂O  (CAL, mg/100 g, mittlere Böden): A 0–5 · B 6–11 · C 12–20 · D 21–33 · E >33
 *   pH(H₂O) ≈ pH(CaCl₂) + 0,5
 * Kaynak: LHL Hessen, Erläuterungen zur Bodenuntersuchung (2024); DLR Rheinland-Pfalz, Merkblatt Düngeplanung Phosphor.
 */
import { sayiLocale, type Dil } from './dil';
import { PARAMS, type ParamKey } from './toprak';

type Donusum = {
  /** Alman raporundaki ad */
  etiket: string;
  birim: string;
  /** iç değer (TR) → gösterilen (DE) */
  ileri: (v: number) => number;
  /** gösterilen (DE) → iç değer (TR) */
  geri: (v: number) => number;
  ornek: string;
  aciklama: string;
};

/** Parçalı doğrusal eşleme: [Almanca değer, Türk değeri] noktaları */
function parcali(noktalar: [number, number][]) {
  const ara = (x: number, a: 0 | 1) => {
    const b = a === 0 ? 1 : 0;
    const p = noktalar;
    if (x <= p[0][a]) return p[0][b];
    for (let i = 1; i < p.length; i++) {
      if (x <= p[i][a]) {
        const t = (x - p[i - 1][a]) / (p[i][a] - p[i - 1][a]);
        return p[i - 1][b] + t * (p[i][b] - p[i - 1][b]);
      }
    }
    const [x1, y1] = [p[p.length - 2][a], p[p.length - 2][b]];
    const [x2, y2] = [p[p.length - 1][a], p[p.length - 1][b]];
    return y2 + ((x - x2) * (y2 - y1)) / (x2 - x1);
  };
  return { geri: (de: number) => ara(de, 0), ileri: (tr: number) => ara(tr, 1) };
}

const P_KG_DA = 0.2 * 2.29;
const K_KG_DA = 0.2 * 1.205;

// Sınıf sınırları: [DE mg/100 g, TR kg/da]
const P = parcali([[0, 0], [4.5, 3], [7.5, 6], [18.5, 12], [30.5, 18], [80, 48]]);
const K = parcali([[0, 0], [5.5, 10], [11.5, 20], [20.5, 30], [33.5, 45], [80, 100]]);

/**
 * Rapordan okunan fosfor, potasyum ve pH'ı, raporda yazan birime göre iç birime (Türk raporu: P₂O₅ / K₂O kg/da, pH suda) çevirir.
 * Böylece Alman (CAL, mg/100 g), İspanyol (Olsen, mg/kg) ya da Türk raporu hangi dilde yüklenirse yüklensin doğru okunur.
 * Birim tanınmazsa undefined döner (değer "ek değerler"e gider).
 */
export function laborBirimindenIc(k: ParamKey, v: number, birim?: string): number | undefined {
  const u = (birim ?? '').toLocaleLowerCase('tr-TR').replace(/[\s₂₅]/g, (c) => (c === '₂' ? '2' : c === '₅' ? '5' : ''));
  if (k === 'ph') return /cacl/.test(u) ? v + 0.5 : v;
  if (k !== 'fosfor' && k !== 'potasyum') return v;
  const oksit = k === 'fosfor' ? /p2o5/.test(u) : /k2o/.test(u);
  // Birim sözcükleri atılınca geriye "p" ya da "k" kalıyorsa değer element olarak verilmiştir (mg P/100 g, mg/kg K)
  const kalan = u.replace(/ppm|mg|kg|dekar|da|100g|cal|olsen|[^a-z]/g, '');
  const element = !oksit && kalan.includes(k === 'fosfor' ? 'p' : 'k');
  const oran = k === 'fosfor' ? 2.29 : 1.205; // element → oksit
  if (!u || /kg\/da|kg\/dekar|dekar/.test(u)) return v;
  if (/100g/.test(u)) {
    // CAL, mg/100 g (Almanya). Element yazıyorsa oksite çevir.
    const deOksit = element ? v * oran : v;
    return k === 'fosfor' ? P.geri(deOksit) : K.geri(deOksit);
  }
  if (/mg\/kg|ppm|mgkg/.test(u)) {
    // Olsen P / amonyum asetat K, mg/kg (İspanya vb.). Oksit yazıyorsa elemente çevir.
    const el = oksit ? v / oran : v;
    return k === 'fosfor' ? el * P_KG_DA : el * K_KG_DA;
  }
  return undefined;
}

const DE: Partial<Record<ParamKey, Donusum>> = {
  ph: {
    etiket: 'pH (CaCl₂)',
    birim: '',
    ileri: (v) => v - 0.5,
    geri: (v) => v + 0.5,
    ornek: '6,4',
    aciklama: 'Der pH-Wert in CaCl₂, wie ihn deutsche Labore angeben. Meist zwischen 4 und 8.',
  },
  fosfor: {
    etiket: 'Phosphat (P₂O₅, CAL)',
    birim: 'mg/100 g',
    ...P,
    ornek: '12',
    aciklama: 'Wert in mg P₂O₅ je 100 g Boden (CAL-Methode). Steht der Wert als P, mit 2,29 multiplizieren.',
  },
  potasyum: {
    etiket: 'Kali (K₂O, CAL)',
    birim: 'mg/100 g',
    ...K,
    ornek: '15',
    aciklama: 'Wert in mg K₂O je 100 g Boden (CAL-Methode). Steht der Wert als K, mit 1,2 multiplizieren.',
  },
};

/**
 * İspanyol ve Arap laboratuvarları fosfor ve potasyumu mg/kg (ppm) verir: P (Olsen, P olarak) ve K (amonyum asetat, K olarak).
 * Türk raporundaki P₂O₅ ve K₂O kg/da aynı yöntemlere dayanır; çeviri birebirdir (0–20 cm, 1 g/cm³ varsayımıyla, lib/indeks.ts ile aynı):
 *   P₂O₅ kg/da = P mg/kg × 0,2 × 2,29 · K₂O kg/da = K mg/kg × 0,2 × 1,205. pH suda ölçülür, aynen kalır.
 */
const MGKG: Record<'en' | 'es' | 'ar', Partial<Record<ParamKey, Donusum>>> = {
  en: {
    fosfor: { etiket: 'Available phosphorus (Olsen P)', birim: 'mg/kg', ileri: (v) => v / P_KG_DA, geri: (v) => v * P_KG_DA, ornek: '18', aciklama: 'Value in mg P per kg of soil (Olsen method), also given as ppm. If the report gives P₂O₅, divide it by 2.29.' },
    potasyum: { etiket: 'Available potassium (K, ammonium acetate)', birim: 'mg/kg', ileri: (v) => v / K_KG_DA, geri: (v) => v * K_KG_DA, ornek: '220', aciklama: 'Value in mg K per kg of soil (ammonium acetate extraction), also ppm. If the report gives K₂O, divide it by 1.2.' },
  },
  es: {
    fosfor: { etiket: 'Fósforo asimilable (P Olsen)', birim: 'mg/kg', ileri: (v) => v / P_KG_DA, geri: (v) => v * P_KG_DA, ornek: '18', aciklama: 'Valor en mg de P por kg de suelo (método Olsen), también expresado como ppm. Si el informe da P₂O₅, divídalo entre 2,29.' },
    potasyum: { etiket: 'Potasio asimilable (K, acetato amónico)', birim: 'mg/kg', ileri: (v) => v / K_KG_DA, geri: (v) => v * K_KG_DA, ornek: '220', aciklama: 'Valor en mg de K por kg de suelo (extracción con acetato amónico), también ppm. Si el informe da K₂O, divídalo entre 1,2.' },
  },
  ar: {
    fosfor: { etiket: 'الفوسفور المتاح (P أولسن)', birim: 'mg/kg', ileri: (v) => v / P_KG_DA, geri: (v) => v * P_KG_DA, ornek: '18', aciklama: 'القيمة بالملغ P لكل كغ تربة (طريقة أولسن)، أي ppm. إن ذكر التقرير P₂O₅ فاقسمه على 2,29.' },
    potasyum: { etiket: 'البوتاسيوم المتاح (K، أسيتات الأمونيوم)', birim: 'mg/kg', ileri: (v) => v / K_KG_DA, geri: (v) => v * K_KG_DA, ornek: '220', aciklama: 'القيمة بالملغ K لكل كغ تربة (استخلاص بأسيتات الأمونيوم)، أي ppm. إن ذكر التقرير K₂O فاقسمه على 1,2.' },
  },
};

export const birimDonusumu = (k: ParamKey, dil: Dil) => (dil === 'de' ? DE[k] : dil === 'en' || dil === 'es' || dil === 'ar' ? MGKG[dil][k] : undefined);

/** İç değeri ekranda gösterilecek değere çevirir */
export const degerGoster = (k: ParamKey, v: number, dil: Dil) => {
  const d = birimDonusumu(k, dil);
  // Çevrilen değerler bir ondalığa yuvarlanır (20,087 mg/kg → 20,1)
  return d ? Math.round(d.ileri(v) * 10) / 10 : v;
};
/** Kullanıcının girdiği değeri iç değere çevirir */
export const icDeger = (k: ParamKey, v: number, dil: Dil) => birimDonusumu(k, dil)?.geri(v) ?? v;
export const birimGoster = (k: ParamKey, dil: Dil) => birimDonusumu(k, dil)?.birim ?? PARAMS[k].unit;
export const etiketGoster = (k: ParamKey, dil: Dil) => birimDonusumu(k, dil)?.etiket ?? PARAMS[k].label;

const sayi = (n: number, dil: Dil, b = 2) => n.toLocaleString(sayiLocale(dil), { maximumFractionDigits: b });

/** Uygun aralık metni (gösterim biriminde, Türkçe kalıp; çeviri tx ile) */
export function aralikMetni(k: ParamKey, dil: Dil): string {
  const r = PARAMS[k].uygun;
  if (!r) return '—';
  const g = (x: number) => sayi(degerGoster(k, x, dil), dil, 1);
  if (r.min !== undefined && r.max !== undefined) return `${g(r.min)} – ${g(r.max)}`;
  if (r.min !== undefined) return `en az ${g(r.min)}`;
  return `en çok ${g(r.max!)}`;
}

/** Uygun aralıktan fark metni (gösterim biriminde) */
export function farkMetni(k: ParamKey, v: number, dil: Dil): string {
  const def = PARAMS[k];
  const r = def.uygun;
  if (!r) return '';
  const birim = birimGoster(k, dil);
  const u = def.unit === '%' ? ' puan' : birim ? ` ${birim}` : '';
  const d = degerGoster(k, v, dil);
  if (r.min !== undefined && v < r.min) {
    const m = degerGoster(k, r.min, dil);
    return `${sayi(m - d, dil)}${u} eksik (%${Math.round(((m - d) / m) * 100)})`;
  }
  if (r.max !== undefined && v > r.max) {
    const m = degerGoster(k, r.max, dil);
    return `${sayi(d - m, dil)}${u} fazla (%${Math.round(((d - m) / m) * 100)})`;
  }
  return 'Uygun aralıkta';
}

/**
 * Alman Bodenart sınıfları (Bodenkundliche Kartieranleitung / Bodenschätzung) → uygulamanın USDA sınıfı.
 * Değer olarak USDA metni saklanır; ekranda Almanca ad gösterilir.
 */
export const DE_BODENARTEN: { ad: string; kod: string }[] = [
  { ad: 'S – Sand', kod: 'S (Kum)' },
  { ad: 'lS – lehmiger Sand', kod: 'LS (Tınlı kum)' },
  { ad: 'sL – sandiger Lehm', kod: 'SL (Kumlu tın)' },
  { ad: 'L – Lehm', kod: 'L (Tın)' },
  { ad: 'uL / U – schluffiger Lehm, Schluff', kod: 'SiL (Siltli tın)' },
  { ad: 'tL – toniger Lehm', kod: 'CL (Killi tın)' },
  { ad: 'LT – lehmiger Ton', kod: 'SiCL (Siltli killi tın)' },
  { ad: 'T – Ton', kod: 'C (Kil)' },
];

/** VDLUFA Gehaltsklasse (A–E) — Almanca gösterilen değerden */
export function gehaltsklasse(k: 'fosfor' | 'potasyum', de: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  const s = k === 'fosfor' ? [4.5, 7.5, 18.5, 30.5] : [5.5, 11.5, 20.5, 33.5];
  return (['A', 'B', 'C', 'D', 'E'] as const)[s.filter((x) => de >= x).length];
}

/** Yapay zekâya: değerlerin Alman laboratuvar birimleriyle karşılığı (Almanca raporda bunlar yazılır) */
export function almanLaborDegerleri(values: Partial<Record<ParamKey, number>> | undefined) {
  if (!values) return undefined;
  const out: Record<string, string> = {};
  const yuvar = (n: number) => Math.round(n * 10) / 10;
  if (values.ph !== undefined) out['pH (CaCl₂)'] = String(yuvar(values.ph - 0.5));
  for (const k of ['fosfor', 'potasyum'] as const) {
    const v = values[k];
    if (v === undefined) continue;
    const de = degerGoster(k, v, 'de');
    out[`${DE[k]!.etiket}`] = `${yuvar(de)} mg/100 g · Gehaltsklasse ${gehaltsklasse(k, de)}`;
  }
  return Object.keys(out).length ? out : undefined;
}

/** İspanyolca/Arapça yorum için laboratuvar değerleri mg/kg (P Olsen, K amonyum asetat) */
export function mgkgLaborDegerleri(values: Partial<Record<ParamKey, number>> | undefined) {
  if (!values) return undefined;
  const out: Record<string, string> = {};
  if (values.fosfor !== undefined) out['P (Olsen)'] = `${Math.round(values.fosfor / P_KG_DA)} mg/kg`;
  if (values.potasyum !== undefined) out['K (acetato amónico)'] = `${Math.round(values.potasyum / K_KG_DA)} mg/kg`;
  return Object.keys(out).length ? out : undefined;
}
