/**
 * Yaprak teşhisi: sorular, cevap tipleri ve besin → etken madde → İGSAŞ/KIANA ürün eşleştirmesi.
 * Ürünler yapay zekaya bırakılmaz; teşhis edilen besine göre burada, katalogdaki dozlarla seçilir.
 * Tanı yaklaşımı: Missouri Üniv. G9074 (tarladaki dağılım, yaprak konumu, belirti türü, zamanlama, hava ve uygulamalar, toprak analizi).
 */
import { URUNLER, type Urun } from './igsas';

export const DONEMLER = ['Fide / çıkış', 'Büyüme (yapraklanma, sürgün)', 'Çiçeklenme', 'Meyve / tane / yumru dolumu', 'Olgunlaşma, hasada yakın'] as const;
export const KONUMLAR = ['Alt (yaşlı) yapraklarda', 'Üst (genç) yapraklarda', 'Bütün bitkide', 'Meyvede / yumruda', 'Emin değilim'] as const;
export const BELIRTILER = [
  'Sararma (bütün yaprak)',
  'Damarlar arası sararma, damarlar yeşil',
  'Uçta / kenarda yanıklık',
  'Kahverengi / siyah lekeler',
  'Mor / kırmızı renk',
  'Beyazlaşma, solukluk',
  'Kıvrılma, şekil bozukluğu',
  'Pas / toz gibi kabarcıklar, küf',
  'Solma',
  'Delik, böcek, ağ',
] as const;
export const DAGILIMLAR = ['Tek tük bitkide', 'Yer yer, kümeler halinde', 'Bütün tarlada', 'Sıra ya da sulama hattı boyunca', 'Tarla kenarında'] as const;
export const OLAYLAR = ['Soğuk / don', 'Aşırı sıcak', 'Çok yağmur ya da fazla sulama', 'Kuraklık, susuz kaldı', 'İlaçlama yapıldı', 'Gübre verildi', 'Hiçbiri'] as const;

export type TeshisCevaplari = {
  bitki: string;
  donem?: string;
  konum?: string;
  belirtiler: string[];
  dagilim?: string;
  olaylar: string[];
  baslangic?: string; // ne zamandır
  not?: string;
  tarlaId?: string;
};

export type Besin = 'N' | 'P' | 'K' | 'Mg' | 'Ca' | 'S' | 'Fe' | 'Zn' | 'Mn' | 'B' | 'Cu';
export type TeshisTuru = 'besin' | 'hastalik' | 'zararli' | 'abiyotik' | 'saglikli';

export type Olasilik = { ad: string; tur: TeshisTuru; besin: Besin | null; yuzde: number; neden: string };
export type TeshisSonucu = {
  gorselUygun: boolean;
  gorselNotu: string | null;
  gorulenBitki: string | null;
  ozet: string;
  guven: 'yüksek' | 'orta' | 'düşük';
  olasiliklar: Olasilik[];
  ipuclari: string[]; // fotoğrafta ve cevaplarda dayandığı gözlemler
  kontrol: string[]; // emin olmak için
  yapilacaklar: string[];
};

