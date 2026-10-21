/**
 * İGSAŞ / KIANA ürün kataloğu, organik madde protokolü ve bitki eşleştirme.
 *
 * Kaynaklar:
 *  - "İGSAŞ Azərbaycan · dönem dönem infografik seti" (Prof. Dr. Metin Turan) – Z-kartlar ve
 *    "İGSAŞ Biyolojik ve Organik Destek" kutuları
 *  - Proje notları (organik madde düşük topraklar için damla sulama protokolü)
 *
 * Ürünlerin "rol" açıklamaları, Z-kartlarda hangi dönemlerde kullanıldıklarından çıkarılmıştır.
 */
import { ZKARTLAR, type ZKart } from './zkartlar';

export type Urun = {
  ad: string;
  grup: 'biyolojik' | 'organik' | 'yaprak' | 'mineral';
  rol: string; // Ne işe yarar (kısa)
  doz: string; // Genel kullanım dozu (dekar başına)
};

export const URUNLER: Urun[] = [
  // --- İGSAŞ biyolojik ve organik destek (KIANA serisi) ---
  { ad: 'KIANA EARTH PLUS', grup: 'biyolojik', rol: 'Kök bölgesi mikrobiyal konsorsiyumu; kök gelişimini ve besin alımını artırır.', doz: 'Toprak/damla 200 g/da · ağaçta 1 kg/da · tohum ilacı olarak 100 g/100 kg tohum' },
  { ad: 'KIANA CLIMATE PLUS', grup: 'biyolojik', rol: 'Don, sıcak ve kuraklık stresine karşı bitkiyi korur (stres tamponu).', doz: 'Yapraktan 200–300 g/da; stresten 5–10 gün ÖNCE' },
  { ad: 'KIANA SOIL SOUL', grup: 'biyolojik', rol: 'Selüloz bazlı hidrojel; kök bölgesinde su ve besin deposu oluşturur.', doz: 'Toprağa 1–3 kg/da' },
  { ad: 'CORENZA', grup: 'biyolojik', rol: 'Enzim bazlı temas ürünü; kalıntı bırakmaz.', doz: '250–300 cc/100 L su' },
  // --- Organik madde protokolü (damla sulama) ---
  { ad: 'HÜMİK ASİT', grup: 'organik', rol: 'Organik madde eksikliğini telafi eder; toprak yapısını ve besin tutmayı iyileştirir.', doz: 'Damla sulama ile toplam 10–15 L/da (duruma göre, bölünerek)' },
  { ad: 'AMİNO ASİT', grup: 'organik', rol: 'Kök ve sürgün gelişimini hızlandırır, stresten sonra toparlanmayı destekler.', doz: 'Damla ile toplam 6–10 L/da · yapraktan 250–300 cc/da' },
  { ad: 'LEONARDİT GRANÜL', grup: 'organik', rol: 'Uzun etkili hümik kaynak; tohum yatağında organik maddeyi yükseltir.', doz: 'Tohum yatağına 300–400 kg/da' },
  { ad: 'BİYOGAZ ÇIKTISI GRANÜL (ODA GRANÜL)', grup: 'organik', rol: 'Fermente organik materyal; toprağın organik madde ve mikrobiyal canlılığını artırır.', doz: '400–500 kg/da' },
  { ad: 'MOL-50', grup: 'organik', rol: 'Kökte besin alımını destekler (İGSAŞ MOL – kök besin alımı noktasında çalışır).', doz: 'Damla 1–1,5 L/da' },
  // --- Yaprak ve özel ürünler ---
  { ad: 'N-CALBOR', grup: 'yaprak', rol: 'Azot + kalsiyum + bor; çiçek/meyve tutumu ve hücre duvarı (kabuk) dayanımı.', doz: 'Yapraktan 250–300 cc/da' },
  { ad: 'FLOWER GOLD', grup: 'yaprak', rol: 'Çiçeklenme ve döllenme döneminde tutumu destekler.', doz: 'Yapraktan 200 cc/da' },
  { ad: 'COLORFUL', grup: 'yaprak', rol: 'Renklenme ve olgunlaşmayı destekler.', doz: 'Yapraktan 300 cc/da' },
  { ad: 'ENLARGE POTASH', grup: 'yaprak', rol: 'Potasyum kaynağı; meyve, tane ve yumru irileşmesi.', doz: 'Yapraktan 1–2 L/da' },
  { ad: 'KOMBİ', grup: 'yaprak', rol: 'Mikro element kombinasyonu.', doz: 'Yapraktan 150 g/da' },
  { ad: 'MAGNEZYUM', grup: 'yaprak', rol: 'Klorofil ve dolum için magnezyum.', doz: 'Yapraktan 300 g/da' },
  { ad: 'EDTA Zn-Mn', grup: 'yaprak', rol: 'Çinko ve mangan; özellikle kireçli ve alkali topraklarda.', doz: 'Yapraktan 200–250 cc/da' },
  { ad: 'DEMİR ŞELAT', grup: 'yaprak', rol: 'Demir eksikliği (yaprak sararması) için.', doz: 'Z-karttaki doza göre' },
  { ad: 'K-S', grup: 'yaprak', rol: 'Potasyum + kükürt; dolum ve kalite.', doz: 'Yapraktan 400–500 g/da' },
  // --- Mineral gübreler ---
  { ad: 'DAP', grup: 'mineral', rol: 'Taban gübresi; fosfor + azot.', doz: '15–20 kg/da (ekimle, banda)' },
  { ad: 'NPK 20.20.0+Zn', grup: 'mineral', rol: 'Taban gübresi; azot + fosfor + çinko.', doz: '20–25 kg/da' },
  { ad: 'NPK 15-30-15+Zn', grup: 'mineral', rol: 'Taban gübresi; fosfor ağırlıklı + çinko.', doz: 'Z-karttaki doza göre' },
  { ad: 'NPK 12-40-12', grup: 'mineral', rol: 'Fosfor ağırlıklı; kök ve başlangıç gelişimi (damla/yağmurlama).', doz: '3–4 kg/da' },
  { ad: 'NPK 18-18-18', grup: 'mineral', rol: 'Dengeli; vejetatif gelişim.', doz: 'Z-karttaki doza göre' },
  { ad: 'NPK 20-20-20+ME', grup: 'mineral', rol: 'Dengeli + mikro element.', doz: 'Z-karttaki doza göre' },
  { ad: 'NPK 7-7-40+ME', grup: 'mineral', rol: 'Potasyum ağırlıklı; meyve dolumu.', doz: '3–5 kg/da' },
  { ad: 'UAN-32', grup: 'mineral', rol: 'Sıvı azot; baş gübre.', doz: '8–16 L/da (döneme göre)' },
  { ad: 'AS 21', grup: 'mineral', rol: 'Amonyum sülfat; azot + kükürt, kireçli toprakta pH etkisi.', doz: '15–20 kg/da' },
  { ad: 'KNO₃', grup: 'mineral', rol: 'Potasyum nitrat; dolum ve irileşme.', doz: '4–8 kg/da (damla) · 400 g/da (yaprak)' },
  { ad: 'K₂SO₄', grup: 'mineral', rol: 'Potasyum sülfat; potasyum + kükürt.', doz: 'Z-karttaki doza göre' },
  { ad: 'MKP', grup: 'mineral', rol: 'Mono potasyum fosfat; çiçeklenme ve tutum.', doz: 'Z-karttaki doza göre' },
  { ad: 'Mg NİTRAT', grup: 'mineral', rol: 'Magnezyum + azot.', doz: 'Z-karttaki doza göre' },
  { ad: 'FOSFORİK ASİT', grup: 'mineral', rol: 'Fosfor + damla hattı temizliği, pH düşürme.', doz: 'Z-karttaki doza göre' },
  { ad: 'NİTRİK ASİT', grup: 'mineral', rol: 'Azot + sulama suyu pH düzenleme.', doz: 'Z-karttaki doza göre' },
];

