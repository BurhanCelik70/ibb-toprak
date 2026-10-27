/**
 * Sezon boyu sulama takvimi: kaçıncı su, yaklaşık tarih, gübreli mi boş mu.
 *
 * Değerler yaklaşıktır; toprak, yağış ve sıcaklığa göre değişir. Dayanak:
 *  - Mısır: karıkta 3–7 su (Eskişehir, Bolu, Tokat, Çukurova denemeleri; Biber ve Kara derlemesi);
 *    Konya-Karaman çiftçi uygulamasında damlada 7–10 günde bir, sezonda ~10 su; Konya Kapalı Havzası
 *    FAO/ÇŞB demonstrasyonlarında programlı damla sulamada sezonluk ~840 mm (Haziran–Ağustos).
 *  - Şeker pancarı: Konya-Çumra damla denemesinde 15 Haziran–10 Eylül, 14 su, 5–7 gün aralık (Kaya ve Topak, Selçuk Tar. Bil. Der.);
 *    son su hasattan 10–15 gün önce (Hektaş).
 *  - Diğer bitkiler: yönteme göre genel aralıklar (damla 3–6, yağmurlama 4–12, karık 6–20 gün).
 * Çiftçi kendi aralığını seçebilir (aralikGun); seçilen değer sıcak aylardaki aralıktır.
 * Sıcak aylarda (Haziran–Ağustos) aralık kısalır; diğer aylarda 1,5 katına çıkar.
 */
import { dozOku } from './sulama';
import type { SulamaYontemi } from './sulama';
import type { ZKart } from './zkartlar';
import { ilBolgesi, type Bolge } from './bolgeler';

type Aralik = { damla: number; yagmurlama: number; salma: number };
type SezonTanimi = {
  bas: string; // "05-20" (ay-gün)
  bit: string;
  aralik: Aralik; // sıcak aylardaki aralık (gün)
  not?: string;
  /** Tahıllar: belirli dönemlerde birer su (karık/yağmurlama) */
  kritikEvreler?: number[];
  /** Çeltik: sürekli göllendirme, sayılı sulama yok */
  goller?: boolean;
};

