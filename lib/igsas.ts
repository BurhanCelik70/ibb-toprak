/**
 * İGSAŞ (İstanbul Gübre Sanayii A.Ş.) ve KIANA ürün kataloğu, öneri kuralları ve organik madde protokolü.
 *
 * Kaynaklar:
 *  - "İGSAŞ Azərbaycan · dönem dönem infografik seti" (Prof. Dr. Metin Turan): Z-kartlar ve
 *    "İGSAŞ Biyolojik ve Organik Destek" kutuları
 *  - ibb-toprak deposundaki lib/igsas.ts (aynı ürünler ve dozlar)
 *
 * Ürünlerin "rol" açıklamaları, Z-kartlarda hangi dönemlerde kullanıldıklarından çıkarılmıştır.
 * Dozlar dekar (da) başınadır.
 * ⚠️ Ürün içerikleri (garanti edilen besin oranları), ürün sayfası adresleri ve satış/iletişim bilgisi İGSAŞ'tan istenecek.
 *    Gelince `icerik`, `url`, `kod` (public/urunler/<kod>.png) ve SATIN_ALMA alanlarını doldurun.
 */

export type IgsasGrup = 'biyolojik' | 'organik' | 'yaprak' | 'mineral';
export type IgsasMarka = 'İGSAŞ' | 'KIANA';

export type IgsasEtiket =
  | 'organik-madde' | 'yapi' | 'tuz' | 'kirec' | 'fe' | 'zn' | 'mn' | 'mikro' | 'ca' | 'b' | 'mg' | 's'
  | 'kok' | 'stres' | 'cicek' | 'biyolojik' | 'tohum' | 'n' | 'p' | 'k' | 'kalite' | 'su-tutma' | 'hat-temizligi';

export type IgsasUrun = {
  ad: string;
  marka: IgsasMarka;
  grup: IgsasGrup;
  /** Kısa içerik / tür (garanti edilen oranlar İGSAŞ'tan gelince yazılacak) */
  icerik: string;
  /** Ne işe yarar, ne zaman önerilir */
  rol: string;
  dozlar: { yol: 'toprak' | 'taban' | 'damla' | 'yaprak' | 'tohum' | 'fide'; doz: string }[];
  /** Öneri kurallarında kullanılan etiketler */
  etiket: IgsasEtiket[];
  /** Ürün sayfası (İGSAŞ'tan gelince) */
  url?: string;
  /** Dosya adı: public/urunler/<kod>.png (çuval / ambalaj görseli, yazısız) */
  kod?: string;
  /** Doğrudan satın alma adresi (bayi / e-mağaza) */
  satinAl?: string;
};