export const URUN_ADLARI = URUNLER.map((u) => u.ad);

/**
 * Organik madde düşük topraklar için uygulama protokolü (proje notları).
 * Ahır gübresi / kompost önerilmez.
 */
export const ORGANIK_MADDE_PROTOKOLU: { urun: string; doz: string; uygulama: string }[] = [
  { urun: 'LEONARDİT GRANÜL', doz: '300–400 kg/da', uygulama: 'Ekim/dikim öncesi tohum yatağına' },
  { urun: 'BİYOGAZ ÇIKTISI GRANÜL (ODA GRANÜL)', doz: '400–500 kg/da', uygulama: 'Toprak hazırlığında, toprağa karıştırarak' },
  { urun: 'HÜMİK ASİT', doz: 'Toplam 10–15 L/da', uygulama: 'Damla sulama ile, sezon boyunca bölünerek' },
  { urun: 'AMİNO ASİT', doz: 'Toplam 6–10 L/da', uygulama: 'Damla sulama ile, kritik gelişme dönemlerinde' },
  { urun: 'KIANA SOIL SOUL', doz: '1–2 kg/da', uygulama: 'Kök bölgesine, toprak hazırlığında' },
];

/** Kullanıcının yazdığı bitki adını Z-kart bitkisiyle eşleştirir. */
const norm = (s: string) =>
  s
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
    .replace(/[^a-z ]/g, ' ')
    .trim();

const ESANLAMLI: Record<string, string> = {
  bugday: 'Buğday', arpa: 'Arpa', susam: 'Susam', aycicegi: 'Ayçiçeği', misir: 'Mısır (dane)',
  celtik: 'Çeltik (pirinç)', pirinc: 'Çeltik (pirinç)', pamuk: 'Pamuk', seker: 'Şeker pancarı', pancar: 'Şeker pancarı',
  tutun: 'Tütün', nar: 'Nar', uzum: 'Üzüm (bağ)', bag: 'Üzüm (bağ)', elma: 'Elma', seftali: 'Şeftali / nektarin',
  nektarin: 'Şeftali / nektarin', kayisi: 'Kayısı', findik: 'Fındık', narenciye: 'Narenciye (mandalina)',
  mandalina: 'Narenciye (mandalina)', portakal: 'Narenciye (mandalina)', limon: 'Narenciye (mandalina)',
  incir: 'İncir', zeytin: 'Zeytin', patates: 'Patates', domates: 'Domates', salatalik: 'Salatalık', hiyar: 'Salatalık',
  sogan: 'Soğan', cay: 'Çay',
};

export function zkartBul(bitki?: string): ZKart | undefined {
  if (!bitki) return undefined;
  const words = norm(bitki).split(/\s+/);
  for (const w of words) {
    const hit = ESANLAMLI[w];
    if (hit) return ZKARTLAR.find((z) => z.bitki === hit);
  }
  return undefined;
}

export const ZKART_BITKILERI = ZKARTLAR.map((z) => z.bitki);

export { ZKARTLAR };