const S: Record<string, SezonTanimi> = {
  'Mısır (dane)': { bas: '06-01', bit: '08-31', aralik: { damla: 9, yagmurlama: 8, salma: 12 }, not: 'Konya-Karaman uygulamasında damlada genelde 7–10 günde bir, sezonda ortalama 10 su verilir; programlı damla sulamada sezonluk su yaklaşık 840 mm\'dir.' },
  'Şeker pancarı': { bas: '06-15', bit: '09-10', aralik: { damla: 6, yagmurlama: 8, salma: 12 }, not: 'Konya-Çumra damla denemesinde 15 Haziran–10 Eylül arasında 14 su verilmiştir (5–7 gün arayla). Son su hasattan 10–15 gün önce verilir.' },
  Ayçiçeği: { bas: '06-01', bit: '08-15', aralik: { damla: 6, yagmurlama: 9, salma: 14 } },
  Pamuk: { bas: '06-01', bit: '08-31', aralik: { damla: 6, yagmurlama: 9, salma: 14 } },
  Patates: { bas: '05-25', bit: '08-25', aralik: { damla: 4, yagmurlama: 6, salma: 9 } },
  Domates: { bas: '05-15', bit: '09-15', aralik: { damla: 3, yagmurlama: 5, salma: 7 } },
  Salatalık: { bas: '05-15', bit: '09-01', aralik: { damla: 3, yagmurlama: 4, salma: 6 } },
  Soğan: { bas: '04-20', bit: '07-31', aralik: { damla: 4, yagmurlama: 6, salma: 9 }, not: 'Hasattan 2–3 hafta önce su kesilir.' },
  Susam: { bas: '06-10', bit: '08-20', aralik: { damla: 6, yagmurlama: 10, salma: 15 } },
  Tütün: { bas: '06-01', bit: '08-15', aralik: { damla: 6, yagmurlama: 9, salma: 14 } },
  Elma: { bas: '05-01', bit: '09-30', aralik: { damla: 5, yagmurlama: 8, salma: 15 } },
  'Şeftali / nektarin': { bas: '05-01', bit: '09-15', aralik: { damla: 5, yagmurlama: 8, salma: 14 } },
  Kayısı: { bas: '04-20', bit: '09-15', aralik: { damla: 5, yagmurlama: 9, salma: 15 }, not: 'Hasattan sonraki sular gelecek yılın çiçek gözleri için önemlidir.' },
  Nar: { bas: '05-15', bit: '10-15', aralik: { damla: 5, yagmurlama: 10, salma: 15 } },
  İncir: { bas: '05-15', bit: '09-15', aralik: { damla: 5, yagmurlama: 10, salma: 18 } },
  Zeytin: { bas: '05-15', bit: '10-15', aralik: { damla: 6, yagmurlama: 12, salma: 20 } },
  'Üzüm (bağ)': { bas: '05-01', bit: '09-01', aralik: { damla: 5, yagmurlama: 10, salma: 18 }, not: 'Ben düşmeden sonra su azaltılır, hasattan önce kesilir.' },
  'Narenciye (mandalina)': { bas: '04-15', bit: '10-31', aralik: { damla: 4, yagmurlama: 8, salma: 14 } },
  Fındık: { bas: '07-01', bit: '08-31', aralik: { damla: 6, yagmurlama: 10, salma: 15 }, not: 'Yağışlı bölgede çoğu yıl sulama gerekmez; takvim kurak geçen yaz içindir.' },
  Çay: { bas: '07-01', bit: '08-31', aralik: { damla: 6, yagmurlama: 10, salma: 15 }, not: 'Yağışlı bölgede çoğu yıl sulama gerekmez; takvim kurak geçen yaz içindir.' },
  Buğday: { bas: '04-10', bit: '06-15', aralik: { damla: 7, yagmurlama: 10, salma: 15 }, kritikEvreler: [2, 3, 4], not: 'Kuru tarımda sulanmaz; sulanan buğdayda kritik dönemler sapa kalkma, başaklanma ve süt olumudur.' },
  Arpa: { bas: '04-05', bit: '06-05', aralik: { damla: 7, yagmurlama: 10, salma: 15 }, kritikEvreler: [2, 3, 4], not: 'Kuru tarımda sulanmaz; sulanan arpada kritik dönemler sapa kalkma, başaklanma ve süt olumudur.' },
  'Çeltik (pirinç)': { bas: '05-01', bit: '09-01', aralik: { damla: 0, yagmurlama: 0, salma: 0 }, goller: true, not: 'Çeltik tavada sürekli 5–10 cm su altında tutulur; hasattan 2–3 hafta önce su çekilir.' },
};

/**
 * Bölge düzeltmesi. Taban: İç Anadolu (Konya-Karaman verileri).
 * carpan: sulama aralığı çarpanı (küçük = daha sık) · kaydir: sezonun gün olarak kayması · kisalt: sezon sonundan kesilen gün.
 * Dayanak (mısır): Şanlıurfa-Harran damla denemesinde 4 günde bir en verimli, 8 günde %27 verim kaybı (Şimşek ve Gerçek);
 * Çukurova'da karıkla 6–7 su (Gençoğlan ve Yazar); Eskişehir, Ankara, Bolu'da karıkla 4 su; Tokat-Kazova'da 3–4 su (Biber ve Kara derlemesi).
 */
