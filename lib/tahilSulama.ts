/**
 * Kışlık ekilen bitkilerde (buğday, arpa, kanola) su sayısına göre gübre planı.
 *
 * Kışlık ekimde kaç su verileceği o yılın yağışına bağlıdır; çiftçi 0–5 arasında seçer.
 * Her su, bitkinin suya en çok ihtiyaç duyduğu döneme konur (öncelik sırası AYARLAR tablosunda).
 *  - Buğday/arpa: 1 su → başaklanma · 2 → + sapa kalkma · 3 → + süt olumu · 4 → + kardeşlenme · 5 → + çıkış suyu.
 *    Dayanak: kurak yıllarda sapa kalkma, başaklanma ve süt olumunda üç su (Aykanat ve Barut; Güngör ve Öğretir).
 *  - Kanola: 1 su → çiçeklenme · 2 → + kapsül dolumu · 3 → + sapa kalkma · 4 → + çıkış suyu · 5 → + rozet.
 *    Dayanak: su stresine en duyarlı dönem çiçeklenme–kapsül dolumu (MAS Seeds); kurak sonbaharda kışa girmeden bir su (TTAE).
 *
 * Gübre miktarı toprak analizinden hesaplanır:
 *  - Azot: su sayısına göre hedef, organik maddeye göre düzeltilir.
 *  - Fosfor ve potasyum: laboratuvarın yarayışlı P₂O₅ ve K₂O (kg/da) sınıflarına göre.
 *  - Kireç ve çinko: çinkolu taban gübresi ve kükürtlü (AS 21) azot seçimi.
 *  - Kanola: Trakya Tarımsal Araştırma Enstitüsü önerisi (N 15, P 5-6, K 6-8, S 4 kg/da; azot ekim–Şubat–Mart üçe bölünür).
 * ⚠️ TASLAK – dozlar ziraat mühendisi / proje danışmanı onayına sunulmak üzere hazırlanmıştır.
 */
import type { SulamaYontemi } from './sulama';
import type { SoilReport } from './toprak';
import type { ZKart } from './zkartlar';

type Ayar = {
  /** Kaç su verilirse hangi Z-kart evrelerine */
  suDonemleri: Record<number, number[]>;
  /** Tarlada dönemi tanımak için (evre sırasıyla) */
  tanima: string[];
  /** Su sayısına göre (0–5) temel azot ihtiyacı, kg N/da */
  azot: number[];
  /** Azotun bölündüğü dönemler; sonSu: yalnızca o dönemde su varsa verilir */
  noktalar: { ei: number; pay: number; sonSu?: boolean }[];
  /** Suyla potasyum verilebilecek dönemler */
  kDonemleri: number[];
  fosfor: (p: number) => number;
  potasyum: (k: number) => number;
  /** Ekimde en az bu kadar azot (kanola: kışa güçlü girmek için) */
  tabanMinN?: number;
  /** İlkbahardaki ilk azot her zaman kükürtlü (AS 21) */
  kukurtlu?: boolean;
  /** Baklagil: azot kökteki bakterilerden gelir; organik maddeye göre azot düzeltilmez, taban gübresi DAP */
  baklagil?: boolean;
  /** Seçilebilecek en çok su (varsayılan 5) ve önerilen başlangıç değeri */
  enCokSu?: number;
  varsayilanSu?: number;
  /** Ekrandaki giriş cümlesi ve kaç su rehberi */
  giris?: string;
  rehber?: string;
  dipnot: string;
};

const TAHIL_SU = { 0: [], 1: [3], 2: [2, 3], 3: [2, 3, 4], 4: [1, 2, 3, 4], 5: [0, 1, 2, 3, 4] };
const TAHIL_TANIMA = [
  'Ekimden sonra 2–3 hafta yağış yoksa çıkış için verilir.',
  'Bitkide 3–4 kardeş görülür, sıralar toprağı örtmeye başlar.',
  'Sapın dibinde ilk boğum parmakla hissedilir.',
  'Bayrak yaprak açılmış, başaklar kından çıkmaya başlamıştır.',
  'Taneyi sıkınca beyaz, süt gibi sıvı çıkar.',
];
const TAHIL_NOKTA = [
  { ei: 1, pay: 0.45 },
  { ei: 2, pay: 0.4 },
  { ei: 3, pay: 0.15, sonSu: true },
];
const tahilFosfor = (p: number) => (p < 3 ? 10 : p < 6 ? 8 : p < 9 ? 6 : p < 12 ? 4 : 0);
const tahilPotasyum = (k: number) => (k < 20 ? 4 : k < 30 ? 2 : 0);
const TAHIL_DIPNOT = 'Azot, kardeşlenme ve sapa kalkmada ağırlıklı verilir; süt olumundan sonra toprağa azot verilmez.';

