/**
 * Sulama yöntemine göre uygulama reçetesi.
 *
 * ⚠️ TASLAK – ziraat mühendisi / proje danışmanı onayına sunulmak üzere hazırlanmıştır.
 * Kurallar fertigasyondaki genel ilkelere dayanır:
 *  - Damla: önce kök bölgesi ıslatılır, gübre sulamanın orta bölümünde verilir, en sonda temiz su ile hat yıkanır.
 *  - Yağmurlama: toprak ıslandıktan sonra kısa bir pencerede gübre verilir, kalan sürede yapraklar temiz suyla yıkanır.
 *  - Pivot: gübre bir tur boyunca sabit oranda enjekte edilir (oransal uygulama).
 * Oranlar aşağıdaki ZAMANLAMA tablosundan değiştirilebilir.
 */
import type { ZEvre, ZKart, ZUygulama } from './zkartlar';

export type SulamaYontemi = 'damla' | 'yagmurlama' | 'pivot' | 'salma' | 'kuru';

export const SULAMA_YONTEMLERI: Record<SulamaYontemi, { ad: string; kisa: string; aciklama: string; sureEtiketi?: string; varsayilanSure?: number }> = {
  damla: { ad: 'Damla sulama', kisa: 'Damla', aciklama: 'Gübre sulama suyuyla (fertigasyon) verilir.', sureEtiketi: 'Bir sulamanın süresi (saat)', varsayilanSure: 6 },
  yagmurlama: { ad: 'Yağmurlama (spring)', kisa: 'Yağmurlama', aciklama: 'Gübre yağmurlama hattına enjekte edilir.', sureEtiketi: 'Bir sulamanın süresi (saat)', varsayilanSure: 6 },
  pivot: { ad: 'Pivot / lineer', kisa: 'Pivot', aciklama: 'Gübre bir tur boyunca sabit oranda enjekte edilir.', sureEtiketi: 'Bir tur süresi (saat)', varsayilanSure: 12 },
  salma: { ad: 'Salma (karık / tava)', kisa: 'Salma', aciklama: 'Gübre toprağa serpilir, ardından sulanır.' },
  kuru: { ad: 'Kuru tarım (susuz)', kisa: 'Kuru tarım', aciklama: 'Baş gübre yağıştan hemen önce verilir.' },
};

/** Gübre penceresi oranları (sulama süresinin kesirleri). Danışman onayıyla değiştirilebilir. */
export const ZAMANLAMA = {
  damla: { once: 0.25, gubre: 0.5 }, // 6 saatte: 0:00–1:30 su · 1:30–4:30 gübre · 4:30–6:00 temiz su
  yagmurlama: { once: 1 / 6, gubre: 1 / 6 }, // 6 saatte: 1. saat su · 2. saat gübre · kalan süre temiz su
};

/** Z-karttaki uygulama gruplarından bu sulama yöntemine uyanlar (öncelik sırasıyla). */
const GRUPLAR: Record<SulamaYontemi, string[]> = {
  damla: ['Damla sulama', 'Taban gübresi', 'Baş gübre', 'Yapraktan'],
  yagmurlama: ['Yağmurlama', 'Taban gübresi', 'Baş gübre', 'Serpme baş gübre', 'Yapraktan'],
  pivot: ['Yağmurlama', 'Taban gübresi', 'Baş gübre', 'Serpme baş gübre', 'Yapraktan'],
  salma: ['Taban gübresi', 'Baş gübre', 'Serpme baş gübre', 'Topraktan', 'Yapraktan'],
  kuru: ['Taban gübresi', 'Baş gübre', 'Serpme baş gübre', 'Topraktan', 'Yapraktan'],
};

export type EvreReceteGrubu = ZUygulama & { not?: string };