export const IGSAS_URUNLER: IgsasUrun[] = [
  // --- KIANA biyolojik destek ---
  {
    ad: 'KIANA EARTH PLUS', marka: 'KIANA', grup: 'biyolojik',
    icerik: 'Kök bölgesi mikrobiyal konsorsiyumu.',
    rol: 'Kök bölgesi mikrobiyal konsorsiyumu; kök gelişimini ve besin alımını artırır.',
    dozlar: [
      { yol: 'damla', doz: '200 g/da (toprağa ya da damlayla)' },
      { yol: 'fide', doz: 'Ağaçta 1 kg/da' },
      { yol: 'tohum', doz: '100 g/100 kg tohum' },
    ],
    etiket: ['biyolojik', 'kok', 'tohum'],
  },
  {
    ad: 'KIANA CLIMATE PLUS', marka: 'KIANA', grup: 'biyolojik',
    icerik: 'Stres tamponu.',
    rol: 'Don, sıcak ve kuraklık stresine karşı bitkiyi korur (stres tamponu).',
    dozlar: [{ yol: 'yaprak', doz: '200–300 g/da; stresten 5–10 gün ÖNCE' }],
    etiket: ['stres'],
  },
  {
    ad: 'KIANA SOIL SOUL', marka: 'KIANA', grup: 'biyolojik',
    icerik: 'Selüloz bazlı hidrojel.',
    rol: 'Selüloz bazlı hidrojel; kök bölgesinde su ve besin deposu oluşturur.',
    dozlar: [{ yol: 'toprak', doz: '1–3 kg/da, kök bölgesine' }],
    etiket: ['su-tutma', 'yapi', 'kok'],
  },
  {
    ad: 'CORENZA', marka: 'İGSAŞ', grup: 'biyolojik',
    icerik: 'Enzim bazlı temas ürünü.',
    rol: 'Enzim bazlı temas ürünü; kalıntı bırakmaz.',
    dozlar: [{ yol: 'yaprak', doz: '250–300 cc/100 L su' }],
    etiket: [],
  },
  // --- Organik madde ---
  {
    ad: 'HÜMİK ASİT', marka: 'İGSAŞ', grup: 'organik',
    icerik: 'Sıvı hümik asit.',
    rol: 'Organik madde eksikliğini telafi eder; toprak yapısını ve besin tutmayı iyileştirir.',
    dozlar: [{ yol: 'damla', doz: 'Toplam 10–15 L/da, sezon boyunca bölünerek' }],
    etiket: ['organik-madde', 'yapi', 'tuz', 'kirec', 'kok'],
  },
  {
    ad: 'AMİNO ASİT', marka: 'İGSAŞ', grup: 'organik',
    icerik: 'Amino asit.',
    rol: 'Kök ve sürgün gelişimini hızlandırır, stresten sonra toparlanmayı destekler.',
    dozlar: [
      { yol: 'damla', doz: 'Toplam 6–10 L/da' },
      { yol: 'yaprak', doz: '250–300 cc/da' },
    ],
    etiket: ['stres', 'kok'],
  },
  {
    ad: 'LEONARDİT GRANÜL', marka: 'İGSAŞ', grup: 'organik',
    icerik: 'Leonardit kökenli granül hümik kaynak.',
    rol: 'Uzun etkili hümik kaynak; tohum yatağında organik maddeyi yükseltir.',
    dozlar: [{ yol: 'toprak', doz: '300–400 kg/da, tohum yatağına' }],
    etiket: ['organik-madde', 'yapi'],
  },
  {
    ad: 'BİYOGAZ ÇIKTISI GRANÜL (ODA GRANÜL)', marka: 'İGSAŞ', grup: 'organik',
    icerik: 'Fermente organik materyal, granül.',
    rol: 'Fermente organik materyal; toprağın organik madde ve mikrobiyal canlılığını artırır.',
    dozlar: [{ yol: 'toprak', doz: '400–500 kg/da, toprak hazırlığında' }],
    etiket: ['organik-madde', 'biyolojik', 'yapi'],
  },
  {
    ad: 'MOL-50', marka: 'İGSAŞ', grup: 'organik',
    icerik: 'Kök besin alımı destekleyici.',
    rol: 'Kökte besin alımını destekler (kök besin alımı noktasında çalışır).',
    dozlar: [{ yol: 'damla', doz: '1–1,5 L/da' }],
    etiket: ['kok'],
  },
  // --- Yaprak ve özel ürünler ---
  {
    ad: 'N-CALBOR', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'Azot + kalsiyum + bor.',
    rol: 'Azot + kalsiyum + bor; çiçek/meyve tutumu ve hücre duvarı (kabuk) dayanımı.',
    dozlar: [{ yol: 'yaprak', doz: '250–300 cc/da' }],
    etiket: ['ca', 'b', 'cicek'],
  },
  {
    ad: 'FLOWER GOLD', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'Çiçeklenme destekleyici yaprak gübresi.',
    rol: 'Çiçeklenme ve döllenme döneminde tutumu destekler.',
    dozlar: [{ yol: 'yaprak', doz: '200 cc/da' }],
    etiket: ['cicek'],
  },
  {
    ad: 'COLORFUL', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'Renklenme destekleyici yaprak gübresi.',
    rol: 'Renklenme ve olgunlaşmayı destekler.',
    dozlar: [{ yol: 'yaprak', doz: '300 cc/da' }],
    etiket: ['kalite', 'k'],
  },
  {
    ad: 'ENLARGE POTASH', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'Sıvı potasyum kaynağı.',
    rol: 'Potasyum kaynağı; meyve, tane ve yumru irileşmesi.',
    dozlar: [{ yol: 'yaprak', doz: '1–2 L/da' }],
    etiket: ['k', 'kalite'],
  },
  {
    ad: 'KOMBİ', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'Mikro element kombinasyonu.',
    rol: 'Mikro element kombinasyonu.',
    dozlar: [{ yol: 'yaprak', doz: '150 g/da' }],
    etiket: ['mikro', 'fe', 'zn', 'mn'],
  },
  {
    ad: 'MAGNEZYUM', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'Yaprak magnezyumu.',
    rol: 'Klorofil ve dolum için magnezyum.',
    dozlar: [{ yol: 'yaprak', doz: '300 g/da' }],
    etiket: ['mg'],
  },
  {
    ad: 'EDTA Zn-Mn', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'EDTA şelatlı çinko ve mangan.',
    rol: 'Çinko ve mangan; özellikle kireçli ve alkali topraklarda.',
    dozlar: [{ yol: 'yaprak', doz: '200–250 cc/da' }],
    etiket: ['zn', 'mn', 'kirec'],
  },
  {
    ad: 'DEMİR ŞELAT', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'Şelatlı demir.',
    rol: 'Demir eksikliği (genç yapraklarda sararma) için; kireçli topraklarda.',
    dozlar: [{ yol: 'damla', doz: 'Z-karttaki doza göre' }],
    etiket: ['fe', 'kirec'],
  },
  {
    ad: 'K-S', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'Potasyum + kükürt.',
    rol: 'Potasyum + kükürt; dolum ve kalite.',
    dozlar: [{ yol: 'yaprak', doz: '400–500 g/da' }],
    etiket: ['k', 's', 'kalite'],
  },
  // --- Mineral gübreler ---
  {
    ad: 'DAP', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Diamonyum fosfat, 18-46-0.',
    rol: 'Taban gübresi; fosfor + azot.',
    dozlar: [{ yol: 'taban', doz: '15–20 kg/da (ekimle, banda)' }],
    etiket: ['p', 'n'],
  },
  {
    ad: 'NPK 20.20.0+Zn', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Kompoze gübre, 20-20-0 + çinko.',
    rol: 'Taban gübresi; azot + fosfor + çinko.',
    dozlar: [{ yol: 'taban', doz: '20–25 kg/da' }],
    etiket: ['n', 'p', 'zn'],
  },
  {
    ad: 'NPK 15-30-15+Zn', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Kompoze gübre, 15-30-15 + çinko.',
    rol: 'Taban gübresi; fosfor ağırlıklı + çinko.',
    dozlar: [{ yol: 'taban', doz: 'Z-karttaki doza göre' }],
    etiket: ['p', 'n', 'k', 'zn'],
  },
  {
    ad: 'NPK 12-40-12', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Suda çözünür, 12-40-12.',
    rol: 'Fosfor ağırlıklı; kök ve başlangıç gelişimi (damla/yağmurlama).',
    dozlar: [{ yol: 'damla', doz: '3–4 kg/da' }],
    etiket: ['p', 'kok'],
  },
  {
    ad: 'NPK 18-18-18', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Suda çözünür, 18-18-18.',
    rol: 'Dengeli; vejetatif gelişim.',
    dozlar: [{ yol: 'damla', doz: 'Z-karttaki doza göre' }],
    etiket: ['n', 'p', 'k'],
  },
  {
    ad: 'NPK 20-20-20+ME', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Suda çözünür, 20-20-20 + mikro element.',
    rol: 'Dengeli + mikro element.',
    dozlar: [{ yol: 'damla', doz: 'Z-karttaki doza göre' }],
    etiket: ['n', 'p', 'k', 'mikro'],
  },
  {
    ad: 'NPK 7-7-40+ME', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Suda çözünür, 7-7-40 + mikro element.',
    rol: 'Potasyum ağırlıklı; meyve dolumu.',
    dozlar: [{ yol: 'damla', doz: '3–5 kg/da' }],
    etiket: ['k', 'kalite'],
  },
  {
    ad: 'UAN-32', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Sıvı azot, %32 N.',
    rol: 'Sıvı azot; baş gübre.',
    dozlar: [{ yol: 'damla', doz: '8–16 L/da (döneme göre)' }],
    etiket: ['n'],
  },
  {
    ad: 'AS 21', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Amonyum sülfat, %21 N + %24 S.',
    rol: 'Amonyum sülfat; azot + kükürt, kireçli toprakta pH etkisi.',
    dozlar: [{ yol: 'toprak', doz: '15–20 kg/da' }],
    etiket: ['n', 's', 'kirec'],
  },
  {
    ad: 'KNO₃', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Potasyum nitrat, 13-0-46.',
    rol: 'Potasyum nitrat; dolum ve irileşme.',
    dozlar: [
      { yol: 'damla', doz: '4–8 kg/da' },
      { yol: 'yaprak', doz: '400 g/da' },
    ],
    etiket: ['k', 'n', 'kalite'],
  },
  {
    ad: 'K₂SO₄', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Potasyum sülfat, %50 K₂O + %18 S.',
    rol: 'Potasyum sülfat; potasyum + kükürt.',
    dozlar: [{ yol: 'damla', doz: 'Z-karttaki doza göre' }],
    etiket: ['k', 's'],
  },
  {
    ad: 'MKP', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Mono potasyum fosfat, 0-52-34.',
    rol: 'Mono potasyum fosfat; çiçeklenme ve tutum.',
    dozlar: [{ yol: 'damla', doz: 'Z-karttaki doza göre' }],
    etiket: ['p', 'k', 'cicek'],
  },
  {
    ad: 'Mg NİTRAT', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Magnezyum nitrat.',
    rol: 'Magnezyum + azot.',
    dozlar: [{ yol: 'damla', doz: 'Z-karttaki doza göre' }],
    etiket: ['mg', 'n'],
  },
  {
    ad: 'FOSFORİK ASİT', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Fosforik asit.',
    rol: 'Fosfor + damla hattı temizliği, pH düşürme.',
    dozlar: [{ yol: 'damla', doz: 'Z-karttaki doza göre' }],
    etiket: ['p', 'hat-temizligi', 'kirec'],
  },
  {
    ad: 'NİTRİK ASİT', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Nitrik asit.',
    rol: 'Azot + sulama suyu pH düzenleme.',
    dozlar: [{ yol: 'damla', doz: 'Z-karttaki doza göre' }],
    etiket: ['n', 'hat-temizligi'],
  },
];

