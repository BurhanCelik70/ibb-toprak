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
 * İçerik, ürün sayfası ve ambalaj görseli igsas.com.tr ürün sayfalarından alındı (Kasım 2026). KIANA ürünleri, CORENZA,
 * HÜMİK ASİT, LEONARDİT GRANÜL, ODA GRANÜL ve NPK 15-30-15+Zn İGSAŞ sitesinde yok: bunlar İGSAŞ'a sorulacak.
 * "EDTA Zn-Mn" için sitedeki en yakın ürün IGSAS MN-ZN (sülfatlı sıvı) kullanıldı; İGSAŞ ile teyit edilmeli.
 * ⚠️ Satış/iletişim bilgisi (SATIN_ALMA) İGSAŞ'tan istenecek.
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
  /** Dosya adı: public/urunler/<kod>.png (scripts/urun-gorselleri.ps1 indirir) */
  kod?: string;
  /** İGSAŞ'ın sitesindeki ambalaj görseli (yerel kopya yoksa bu gösterilir) */
  gorsel?: string;
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
    icerik: 'Sıvı organik: organik madde %55, organik karbon %20, organik azot %8, serbest amino asit %12.',
    url: 'https://www.igsas.com.tr/en/products/liquid-organic-fertilizers/igsas-amino-acid',
    kod: 'amino-asit',
    gorsel: 'https://www.igsas.com.tr/uploads/Products/aminoasitmockup.png',
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
    icerik: 'Bitki kökenli sıvı organomineral: organik madde %50, organik karbon %20, toplam azot %1,5, K₂O %5.',
    url: 'https://www.igsas.com.tr/en/products/liquid-organic-fertilizers/igsas-mol-50',
    kod: 'mol-50',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/mol50.png',
    rol: 'Kökte besin alımını destekler (kök besin alımı noktasında çalışır).',
    dozlar: [{ yol: 'damla', doz: '1–1,5 L/da' }],
    etiket: ['kok'],
  },
  // --- Yaprak ve özel ürünler ---
  {
    ad: 'N-CALBOR', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'Kalsiyum nitrat çözeltisi: azot %8 (nitrat), CaO %15, bor %0,2.',
    url: 'https://www.igsas.com.tr/en/products/liquid-fertilizers/igsas-n-calbor',
    kod: 'n-calbor',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/N-CALBOR.png',
    rol: 'Azot + kalsiyum + bor; çiçek/meyve tutumu ve hücre duvarı (kabuk) dayanımı.',
    dozlar: [{ yol: 'yaprak', doz: '250–300 cc/da' }],
    etiket: ['ca', 'b', 'cicek'],
  },
  {
    ad: 'FLOWER GOLD', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'NP + çinkolu sıvı organomineral: organik madde %20, azot %3, P₂O₅ %21, çinko %3.',
    url: 'https://www.igsas.com.tr/en/products/solid-and-liquid-organomineral-fertilizers/igsas-flower-gold',
    kod: 'flower-gold',
    gorsel: 'https://www.igsas.com.tr/uploads/Products/igsas-flower-gold.png',
    rol: 'Çiçeklenme ve döllenme döneminde tutumu destekler.',
    dozlar: [{ yol: 'yaprak', doz: '200 cc/da' }],
    etiket: ['cicek'],
  },
  {
    ad: 'COLORFUL', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'Sıvı potasyum: suda çözünür K₂O %30.',
    url: 'https://www.igsas.com.tr/en/products/liquid-fertilizers/igsas-colorful',
    kod: 'colorful',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/COLORFUL.png',
    rol: 'Renklenme ve olgunlaşmayı destekler.',
    dozlar: [{ yol: 'yaprak', doz: '300 cc/da' }],
    etiket: ['kalite', 'k'],
  },
  {
    ad: 'ENLARGE POTASH', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'NK sıvı organomineral: organik madde %15, azot %7, K₂O %20.',
    url: 'https://www.igsas.com.tr/en/products/solid-and-liquid-organomineral-fertilizers/igsas-enlarge-potash',
    kod: 'enlarge-potash',
    gorsel: 'https://www.igsas.com.tr/uploads/Products/igsas-enlarge-potash.png',
    rol: 'Potasyum kaynağı; meyve, tane ve yumru irileşmesi.',
    dozlar: [{ yol: 'yaprak', doz: '1–2 L/da' }],
    etiket: ['k', 'kalite'],
  },
  {
    ad: 'KOMBİ', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'EDTA şelatlı mikro element karışımı: Fe %4, Zn %4, Mn %3, Cu %0,5, B %0,1, Mo %0,1.',
    url: 'https://www.igsas.com.tr/en/products/micro-elements/igsas-combi',
    kod: 'kombi',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/COMBI.png',
    rol: 'Mikro element kombinasyonu.',
    dozlar: [{ yol: 'yaprak', doz: '150 g/da' }],
    etiket: ['mikro', 'fe', 'zn', 'mn'],
  },
  {
    ad: 'MAGNEZYUM', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'Sıvı magnezyum sülfat: MgO %5, SO₃ %10.',
    url: 'https://www.igsas.com.tr/en/products/liquid-fertilizers/igsas-magnesium',
    kod: 'magnezyum',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/MAGNEZYUM.png',
    rol: 'Klorofil ve dolum için magnezyum.',
    dozlar: [{ yol: 'yaprak', doz: '300 g/da' }],
    etiket: ['mg'],
  },
  {
    ad: 'EDTA Zn-Mn', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'Sıvı mangan + çinko: Mn %2, Zn %5.',
    url: 'https://www.igsas.com.tr/en/products/liquid-fertilizers/igsas-mn-zn',
    kod: 'mn-zn',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/MN-ZN.png',
    rol: 'Çinko ve mangan; özellikle kireçli ve alkali topraklarda.',
    dozlar: [{ yol: 'yaprak', doz: '200–250 cc/da' }],
    etiket: ['zn', 'mn', 'kirec'],
  },
  {
    ad: 'DEMİR ŞELAT', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'EDDHA şelatlı demir %6 (orto-orto 1,2); pH 7–9 kireçli topraklarda kararlı.',
    url: 'https://www.igsas.com.tr/en/products/micro-elements/igsas-eddha-fe-6',
    kod: 'eddha-fe-6',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/igsas-EDDHAFe6.png',
    rol: 'Demir eksikliği (genç yapraklarda sararma) için; kireçli topraklarda.',
    dozlar: [{ yol: 'damla', doz: 'Z-karttaki doza göre' }],
    etiket: ['fe', 'kirec'],
  },
  {
    ad: 'K-S', marka: 'İGSAŞ', grup: 'yaprak',
    icerik: 'Klorsuz sıvı potasyum tiyosülfat: K₂O %25, SO₃ %42.',
    url: 'https://www.igsas.com.tr/en/products/liquid-fertilizers/igsas-k-s',
    kod: 'k-s',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/k-s.png',
    rol: 'Potasyum + kükürt; dolum ve kalite.',
    dozlar: [{ yol: 'yaprak', doz: '400–500 g/da' }],
    etiket: ['k', 's', 'kalite'],
  },
  // --- Mineral gübreler ---
  {
    ad: 'DAP', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Diamonyum fosfat 18-46-0: azot %18 (amonyum), P₂O₅ %46.',
    url: 'https://www.igsas.com.tr/en/products/base-fertilizers/igsas-dap-diammonium-phosphate-18-46-0',
    kod: 'dap',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/taban-g%C3%BCbreleri/%C4%B0GSA%C5%9E-DAP-%C3%87UVAL.png',
    rol: 'Taban gübresi; fosfor + azot.',
    dozlar: [{ yol: 'taban', doz: '15–20 kg/da (ekimle, banda)' }],
    etiket: ['p', 'n'],
  },
  {
    ad: 'NPK 20.20.0+Zn', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Kükürt ve çinko kaplı kompoze: azot %20, P₂O₅ %20, SO₃ %12, çinko %1.',
    url: 'https://www.igsas.com.tr/en/products/base-fertilizers/igsas-20-20-012-so3zn-sulphur-coated-and-zinc-coated-compound',
    kod: '20-20-0-zn',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/taban-g%C3%BCbreleri/20.20.0+12SO3+ZN-KOMPOZE-%C3%87UVAL.png',
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
    icerik: 'Suda tam çözünür 12-40-12 + mikro element (EDTA şelatlı Fe, Mn, Zn, Cu; B, Mo).',
    url: 'https://www.igsas.com.tr/en/products/drip-rrigation-fertilizers/igsas-12-40-12me',
    kod: '12-40-12',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/damla-sulama-g%C3%BCbreleri/12-40-12+ME.png',
    rol: 'Fosfor ağırlıklı; kök ve başlangıç gelişimi (damla/yağmurlama).',
    dozlar: [{ yol: 'damla', doz: '3–4 kg/da' }],
    etiket: ['p', 'kok'],
  },
  {
    ad: 'NPK 18-18-18', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Suda tam çözünür 18-18-18 + mikro element.',
    url: 'https://www.igsas.com.tr/en/products/drip-rrigation-fertilizers/igsas-18-18-18me',
    kod: '18-18-18',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/damla-sulama-g%C3%BCbreleri/18-18-18-ME.png',
    rol: 'Dengeli; vejetatif gelişim.',
    dozlar: [{ yol: 'damla', doz: 'Z-karttaki doza göre' }],
    etiket: ['n', 'p', 'k'],
  },
  {
    ad: 'NPK 20-20-20+ME', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Suda tam çözünür 20-20-20 + mikro element.',
    url: 'https://www.igsas.com.tr/en/products/drip-rrigation-fertilizers/igsas-20-20-20me',
    kod: '20-20-20',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/damla-sulama-g%C3%BCbreleri/20-20-20-ME.png',
    rol: 'Dengeli + mikro element.',
    dozlar: [{ yol: 'damla', doz: 'Z-karttaki doza göre' }],
    etiket: ['n', 'p', 'k', 'mikro'],
  },
  {
    ad: 'NPK 7-7-40+ME', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Suda tam çözünür 7-7-40 + mikro element; potasyum ağırlıklı.',
    url: 'https://www.igsas.com.tr/en/products/drip-rrigation-fertilizers/igsas-7-7-40me',
    kod: '7-7-40',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/damla-sulama-g%C3%BCbreleri/igsas-7-7-40+ME.png',
    rol: 'Potasyum ağırlıklı; meyve dolumu.',
    dozlar: [{ yol: 'damla', doz: '3–5 kg/da' }],
    etiket: ['k', 'kalite'],
  },
  {
    ad: 'UAN-32', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Sıvı azot %32 (üre %16, amonyum %8, nitrat %8) + iz mikro element.',
    url: 'https://www.igsas.com.tr/en/products/liquid-fertilizers/igsas-uan-32',
    kod: 'uan-32',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/UAN-32.png',
    rol: 'Sıvı azot; baş gübre.',
    dozlar: [{ yol: 'damla', doz: '8–16 L/da (döneme göre)' }],
    etiket: ['n'],
  },
  {
    ad: 'AS 21', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Amonyum sülfat: amonyum azotu %21, kükürt yaklaşık %24.',
    url: 'https://www.igsas.com.tr/en/products/top-fertilizers/igsas-ammonium-sulfate-21-n',
    kod: 'as-21',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/%C3%BCst-g%C3%BCbreler/AMONYUM-S%C3%9CLFAT-21-%C3%87UVAL.png',
    rol: 'Amonyum sülfat; azot + kükürt, kireçli toprakta pH etkisi.',
    dozlar: [{ yol: 'toprak', doz: '15–20 kg/da' }],
    etiket: ['n', 's', 'kirec'],
  },
  {
    ad: 'KNO₃', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Potasyum nitrat 13-0-46: nitrat azotu %13, K₂O %46; suda tam çözünür (Kütahya üretimi).',
    url: 'https://www.igsas.com.tr/en/products/pure-fertilizers/potassium-nitrate',
    kod: 'potasyum-nitrat',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/potasyum-nitrat-yeni.png',
    rol: 'Potasyum nitrat; dolum ve irileşme.',
    dozlar: [
      { yol: 'damla', doz: '4–8 kg/da' },
      { yol: 'yaprak', doz: '400 g/da' },
    ],
    etiket: ['k', 'n', 'kalite'],
  },
  {
    ad: 'K₂SO₄', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Potasyum sülfat: K₂O %50, kükürt; klora hassas bitkiler için.',
    url: 'https://www.igsas.com.tr/en/products/pure-fertilizers/potassium-sulfate-50',
    kod: 'potasyum-sulfat',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/saf-g%C3%BCbreler/potasyum-sulfat.png',
    rol: 'Potasyum sülfat; potasyum + kükürt.',
    dozlar: [{ yol: 'damla', doz: 'Z-karttaki doza göre' }],
    etiket: ['k', 's'],
  },
  {
    ad: 'MKP', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Mono potasyum fosfat 0-52-34: P₂O₅ %52, K₂O %34; suda tam çözünür.',
    url: 'https://www.igsas.com.tr/en/products/pure-fertilizers/mono-potassium-phosphate',
    kod: 'mkp',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/saf-g%C3%BCbreler/mono-potasyum-fosfat-0-52-34.png',
    rol: 'Mono potasyum fosfat; çiçeklenme ve tutum.',
    dozlar: [{ yol: 'damla', doz: 'Z-karttaki doza göre' }],
    etiket: ['p', 'k', 'cicek'],
  },
  {
    ad: 'Mg NİTRAT', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Magnezyum nitrat: nitrat azotu %11, MgO %15; suda tam çözünür.',
    url: 'https://www.igsas.com.tr/en/products/pure-fertilizers/magnesium-nitrate',
    kod: 'magnezyum-nitrat',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/saf-g%C3%BCbreler/magnezyum-nitrat.png',
    rol: 'Magnezyum + azot.',
    dozlar: [{ yol: 'damla', doz: 'Z-karttaki doza göre' }],
    etiket: ['mg', 'n'],
  },
  {
    ad: 'FOSFORİK ASİT', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Fosforik asit: toplam P₂O₅ %61; damla hattı temizliği ve fosfor.',
    url: 'https://www.igsas.com.tr/en/products/acid-series/igsas-phosphoric-acid',
    kod: 'fosforik-asit',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/fosforikasitdekupe.png',
    rol: 'Fosfor + damla hattı temizliği, pH düşürme.',
    dozlar: [{ yol: 'damla', doz: 'Z-karttaki doza göre' }],
    etiket: ['p', 'hat-temizligi', 'kirec'],
  },
  {
    ad: 'NİTRİK ASİT', marka: 'İGSAŞ', grup: 'mineral',
    icerik: 'Nitrik asit %56; sulama suyu pH düzenleme ve hat temizliği.',
    url: 'https://www.igsas.com.tr/en/products/acid-series/igsas-nitric-acid',
    kod: 'nitrik-asit',
    gorsel: 'https://www.igsas.com.tr/uploads/new-products/56-HNO.png',
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

/** Ürün görseli: önce sitedeki kopya (public/urunler/<kod>.png), yoksa İGSAŞ'ın sitesindeki görsel, o da yoksa baş harfli yedek kutu */
export const urunGorselleri = (u: IgsasUrun) => [u.kod ? `/urunler/${u.kod}.png` : '', u.gorsel ?? ''].filter(Boolean);

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