export const BOLGE_DUZELTME: Record<Bolge, { carpan: number; kaydir: number; kisalt: number; not: string }> = {
  'İç Anadolu': { carpan: 1, kaydir: 0, kisalt: 0, not: 'İç Anadolu (Konya-Karaman) verileri esas alındı.' },
  'Güneydoğu Anadolu': { carpan: 0.55, kaydir: -10, kisalt: 0, not: 'Harran gibi sıcak ovalarda buharlaşma çok yüksek; Şanlıurfa denemesinde mısır damlada 4 günde bir sulandığında en verimli sonucu vermiş, 8 günde bir sulandığında verim %27 düşmüştür.' },
  Akdeniz: { carpan: 0.8, kaydir: -25, kisalt: 0, not: 'Yaz sıcak ve uzun; sezon erken başlar. Çukurova denemelerinde mısıra karıkla 6–7 su verilmiştir.' },
  Ege: { carpan: 0.8, kaydir: -20, kisalt: 0, not: 'Yaz sıcak ve kurak; sulama İç Anadolu\'dan daha sık ve daha erken başlar.' },
  Marmara: { carpan: 1.1, kaydir: -10, kisalt: 0, not: 'Yaz yağışı İç Anadolu\'dan biraz fazla; aralıklar biraz uzundur.' },
  Karadeniz: { carpan: 1.5, kaydir: 0, kisalt: 0, not: 'Yağışlı bölge; Bolu ve Tokat denemelerinde mısıra 3–4 su yetmiştir. Yağışlı yazlarda su sayısı daha da azalır.' },
  'Doğu Anadolu': { carpan: 1, kaydir: 15, kisalt: 30, not: 'Yaz kısa; sulama sezonu geç başlar ve erken biter.' },
};

/** Bitki + yöntem + il için önerilen sıcak ay aralığı (gün) ve bölge bilgisi */
export function onerilenAralik(bitki: string | undefined, yontem: SulamaYontemi, il?: string | null) {
  const t = bitki ? S[bitki] : undefined;
  const bolge = ilBolgesi(il);
  if (!t || yontem === 'kuru') return { gun: 0, bolge };
  const tur = yontem === 'pivot' ? 'yagmurlama' : yontem;
  const taban = t.aralik[tur as keyof Aralik];
  const c = bolge ? BOLGE_DUZELTME[bolge].carpan : 1;
  return { gun: taban ? Math.max(2, Math.round(taban * c)) : 0, bolge };
}

export type SezonSuyu = {
  no: number;
  tarih: Date;
  evre: number;
  gubreli: boolean;
};
export type EvreOzeti = { evre: number; ad: string; sular: SezonSuyu[]; gubreliSayisi: number };
export type SezonTakvimi = {
  sular: SezonSuyu[];
  evreler: EvreOzeti[];
  not?: string;
  goller?: boolean;
};

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

function tarihYap(yil: number, md: string) {
  const [m, d] = md.split('-').map(Number);
  return new Date(yil, m - 1, d);
}
function ilkAy(donem: string): number | undefined {
  const bul = AYLAR.map((a, i) => ({ i, at: donem.indexOf(a) })).filter((x) => x.at >= 0).sort((a, b) => a.at - b.at);
  return bul[0]?.i;
}

/** Dönem dozu bu dönemdeki her gübreli suya bölünmeli mi ("bölünmüş", "her sulama") */
export const bolunmusMu = (doz: string) => /bölün|her sulama/i.test(doz);

/** Bir dozu n suya bölüp "3,3–4,7 L/da" verir */
export function suBasinaDoz(doz: string, n: number): string | undefined {
  const d = dozOku(doz);
  if (!d || n <= 1) return undefined;
  const f = (x: number) => x.toLocaleString('tr-TR', { maximumFractionDigits: x < 10 ? 1 : 0 });
  const a = d.min / n;
  const b = d.max / n;
  return a === b ? `${f(a)} ${d.birim}/da` : `${f(a)}–${f(b)} ${d.birim}/da`;
}

export function sezonTanimi(bitki?: string) {
  return bitki ? S[bitki] : undefined;
}

/**
 * Sezon takvimini çıkarır. gubreVar(evreNo) o evrede bu yöntemle verilecek gübre olup olmadığını söyler;
 * bolunmus(evreNo) dozun her suya bölünmesi gerekip gerekmediğini.
 */
