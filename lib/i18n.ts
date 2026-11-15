/**
 * Metin çevirisi (gettext usulü): kaynak metin Türkçedir ve anahtar olarak kullanılır.
 *   t('Tarlalarım')                → 'Meine Felder'
 *   t('{n} analiz', { n: 3 })      → '3 Analysen'
 * Sözlükte olmayan metin olduğu gibi (Türkçe) döner. Sözlükler: lib/ceviri-de.ts, -es, -ar (i18n/uret.py üretir);
 * lib/ceviri-tr.ts yalnız Türkçede değişen metinleri tutar (dekar → hektar).
 * İstemci bileşenlerinde `useT()` / `useDil()` (components/DilSaglayici.tsx), sunucuda `ceviriAl()` (lib/dilSunucu.ts).
 */
import { AR, AR_DESEN } from './ceviri-ar';
import { DE, DE_DESEN } from './ceviri-de';
import { EN, EN_DESEN } from './ceviri-en';
import { ES, ES_DESEN } from './ceviri-es';
import { TR } from './ceviri-tr';
import { alanYaz, dekarli, dozCevir, type Dil } from './dil';

export type Degiskenler = Record<string, string | number | null | undefined>;
export type Ceviri = ((metin: string | null | undefined, d?: Degiskenler) => string) & {
  dil: Dil;
  /** "4,7 kg/da" → "47 kg/ha" (bütün dillerde) */
  doz: (metin: string) => string;
  /** dekar → "1,2 ha" */
  alan: (dekar: number) => string;
  /** Dekar başı miktarı hektar başına çevirir (×10) */
  ha: <T extends { min: number; max: number } | number>(x: T) => T;
};

function doldur(m: string, d?: Degiskenler) {
  return d ? m.replace(/\{(\w+)\}/g, (x, k: string) => (d[k] === undefined || d[k] === null ? x : String(d[k]))) : m;
}

type Desen = [RegExp, (m: RegExpExecArray, t: (s: string) => string) => string];
type Sozluk = { metin: Record<string, string>; desen: Desen[]; doz: [RegExp, string][] };

/** Doz metnindeki sabit sözcükler ("/100 L su" …) */
const DOZ_DE: [RegExp, string][] = [
  [/\/100 L su\b/g, '/100 L Wasser'],
  [/\/100 kg tohum\b/g, '/100 kg Saatgut'],
  [/\/ton tohum\b/g, '/t Saatgut'],
  [/^Toplam /, 'Gesamt '],
  [/^Sezonda /, 'Pro Saison '],
  [/’lık uygulamalarla/g, ''],
  [/, iki haftada bir/g, ', alle zwei Wochen'],
];
const DOZ_EN: [RegExp, string][] = [
  [/\/100 L su\b/g, '/100 L water'],
  [/\/100 kg tohum\b/g, '/100 kg seed'],
  [/\/ton tohum\b/g, '/t seed'],
  [/^Toplam /, 'Total '],
  [/^Sezonda /, 'Per season '],
  [/’lık uygulamalarla/g, ''],
  [/, iki haftada bir/g, ', every two weeks'],
];
const DOZ_ES: [RegExp, string][] = [
  [/\/100 L su\b/g, '/100 L de agua'],
  [/\/100 kg tohum\b/g, '/100 kg de semilla'],
  [/\/ton tohum\b/g, '/t de semilla'],
  [/^Toplam /, 'Total '],
  [/^Sezonda /, 'Por campaña '],
  [/’lık uygulamalarla/g, ''],
  [/, iki haftada bir/g, ', cada dos semanas'],
];
const DOZ_AR: [RegExp, string][] = [
  [/\/100 L su\b/g, '/100 لتر ماء'],
  [/\/100 kg tohum\b/g, '/100 كغ بذور'],
  [/\/ton tohum\b/g, '/طن بذور'],
  [/^Toplam /, 'الإجمالي '],
  [/^Sezonda /, 'في الموسم '],
  [/’lık uygulamalarla/g, ''],
  [/, iki haftada bir/g, '، كل أسبوعين'],
];
const DOZ_TR: [RegExp, string][] = [[/’lık uygulamalarla/g, ' uygulamalarla']];