const AYARLAR: Record<string, Ayar> = {
  Buğday: { suDonemleri: TAHIL_SU, tanima: TAHIL_TANIMA, azot: [10, 12, 14, 16, 16, 16], noktalar: TAHIL_NOKTA, kDonemleri: [2, 3], fosfor: tahilFosfor, potasyum: tahilPotasyum, dipnot: TAHIL_DIPNOT },
  Arpa: { suDonemleri: TAHIL_SU, tanima: TAHIL_TANIMA, azot: [8, 10, 12, 13, 13, 13], noktalar: TAHIL_NOKTA, kDonemleri: [2, 3], fosfor: tahilFosfor, potasyum: tahilPotasyum, dipnot: TAHIL_DIPNOT },
  Kanola: {
    suDonemleri: { 0: [], 1: [4], 2: [4, 5], 3: [3, 4, 5], 4: [0, 3, 4, 5], 5: [0, 1, 3, 4, 5] },
    tanima: [
      'Ekimden sonra yağış yoksa çıkış için bir su verilir; bitkiler kışa 6–8 yapraklı rozetle girmelidir.',
      'Bitki toprağa yayılmış 6–8 yapraklı bir rozettir.',
      'Kış bitince rozetin ortasında yeni, açık yeşil yapraklar çıkar.',
      'Ana sap uzar, tepesinde yeşil tomurcuk kümesi görülür.',
      'Sarı çiçekler açmıştır; su eksikliğine en duyarlı dönemdir.',
      'Kapsüller (baklalar) uzamış, içindeki taneler doluyor.',
    ],
    azot: [15, 16, 17, 18, 18, 18],
    noktalar: [
      { ei: 2, pay: 0.5 },
      { ei: 3, pay: 0.5 },
    ],
    kDonemleri: [3, 4],
    fosfor: (p) => (p < 3 ? 8 : p < 6 ? 6 : p < 9 ? 5 : p < 12 ? 3 : 0),
    potasyum: (k) => (k < 20 ? 8 : k < 30 ? 5 : 0),
    tabanMinN: 4,
    kukurtlu: true,
    dipnot: 'Azot ekim, Şubat ve Mart olmak üzere üçe bölünür; kanola kükürde çok ihtiyaç duyar, bu yüzden azotun bir kısmı kükürtlü (AS 21) verilir.',
  },
  Bezelye: {
    // Samsun İl Tarım ve Orman Müdürlüğü: ilkbahar ekiminde en az 2 su (çiçeklenmeden önce ve meyve tutumundan sonra), çok kurakta 3. su
    suDonemleri: { 0: [], 1: [2], 2: [2, 3], 3: [1, 2, 3], 4: [0, 1, 2, 3] },
    tanima: [
      'Ekimden sonra toprak kuruysa çıkış için verilir.',
      'Bitki dallanmış, yaprak uçlarında kıvrık sülükler çıkmıştır.',
      'İlk beyaz çiçekler açmaktadır; su çiçeklenmeden hemen önce ya da başında verilir.',
      'Çiçekler baklaya dönmüştür, baklalar doluyor; meyve tutumundan sonraki sudur.',
      'Baklalar dolgun ve parlak yeşildir; taze hasat 3–4 gün arayla kademeli yapılır.',
    ],
    azot: [3, 3, 4, 4, 4, 4],
    noktalar: [],
    kDonemleri: [],
    fosfor: (p) => (p < 3 ? 10 : p < 6 ? 9 : p < 9 ? 8 : p < 12 ? 5 : 0),
    potasyum: (k) => (k < 20 ? 12 : k < 30 ? 8 : 0),
    tabanMinN: 3,
    baklagil: true,
    enCokSu: 4,
    varsayilanSu: 2,
    giris:
      'Bezelyede kaç su gerektiğini ilkbahar yağışı belirler. Sonbaharda ekilen bezelye genellikle sulanmaz; ilkbaharda ekilene en az iki su verilir.',
    rehber: 'Sonbahar ekimi: genelde sulanmaz · ilkbahar ekimi: 2 su (çiçeklenmeden önce ve meyve tutumundan sonra) · çok kurak yıl: 3–4 su.',
    dipnot:
      'Bezelye azotunun çoğunu kökündeki bakterilerden alır; bu yüzden yalnızca az bir başlangıç azotu verilir. Bakteri aşılı tohum kullanın. Fosfor ve potasyumun tamamı ekimden önce toprağa verilir.',
  },
};

