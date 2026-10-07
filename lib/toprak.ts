/**
 * Toprak Rehberi – veri modeli ve kural tabanlı değerlendirme.
 *
 * Alanlar İBB Asya Yakası Çevre Laboratuvarı "Toprak Analiz Raporu"
 * (P.18-Ek3 Rev.03) ile birebir aynıdır. Birimler de rapordaki gibidir:
 *   EC  -> µS/cm   (dS/m DEĞİL)
 *   P   -> P2O5 kg/da  (mg/kg DEĞİL)
 *   K   -> K2O  kg/da  (mg/kg DEĞİL)
 * Raporda azot (N) ölçülmüyor; bu yüzden modelde yok.
 *
 * Sınıf sınırları "Toprak, Su, Bitki ve Gübre Analiz Metotları Laboratuvar
 * El Kitabı" sınıflamasıyla uyumlu olacak şekilde seçildi ve yüklenen
 * T26-286/287/288 raporlarındaki laboratuvar değerlendirmeleriyle test edildi.
 * ⚠️ Yayına almadan önce sınırları laboratuvar sorumlusuna onaylatın
 *    (özellikle potasyum).
 */

export type ParamKey =
  | 'doygunluk'
  | 'ph'
  | 'ec'
  | 'tuz'
  | 'kum'
  | 'silt'
  | 'kil'
  | 'kirec'
  | 'organikMadde'
  | 'fosfor'
  | 'potasyum';

export type Tone = 'iyi' | 'dikkat' | 'sorun' | 'bilgi';

export type Classification = {
  label: string; // Raporda yazan / hesaplanan sınıf ("Az", "Nötr" ...)
  tone: Tone; // Renk ve ikon için
  meaning: string; // Vatandaşın anlayacağı tek cümle
};

export type SoilReport = {
  raporNo?: string;
  raporTarihi?: string;
  ilce?: string;
  adres?: string;
  numuneAdi?: string; // "Tepe Tarla"
  bitki?: string; // Ekimi planlanan bitki
  numuneTarihi?: string;
  bunyeSinifi?: string; // Laboratuvarın verdiği bünye sınıfı: "CL (Killi Tın Bünyeli)"
  values: Partial<Record<ParamKey, number>>;
  /** Laboratuvarın "Değerlendirme" sütunu – varsa her zaman bunu esas alıyoruz. */
  labDegerlendirme: Partial<Record<ParamKey | 'bunye', string>>;
};

export type ParamDef = {
  key: ParamKey;
  label: string;
  reportLabel: string; // Raporda nasıl yazıyor – kullanıcı bulabilsin diye
  unit: string;
  helper: string;
  placeholder: string;
  min: number;
  max: number;
  why: string; // Bu değer neden önemli (sade dil)
};