export function sezonTakvimi(
  zkart: ZKart,
  yontem: SulamaYontemi,
  gubreVar: (evre: number) => boolean,
  bolunmus: (evre: number) => boolean,
  yil = new Date().getFullYear(),
  aralikGun?: number,
  bolge?: Bolge,
): SezonTakvimi | undefined {
  const t = S[zkart.bitki];
  if (!t || yontem === 'kuru') return undefined;
  if (t.goller) return { sular: [], evreler: [], not: t.not, goller: true };

  // Evre başlangıçları (sıralı): her evre bir sonrakinin başına kadar sürer
  const basla = zkart.evreler.map((e) => ilkAy(e.donem));
  const evreBas = basla.map((ay, i) => (ay === undefined ? undefined : new Date(yil, ay < (basla[0] ?? 0) ? ay + 12 : ay, 1)));
  const evreBul = (d: Date) => {
    let k = 0;
    evreBas.forEach((b, i) => {
      if (b && d >= b) k = i;
    });
    return k;
  };

  const bd = bolge ? BOLGE_DUZELTME[bolge] : undefined;
  const gun = 86400000;
  const sezonBas = new Date(tarihYap(yil, t.bas).getTime() + (bd?.kaydir ?? 0) * gun);
  const sezonBit = new Date(tarihYap(yil, t.bit).getTime() + ((bd?.kaydir ?? 0) - (bd?.kisalt ?? 0)) * gun);
  const tur = yontem === 'pivot' ? 'yagmurlama' : yontem;
  const tepe = aralikGun && aralikGun > 0 ? aralikGun : t.aralik[tur as keyof Aralik];

  let tarihler: Date[] = [];
  if (t.kritikEvreler && yontem !== 'damla') {
    // Tahıl: kritik dönemlerin ortasında birer su; yağmurlamada başaklanmaya bir su daha
    t.kritikEvreler.forEach((ei) => {
      const b = evreBas[ei];
      if (!b) return;
      tarihler.push(new Date(b.getFullYear(), b.getMonth(), 12));
      if (yontem !== 'salma' && ei === t.kritikEvreler![1]) tarihler.push(new Date(b.getFullYear(), b.getMonth(), 26));
    });
  } else {
    for (let d = new Date(sezonBas); d <= sezonBit; ) {
      tarihler.push(new Date(d));
      const sicak = d.getMonth() >= 5 && d.getMonth() <= 7;
      d = new Date(d.getTime() + Math.round(tepe * (sicak ? 1 : 1.5)) * 86400000);
    }
  }
  tarihler = tarihler.sort((a, b) => a.getTime() - b.getTime());

  const sular: SezonSuyu[] = tarihler.map((tarih, i) => ({ no: i + 1, tarih, evre: evreBul(tarih), gubreli: false }));

  // Gübreli suları seç: salma/pivot dışı yöntemlerde dönemin sularının yarısı (eşit aralıklı, ilki dahil);
  // doz "her sulamaya bölünmüş" ise hepsi; salmada dönemin ilk suyu (gübre serpildikten sonra).
  const evreler: EvreOzeti[] = zkart.evreler.map((e, ei) => {
    const es = sular.filter((s) => s.evre === ei);
    if (es.length && gubreVar(ei)) {
      const n = yontem === 'salma' ? 1 : bolunmus(ei) ? es.length : Math.max(1, Math.round(es.length / 2));
      const adim = es.length / n;
      for (let k = 0; k < n; k++) es[Math.min(es.length - 1, Math.floor(k * adim))].gubreli = true;
    }
    return { evre: ei, ad: e.evre, sular: es, gubreliSayisi: es.filter((s) => s.gubreli).length };
  });

  return { sular, evreler, not: t.not };
}

export const tarihKisa = (d: Date) => `${d.getDate()} ${AYLAR[d.getMonth()].slice(0, 3)}`;
