/**
 * Sezon boyu sulama takvimi: kaçıncı su, yaklaşık tarih, gübreli mi boş mu.
 *
 * Değerler yaklaşıktır; toprak, yağış ve sıcaklığa göre değişir. Dayanak:
 *  - Mısır: karıkta 3–7 su (Eskişehir, Bolu, Tokat, Çukurova denemeleri; Biber ve Kara derlemesi),
 *    damlada kurak iklimde 3 günde bir (Hektaş).
 *  - Şeker pancarı: Konya-Çumra damla denemesinde 14 su, 5–7 gün aralık (Kaya ve Topak, Selçuk Tar. Bil. Der.);
 *    son su hasattan 10–15 gün önce (Hektaş).
 *  - Diğer bitkiler: yönteme göre genel aralıklar (damla 2–6, yağmurlama 4–12, karık 6–20 gün).
 * Sıcak aylarda (Haziran–Ağustos) aralık kısalır; diğer aylarda 1,5 katına çıkar.
 */
import { dozOku } from './sulama';
import type { SulamaYontemi } from './sulama';
import type { ZKart } from './zkartlar';

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
  'Mısır (dane)': { bas: '05-20', bit: '08-31', aralik: { damla: 3, yagmurlama: 7, salma: 11 } },
  'Şeker pancarı': { bas: '06-01', bit: '09-15', aralik: { damla: 6, yagmurlama: 8, salma: 12 }, not: 'Son su hasattan 10–15 gün önce verilir.' },
  Ayçiçeği: { bas: '06-01', bit: '08-15', aralik: { damla: 5, yagmurlama: 9, salma: 14 } },
  Pamuk: { bas: '06-01', bit: '08-31', aralik: { damla: 5, yagmurlama: 9, salma: 14 } },
  Patates: { bas: '05-25', bit: '08-25', aralik: { damla: 3, yagmurlama: 6, salma: 9 } },
  Domates: { bas: '05-15', bit: '09-15', aralik: { damla: 2, yagmurlama: 5, salma: 7 } },
  Salatalık: { bas: '05-15', bit: '09-01', aralik: { damla: 2, yagmurlama: 4, salma: 6 } },
  Soğan: { bas: '04-20', bit: '07-31', aralik: { damla: 3, yagmurlama: 6, salma: 9 }, not: 'Hasattan 2–3 hafta önce su kesilir.' },
  Susam: { bas: '06-10', bit: '08-20', aralik: { damla: 6, yagmurlama: 10, salma: 15 } },
  Tütün: { bas: '06-01', bit: '08-15', aralik: { damla: 5, yagmurlama: 9, salma: 14 } },
  Elma: { bas: '05-01', bit: '09-30', aralik: { damla: 3, yagmurlama: 8, salma: 15 } },
  'Şeftali / nektarin': { bas: '05-01', bit: '09-15', aralik: { damla: 3, yagmurlama: 8, salma: 14 } },
  Kayısı: { bas: '04-20', bit: '09-15', aralik: { damla: 4, yagmurlama: 9, salma: 15 }, not: 'Hasattan sonraki sular gelecek yılın çiçek gözleri için önemlidir.' },
  Nar: { bas: '05-15', bit: '10-15', aralik: { damla: 4, yagmurlama: 10, salma: 15 } },
  İncir: { bas: '05-15', bit: '09-15', aralik: { damla: 5, yagmurlama: 10, salma: 18 } },
  Zeytin: { bas: '05-15', bit: '10-15', aralik: { damla: 6, yagmurlama: 12, salma: 20 } },
  'Üzüm (bağ)': { bas: '05-01', bit: '09-01', aralik: { damla: 5, yagmurlama: 10, salma: 18 }, not: 'Ben düşmeden sonra su azaltılır, hasattan önce kesilir.' },
  'Narenciye (mandalina)': { bas: '04-15', bit: '10-31', aralik: { damla: 3, yagmurlama: 8, salma: 14 } },
  Fındık: { bas: '07-01', bit: '08-31', aralik: { damla: 6, yagmurlama: 10, salma: 15 }, not: 'Yağışlı bölgede çoğu yıl sulama gerekmez; takvim kurak geçen yaz içindir.' },
  Çay: { bas: '07-01', bit: '08-31', aralik: { damla: 6, yagmurlama: 10, salma: 15 }, not: 'Yağışlı bölgede çoğu yıl sulama gerekmez; takvim kurak geçen yaz içindir.' },
  Buğday: { bas: '04-10', bit: '06-15', aralik: { damla: 7, yagmurlama: 10, salma: 15 }, kritikEvreler: [2, 3, 4], not: 'Kuru tarımda sulanmaz; sulanan buğdayda kritik dönemler sapa kalkma, başaklanma ve süt olumudur.' },
  Arpa: { bas: '04-05', bit: '06-05', aralik: { damla: 7, yagmurlama: 10, salma: 15 }, kritikEvreler: [2, 3, 4], not: 'Kuru tarımda sulanmaz; sulanan arpada kritik dönemler sapa kalkma, başaklanma ve süt olumudur.' },
  'Çeltik (pirinç)': { bas: '05-01', bit: '09-01', aralik: { damla: 0, yagmurlama: 0, salma: 0 }, goller: true, not: 'Çeltik tavada sürekli 5–10 cm su altında tutulur; hasattan 2–3 hafta önce su çekilir.' },
};

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

  const sezonBas = tarihYap(yil, t.bas);
  const sezonBit = tarihYap(yil, t.bit);
  const tur = yontem === 'pivot' ? 'yagmurlama' : yontem;
  const tepe = t.aralik[tur as keyof Aralik];

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