export const PARAMS: Record<ParamKey, ParamDef> = {
  ph: {
    key: 'ph',
    label: 'pH',
    reportLabel: 'pH (25 °C) (Saturasyon Çamurunda)',
    unit: '',
    helper: 'Raporda "pH" satırındaki sayı. Genelde 4 ile 9 arasıdır.',
    placeholder: '7,12',
    min: 0,
    max: 14,
    why: 'Toprağın asit mi kireçli mi olduğunu gösterir; bitkinin besinleri alıp alamayacağını belirler.',
  },
  ec: {
    key: 'ec',
    label: 'Elektriksel iletkenlik (EC)',
    reportLabel: 'EC (25 °C) (Saturasyon Çamurunda)',
    unit: 'µS/cm',
    helper: 'Raporda birimi µS/cm yazar (ör. 658). Küçük bir sayı (ör. 0,65) görüyorsanız birim dS/m olabilir.',
    placeholder: '658',
    min: 0,
    max: 50000,
    why: 'Topraktaki tuz miktarının dolaylı ölçüsüdür. Yüksekse bitki suyu zor alır.',
  },
  tuz: {
    key: 'tuz',
    label: 'Toplam tuz',
    reportLabel: 'Tuz',
    unit: '%',
    helper: 'Raporda "Tuz" satırı. Genelde 0,01 – 0,1 gibi küçük bir sayıdır.',
    placeholder: '0,021',
    min: 0,
    max: 10,
    why: 'Tuzluluk bitki köklerine zarar verebilir.',
  },
  doygunluk: {
    key: 'doygunluk',
    label: 'Su ile doygunluk',
    reportLabel: 'Su ile Doygunluk',
    unit: '%',
    helper: 'Raporun ilk satırı. Toprağın ne kadar su tutabildiğini gösterir.',
    placeholder: '51',
    min: 0,
    max: 200,
    why: 'Toprağın kumlu mu killi mi olduğuna dair ilk ipucudur.',
  },
  kum: {
    key: 'kum',
    label: 'Kum oranı',
    reportLabel: 'Bünye – Kum Oranı',
    unit: '%',
    helper: 'Bünye satırındaki kum yüzdesi.',
    placeholder: '44,56',
    min: 0,
    max: 100,
    why: 'Kum suyu hızlı geçirir, besin tutmaz.',
  },
  silt: {
    key: 'silt',
    label: 'Silt oranı',
    reportLabel: 'Bünye – Silt Oranı',
    unit: '%',
    helper: 'Bünye satırındaki silt yüzdesi.',
    placeholder: '24,72',
    min: 0,
    max: 100,
    why: 'Silt, kum ile kil arasında orta büyüklükte tanelerdir.',
  },
  kil: {
    key: 'kil',
    label: 'Kil oranı',
    reportLabel: 'Bünye – Kil Oranı',
    unit: '%',
    helper: 'Bünye satırındaki kil yüzdesi.',
    placeholder: '30,72',
    min: 0,
    max: 100,
    why: 'Kil su ve besin tutar ama fazlası toprağı ağırlaştırır.',
  },
  kirec: {
    key: 'kirec',
    label: 'Kireç',
    reportLabel: 'Kireç',
    unit: '%',
    helper: 'Raporda "Kireç" satırı.',
    placeholder: '3,64',
    min: 0,
    max: 100,
    why: 'Fazla kireç demir, çinko ve fosforun bitkiye geçişini zorlaştırır.',
  },
  organikMadde: {
    key: 'organikMadde',
    label: 'Organik madde',
    reportLabel: 'Organik Madde',
    unit: '%',
    helper: 'Raporda "Organik Madde" satırı.',
    placeholder: '1,64',
    min: 0,
    max: 100,
    why: 'Toprağın canlılığı ve verimliliğidir; su tutmayı ve yapıyı iyileştirir.',
  },
  fosfor: {
    key: 'fosfor',
    label: 'Yarayışlı fosfor',
    reportLabel: 'Yarayışlı Fosfor',
    unit: 'P₂O₅ kg/da',
    helper: 'Birim P₂O₅ kg/da olmalı (dekar başına kilogram). Raporunuzda farklıysa laboratuvara danışın.',
    placeholder: '6,53',
    min: 0,
    max: 200,
    why: 'Kök gelişimi ve çiçeklenme için gereklidir.',
  },
  potasyum: {
    key: 'potasyum',
    label: 'Yarayışlı potasyum',
    reportLabel: 'Yarayışlı Potasyum',
    unit: 'K₂O kg/da',
    helper: 'Birim K₂O kg/da olmalı (dekar başına kilogram).',
    placeholder: '41,09',
    min: 0,
    max: 500,
    why: 'Bitkinin hastalığa, kuraklığa dayanıklılığını ve ürün kalitesini artırır.',
  },
};

/** Manuel giriş adımları – raporun satır sırasını takip eder. */
export const MANUAL_STEPS: { title: string; description: string; fields: ParamKey[] }[] = [
  {
    title: 'Tuz ve asitlik',
    description: 'Raporun üst kısmındaki ilk satırlar.',
    fields: ['doygunluk', 'ph', 'ec', 'tuz'],
  },
  {
    title: 'Toprağın yapısı (bünye)',
    description: 'Kum, silt ve kil oranları. Üçünün toplamı yaklaşık %100 olmalı.',
    fields: ['kum', 'silt', 'kil'],
  },
  {
    title: 'Kireç ve besinler',
    description: 'Raporun alt kısmındaki satırlar.',
    fields: ['kirec', 'organikMadde', 'fosfor', 'potasyum'],
  },
];