export const URUN_ADLARI = IGSAS_URUNLER.map((u) => u.ad);

/** Analizdeki duruma göre öncelikli ürün etiketleri (öneri motorunun kuralları) */
export const IGSAS_KURALLAR: { durum: string; etiketler: IgsasEtiket[] }[] = [
  { durum: 'Organik madde düşük (%2’nin altı)', etiketler: ['organik-madde', 'yapi'] },
  { durum: 'Tuzlu toprak ya da tuzlu sulama suyu', etiketler: ['tuz', 'organik-madde', 'biyolojik'] },
  { durum: 'Kireçli / pH > 7,5 ve Fe-Zn-Mn düşük', etiketler: ['kirec', 'fe', 'zn', 'mn'] },
  { durum: 'Fosfor düşük', etiketler: ['p'] },
  { durum: 'Potasyum düşük ya da dolum/irileşme dönemi', etiketler: ['k', 'kalite'] },
  { durum: 'Azot ihtiyacı (baş gübre)', etiketler: ['n'] },
  { durum: 'Magnezyum düşük', etiketler: ['mg'] },
  { durum: 'Kalsiyum veya bor noksanlığı belirtisi', etiketler: ['ca', 'b'] },
  { durum: 'Biyolojik aktivite (solunum, enzimler) düşük', etiketler: ['biyolojik'] },
  { durum: 'Kumlu ya da su tutmayan toprak', etiketler: ['su-tutma', 'organik-madde'] },
  { durum: 'Ekim / dikim, köklenme dönemi', etiketler: ['kok', 'tohum'] },
  { durum: 'Çiçeklenme ve meyve tutumu', etiketler: ['cicek'] },
  { durum: 'Don, sıcak, kuraklık stresi beklentisi', etiketler: ['stres'] },
];