/** Bir Z-kart evresindeki uygulamaları sulama yöntemine göre süzer. */
export function evreUygulamalari(e: ZEvre, yontem: SulamaYontemi): EvreReceteGrubu[] {
  const izinli = GRUPLAR[yontem];
  const secilen = e.uygulamalar.filter((g) => izinli.includes(g.yontem));
  const topraga = secilen.some((g) => g.yontem !== 'Yapraktan');
  if (topraga || e.uygulamalar.length === 0) return secilen;

  // Kartta bu yönteme ait sütun yok: en yakın sütunu açıklamayla göster
  const yedek =
    e.uygulamalar.find((g) => (yontem === 'damla' ? g.yontem === 'Yağmurlama' : g.yontem === 'Damla sulama')) ??
    e.uygulamalar.find((g) => g.yontem !== 'Yapraktan');
  if (!yedek) return secilen;
  const not =
    yontem === 'salma' || yontem === 'kuru'
      ? 'Kartta bu sulama için ayrı sütun yok; suda çözünen bu gübreleri toprağa serpip hemen sulayın (kuru tarımda yağıştan hemen önce).'
      : `Kartta ${SULAMA_YONTEMLERI[yontem].kisa.toLocaleLowerCase('tr-TR')} için ayrı sütun yok; en yakın sütun gösteriliyor.`;
  return [{ ...yedek, not }, ...secilen];
}

/* -------------------------------------------------------------------------- */
/* Zaman çizelgesi                                                             */
/* -------------------------------------------------------------------------- */

const saat = (h: number) => {
  const dk = Math.round(h * 60);
  return `${Math.floor(dk / 60)}:${String(dk % 60).padStart(2, '0')}`;
};

export type Dilim = { bas: string; bit: string; tur: 'su' | 'gubre' | 'temiz'; baslik: string; aciklama: string };

/** Damla ve yağmurlamada sulama süresine göre su–gübre–temiz su dilimleri. */
export function zamanCizelgesi(yontem: SulamaYontemi, sure: number): Dilim[] | undefined {
  if (!(sure > 0)) return undefined;
  if (yontem === 'damla' || yontem === 'yagmurlama') {
    const z = ZAMANLAMA[yontem];
    const t1 = sure * z.once;
    const t2 = t1 + sure * z.gubre;
    const damla = yontem === 'damla';
    return [
      { bas: saat(0), bit: saat(t1), tur: 'su', baslik: 'Yalnızca su', aciklama: damla ? 'Hat basınçlanır, kök bölgesi ıslanır.' : 'Toprak yüzeyi ve kök bölgesi ıslanır.' },
      { bas: saat(t1), bit: saat(t2), tur: 'gubre', baslik: 'Gübre enjeksiyonu', aciklama: 'Bu dönemin damla/yağmurlama gübreleri bu pencerede verilir.' },
      { bas: saat(t2), bit: saat(sure), tur: 'temiz', baslik: 'Temiz su', aciklama: damla ? 'Hat ve damlatıcılar yıkanır, gübre kök bölgesinde kalır.' : 'Yapraklardaki gübre yıkanır, yaprak yanığı önlenir.' },
    ];
  }
  if (yontem === 'pivot') {
    return [
      { bas: saat(0), bit: saat(sure), tur: 'gubre', baslik: 'Tur boyunca sabit oranlı enjeksiyon', aciklama: 'Gübre, pivotun bir turu boyunca eşit dağılır.' },
    ];
  }
  return undefined;
}

/** Yönteme göre genel uygulama kuralları. */
export const KURALLAR: Record<SulamaYontemi, string[]> = {
  damla: [
    'Kalsiyumlu gübreleri sülfatlı ve fosfatlı gübrelerle aynı tankta karıştırmayın; çökelti yapar, damlatıcıyı tıkar. Gerekirse iki ayrı tank (A/B) kullanın.',
    'Mikrobiyal ürünleri (KIANA EARTH PLUS) asitle aynı enjeksiyonda vermeyin; ayrı sulamada uygulayın.',
    'Sulama suyunun pH’ı 5,5–6,5 aralığında olmalı; gerekirse NİTRİK ASİT veya FOSFORİK ASİT ile düzenleyin.',
  ],
  yagmurlama: [
    'Gübreyi toprak ıslandıktan sonra verin; kalan sürede temiz su yaprakları yıkasın.',
    'Yapraktan uygulamadan sonra en az 6 saat yağmurlama yapmayın, ürün yıkanır.',
    'Rüzgârlı havada ve öğle sıcağında uygulama yapmayın.',
  ],
  pivot: [
    'Enjeksiyon hattında geri akış önleyici (çek valf) mutlaka olmalı.',
    'Turun sonunda 10–15 dakika temiz su vererek hattı yıkayın.',
    'Rüzgâr 15 km/saati aşıyorsa uygulamayı erteleyin.',
  ],
  salma: [
    'Gübreyi karık ya da tava boyunca eşit serpin, ardından hemen sulayın.',
    'Sulama suyuyla gübre vermeyin; tarlanın başında birikir, sonu gübresiz kalır.',
  ],
  kuru: [
    'Baş gübreyi kuru toprağa değil, yağıştan hemen önce ya da yağışlı toprağa verin.',
    'Taban gübresini ekimle birlikte mibzerle banda verin.',
  ],
};