export const BUNYE_SINIFLARI = [
  { code: 'S', label: 'Kum' },
  { code: 'LS', label: 'Tınlı kum' },
  { code: 'SL', label: 'Kumlu tın' },
  { code: 'L', label: 'Tın' },
  { code: 'SiL', label: 'Siltli tın' },
  { code: 'Si', label: 'Silt' },
  { code: 'SCL', label: 'Kumlu killi tın' },
  { code: 'CL', label: 'Killi tın' },
  { code: 'SiCL', label: 'Siltli killi tın' },
  { code: 'SC', label: 'Kumlu kil' },
  { code: 'SiC', label: 'Siltli kil' },
  { code: 'C', label: 'Kil' },
];

export const ISTANBUL_ILCELERI = [
  'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy',
  'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece',
  'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa',
  'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik',
  'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla',
  'Ümraniye', 'Üsküdar', 'Zeytinburnu',
];

/** "7,12" / "7.12" / " 658 " -> number. Türkçe virgülü destekler. */
export function parseNumber(input: string | number | null | undefined): number | undefined {
  if (input === null || input === undefined) return undefined;
  if (typeof input === 'number') return Number.isFinite(input) ? input : undefined;
  const s = input.trim().replace(/\s/g, '');
  if (!s) return undefined;
  // "1.234,5" -> 1234.5 ; "7,12" -> 7.12 ; "7.12" -> 7.12
  const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : undefined;
}

export function formatNumber(n: number, maxFraction = 2): string {
  return n.toLocaleString('tr-TR', { maximumFractionDigits: maxFraction, useGrouping: false });
}

/** Girilen değer için uyarı (yanlış birim vb.). Hata değil, kullanıcıya soru. */
export function sanityWarning(key: ParamKey, value: number): string | undefined {
  const def = PARAMS[key];
  if (value < def.min || value > def.max) return `${def.label} için bu değer olağan dışı görünüyor.`;
  if (key === 'ec' && value > 0 && value < 20)
    return 'Bu değer dS/m cinsinden olabilir. Raporunuzda µS/cm yazıyorsa 1000 ile çarpılmış hâlini girin (ör. 0,658 → 658).';
  if (key === 'ph' && (value < 3 || value > 10)) return 'pH genelde 4 – 9 arasındadır. Değeri tekrar kontrol edin.';
  if (key === 'tuz' && value > 2) return 'Tuz yüzdesi genelde 1’in altındadır. Değeri tekrar kontrol edin.';
  return undefined;
}

export function textureSumWarning(v: SoilReport['values']): string | undefined {
  if (v.kum === undefined || v.silt === undefined || v.kil === undefined) return undefined;
  const sum = v.kum + v.silt + v.kil;
  if (Math.abs(sum - 100) > 2) return `Kum + silt + kil toplamı %${formatNumber(sum)} çıktı; %100 olmalı. Değerleri kontrol edin.`;
  return undefined;
}

// ---------------------------------------------------------------------------
// Sınıflandırma
// ---------------------------------------------------------------------------

type Band = { upTo: number; inclusive?: boolean; label: string; tone: Tone; meaning: string };

function band(value: number, bands: Band[]): Classification {
  for (const b of bands) {
    if (b.inclusive ? value <= b.upTo : value < b.upTo) return { label: b.label, tone: b.tone, meaning: b.meaning };
  }
  const last = bands[bands.length - 1];
  return { label: last.label, tone: last.tone, meaning: last.meaning };
}