/**
 * Organik maddesi düşük topraklar için İGSAŞ uygulama protokolü (proje notları).
 * Ahır gübresi / kompost önerilmez.
 */
export const ORGANIK_MADDE_PROTOKOLU: { urun: string; doz: string; uygulama: string }[] = [
  { urun: 'LEONARDİT GRANÜL', doz: '300–400 kg/da', uygulama: 'Ekim/dikim öncesi tohum yatağına' },
  { urun: 'BİYOGAZ ÇIKTISI GRANÜL (ODA GRANÜL)', doz: '400–500 kg/da', uygulama: 'Toprak hazırlığında, toprağa karıştırarak' },
  { urun: 'HÜMİK ASİT', doz: 'Toplam 10–15 L/da', uygulama: 'Damla sulama ile, sezon boyunca bölünerek' },
  { urun: 'AMİNO ASİT', doz: 'Toplam 6–10 L/da', uygulama: 'Damla sulama ile, kritik gelişme dönemlerinde' },
  { urun: 'KIANA SOIL SOUL', doz: '1–2 kg/da', uygulama: 'Kök bölgesine, toprak hazırlığında' },
];

const adNorm = (s: string) => s.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();
/** Yazım farklarını kaldırır: "NPK 20-20-0+Zn" = "NPK 20.20.0+Zn", "KNO3" = "KNO₃" */
const anahtar = (s: string) =>
  adNorm(s)
    .replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 0x2080))
    .replace(/[.\-–\s]/g, '');