/** Besin → etken madde ve katalog ürünleri (sıra önemli: ilk ürün öne çıkar) */
export const BESIN_COZUM: Record<Besin, { ad: string; etkenMadde: string; urunler: string[]; not?: string }> = {
  N: { ad: 'Azot', etkenMadde: 'Azot (amonyum sülfat, üre, amonyum nitrat; hızlı destek için yapraktan amino asit)', urunler: ['UAN-32', 'AS 21', 'NPK 20-20-20+ME', 'AMİNO ASİT'] },
  P: { ad: 'Fosfor', etkenMadde: 'Fosfor (monoamonyum fosfat, mono potasyum fosfat)', urunler: ['NPK 12-40-12', 'MKP', 'DAP'], not: 'Soğuk ve ıslak toprakta görülen geçici fosfor noksanlığı hava ısınınca kendiliğinden geçebilir.' },
  K: { ad: 'Potasyum', etkenMadde: 'Potasyum (potasyum sülfat, potasyum nitrat)', urunler: ['ENLARGE POTASH', 'KNO₃', 'K₂SO₄', 'NPK 7-7-40+ME'] },
  Mg: { ad: 'Magnezyum', etkenMadde: 'Magnezyum (magnezyum sülfat, magnezyum nitrat)', urunler: ['MAGNEZYUM', 'Mg NİTRAT'] },
  Ca: { ad: 'Kalsiyum', etkenMadde: 'Kalsiyum (kalsiyum nitrat; bor ile birlikte)', urunler: ['N-CALBOR'], not: 'Kalsiyum noksanlığı çoğu zaman topraktaki azlıktan değil düzensiz sulamadan olur; sulamayı düzenli yapın.' },
  S: { ad: 'Kükürt', etkenMadde: 'Kükürt (amonyum sülfat, potasyum sülfat)', urunler: ['AS 21', 'K-S', 'K₂SO₄'] },
  Fe: { ad: 'Demir', etkenMadde: 'Şelatlı demir (Fe-EDDHA kireçli toprakta en etkilisi; yapraktan Fe-EDTA)', urunler: ['DEMİR ŞELAT'], not: 'Kireçli, yüksek pH’lı ve fazla sulanan topraklarda demir topraktan alınamaz; fazla sulamadan kaçının.' },
  Zn: { ad: 'Çinko', etkenMadde: 'Çinko (EDTA-çinko, çinko sülfat)', urunler: ['EDTA Zn-Mn', 'NPK 20.20.0+Zn', 'KOMBİ'] },
  Mn: { ad: 'Mangan', etkenMadde: 'Mangan (EDTA-mangan, mangan sülfat)', urunler: ['EDTA Zn-Mn', 'KOMBİ'] },
  B: { ad: 'Bor', etkenMadde: 'Bor (borik asit, sodyum bor)', urunler: ['N-CALBOR', 'FLOWER GOLD'], not: 'Bor fazlası da zehirler; dozu aşmayın.' },
  Cu: { ad: 'Bakır', etkenMadde: 'Bakır (bakır sülfat ya da şelatlı bakır)', urunler: ['KOMBİ'] },
};

/** Besin dışı durumlar için destek ürünleri */
export const TUR_DESTEK: Partial<Record<TeshisTuru, { etkenMadde: string; urunler: string[]; not: string }>> = {
  abiyotik: {
    etkenMadde: 'Stres tamponu ve toparlayıcı (biyostimülan, amino asit)',
    urunler: ['KIANA CLIMATE PLUS', 'AMİNO ASİT'],
    not: 'Don, sıcak, kuraklık gibi stres beklentisinden 5–10 gün önce KIANA CLIMATE PLUS; stresten sonra toparlanma için amino asit.',
  },
  hastalik: {
    etkenMadde: 'Hastalık için ruhsatlı bir bitki koruma ürünü gerekir (gübre hastalığı tedavi etmez)',
    urunler: ['AMİNO ASİT'],
    not: 'İGSAŞ ve KIANA ürünleri bitki besleme ürünüdür, hastalığı tedavi etmez. Fotoğrafı ilaç bayiinize ya da ziraat mühendisine gösterin, bitkinizde ruhsatlı ilacı etiketindeki dozla kullanın. İlaçlamadan sonra toparlanma için amino asit verilebilir.',
  },
  zararli: {
    etkenMadde: 'Zararlı için ruhsatlı bir bitki koruma ürünü gerekir',
    urunler: [],
    not: 'Gübre zararlıyı uzaklaştırmaz. Yaprağın altını büyüteçle kontrol edin; ilaç bayiinize örnek götürün ve ruhsatlı ilacı etiketine göre kullanın.',
  },
};

export function cozumUrunleri(adlar: string[]): Urun[] {
  return adlar.map((a) => URUNLER.find((u) => u.ad === a)).filter((u): u is Urun => !!u);
}

export const TUR_AD: Record<TeshisTuru, string> = {
  besin: 'Besin noksanlığı',
  hastalik: 'Hastalık',
  zararli: 'Zararlı',
  abiyotik: 'Çevre / stres kaynaklı',
  saglikli: 'Sağlıklı görünüyor',
};