export const TAHILLAR = Object.keys(AYARLAR);
export const tahilMi = (bitki?: string | null) => !!bitki && bitki in AYARLAR;
export const planDipnotu = (bitki: string) => AYARLAR[bitki]?.dipnot ?? '';
/** Ekrandaki seçenekler ve metinler */
export function planAyari(bitki: string) {
  const a = AYARLAR[bitki] ?? AYARLAR.Buğday;
  const ad = bitki.toLocaleLowerCase('tr-TR');
  return {
    enCokSu: a.enCokSu ?? 5,
    varsayilanSu: a.varsayilanSu ?? 3,
    giris:
      a.giris ??
      `Kışlık ${ad} kaç su alacağını o yılın yağışı belirler. Kış ve bahar yağışlı geçerse az, kurak geçerse çok su verilir.`,
    rehber: a.rehber ?? 'Genel olarak: yağışlı yıl 1–2 su · normal yıl 2–3 su · kurak yıl 4–5 su.',
  };
}

export type PlanUrunu = { urun: string; doz: string; neden?: string };
export type PlanAdimi = {
  evre: number;
  ad: string;
  donem: string;
  tanima: string;
  /** Bu dönemde verilen suyun sırası (1., 2. su…); yoksa dönem yağışa bırakılmıştır */
  su?: number;
  /** Toprağa / suyla verilecekler ve nasıl */
  gubre: PlanUrunu[];
  gubreYolu?: 'ekim' | 'suyla' | 'serpip-sula' | 'yagis-oncesi';
  yaprak: PlanUrunu[];
};
export type TahilPlani = {
  suSayisi: number;
  adimlar: PlanAdimi[];
  hedef: { N: number; P2O5: number; K2O: number; S?: number };
  nedenler: string[];
  analizli: boolean;
};

const yuvarla = (x: number, adim = 1) => Math.max(adim, Math.round(x / adim) * adim);
const fmt = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 1 });

/** UAN-32: %32 N, yoğunluk ≈ 1,32 kg/L → 1 L ≈ 0,42 kg N */
const UAN_N_L = 0.32 * 1.32;
/** AS 21: %21 N, %24 S */
const AS_S = 0.24;

function azotHedefi(a: Ayar, su: number, om: number | undefined) {
  const taban = a.azot[Math.min(5, su)];
  let n = taban;
  let neden: string | undefined;
  if (om !== undefined) {
    const d = om < 1 ? 2 : om < 2 ? 1 : om < 3 ? 0 : om < 4 ? -2 : -3;
    n += d;
    const sinif = om < 1 ? 'çok az' : om < 2 ? 'az' : om < 3 ? 'orta' : om < 4 ? 'iyi' : 'yüksek';
    neden =
      d > 0
        ? `Organik madde %${fmt(om)} (${sinif}): toprak kendiliğinden az azot verir, azot hedefi ${d} kg/da artırıldı`
        : d < 0
          ? `Organik madde %${fmt(om)} (${sinif}): toprak azotun bir kısmını kendisi verir, azot hedefi ${-d} kg/da azaltıldı`
          : `Organik madde %${fmt(om)} (orta): azot hedefi değiştirilmedi`;
  }
  return { n, taban, neden };
}

function fosforIhtiyaci(a: Ayar, p: number | undefined) {
  if (p === undefined) return { p2o5: a.fosfor(7), neden: undefined };
  const p2o5 = a.fosfor(p);
  const sinif = p < 3 ? 'çok az' : p < 6 ? 'az' : p < 9 ? 'orta' : p < 12 ? 'yüksek' : 'çok yüksek';
  return {
    p2o5,
    neden: p2o5 > 0 ? `Fosfor ${fmt(p)} kg/da (${sinif}): ekimde ${p2o5} kg/da saf fosfor (P₂O₅) verilir.` : `Fosfor ${fmt(p)} kg/da (${sinif}): fosforlu gübreye gerek yok.`,
  };
}

function potasyumIhtiyaci(a: Ayar, k: number | undefined) {
  if (k === undefined) return { k2o: a.baklagil ? a.potasyum(25) : 0, neden: undefined };
  const k2o = a.potasyum(k);
  const sinif = k < 20 ? 'az' : k < 30 ? 'orta' : 'yeterli';
  return {
    k2o,
    neden: k2o > 0 ? `Potasyum ${fmt(k)} kg/da (${sinif}): ${k2o} kg/da saf potasyum (K₂O) eklendi.` : `Potasyum ${fmt(k)} kg/da (${sinif}): potasyumlu gübreye gerek yok.`,
  };
}