/** "KIANA EARTH PLUS (tohuma)" gibi adları katalogdaki ürünle eşleştirir. */
export function igsasUrunBul(ad: string): IgsasUrun | undefined {
  if (!ad) return undefined;
  const a = adNorm(ad);
  const ak = anahtar(ad.replace(/\s*\(.*$/, ''));
  return (
    IGSAS_URUNLER.find((u) => {
      const k = adNorm(u.ad);
      return a === k || a.startsWith(k + ' ') || a.startsWith(k + ' (');
    }) ?? IGSAS_URUNLER.find((u) => anahtar(u.ad) === ak)
  );
}

/**
 * Markasız besin satırları. İGSAŞ sürümünde mineral gübreler ürün adıyla (DAP, NPK…) önerilir;
 * bu satırlar yalnız eski kayıtlarda ya da yapay zekâ markasız besin yazarsa tanınsın diye durur.
 */
export const BESIN_SATIRLARI: Record<string, string> = {
  'Azot (N)': 'Saf azot. İGSAŞ’ın azotlu gübrelerinden (UAN-32, AS 21, KNO₃ …) karşılanabilir.',
  'Fosfor (P₂O₅)': 'Saf fosfor (P₂O₅). DAP, NPK 20.20.0+Zn ya da suda çözünür fosforlu gübrelerden karşılanabilir.',
  'Potasyum (K₂O)': 'Saf potasyum (K₂O). K₂SO₄, KNO₃ ya da NPK 7-7-40+ME’den karşılanabilir.',
  'Magnezyum (MgO)': 'Saf magnezyum (MgO). Mg NİTRAT ya da yapraktan MAGNEZYUM ile karşılanabilir.',
  'Kükürt (S)': 'Saf kükürt. AS 21, K₂SO₄ ve K-S ile birlikte gelir.',
  'Çinko (Zn)': 'Çinkolu taban gübresi (NPK 20.20.0+Zn) ya da yapraktan EDTA Zn-Mn.',
};

/** Bir öneri satırı İGSAŞ/KIANA ürünü mü, markasız besin mi? Rozet ve kısa açıklama için. */
export function urunBilgisi(ad: string): { marka: IgsasMarka | null; besin: boolean; rol?: string } {
  const besin = BESIN_SATIRLARI[ad];
  if (besin) return { marka: null, besin: true, rol: besin };
  const u = igsasUrunBul(ad);
  return { marka: u ? u.marka : null, besin: false, rol: u?.rol };
}

/**
 * Satın alma / fiyat isteme. İGSAŞ'ın bayi ağı ya da e-posta adresi gelince doldurun:
 *  - `magaza`: bayi bulucu ya da e-mağaza adresi (bütün "Satın al" düğmeleri oraya gider)
 *  - `eposta`: fiyat isteği e-postası (mağaza yoksa "Fiyat al" düğmesi bu adrese e-posta açar)
 * İkisi de boşsa düğme gösterilmez.
 */
export const SATIN_ALMA = {
  magaza: '',
  eposta: '',
  telefon: '',
};

/** Ürün görseli: sitedeki kopya (public/urunler/<kod>.png); yoksa baş harfli yedek kutu gösterilir */
export const urunGorselleri = (u: IgsasUrun) => [u.kod ? `/urunler/${u.kod}.png` : ''].filter(Boolean);

/** "Satın al" bağlantısı: mağaza varsa oraya, yoksa ihtiyaç miktarı yazılmış fiyat isteği e-postası; ikisi de yoksa undefined */
export function satinAlmaLinki(
  u: Pick<IgsasUrun, 'ad' | 'satinAl'>,
  ihtiyac?: { miktar?: string; alan?: number | null; bitki?: string | null },
): { href: string; metin: string; dis: boolean } | undefined {
  if (u.satinAl) return { href: u.satinAl, metin: 'Satın al', dis: true };
  if (SATIN_ALMA.magaza) return { href: SATIN_ALMA.magaza, metin: 'Satın al', dis: true };
  if (!SATIN_ALMA.eposta) return undefined;
  const satirlar = [
    'Merhaba,',
    '',
    `Toprak analiz raporuma göre ${u.ad} kullanmak istiyorum.`,
    ihtiyac?.miktar ? `Sezonluk ihtiyacım: yaklaşık ${ihtiyac.miktar}${ihtiyac.alan ? ` (${ihtiyac.alan} dekar` : ''}${ihtiyac.bitki ? `${ihtiyac.alan ? ', ' : ' ('}${ihtiyac.bitki}` : ''}${ihtiyac.alan || ihtiyac.bitki ? ')' : ''}.` : '',
    'Bölgemdeki bayiyi ve fiyat bilgisini rica ederim.',
    '',
    'Ad Soyad:',
    'Telefon:',
    'İl / İlçe:',
  ].filter((x, i) => x !== '' || i === 1 || i === 5);
  const href = `mailto:${SATIN_ALMA.eposta}?subject=${encodeURIComponent(`Fiyat isteği: ${u.ad}`)}&body=${encodeURIComponent(satirlar.join('\n'))}`;
  return { href, metin: 'Fiyat al', dis: false };
}
