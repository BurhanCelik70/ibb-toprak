/**
 * Dil ve birim altyapısı (sunucu ve tarayıcıda ortak).
 * Dil seçimi `dil` çerezinde saklanır; çerez yoksa tarayıcının diline bakılır (Almanca tarayıcı → de).
 * Veritabanında her şey dekar (da) cinsindendir. İGSAŞ sürümünde Türkçede ekranda dekar kalır; diğer dillerde
 * hektara (ha) çevrilir: 1 ha = 10 da.
 */
export const DILLER = {
  tr: { ad: 'Türkçe', kisa: 'TR', bayrak: '🇹🇷', yon: 'ltr', locale: 'tr-TR', og: 'tr_TR' },
  de: { ad: 'Deutsch', kisa: 'DE', bayrak: '🇩🇪', yon: 'ltr', locale: 'de-DE', og: 'de_DE' },
  en: { ad: 'English', kisa: 'EN', bayrak: '🇬🇧', yon: 'ltr', locale: 'en-GB', og: 'en_GB' },
  es: { ad: 'Español', kisa: 'ES', bayrak: '🇪🇸', yon: 'ltr', locale: 'es-ES', og: 'es_ES' },
  // Arapça sağdan sola; rakamlar Latin (0–9) kalır, laboratuvar değerleri karışmasın
  ar: { ad: 'العربية', kisa: 'AR', bayrak: '🌍', yon: 'rtl', locale: 'ar-u-nu-latn', og: 'ar_AR' },
} as const;

export type Dil = keyof typeof DILLER;
/** İlk girişte (dil çerezi yokken) site İngilizce açılır; kullanıcı seçiciden değiştirir. */
export const VARSAYILAN_DIL: Dil = 'en';
export const DIL_COOKIE = 'dil';

/** Sitede açık olan diller (seçicide görünür; çerez yoksa İngilizce açılır) */
export const ACIK_DILLER: Dil[] = ['en', 'tr', 'de', 'es', 'ar'];
/** Noksanlık kataloğu, yaprak teşhisi, besinler ve su karnesi bu dillerde çevrili (Arapçada yalnız toprak raporu) */
export const modullerAcik = (_dil?: Dil) => true;
export const dilGecerli = (x: unknown): x is Dil => typeof x === 'string' && (ACIK_DILLER as string[]).includes(x);

/** Accept-Language başlığından desteklenen ilk dil ("de-DE,de;q=0.9,en;q=0.8" → de) */
export function tarayicidanDil(acceptLanguage?: string | null): Dil {
  if (!acceptLanguage) return VARSAYILAN_DIL;
  const diller = acceptLanguage
    .split(',')
    .map((p) => {
      const [kod, q] = p.trim().split(';q=');
      return { kod: kod.toLowerCase().slice(0, 2), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return (diller.find((d) => dilGecerli(d.kod))?.kod as Dil | undefined) ?? VARSAYILAN_DIL;
}

/* -------------------------------------------------------------------------- */
/* Alan ve doz birimleri                                                       */
/* -------------------------------------------------------------------------- */

/** Ekranda kullanılan alan birimi: Türkçede dekar, diğer dillerde hektar */
export const alanBirimi = (dil?: Dil) => (dil === 'tr' || !dil ? 'da' : 'ha');
/** Türkçede dekar kullanılır mı? (dekar → hektar çevirisi yapılmaz) */
export const dekarli = (dil?: Dil) => alanBirimi(dil) === 'da';
/** Uzun ad */
export const alanBirimAdi = (dil: Dil) => ({ tr: 'dekar', en: 'hectare', de: 'Hektar', es: 'hectárea', ar: 'هكتار' })[dil];

/**
 * Sayı biçimi. İngilizcede sayılar önce Türkçe biçimde yazılır ve çeviri sırasında (lib/i18n.ts, sayiIngilizce)
 * tek noktada İngiliz biçimine çevrilir; böylece bir sayı iki kez dönüştürülmez.
 */
export const sayiLocale = (dil: Dil) => (dil === 'en' || dil === 'ar' ? 'tr-TR' : DILLER[dil].locale);

const sayiYaz = (n: number, dil: Dil, basamak = 1) =>
  n.toLocaleString(sayiLocale(dil), { maximumFractionDigits: n >= 100 ? 0 : basamak });

/** Dekar cinsinden alanı ekranda gösterilecek birime çevirir (Türkçede 12 da; diğer dillerde 12 da → 1,2 ha) */
export const alanDegeri = (dekar: number, dil?: Dil) => (dekarli(dil) ? dekar : dekar / 10);
/** "12 da" ya da "1,2 ha" */
export const alanYaz = (dekar: number, dil: Dil) => (dekarli(dil) ? `${sayiYaz(dekar, dil, 1)} da` : `${sayiYaz(dekar / 10, dil, 2)} ha`);
/** Kullanıcının girdiği alanı (Türkçede dekar, diğer dillerde hektar) dekara çevirir */
export const dekaraCevir = (girilen: number, dil?: Dil) => (dekarli(dil) ? girilen : girilen * 10);

/**
 * Doz metnindeki "/da" miktarlarını hektara çevirir (Türkçe dışındaki dillerde; Türkçede dekar kalır).
 * "4,7–5,8 kg/da" → "47–58 kg/ha", "300 g/da" → "3 kg/ha", "100–200 ml/da" → "1–2 L/ha".
 * "/100 L su", "/100 kg tohum" gibi alana bağlı olmayan dozlara dokunmaz.
 */
export function dozCevir(doz: string, dil: Dil): string {
  if (dekarli(dil)) return doz;
  return doz.replace(
    /(\d+(?:[.,]\d+)?)(?:\s*([–-])\s*(\d+(?:[.,]\d+)?))?\s*(kg|g|L|l|ml|cc)\s*\/\s*da\b/g,
    (_m, a: string, tire: string | undefined, b: string | undefined, birim: string) => {
      const sayi = (s: string) => Number(s.replace(',', '.')) * 10;
      let x = sayi(a);
      let y = b ? sayi(b) : undefined;
      let u = birim === 'l' ? 'L' : birim === 'cc' ? 'ml' : birim;
      if ((u === 'g' || u === 'ml') && Math.max(x, y ?? 0) >= 1000) {
        x /= 1000;
        if (y !== undefined) y /= 1000;
        u = u === 'g' ? 'kg' : 'L';
      }
      const yaz = (n: number) => sayiYaz(n, dil, 2);
      return y !== undefined ? `${yaz(x)}${tire === '-' ? '–' : tire}${yaz(y)} ${u}/ha` : `${yaz(x)} ${u}/ha`;
    },
  );
}