/**
 * Su sayısına ve toprak analizine göre dönem dönem plan.
 * yontem: tarlanın sulama sistemi. "kuru" seçili tarlada su verilirse gübre suyla değil, serpilip sulanır.
 */
export function tahilPlani(zkart: ZKart, suSayisi: number, yontem: SulamaYontemi, report?: SoilReport | null): TahilPlani {
  const ayar = AYARLAR[zkart.bitki] ?? AYARLAR.Buğday;
  const v = report?.values ?? {};
  const analizli = !!report && Object.keys(v).length > 0;
  const nedenler: string[] = [];
  const suEvreleri = ayar.suDonemleri[Math.max(0, Math.min(ayar.enCokSu ?? 5, suSayisi))] ?? [];
  const suyla = yontem === 'damla' || yontem === 'yagmurlama' || yontem === 'pivot';
  const kirecli = (v.kirec ?? 0) > 5 || (v.ph ?? 0) > 7.8;
  const cinkoDusuk = v.cinko !== undefined ? v.cinko < 0.7 : kirecli;
  const bitkiAd = zkart.bitki.toLocaleLowerCase('tr-TR');
  let kukurt = 0;

  // Hedefler
  const az = azotHedefi(ayar, suEvreleri.length, ayar.baklagil ? undefined : v.organikMadde);
  const fo = fosforIhtiyaci(ayar, v.fosfor);
  const po = potasyumIhtiyaci(ayar, v.potasyum);
  if (ayar.baklagil)
    nedenler.push(`Bezelye baklagildir; azotun çoğunu kökündeki bakterilerden alır. Yalnızca ${az.n} kg/da başlangıç azotu verilir.`);
  else nedenler.push(
    suEvreleri.length === 0
      ? `Sulanmayan ${bitkiAd} için temel azot ihtiyacı ${az.taban} kg/da.`
      : `${suEvreleri.length} su verilen ${bitkiAd} daha yüksek verim verir; temel azot ihtiyacı ${az.taban} kg/da.`,
  );
  if (az.neden) nedenler.push(`${az.neden} (toplam ${az.n} kg/da).`);
  if (fo.neden) nedenler.push(fo.neden);
  if (po.neden) nedenler.push(po.neden);
  if (!ayar.baklagil && v.kirec !== undefined && v.kirec > 5) nedenler.push(`Kireç %${fmt(v.kirec)}: çinko ve fosfor alımı zorlaşır; çinkolu taban gübresi ve kükürtlü azot (AS 21) seçildi.`);
  if (v.cinko !== undefined && !(ayar.baklagil && cinkoDusuk)) nedenler.push(cinkoDusuk ? `Çinko ${fmt(v.cinko)} mg/kg (düşük): taban gübresi çinkolu seçildi, yapraktan çinko önemli.` : `Çinko ${fmt(v.cinko)} mg/kg (yeterli).`);
  if (zkart.bitki === 'Kanola' && v.bor !== undefined)
    nedenler.push(
      v.bor < 0.5
        ? `Bor ${fmt(v.bor)} mg/kg (düşük): kanola bora çok ihtiyaç duyar; tomurcuk ve çiçeklenmedeki yapraktan bor (N-CALBOR) uygulamalarını atlamayın.`
        : `Bor ${fmt(v.bor)} mg/kg (yeterli); yapraktan bor yine de çiçek tutumunu destekler.`,
    );

  const adimlar: PlanAdimi[] = zkart.evreler.map((e, i) => ({
    evre: i,
    ad: e.evre,
    donem: e.donem,
    tanima: ayar.tanima[i] ?? '',
    su: suEvreleri.includes(i) ? suEvreleri.indexOf(i) + 1 : undefined,
    gubre: [],
    yaprak: e.uygulamalar.filter((g) => g.yontem === 'Yapraktan').flatMap((g) => g.urunler.map((u) => ({ urun: u.urun, doz: u.doz }))),
  }));

  // 1) Ekim: fosfor (ve suyla verilemiyorsa potasyum) taban gübresiyle
  let tabanN = 0;
  const ekim = adimlar[0];
  ekim.gubreYolu = 'ekim';
  if (fo.p2o5 > 0) {
    if (cinkoDusuk && !ayar.baklagil) {
      const kg = yuvarla(fo.p2o5 / 0.2);
      tabanN += kg * 0.2;
      ekim.gubre.push({ urun: 'NPK 20.20.0+Zn', doz: `${kg} kg/da`, neden: `${fo.p2o5} kg/da fosfor ve çinko için, mibzerle tohumun yanına` });
    } else {
      const kg = yuvarla(fo.p2o5 / 0.46);
      tabanN += kg * 0.18;
      ekim.gubre.push({ urun: 'DAP', doz: `${kg} kg/da`, neden: `${fo.p2o5} kg/da fosfor için, mibzerle tohumun yanına` });
    }
  }
  if (ayar.baklagil && cinkoDusuk)
    nedenler.push('Çinko düşük ya da toprak kireçli: baklagilde fazla azot vermemek için taban gübresi DAP seçildi; çinkoyu yapraktan verin.');
  if (ayar.tabanMinN && tabanN < ayar.tabanMinN - 0.5) {
    const n = ayar.tabanMinN - tabanN;
    const kg = yuvarla(n / 0.21);
    tabanN += kg * 0.21;
    kukurt += kg * AS_S;
    ekim.gubre.push({ urun: 'AS 21', doz: `${kg} kg/da`, neden: `${fmt(n)} kg/da azot ve kükürtle kışa güçlü girmek için` });
  }
  // Potasyum: suyla verilebiliyorsa uygun sulara; yoksa ekimde
  const kSulari = suyla ? ayar.kDonemleri.filter((ei) => suEvreleri.includes(ei)) : [];
  if (po.k2o > 0 && kSulari.length === 0) {
    const kg = yuvarla(po.k2o / 0.5);
    kukurt += kg * 0.18;
    ekim.gubre.push({ urun: 'K₂SO₄', doz: `${kg} kg/da`, neden: `${po.k2o} kg/da potasyum için, ekimle birlikte` });
  }

  // 2) Azot: ilkbahar dönemlerine bölünür
  const kalanN = Math.max(0, az.n - tabanN);
  const noktalar = ayar.noktalar.filter((x) => !x.sonSu || suEvreleri.includes(x.ei));
  const toplamPay = noktalar.reduce((s, x) => s + x.pay, 0);
  let ilkNokta = true;
  for (const { ei, pay } of noktalar) {
    const a = adimlar[ei];
    if (!a) continue;
    let n = (kalanN * pay) / toplamPay;
    const suVar = a.su !== undefined;
    a.gubreYolu = suVar ? (suyla ? 'suyla' : 'serpip-sula') : 'yagis-oncesi';

    // Potasyum bu suyla (KNO₃ azot da verir)
    if (po.k2o > 0 && kSulari.includes(ei)) {
      const k2o = po.k2o / kSulari.length;
      const kg = yuvarla(k2o / 0.46, 0.5);
      n -= kg * 0.13;
      a.gubre.push({ urun: 'KNO₃', doz: `${fmt(kg)} kg/da`, neden: `${fmt(k2o)} kg/da potasyum için` });
    }
    if (n < 0.8) {
      ilkNokta = false;
      continue;
    }
    const kukurtGerek = ilkNokta && (kirecli || !!ayar.kukurtlu);
    if (suVar && suyla && !kukurtGerek) {
      a.gubre.push({ urun: 'UAN-32', doz: `${fmt(yuvarla(n / UAN_N_L, 0.5))} L/da`, neden: `${fmt(n)} kg/da azot` });
    } else {
      const kg = yuvarla(n / 0.21);
      kukurt += kg * AS_S;
      a.gubre.push({
        urun: 'AS 21',
        doz: `${kg} kg/da`,
        neden: `${fmt(n)} kg/da azot${
          kukurtGerek && ayar.kukurtlu ? ', kükürtle birlikte (kanola kükürde çok ihtiyaç duyar)' : kirecli ? ', kükürtle birlikte (kireçli toprak)' : ''
        }`,
      });
    }
    ilkNokta = false;
  }
  for (const a of adimlar) if (a.gubre.length === 0 && a.gubreYolu !== 'ekim') a.gubreYolu = undefined;

  if (ayar.kukurtlu)
    nedenler.push(
      kukurt >= 4
        ? 'Kanola kükürde çok ihtiyaç duyar (yaklaşık 4 kg/da); bu ihtiyaç plandaki kükürtlü gübrelerle (AS 21) karşılanıyor.'
        : `Kanola kükürde çok ihtiyaç duyar (yaklaşık 4 kg/da); plandaki gübreler ≈ ${fmt(kukurt)} kg/da veriyor, kapsül döneminde yapraktan K-S'yi atlamayın.`,
    );

  return {
    suSayisi: suEvreleri.length,
    adimlar,
    hedef: { N: az.n, P2O5: fo.p2o5, K2O: po.k2o, S: ayar.kukurtlu ? 4 : undefined },
    nedenler,
    analizli,
  };
}