const RULES: Partial<Record<ParamKey, (v: number) => Classification>> = {
  ph: (v) =>
    band(v, [
      { upTo: 4.5, label: 'Kuvvetli asit', tone: 'sorun', meaning: 'Toprak çok asidik; birçok bitki zorlanır, kireçleme gerekebilir.' },
      { upTo: 5.5, label: 'Orta asit', tone: 'dikkat', meaning: 'Toprak asidik; asit seven bitkiler dışında düzeltme gerekebilir.' },
      { upTo: 6.5, label: 'Hafif asit', tone: 'iyi', meaning: 'Çoğu bitki için uygun, hafif asidik bir toprak.' },
      { upTo: 7.5, inclusive: true, label: 'Nötr', tone: 'iyi', meaning: 'Asitlik açısından çoğu bitki için ideal aralıkta.' },
      { upTo: 8.5, inclusive: true, label: 'Hafif alkali', tone: 'dikkat', meaning: 'Hafif kireçli/bazik; demir ve çinko alımı zorlaşabilir.' },
      { upTo: Infinity, label: 'Kuvvetli alkali', tone: 'sorun', meaning: 'Çok bazik; besin alımı ciddi şekilde zorlaşır, uzman desteği alın.' },
    ]),
  ec: (v) =>
    band(v, [
      { upTo: 4000, label: 'Tuzsuz', tone: 'iyi', meaning: 'Tuzluluk sorunu yok.' },
      { upTo: 8000, label: 'Hafif tuzlu', tone: 'dikkat', meaning: 'Tuza hassas bitkilerde verim düşebilir.' },
      { upTo: 15000, label: 'Orta tuzlu', tone: 'sorun', meaning: 'Çoğu bitkide verim düşer; yıkama ve drenaj gerekebilir.' },
      { upTo: Infinity, label: 'Çok tuzlu', tone: 'sorun', meaning: 'Yalnızca tuza dayanıklı bitkiler yetişebilir.' },
    ]),
  tuz: (v) =>
    band(v, [
      { upTo: 0.15, label: 'Tuzsuz', tone: 'iyi', meaning: 'Tuz oranı düşük.' },
      { upTo: 0.35, label: 'Hafif tuzlu', tone: 'dikkat', meaning: 'Hassas bitkilerde sorun çıkabilir.' },
      { upTo: 0.65, label: 'Orta tuzlu', tone: 'sorun', meaning: 'Verim kaybı beklenir.' },
      { upTo: Infinity, label: 'Çok tuzlu', tone: 'sorun', meaning: 'Tarım için ciddi sorun.' },
    ]),
  doygunluk: (v) =>
    band(v, [
      { upTo: 30, inclusive: true, label: 'Kumlu', tone: 'bilgi', meaning: 'Suyu az tutar, sık sulama ister.' },
      { upTo: 50, inclusive: true, label: 'Tınlı', tone: 'bilgi', meaning: 'Su tutma dengeli.' },
      { upTo: 70, inclusive: true, label: 'Killi-tınlı', tone: 'bilgi', meaning: 'Suyu iyi tutar.' },
      { upTo: 110, inclusive: true, label: 'Killi', tone: 'bilgi', meaning: 'Suyu çok tutar, geç tava gelir.' },
      { upTo: Infinity, label: 'Ağır killi', tone: 'dikkat', meaning: 'Çok ağır toprak; işlemesi zor, su birikebilir.' },
    ]),
  kirec: (v) =>
    band(v, [
      { upTo: 1, label: 'Kireçsiz', tone: 'iyi', meaning: 'Kireç sorunu yok.' },
      { upTo: 5, label: 'Az kireçli', tone: 'iyi', meaning: 'Kireç seviyesi sorun yaratmaz.' },
      { upTo: 15, label: 'Orta kireçli', tone: 'dikkat', meaning: 'Bazı besinlerin (demir, çinko, fosfor) alımı azalabilir.' },
      { upTo: 25, label: 'Fazla kireçli', tone: 'sorun', meaning: 'Besin alımı zorlaşır; kirece dayanıklı bitki seçin.' },
      { upTo: Infinity, label: 'Çok fazla kireçli', tone: 'sorun', meaning: 'Kireç ciddi bir kısıt; uzman desteği alın.' },
    ]),
  organikMadde: (v) =>
    band(v, [
      { upTo: 1, label: 'Çok az', tone: 'sorun', meaning: 'Toprak canlılığı çok düşük; organik gübre/kompost önemli.' },
      { upTo: 2, label: 'Az', tone: 'dikkat', meaning: 'Organik madde düşük; kompost, ahır gübresi veya yeşil gübre faydalı olur.' },
      { upTo: 3, label: 'Orta', tone: 'iyi', meaning: 'Kabul edilebilir seviyede.' },
      { upTo: 4, label: 'İyi', tone: 'iyi', meaning: 'Organik madde iyi seviyede.' },
      { upTo: Infinity, label: 'Yüksek', tone: 'iyi', meaning: 'Organik madde bakımından zengin.' },
    ]),
  fosfor: (v) =>
    band(v, [
      { upTo: 3, label: 'Çok az', tone: 'sorun', meaning: 'Fosfor eksik; gübreleme gerekebilir.' },
      { upTo: 6, label: 'Az', tone: 'dikkat', meaning: 'Fosfor yetersiz; ekimden önce takviye düşünülmeli.' },
      { upTo: 9, label: 'Orta', tone: 'iyi', meaning: 'Fosfor orta seviyede.' },
      { upTo: 12, label: 'Yüksek', tone: 'iyi', meaning: 'Fosfor yeterli.' },
      { upTo: Infinity, label: 'Çok yüksek', tone: 'dikkat', meaning: 'Fosfor fazla; ek fosforlu gübreye gerek yok.' },
    ]),
  // TODO: Potasyum sınırlarını laboratuvar ile teyit edin.
  potasyum: (v) =>
    band(v, [
      { upTo: 20, label: 'Az', tone: 'dikkat', meaning: 'Potasyum yetersiz olabilir.' },
      { upTo: 30, label: 'Orta', tone: 'iyi', meaning: 'Potasyum orta seviyede.' },
      { upTo: Infinity, label: 'Yeterli', tone: 'iyi', meaning: 'Potasyum yeterli; ek potasyuma genelde gerek yok.' },
    ]),
};