/* -------------------------------------------------------------------------- */
/* Doz ve toplam miktar                                                        */
/* -------------------------------------------------------------------------- */

export type Doz = { min: number; max: number; birim: 'kg' | 'g' | 'L' | 'cc' };

/** "12-16 L/da", "200–300 g/da", "1 kg/da" gibi dekar başı dozları okur. */
export function dozOku(s: string): Doz | undefined {
  const m = s.replace(/,/g, '.').match(/(\d+(?:\.\d+)?)\s*(?:[-–]\s*(\d+(?:\.\d+)?))?\s*(kg|g|L|lt|cc|ml)\s*\/\s*da/i);
  if (!m) return undefined;
  const raw = m[3].toLowerCase();
  const birim = (raw === 'lt' ? 'L' : raw === 'ml' ? 'cc' : raw === 'l' ? 'L' : raw) as Doz['birim'];
  const min = Number(m[1]);
  return { min, max: m[2] ? Number(m[2]) : min, birim };
}

const fmt = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: n < 10 ? 1 : 0 });

/** Dekar başı dozu tarla alanıyla çarpıp okunur toplam verir: "144–192 L". */
export function toplamMiktar(dozMetni: string, alanDekar?: number | null): string | undefined {
  const d = dozOku(dozMetni);
  if (!d || !alanDekar || alanDekar <= 0) return undefined;
  let min = d.min * alanDekar;
  let max = d.max * alanDekar;
  let birim: string = d.birim;
  if ((birim === 'g' || birim === 'cc') && min >= 1000) {
    min /= 1000;
    max /= 1000;
    birim = birim === 'g' ? 'kg' : 'L';
  }
  return min === max ? `${fmt(min)} ${birim}` : `${fmt(min)}–${fmt(max)} ${birim}`;
}

/** Pivotta saatlik enjeksiyon miktarı. */
export function pivotEnjeksiyon(dozMetni: string, alanDekar?: number | null, turSaat?: number | null): string | undefined {
  const d = dozOku(dozMetni);
  if (!d || !alanDekar || !turSaat) return undefined;
  const ort = ((d.min + d.max) / 2) * alanDekar;
  let v = ort / turSaat;
  let birim: string = d.birim;
  if ((birim === 'g' || birim === 'cc') && v >= 1000) {
    v /= 1000;
    birim = birim === 'g' ? 'kg' : 'L';
  }
  return `≈ ${fmt(v)} ${birim}/saat`;
}

/* -------------------------------------------------------------------------- */
/* Takvim: şu anki dönem                                                        */
/* -------------------------------------------------------------------------- */

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

/** "Mart-Nisan" → [2,3]; "Ekim-Mart" gibi yıl dönümlerini de çözer. */
export function donemAylari(donem: string): number[] {
  const bul = AYLAR.map((a, i) => ({ i, at: donem.indexOf(a) })).filter((x) => x.at >= 0).sort((a, b) => a.at - b.at);
  if (bul.length === 0) return [];
  if (bul.length === 1) return [bul[0].i];
  const [a, b] = [bul[0].i, bul[bul.length - 1].i];
  const out: number[] = [];
  for (let m = a; ; m = (m + 1) % 12) {
    out.push(m);
    if (m === b || out.length > 12) break;
  }
  return out;
}

/** Bu ay (veya verilen ay) hangi evre(ler)deyiz? */
export function simdikiEvreler(z: ZKart, ay = new Date().getMonth()): number[] {
  return z.evreler.map((e, i) => (donemAylari(e.donem).includes(ay) ? i : -1)).filter((i) => i >= 0);
}