const SOZLUKLER: Record<Dil, Sozluk> = {
  // İGSAŞ sürümünde Türkçede dekar kalır: dekar → hektar sözlüğü (lib/ceviri-tr.ts) kullanılmaz
  tr: { metin: {} as typeof TR, desen: [], doz: DOZ_TR },
  en: { metin: EN, desen: EN_DESEN, doz: DOZ_EN },
  de: { metin: DE, desen: DE_DESEN, doz: DOZ_DE },
  es: { metin: ES, desen: ES_DESEN, doz: DOZ_ES },
  ar: { metin: AR, desen: AR_DESEN, doz: DOZ_AR },
};

function cevir(m: string, S: Sozluk, dil: Dil): string {
  const s = S.metin[m];
  // Çeviride dekar başı doz kalmışsa ("0,5–1 L/da") hektara çevrilir
  if (s !== undefined) return /\/da\b/.test(s) ? dozCevir(s, dil) : s;
  // baştaki/sondaki boşluk ve noktalama korunarak tekrar dene ("Toplam: " → "Gesamt: ")
  const e = /^(\s*)([^]*?)([\s:.,;·–—]*)$/.exec(m);
  if (e && e[2] && e[2] !== m && S.metin[e[2]] !== undefined) return e[1] + cevir(e[2], S, dil) + e[3];
  const t = (x: string) => cevir(x, S, dil);
  for (const [desen, c] of S.desen) {
    const b = desen.exec(m);
    if (b) {
      // Kalıp çevirisinde dekar başı miktar kaldıysa ("12 kg/da") hektara çevrilir
      const r = c(b, t);
      return /\/da\b/.test(r) ? dozCevir(r, dil) : r;
    }
  }
  // Birleştirilmiş cümleler (ör. "Sabit cümle. Bitkiye göre cümle.") parça parça çevrilir
  if (dil !== 'tr') {
    const parcalar = m.split(/(?<=[.!?])\s+(?=[A-ZÇĞİÖŞÜ0-9])/);
    if (parcalar.length > 1) {
      const c = parcalar.map(t);
      if (c.some((x, i) => x !== parcalar[i])) return c.join(' ');
    }
    // Noktalı virgülle birleştirilmiş parçalar (ör. "potasyum nitratla, suya; sıvı azotlu gübreyle, suya")
    const yari = m.split(/;\s+/);
    if (yari.length > 1) {
      const c = yari.map(t);
      if (c.some((x, i) => x !== yari[i])) return c.join(dil === 'ar' ? '؛ ' : '; ');
    }
  }
  return dekarli(dil) ? m : birimMetni(m);
}

/** Çevirisi olmayan (Türkçe kalan) metinde dekar başı miktarları hektara çevirir: "12 kg/da" → "120 kg/ha", "dekara 4 kg" → "hektara 40 kg" */
function birimMetni(m: string): string {
  if (!/\/da\b|dekar/.test(m)) return m;
  return dozCevir(m, 'tr').replace(
    /dekara (yaklaşık |en az |en çok )?(\d+(?:,\d+)?)(?:–(\d+(?:,\d+)?))? (kg|L|m³)/g,
    (_x, on: string | undefined, a: string, b: string | undefined, u: string) => {
      const y = (t: string) => String(Math.round(Number(t.replace(',', '.')) * 100) / 10).replace('.', ',');
      return `hektara ${on ?? ''}${y(a)}${b ? `–${y(b)}` : ''} ${u}`;
    },
  );
}

/** Doz metnindeki sözcükleri çevirir: "2,7 kg/da (mibzerle banda)", "25 g/100 L su", "Toplam 2,5 L/da" */
function dozMetni(m: string, S: Sozluk): string {
  if (S.metin[m] !== undefined) return S.metin[m];
  let x = m.replace(/\(([^)]+)\)/g, (y, ic: string) => (S.metin[ic] !== undefined ? `(${S.metin[ic]})` : y));
  for (const [d, c] of S.doz) x = x.replace(d, c);
  return x;
}

