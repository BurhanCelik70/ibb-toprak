/**
 * Dünya tarlasının iklimi: NASA POWER "Climatology" servisi (uydu + yeniden analiz, uzun yıllar aylık ortalaması).
 * Türkiye illerinde kullandığımız parametrelerin aynısı: T2M, T2M_RANGE, PRECTOTCORR (mm/gün), ALLSKY_SFC_PAR_TOT (MJ/m²/gün).
 * YALNIZ SUNUCUDA çalışır. Sonuç Next.js veri önbelleğinde 30 gün tutulur; servis yanıt vermezse null döner ve
 * iklime dayalı bölümler gösterilmez (rapor yine çalışır).
 */
import { DUNYA } from './dunyaVeri';
import { dunyaIli, iklimKaydet, ulkeAdi, type DunyaIklimi } from './dunya';

const AYLAR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const PARAMETRELER = ['T2M', 'T2M_RANGE', 'PRECTOTCORR', 'ALLSKY_SFC_PAR_TOT'];

/** Bölgenin koordinatı; bölgenin koordinatı yoksa ülke merkezi (yaklaşık) */
export function dunyaKoordinati(il?: string | null): { enlem: number; boylam: number; yaklasik: boolean } | undefined {
  const d = dunyaIli(il);
  const u = d ? DUNYA[d.ulke] : undefined;
  if (!d || !u) return undefined;
  const b = u.b.find((x) => x[0] === d.bolge);
  if (b && b.length === 3) return { enlem: b[1], boylam: b[2], yaklasik: false };
  return { enlem: u.m[0], boylam: u.m[1], yaklasik: true };
}

/** Ülkenin bölge adları (form için) */
export const dunyaBolgeleri = (ulke: string) => (DUNYA[ulke]?.b ?? []).map((b) => b[0]).sort((a, b) => a.localeCompare(b));

const yuvarla = (x: number) => Math.round(x * 100) / 100;

/** NASA POWER yanıtından 12 aylık dizi; eksik ya da -999 varsa undefined */
export function aylikDizi(json: unknown, p: string): number[] | undefined {
  const o = (json as { properties?: { parameter?: Record<string, Record<string, number>> } })?.properties?.parameter?.[p];
  if (!o) return undefined;
  const a = AYLAR.map((m) => o[m]);
  return a.every((x) => typeof x === 'number' && Number.isFinite(x) && x > -900) ? a.map(yuvarla) : undefined;
}

/** Servis yanıt vermediyse aynı yer 10 dakika yeniden sorulmaz (sayfa her açılışta beklemesin) */
const basarisiz = new Map<string, number>();
/**
 * Alınan iklim sunucu çalıştıkça bellekte kalır (iklim ortalaması değişmez). Ayrıca sunucudaki tablolara bir kez kaydedilen
 * il sonra hep aynı veriyle döner; servis o an yanıt vermese de sunucu ve tarayıcı aynı şeyi çizer (hydration uyuşmazlığı olmaz).
 */
const bellek = new Map<string, DunyaIklimi>();

export async function dunyaIklimiGetir(il?: string | null): Promise<DunyaIklimi | null> {
  const k = dunyaKoordinati(il);
  if (!k || !il) return null;
  const hazir = bellek.get(il);
  if (hazir) return hazir;
  const son = basarisiz.get(il);
  if (son && Date.now() - son < 10 * 60 * 1000) return null;
  const v = await getir(k);
  if (v) {
    basarisiz.delete(il);
    bellek.set(il, v);
  } else basarisiz.set(il, Date.now());
  return v;
}