const TONE_BY_LABEL: Record<string, Tone> = {
  'nötr': 'iyi', 'hafif asit': 'iyi', 'tuzsuz': 'iyi', 'kireçsiz': 'iyi', 'az kireçli': 'iyi',
  'orta': 'iyi', 'iyi': 'iyi', 'yüksek': 'iyi', 'yeterli': 'iyi',
  'hafif alkali': 'dikkat', 'orta asit': 'dikkat', 'hafif tuzlu': 'dikkat', 'orta kireçli': 'dikkat', 'az': 'dikkat',
  'çok az': 'sorun', 'kuvvetli asit': 'sorun', 'kuvvetli alkali': 'sorun', 'orta tuzlu': 'sorun',
  'çok tuzlu': 'sorun', 'fazla kireçli': 'sorun', 'çok fazla kireçli': 'sorun',
};

export type ParamResult = {
  key: ParamKey;
  value: number;
  classification?: Classification;
  source: 'laboratuvar' | 'hesaplandı';
};

/**
 * Laboratuvarın değerlendirmesi varsa onu kullanır (resmî sonuç odur),
 * yoksa kural tablosundan hesaplar.
 */
export function classify(report: SoilReport): ParamResult[] {
  const out: ParamResult[] = [];
  (Object.keys(PARAMS) as ParamKey[]).forEach((key) => {
    const value = report.values[key];
    if (value === undefined) return;
    // Kum, silt ve kil için ayrı kural yok; bünye sınıfıyla birlikte bilgi olarak gösterilir.
    const computed: Classification = RULES[key]?.(value) ?? {
      label: report.bunyeSinifi ? `Bünye: ${report.bunyeSinifi}` : 'Bünye bileşeni',
      tone: 'bilgi',
      meaning: 'Toprağın yapısını (bünyesini) oluşturan tanelerin oranı. Tek başına iyi ya da kötü değildir.',
    };
    const lab = report.labDegerlendirme[key];
    if (lab) {
      const tone = TONE_BY_LABEL[lab.toLocaleLowerCase('tr-TR')] ?? computed.tone;
      out.push({ key, value, source: 'laboratuvar', classification: { label: lab, tone, meaning: computed.meaning } });
    } else {
      out.push({ key, value, source: 'hesaplandı', classification: computed });
    }
  });
  return out;
}

/** AI'ya gönderilecek sade, doğrulanmış özet. Sayılar burada sabitlenir; AI yeni sayı üretmez. */
export function buildAiPayload(report: SoilReport) {
  return {
    raporNo: report.raporNo,
    ilce: report.ilce,
    numune: report.numuneAdi,
    planlananBitki: report.bitki,
    bunyeSinifi: report.bunyeSinifi,
    parametreler: classify(report).map((r) => ({
      parametre: PARAMS[r.key].label,
      deger: r.value,
      birim: PARAMS[r.key].unit,
      sinif: r.classification?.label,
      durum: r.classification?.tone,
      kaynak: r.source,
    })),
  };
}

export function emptyReport(): SoilReport {
  return { values: {}, labDegerlendirme: {} };
}