/** Arapçada (sağdan sola) "20 kg", "2,5 L/ha" gibi sayı + Latin birimleri ters dönmesin diye soldan sağa yalıtılır (LRI … PDI) */
const BIRIMLI = /((?<![\d\w])[-−]?\d[\d.,]*(?:\s*[–-]\s*\d[\d.,]*)?\s?(?:kg|g|L|ml|mg|ha|mm|µS\/cm|dS\/m|m³|MJ)(?:\s?\/\s?(?:ha|da|kg|L|m²·gün|100\s?L|100\s?g))?)(?![A-Za-z])/g;
// Eksi işaretli sayılar (ör. RSC −1.7) sağdan sola metinde işareti sona kaçmasın diye ayrıca yalıtılır
const ISARETLI = /(?<![\d\w\u2066.,])[-−]\d[\d.,]*(?![\d\u2069])/g;
const yalit = (m: string) => (/\d/.test(m) ? m.replace(BIRIMLI, '\u2066$1\u2069').replace(ISARETLI, '\u2066$&\u2069') : m);

/**
 * İngilizcede sayılar Türkçe biçimde gelir ("2,5", "1.250"); İngiliz biçimine çevrilir ("2.5", "1,250").
 * Önce binlik noktaları geçici işarete, sonra ondalık virgülleri noktaya, en sonda geçici işareti virgüle çevirir.
 */
export const sayiIngilizce = (m: string) =>
  /\d[.,]\d/.test(m)
    ? m
        .replace(/(?<![\d.,])([1-9]\d{0,2})((?:\.\d{3})+)(?!\d|\.\d)/g, (_x, a: string, b: string) => a + b.replaceAll('.', '\u0000'))
        .replace(/(\d),(\d)/g, '$1.$2')
        .replaceAll('\u0000', ',')
    : m;

export function ceviriFonk(dil: Dil): Ceviri {
  if (dil === 'en') {
    const g = ceviriFonkHam(dil);
    const f = ((m: string | null | undefined, d?: Degiskenler) => sayiIngilizce(g(m, d))) as Ceviri;
    f.dil = dil;
    f.doz = (m) => sayiIngilizce(g.doz(m));
    f.alan = (d) => sayiIngilizce(g.alan(d));
    f.ha = g.ha;
    return f;
  }
  if (dil === 'ar') {
    const g = ceviriFonkHam(dil);
    // Arapçada da sayılar İngiliz biçimiyle yazılır (2.5, 1,250); sonra sayı + birim yönden yalıtılır
    const f = ((m: string | null | undefined, d?: Degiskenler) => yalit(sayiIngilizce(g(m, d)))) as Ceviri;
    f.dil = dil;
    f.doz = (m) => yalit(sayiIngilizce(g.doz(m)));
    f.alan = (d) => yalit(sayiIngilizce(g.alan(d)));
    f.ha = g.ha;
    return f;
  }
  return ceviriFonkHam(dil);
}

function ceviriFonkHam(dil: Dil): Ceviri {
  const S = SOZLUKLER[dil];
  const f = ((m: string | null | undefined, d?: Degiskenler) => (!m ? m ?? '' : doldur(cevir(m, S, dil), d))) as Ceviri;
  f.dil = dil;
  // Dozlar bütün dillerde hektar başına gösterilir (veride dekar başına olanlar ×10 çevrilir)
  f.doz = (m) => (!m ? m : dozCevir(dozMetni(m, S), dil));
  f.alan = (d) => alanYaz(d, dil);
  f.ha = (<T extends { min: number; max: number } | number>(x: T): T =>
    dekarli(dil) ? x : (typeof x === 'number' ? x * 10 : { ...(x as { min: number; max: number }), min: x.min * 10, max: x.max * 10 }) as T) as Ceviri['ha'];
  return f;
}