async function getir(k: { enlem: number; boylam: number; yaklasik: boolean }): Promise<DunyaIklimi | null> {
  const q = new URLSearchParams({
    parameters: PARAMETRELER.join(','),
    community: 'AG',
    latitude: String(k.enlem),
    longitude: String(k.boylam),
    format: 'JSON',
  });
  try {
    const res = await fetch(`https://power.larc.nasa.gov/api/temporal/climatology/point?${q}`, {
      next: { revalidate: 60 * 60 * 24 * 30 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const t = aylikDizi(json, 'T2M');
    const fark = aylikDizi(json, 'T2M_RANGE');
    const yagis = aylikDizi(json, 'PRECTOTCORR');
    let par = aylikDizi(json, 'ALLSKY_SFC_PAR_TOT');
    if (!t || !fark || !yagis) return null;
    // Akla yatkınlık denetimi: sıcaklık −50…50 °C, gün içi fark 0…35 °C, yağış 0…60 mm/gün
    if (t.some((x) => x < -50 || x > 50) || fark.some((x) => x < 0 || x > 35) || yagis.some((x) => x < 0 || x > 60)) return null;
    // PAR MJ/m²/gün beklenir (AG topluluğu); W/m² gelirse çevir (1 W/m² = 0,0864 MJ/m²/gün)
    if (par && Math.max(...par) > 30) par = par.map((x) => yuvarla(x * 0.0864));
    if (par && par.some((x) => x < 0 || x > 30)) par = undefined;
    return { enlem: k.enlem, boylam: k.boylam, yaklasik: k.yaklasik, t, fark, yagis, par };
  } catch {
    return null;
  }
}

/**
 * Yapay zekâ için dünya tarlasının bölge bilgisi (Türkiye/Almanya/İspanya'daki bolgeBilgisi'nin karşılığı).
 * Ayrıntılı toprak notu yok; ülke, bölge ve NASA POWER'dan aylık sıcaklık ile yağış verilir.
 */
export async function dunyaBolgeBilgisi(il?: string | null, ilce?: string | null) {
  const d = dunyaIli(il);
  if (!d) return undefined;
  const v = await dunyaIklimiGetir(il);
  const enlem = dunyaKoordinati(il)?.enlem ?? 0;
  const mevsim =
    enlem < -23
      ? 'Tarla GÜNEY yarımkürede: Z-karttaki ay adları Kuzey yarımküreye göredir; dönemleri yaklaşık 6 ay kaydırarak yaz (ör. Mart–Nisan → Eylül–Ekim).'
      : Math.abs(enlem) <= 23
        ? 'Tarla tropik kuşakta: mevsimler sıcaklıkla değil yağışlı/kurak dönemlerle belirlenir; Z-karttaki ay adlarını yerel ekim zamanına göre uyarla, ay adı vermekten kaçın.'
        : undefined;
  return {
    ulke: ulkeAdi(d.ulke, 'en'),
    ulkeKodu: d.ulke,
    bolge: d.bolge,
    ilce: ilce || undefined,
    ...(mevsim ? { mevsim } : {}),
    not: 'Bu ülke için ayrıntılı bölgesel toprak notu yok. Ülkenin genel iklimi, toprak tipi ve tarım koşulları hakkında bildiklerini temkinli kullan; emin olmadığın yerel bilgiyi uydurma.',
    iklim: v
      ? {
          kaynak: `NASA POWER uydu iklim verisi, uzun yıllar aylık ortalaması${v.yaklasik ? ' (bölge koordinatı yok, ülke merkezi alındı; yaklaşık)' : ''}`,
          enlem: v.enlem,
          ortalamaSicaklikC_OcakAralik: v.t,
          yagisMmGun_OcakAralik: v.yagis,
          yillikYagisMm: Math.round(v.yagis.reduce((a, b, i) => a + b * [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i], 0)),
        }
      : undefined,
  };
}

/**
 * Sayfadaki dünya illerinin iklimini getirir ve sunucudaki tablolara kaydeder; istemciye <IklimKaydi> ile verilecek kaydı döner.
 * Türkiye/Almanya/İspanya illeri atlanır.
 */
export async function dunyaIklimleri(iller: (string | null | undefined)[]): Promise<Record<string, DunyaIklimi | null>> {
  const tekil = [...new Set(iller.filter((il): il is string => !!dunyaIli(il)))];
  const sonuc = await Promise.all(tekil.map(async (il) => [il, await dunyaIklimiGetir(il)] as const));
  for (const [il, v] of sonuc) iklimKaydet(il, v);
  return Object.fromEntries(sonuc);
}
