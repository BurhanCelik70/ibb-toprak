/**
 * Bitki besin noksanlıkları kataloğu.
 * Her kartın resmi: public/noksanlik/<id>.webp
 * Dayanak: Nebraska Üniv. CropWatch mısır-sorgum noksanlık anahtarı; BBRO (İngiltere) şeker pancarı beslenme rehberi;
 * Batı Avustralya Tarım Bak. buğdayda çinko noksanlığı tanısı; Borax ve Mississippi Eyalet Üniv. bor rehberleri;
 * Çakmak ve ark. İç Anadolu çinko çalışmaları. Belirtiler başka sorunlara (hastalık, ilaç yanığı, kuraklık) benzeyebilir;
 * kesin tanı için yaprak (bitki) analizi önerilir.
 */
import type { ParamKey } from './toprak';
import { zkartBul } from './igsas';

export type Noksanlik = {
  id: string;
  bitki: string; // Z-kart bitki adı (Keten Z-kartta yok)
  besin: string; // Azot, Fosfor …
  sembol: string; // N, P, K …
  /** Toprak analizindeki karşılığı (raporda bu değer düşükse kart gösterilir) */
  anahtar?: ParamKey;
  /** Belirti önce hangi yaprakta */
  yaprak: 'yaşlı' | 'genç' | 'meyve' | 'yumru' | 'tabla';
  kisa: string;
  belirtiler: string[];
  neden: string;
  cozum: string[];
  karisir?: string;
};

export const BITKI_SIRASI = [
  'Mısır (dane)',
  'Buğday',
  'Arpa',
  'Şeker pancarı',
  'Ayçiçeği',
  'Pamuk',
  'Keten',
  'Patates',
  'Domates',
  'Elma',
  'Üzüm (bağ)',
] as const;

export const BITKI_KISA: Record<string, string> = {
  'Mısır (dane)': 'Mısır',
  'Üzüm (bağ)': 'Üzüm (bağ)',
};

/** Besin → renk (kart etiketleri) */
export const BESIN_RENK: Record<string, string> = {
  N: '#2f7d4f',
  P: '#7b4fa3',
  K: '#b5651d',
  Mg: '#4f8a3a',
  S: '#c9a227',
  Ca: '#6b7b8c',
  Fe: '#a0442c',
  Zn: '#3b6ea5',
  Mn: '#8a5a44',
  B: '#c0567a',
};

// Ortak çözüm cümleleri
const ZN_YAPRAK = 'Yapraktan %0,5 çinko sülfat (100 litre suya 500 g) veya şelatlı çinko; 10–15 gün arayla 2 kez, akşamüstü ya da sabah serinde.';
const ZN_TOPRAK = 'Ekimden önce toprağa çinko sülfat ya da çinkolu taban gübresi verin; kireçli topraklarda etkisi birkaç yıl sürer.';
const FE_YAPRAK = 'Yapraktan şelatlı demir (Fe-EDTA / Fe-DTPA) veya %0,5 demir sülfat; 7–10 gün arayla 2–3 kez.';
const MG_YAPRAK = 'Yapraktan %2 magnezyum sülfat (100 litre suya 2 kg); 10–14 gün arayla 2–3 kez.';
const B_YAPRAK = 'Yapraktan bor (100 litre suya 100–200 g sodyum bor / borik asit ürünü); çiçeklenmeden önce ve çiçeklenme başında.';
const MN_YAPRAK = 'Yapraktan %0,5 mangan sülfat veya şelatlı mangan; belirti görülür görülmez, gerekirse 10 gün sonra tekrar.';
const K_TOPRAK = 'Potasyum sülfat veya potasyum nitrat ile potasyumu tamamlayın; damlada gübreli sularla bölerek verin.';
const N_UST = 'Üst gübre (üre, amonyum nitrat, amonyum sülfat) verin; miktar raporunuzdaki gübre planında. Damlada gübreli sularla bölerek verin.';
const P_TABAN = 'Ekimde taban gübresiyle (DAP, MAP, 20-20-0) fosforu tohumun yakınına verin; erken dönemde yapraktan MAP desteği yapılabilir.';

export const NOKSANLIKLAR: Noksanlik[] = [
  // ───────── MISIR ─────────
  {
    id: 'misir-n', bitki: 'Mısır (dane)', besin: 'Azot', sembol: 'N', anahtar: 'azot', yaprak: 'yaşlı',
    kisa: 'Alt yapraklarda uçtan orta damar boyunca V şeklinde sararma.',
    belirtiler: ['Sararma alt (yaşlı) yapraklarda başlar.', 'Yaprak ucundan başlayıp orta damar boyunca V şeklinde ilerler.', 'Bitki genel olarak açık yeşil ve cılızdır; koçan küçük, uç kısmı boş kalır.'],
    neden: 'Organik maddesi düşük, kumlu topraklarda; aşırı yağış ya da sulamayla azotun yıkanmasında; üst gübrenin geç kalmasında.',
    cozum: [N_UST, 'Mısırın en çok azot istediği dönem 6–8 yapraktan tepe püskülüne kadardır; üst gübreyi bu döneme yetiştirin.'],
    karisir: 'Potasyumda sararma yaprak kenarından başlar, azotta ise orta damardan.',
  },
  {
    id: 'misir-p', bitki: 'Mısır (dane)', besin: 'Fosfor', sembol: 'P', anahtar: 'fosfor', yaprak: 'yaşlı',
    kisa: 'Genç bitkide alt yaprak uç ve kenarlarında mor-kırmızı renk.',
    belirtiler: ['Genç bitkilerde (2–6 yaprak) alt yapraklarda mor-kırmızı renk, özellikle uç ve kenarlarda.', 'Bitki koyu yeşil ama bodur kalır, gelişme yavaşlar.', 'Koçanlar küçük ve çarpık olabilir.'],
    neden: 'Soğuk ve ıslak ilkbaharda kök fosforu alamaz; kireçli topraklarda fosfor tutulur. Hava ısınınca belirti çoğu zaman kaybolur.',
    cozum: [P_TABAN, 'Belirti hava ısınınca geçiyorsa ek gübre gerekmeyebilir; toprak analizinde fosfor düşükse gelecek yıl taban gübresini artırın.'],
    karisir: 'Bazı çeşitler doğal olarak mor renklidir; o renk tüm bitkidedir, yalnız alt yapraklarda değil.',
  },
  {
    id: 'misir-k', bitki: 'Mısır (dane)', besin: 'Potasyum', sembol: 'K', anahtar: 'potasyum', yaprak: 'yaşlı',
    kisa: 'Alt yaprak kenarlarında sararma ve kahverengi yanıklık.',
    belirtiler: ['Alt yapraklarda kenardan ve uçtan başlayan sararma, sonra kahverengi kuruma (yanık görünüm).', 'Orta damar yeşil kalır.', 'Saplar zayıflar, hasada doğru yatma artar; koçan ucu dolmaz.'],
    neden: 'Kumlu ya da çok killi topraklarda, kuraklıkta, toprak sıkışmasında; yüksek kireç ve magnezyum potasyum alımını azaltır.',
    cozum: [K_TOPRAK, 'Yapraktan %1–2 potasyum nitrat ile kısa süreli destek verilebilir.'],
    karisir: 'Azotta sararma orta damardan V şeklinde ilerler, potasyumda kenardan.',
  },
  {
    id: 'misir-zn', bitki: 'Mısır (dane)', besin: 'Çinko', sembol: 'Zn', anahtar: 'cinko', yaprak: 'genç',
    kisa: 'Genç yapraklarda orta damarın iki yanında beyaz-sarı geniş bantlar.',
    belirtiler: ['Üst (genç) yapraklarda, yaprağın alt yarısında orta damarın iki yanında beyaz ya da açık sarı geniş bantlar.', 'Orta damar ve yaprak kenarları yeşil kalır.', 'Boğum araları kısalır, bitki bodur ve rozet görünümlü olur; ileride bantlar gri-kahverengi kurur.'],
    neden: 'Türkiye\'nin kireçli, yüksek pH\'lı, organik maddesi düşük topraklarında çok yaygındır; fazla fosforlu gübre çinko alımını azaltır.',
    cozum: [ZN_TOPRAK, ZN_YAPRAK],
    karisir: 'Demirde sararma yaprağın boydan boya tamamında ince çizgiler hâlindedir; çinkoda ise yaprağın alt yarısında geniş bant.',
  },
  {
    id: 'misir-fe', bitki: 'Mısır (dane)', besin: 'Demir', sembol: 'Fe', anahtar: 'demir', yaprak: 'genç',
    kisa: 'En üst yapraklarda boydan boya damarlar arası sararma.',
    belirtiler: ['En genç yapraklarda damarlar arası sararma; damarlar yeşil çizgiler gibi belirgindir.', 'Sararma yaprağın boydan boya tamamındadır.', 'Ağır durumda yaprak beyazlaşır ve kurur.'],
    neden: 'Kireçli, yüksek pH\'lı, fazla sulanmış ya da sıkışmış topraklarda demir topraktan alınamaz (kireç klorozu).',
    cozum: [FE_YAPRAK, 'Fazla sulamadan ve toprak sıkışmasından kaçının; organik madde (yanmış gübre, kompost) demir alımını kolaylaştırır.'],
    karisir: 'Magnezyumda benzer çizgiler alt (yaşlı) yapraklarda görülür, demirde üst (genç) yapraklarda.',
  },
  {
    id: 'misir-mg', bitki: 'Mısır (dane)', besin: 'Magnezyum', sembol: 'Mg', yaprak: 'yaşlı',
    kisa: 'Alt yapraklarda damarlar arasında sarı çizgiler.',
    belirtiler: ['Alt (yaşlı) yapraklarda damarlar arasında sarı çizgiler, damarlar yeşil kalır (boncuk dizisi görünümü).', 'Sonra çizgiler kızıl-kahverengiye döner.', 'Belirti yukarı doğru ilerler.'],
    neden: 'Kumlu, asidik topraklarda; fazla potasyumlu gübrelemede; soğuk ve ıslak dönemlerde.',
    cozum: [MG_YAPRAK, 'Toprağa magnezyumlu gübre (magnezyum sülfat) ekleyin; potasyumu aşırı vermeyin.'],
  },

  // ───────── BUĞDAY ─────────
  {
    id: 'bugday-n', bitki: 'Buğday', besin: 'Azot', sembol: 'N', anahtar: 'azot', yaprak: 'yaşlı',
    kisa: 'Alt yapraklar uçtan sararır, tarla açık yeşil görünür.',
    belirtiler: ['Yaşlı yapraklar uçtan başlayarak sararır, sonra kurur.', 'Tarlanın tamamı açık yeşil-sarımsı görünür.', 'Kardeşlenme azdır, başaklar küçük kalır.'],
    neden: 'Kış yağışlarıyla azot yıkandığında; organik maddesi düşük topraklarda; ilkbahar üst gübresi geç ya da eksik verildiğinde.',
    cozum: [N_UST, 'Kardeşlenme ve sapa kalkma başında üst gübreyi ikiye bölerek verin.'],
  },
  {
    id: 'bugday-p', bitki: 'Buğday', besin: 'Fosfor', sembol: 'P', anahtar: 'fosfor', yaprak: 'yaşlı',
    kisa: 'Koyu yeşil, bodur bitki; yaprak uçlarında mor renk.',
    belirtiler: ['Bitki koyu, mat yeşil ve bodurdur.', 'Yaşlı yaprakların uçlarında mor-kırmızı renk.', 'Kardeş sayısı az, olgunlaşma gecikir.'],
    neden: 'Kireçli topraklarda fosfor tutulur; soğuk toprakta kök fosforu alamaz; taban gübresi verilmediğinde.',
    cozum: [P_TABAN],
  },
  {
    id: 'bugday-k', bitki: 'Buğday', besin: 'Potasyum', sembol: 'K', anahtar: 'potasyum', yaprak: 'yaşlı',
    kisa: 'Yaşlı yaprak uç ve kenarlarında sararma, sonra kahverengi kuruma.',
    belirtiler: ['Yaşlı yaprakların uç ve kenarlarında sararma, sonra kahverengi kuruma.', 'Saplar zayıf, yatma artar.', 'Taneler cılız kalır.'],
    neden: 'Kumlu, hafif topraklarda; kuraklıkta. Türkiye topraklarında potasyum genelde yeterlidir, noksanlığı daha seyrektir.',
    cozum: [K_TOPRAK],
  },
  {
    id: 'bugday-zn', bitki: 'Buğday', besin: 'Çinko', sembol: 'Zn', anahtar: 'cinko', yaprak: 'genç',
    kisa: 'Yaprak ortasında gri-kahverengi ölü lekeler; yaprak ortadan kırılıp sarkar.',
    belirtiler: ['Orta yaşlı yaprakların ortasında sarımsı-beyaz, sonra gri-kahverengi ölü lekeler ve şeritler.', 'Yaprak ölü kısımdan kırılıp ortadan sarkar.', 'Bitkiler bodur, tarlada yer yer cılız alanlar oluşur; olgunlaşma gecikir.'],
    neden: 'İç Anadolu\'da (özellikle Konya) en yaygın besin sorunudur: kireçli, yüksek pH\'lı, organik maddesi düşük topraklarda buğday çinkoyu alamaz.',
    cozum: [ZN_TOPRAK + ' Konya denemelerinde çinkolu gübreleme verimi belirgin artırmıştır.', ZN_YAPRAK + ' Başaklanma döneminde yapılan yaprak uygulaması tanede çinkoyu da artırır.'],
    karisir: 'Mantar hastalıklarının (septorya, pas) lekelerinden farkı: çinko lekeleri yaprağın ortasında toplanır ve yaprağı ortadan kırar.',
  },
  {
    id: 'bugday-s', bitki: 'Buğday', besin: 'Kükürt', sembol: 'S', yaprak: 'genç',
    kisa: 'Genç yapraklar tümüyle açık sarı; yaşlı yapraklar daha yeşil.',
    belirtiler: ['Genç yapraklar baştan sona düzgün açık sarı renktedir.', 'Yaşlı yapraklar daha yeşil kalır (azotta tersidir).', 'Bitki ince ve dik görünür.'],
    neden: 'Kumlu, organik maddesi düşük topraklarda; kükürtsüz gübreler (üre, DAP) kullanıldığında.',
    cozum: ['Üst gübrenin bir kısmını amonyum sülfat olarak verin veya kükürtlü taban gübresi kullanın.'],
    karisir: 'Azotta sararma yaşlı yapraklardan başlar, kükürtte genç yapraklardan.',
  },

  // ───────── ARPA ─────────
  {
    id: 'arpa-n', bitki: 'Arpa', besin: 'Azot', sembol: 'N', anahtar: 'azot', yaprak: 'yaşlı',
    kisa: 'Alt yapraklar uçtan sararır, tarla soluk görünür.',
    belirtiler: ['Yaşlı yapraklar uçtan sararıp kurur.', 'Bitkiler açık yeşil, kardeşlenme zayıf.', 'Başaklar kısa, tane sayısı az.'],
    neden: 'Kış yağışlarıyla yıkanma, organik maddesi düşük toprak, eksik üst gübre.',
    cozum: [N_UST, 'Arpada fazla azot yatmaya yol açar; üst gübreyi kardeşlenme başında verin.'],
  },
  {
    id: 'arpa-p', bitki: 'Arpa', besin: 'Fosfor', sembol: 'P', anahtar: 'fosfor', yaprak: 'yaşlı',
    kisa: 'Koyu yeşil-morumsu, bodur bitki.',
    belirtiler: ['Bitki koyu yeşil, yaprak uçları morumsu.', 'Gelişme yavaş, kardeş az.', 'Kök gelişimi zayıf.'],
    neden: 'Kireçli ve soğuk topraklarda fosfor alınamaz; taban gübresi eksik.',
    cozum: [P_TABAN],
  },
  {
    id: 'arpa-zn', bitki: 'Arpa', besin: 'Çinko', sembol: 'Zn', anahtar: 'cinko', yaprak: 'genç',
    kisa: 'Yapraklarda açık renkli şeritler ve kahverengi ölü lekeler.',
    belirtiler: ['Genç-orta yapraklarda damar boyunca açık sarı-beyaz şeritler.', 'Şeritler kahverengi ölü lekelere döner, yaprak sarkar.', 'Bitki bodur, tarlada yer yer cılız alanlar.'],
    neden: 'Kireçli, yüksek pH\'lı İç Anadolu topraklarında yaygındır; arpa buğdaydan biraz daha dayanıklıdır.',
    cozum: [ZN_TOPRAK, ZN_YAPRAK],
  },
  {
    id: 'arpa-mn', bitki: 'Arpa', besin: 'Mangan', sembol: 'Mn', anahtar: 'mangan', yaprak: 'genç',
    kisa: 'Genç yapraklarda damarlar arası soluk çizgiler ve kahverengi benekler.',
    belirtiler: ['Genç ve orta yapraklarda damarlar arasında soluk yeşil-sarı çizgiler.', 'Üzerinde küçük gri-kahverengi benekler.', 'Yapraklar gevşek, sarkık; bitki soluk görünür.'],
    neden: 'Kireçli, yüksek pH\'lı, gevşek (iyi bastırılmamış) ve kuru topraklarda; organik maddesi yüksek topraklarda.',
    cozum: [MN_YAPRAK, 'Ekimden sonra toprağı merdaneyle bastırmak kök-toprak temasını artırır.'],
  },

  // ───────── ŞEKER PANCARI ─────────
  {
    id: 'pancar-n', bitki: 'Şeker pancarı', besin: 'Azot', sembol: 'N', anahtar: 'azot', yaprak: 'yaşlı',
    kisa: 'Dış yapraklar soluk sarı, bitki küçük.',
    belirtiler: ['Dış (yaşlı) yapraklar tümüyle açık yeşil-sarıya döner, sonra solup kurur.', 'Yaprak örtüsü seyrek ve küçüktür.', 'Ağır durumda yaprak sapları uzar, yapraklar dik durur.'],
    neden: 'Hafif topraklarda, aşırı yağışta, organik gübre verilmediğinde.',
    cozum: [N_UST, 'Pancarda geç ve fazla azot şeker oranını düşürür; azotun çoğunu Haziran sonuna kadar verin.'],
  },
  {
    id: 'pancar-k', bitki: 'Şeker pancarı', besin: 'Potasyum', sembol: 'K', anahtar: 'potasyum', yaprak: 'yaşlı',
    kisa: 'Yaşlı yaprak kenarlarında sararma, sonra kızıl-kahverengi kuruma.',
    belirtiler: ['Yaşlı yapraklar mat, zeytin yeşili görünür.', 'Kenarlardan başlayan sarı alanlar kızıl-kahverengiye döner.', 'Yaprak kenarları hafifçe kıvrılır.'],
    neden: 'Kumlu ve hafif topraklarda; kuraklıkta.',
    cozum: [K_TOPRAK],
  },
  {
    id: 'pancar-mg', bitki: 'Şeker pancarı', besin: 'Magnezyum', sembol: 'Mg', yaprak: 'yaşlı',
    kisa: 'Yaşlı yapraklarda kenardan içe doğru sararma, kenarlar kararır.',
    belirtiler: ['Yaşlı yapraklarda sararma kenardan başlayıp damarlar arasında içe doğru ilerler.', 'Yaprak kenarı kararıp dağılır.', 'Virüs sarılığına benzer ama yapraklar kalınlaşıp gevrekleşmez.'],
    neden: 'Kumlu, asidik topraklarda; fazla potasyum ya da fosforlu gübrede; kuraklıkta.',
    cozum: [MG_YAPRAK],
    karisir: 'Virüs sarılığında yapraklar kalınlaşır ve kırılınca çıtırdar.',
  },
  {
    id: 'pancar-b', bitki: 'Şeker pancarı', besin: 'Bor', sembol: 'B', anahtar: 'bor', yaprak: 'genç',
    kisa: 'Kalp (orta) yapraklar kararır, baş kısmı çürür.',
    belirtiler: ['En içteki kalp yapraklar kahverengi-siyah olur ve ölür (kalp çürüklüğü).', 'Yaprak saplarında kahverengi mantarlaşmış çatlaklar.', 'Çürüme pancarın başına ve içine ilerler; kesince kökte kahverengi damarlar görülür.'],
    neden: 'Kuru yazlarda, kireçli ve yüksek pH\'lı topraklarda, kumlu ve organik maddesi düşük topraklarda. Pancar boru en çok isteyen bitkilerdendir.',
    cozum: ['Ekimden önce toprağa boraks / bor içeren gübre; bor eksik topraklarda her pancar ekiminde.', B_YAPRAK.replace('çiçeklenmeden önce ve çiçeklenme başında', 'yaprak örtüsü kapanmadan önce 1–2 kez')],
    karisir: 'Kök çürüklüğü hastalıkları alttan başlar; bor noksanlığı tepeden (kalp yapraklardan).',
  },
  {
    id: 'pancar-mn', bitki: 'Şeker pancarı', besin: 'Mangan', sembol: 'Mn', anahtar: 'mangan', yaprak: 'genç',
    kisa: 'Genç-orta yapraklarda benekli sarılık, yapraklar dik ve kenarları içe kıvrık.',
    belirtiler: ['Genç ve orta yapraklarda damarlar arasında açık sarı benekler (benekli sarılık).', 'Benekler kahverengi ölü noktalara dönüp birleşir.', 'Yapraklar dik durur, kenarları içe kıvrılır.'],
    neden: 'Yüksek pH\'lı, kireçli, gevşek ve organik maddesi yüksek topraklarda; soğuk-ıslak ilkbaharda.',
    cozum: [MN_YAPRAK],
  },

  // ───────── AYÇİÇEĞİ ─────────
  {
    id: 'aycicegi-n', bitki: 'Ayçiçeği', besin: 'Azot', sembol: 'N', anahtar: 'azot', yaprak: 'yaşlı',
    kisa: 'Alt yapraklar baştan sona sararır, bitki ince ve kısa.',
    belirtiler: ['Alt yapraklar tümüyle açık sarıya döner ve erken dökülür.', 'Sap ince, bitki kısa kalır.', 'Tabla küçük olur.'],
    neden: 'Organik maddesi düşük topraklarda, kuraklıkta, eksik gübrelemede.',
    cozum: [N_UST, 'Ayçiçeğinde azotun çoğu ekimde ve ilk çapada verilmelidir; geç azot yağ oranını düşürür.'],
  },
  {
    id: 'aycicegi-p', bitki: 'Ayçiçeği', besin: 'Fosfor', sembol: 'P', anahtar: 'fosfor', yaprak: 'yaşlı',
    kisa: 'Koyu yeşil, bodur bitki; alt yapraklarda kahverengi lekeler.',
    belirtiler: ['Bitki koyu yeşil ve bodurdur, gelişme yavaştır.', 'Alt yapraklarda kenardan başlayan kahverengi ölü lekeler.', 'Çiçeklenme gecikir.'],
    neden: 'Kireçli topraklarda fosfor tutulur; erken ekimde soğuk toprak.',
    cozum: [P_TABAN],
  },
  {
    id: 'aycicegi-k', bitki: 'Ayçiçeği', besin: 'Potasyum', sembol: 'K', anahtar: 'potasyum', yaprak: 'yaşlı',
    kisa: 'Alt yaprak kenarlarında sararma ve kahverengi kuruma.',
    belirtiler: ['Alt yaprakların kenarlarında sararma, sonra kahverengi kuruma.', 'Yapraklar aşağı kıvrılabilir.', 'Sap zayıflar, kırılma ve yatma artar.'],
    neden: 'Kumlu, hafif topraklarda ve kuraklıkta.',
    cozum: [K_TOPRAK],
  },
  {
    id: 'aycicegi-mg', bitki: 'Ayçiçeği', besin: 'Magnezyum', sembol: 'Mg', yaprak: 'yaşlı',
    kisa: 'Alt yapraklarda damarlar arası sararma, damarlar yeşil.',
    belirtiler: ['Alt yapraklarda damarlar arası sararma; damarlar yeşil ağ gibi kalır.', 'Sonra kahverengi lekeler oluşur.', 'Belirti yukarı doğru ilerler.'],
    neden: 'Kumlu, asidik topraklarda ve fazla potasyumlu gübrelemede.',
    cozum: [MG_YAPRAK],
  },
  {
    id: 'aycicegi-b', bitki: 'Ayçiçeği', besin: 'Bor', sembol: 'B', anahtar: 'bor', yaprak: 'tabla',
    kisa: 'Genç yapraklar küçük ve şekilsiz; tabla çarpık ve yer yer boş.',
    belirtiler: ['En genç yapraklar küçük, kalın, buruşuk ve şekilsizdir.', 'Tabla çarpık gelişir, tohum bağlama düzensizdir; bazı kısımlar boş kalır.', 'Tabla sapında çatlak ve kırılma; ağır durumda büyüme ucu ölür.'],
    neden: 'Kumlu, kireçli, organik maddesi düşük topraklarda; kuraklıkta. Trakya\'da ayçiçeğinde bilinen bir sorundur.',
    cozum: [B_YAPRAK.replace('çiçeklenmeden önce ve çiçeklenme başında', '8–10 yaprak döneminde ve tabla görünürken')],
  },

  // ───────── PAMUK ─────────
  {
    id: 'pamuk-n', bitki: 'Pamuk', besin: 'Azot', sembol: 'N', anahtar: 'azot', yaprak: 'yaşlı',
    kisa: 'Alt yapraklar sarı-kırmızımsı, bitki kısa ve az dallı.',
    belirtiler: ['Alt yapraklar açık yeşil-sarıya, sonra kırmızımsıya döner ve erken dökülür.', 'Bitki kısa, dal ve tarak sayısı azdır.', 'Erken olgunlaşma, düşük verim.'],
    neden: 'Hafif topraklarda, yıkanmada, eksik üst gübrede.',
    cozum: [N_UST, 'Pamukta azotun büyük kısmını taraklanma ile çiçeklenme arasında verin; geç azot olgunlaşmayı geciktirir.'],
  },
  {
    id: 'pamuk-k', bitki: 'Pamuk', besin: 'Potasyum', sembol: 'K', anahtar: 'potasyum', yaprak: 'yaşlı',
    kisa: 'Yapraklarda bronzlaşma, damarlar arası sarı-kahve lekeler.',
    belirtiler: ['Yapraklarda sarı-bronz renk ve damarlar arasında kahverengi lekeler.', 'Yaprak kenarları aşağı kıvrılır, yaprak erken dökülür.', 'Kozalar küçük kalır, lif kalitesi düşer; belirti koza dolum döneminde artar.'],
    neden: 'Koza dolumunda potasyum ihtiyacı çok artar; kumlu ya da kuru topraklarda belirginleşir.',
    cozum: [K_TOPRAK, 'Koza dolumunda yapraktan %2 potasyum nitrat 2–3 kez uygulanabilir.'],
  },
  {
    id: 'pamuk-mg', bitki: 'Pamuk', besin: 'Magnezyum', sembol: 'Mg', yaprak: 'yaşlı',
    kisa: 'Alt yapraklar kırmızı-mor, damarlar yeşil kalır.',
    belirtiler: ['Alt yapraklarda damarlar arası kırmızı-mor renk.', 'Damarlar belirgin şekilde yeşil kalır.', 'Yapraklar erken dökülür.'],
    neden: 'Kumlu, asidik topraklarda ve fazla potasyumlu gübrelemede.',
    cozum: [MG_YAPRAK],
  },
  {
    id: 'pamuk-b', bitki: 'Pamuk', besin: 'Bor', sembol: 'B', anahtar: 'bor', yaprak: 'genç',
    kisa: 'Yaprak saplarında koyu halkalar, tarak ve koza dökümü.',
    belirtiler: ['Genç yaprakların sapları kısa ve kalın, üzerinde koyu halkalar.', 'Tarak ve çiçek dökümü artar; kozalar şekilsiz olur.', 'Ağır durumda büyüme ucu ölür ya da çarpılır.'],
    neden: 'Kumlu, kireçli topraklarda ve kuraklıkta.',
    cozum: [B_YAPRAK.replace('çiçeklenmeden önce ve çiçeklenme başında', 'taraklanma ve çiçeklenme başında')],
  },
  {
    id: 'pamuk-zn', bitki: 'Pamuk', besin: 'Çinko', sembol: 'Zn', anahtar: 'cinko', yaprak: 'genç',
    kisa: 'Genç yapraklar küçük, damarlar arası sararmış, kenarları yukarı kıvrık.',
    belirtiler: ['Genç yapraklar küçük ve kalındır.', 'Damarlar arası sararma; yaprak kenarları yukarı kıvrılır.', 'Boğum araları kısa, bitki bodur.'],
    neden: 'Kireçli, yüksek pH\'lı Çukurova ve GAP topraklarında; fazla fosforlu gübrede.',
    cozum: [ZN_TOPRAK, ZN_YAPRAK],
  },

  // ───────── KETEN ─────────
  {
    id: 'keten-n', bitki: 'Keten', besin: 'Azot', sembol: 'N', anahtar: 'azot', yaprak: 'yaşlı',
    kisa: 'Alt yapraklar sararır, gövde ince ve kısa.',
    belirtiler: ['Alt yapraklar açık sarıya döner ve dökülür.', 'Gövde ince ve kısa kalır.', 'Kapsül (tohum kozası) sayısı azdır.'],
    neden: 'Organik maddesi düşük, hafif topraklarda.',
    cozum: ['Ketende azot az ama zamanında verilmeli; fazla azot yatmaya yol açar.', N_UST],
  },
  {
    id: 'keten-zn', bitki: 'Keten', besin: 'Çinko', sembol: 'Zn', anahtar: 'cinko', yaprak: 'genç',
    kisa: 'Üst yapraklar gri-yeşil, beyaz-kahverengi lekeler; uç kuruyabilir.',
    belirtiler: ['Bitkinin üst yarısındaki yapraklarda gri-yeşil renk ve beyaz-kahverengi ölü lekeler.', 'Gövde ucu sararıp kuruyabilir.', 'Bitki bodur kalır. Keten çinko noksanlığına en duyarlı bitkilerdendir.'],
    neden: 'Kireçli, yüksek pH\'lı topraklarda; fazla fosforlu gübrede.',
    cozum: [ZN_TOPRAK, ZN_YAPRAK],
  },
  {
    id: 'keten-fe', bitki: 'Keten', besin: 'Demir', sembol: 'Fe', anahtar: 'demir', yaprak: 'genç',
    kisa: 'Uç yapraklar sapsarı, alt kısım yeşil.',
    belirtiler: ['Gövde ucundaki genç yapraklar sapsarı olur.', 'Alt yapraklar yeşil kalır.', 'Ağır durumda uçlar beyazlaşır.'],
    neden: 'Kireçli, yüksek pH\'lı ve ıslak, havasız topraklarda.',
    cozum: [FE_YAPRAK],
  },

  // ───────── PATATES ─────────
  {
    id: 'patates-n', bitki: 'Patates', besin: 'Azot', sembol: 'N', anahtar: 'azot', yaprak: 'yaşlı',
    kisa: 'Alt yapraklar açık yeşil-sarı, bitki cılız.',
    belirtiler: ['Alt yapraklar açık yeşil-sarıya döner, sonra kurur.', 'Bitki küçük ve dik, yapraklar küçüktür.', 'Erken yaşlanma, küçük yumru.'],
    neden: 'Hafif topraklarda, yağmur ya da fazla sulamayla yıkanmada.',
    cozum: [N_UST, 'Patateste azotun yarısını dikimde, kalanını boğaz doldurmada verin.'],
  },
  {
    id: 'patates-p', bitki: 'Patates', besin: 'Fosfor', sembol: 'P', anahtar: 'fosfor', yaprak: 'yaşlı',
    kisa: 'Koyu yeşil, dik ve küçük yapraklar; yaprak kenarları yukarı kıvrık.',
    belirtiler: ['Bitki koyu yeşil, bodur ve dik durur.', 'Yapraklar küçük, kenarları yukarı kıvrık.', 'Yumru sayısı azdır; yumruda pas renkli lekeler olabilir.'],
    neden: 'Kireçli ve soğuk topraklarda.',
    cozum: [P_TABAN],
  },
  {
    id: 'patates-k', bitki: 'Patates', besin: 'Potasyum', sembol: 'K', anahtar: 'potasyum', yaprak: 'yaşlı',
    kisa: 'Koyu, bronz renkli yapraklar; yaprak kenarlarında yanıklık.',
    belirtiler: ['Yapraklar koyu mavimsi yeşil, sonra bronz renk alır.', 'Yaprak kenar ve uçlarında kahverengi kuruma, yaprakçıklar aşağı kıvrılır.', 'Yumruda kararma ve depolama sorunları artar.'],
    neden: 'Patates potasyumu çok sever; kumlu topraklarda ve yetersiz gübrelemede sık görülür.',
    cozum: [K_TOPRAK, 'Patateste klorsuz potasyum (potasyum sülfat) yumru kalitesi için daha iyidir.'],
  },
  {
    id: 'patates-mg', bitki: 'Patates', besin: 'Magnezyum', sembol: 'Mg', yaprak: 'yaşlı',
    kisa: 'Alt yapraklarda damarlar arası sararma, sonra kahverengi lekeler.',
    belirtiler: ['Alt yapraklarda damarlar arası sararma, damarlar yeşil.', 'Sararan alanlar kahverengi ölü lekelere döner.', 'Yapraklar kalınlaşıp gevrekleşebilir.'],
    neden: 'Kumlu, asidik topraklarda; fazla potasyumlu gübrede.',
    cozum: [MG_YAPRAK],
  },
  {
    id: 'patates-ca', bitki: 'Patates', besin: 'Kalsiyum', sembol: 'Ca', yaprak: 'yumru',
    kisa: 'Yumru içinde kahverengi benekler; genç yaprak uçları yanık.',
    belirtiler: ['Yumru kesildiğinde içinde dağınık pas-kahverengi benekler.', 'Genç yaprakların kenarları kıvrılır ve uçları kahverengileşir.', 'Yumru içi boşluk ve kararma.'],
    neden: 'Kalsiyum topraktan suyla taşınır; düzensiz sulama, kuraklık ve kumlu topraklarda yumruya yeterli kalsiyum gitmez.',
    cozum: ['Düzenli ve dengeli sulayın; ani kuruma-ıslanma döngüsünden kaçının.', 'Yumru bağlama döneminde kalsiyum nitrat ile gübreleyin.'],
  },

  // ───────── DOMATES ─────────
  {
    id: 'domates-n', bitki: 'Domates', besin: 'Azot', sembol: 'N', anahtar: 'azot', yaprak: 'yaşlı',
    kisa: 'Alt yapraklar baştan sona sararır, sap ince ve morumsu.',
    belirtiler: ['Alt yapraklar tümüyle açık sarıya döner.', 'Sap ince, sert ve morumsu olabilir.', 'Meyveler küçük kalır.'],
    neden: 'Yetersiz gübreleme, yıkanma, meyve yükünün fazla olduğu dönem.',
    cozum: [N_UST],
  },
  {
    id: 'domates-k', bitki: 'Domates', besin: 'Potasyum', sembol: 'K', anahtar: 'potasyum', yaprak: 'meyve',
    kisa: 'Düzensiz olgunlaşma, sapa yakın yeşil-sarı omuz; yaprak kenarı yanık.',
    belirtiler: ['Meyvelerde düzensiz renklenme; sap çevresi sarı-yeşil kalır (yeşil omuz).', 'Yaşlı yaprakların kenarları sararıp kahverengi kurur.', 'Meyve sertliği ve tadı düşer.'],
    neden: 'Meyve döneminde potasyum ihtiyacı çok artar; yetersiz gübrelemede.',
    cozum: [K_TOPRAK, 'Meyve döneminde potasyumlu gübreyi artırın (ör. 15-5-30 gibi potasyumu yüksek ürünler).'],
  },
  {
    id: 'domates-mg', bitki: 'Domates', besin: 'Magnezyum', sembol: 'Mg', yaprak: 'yaşlı',
    kisa: 'Alt yapraklarda damarlar arası sararma, damarlar yeşil kalır.',
    belirtiler: ['Alt ve orta yapraklarda damarlar arası sararma.', 'Damarlar yeşil ağ gibi kalır.', 'Sonra sarı alanlar kahverengileşir; meyve yükü arttıkça belirti yukarı çıkar.'],
    neden: 'Fazla potasyumlu gübrede ve kumlu topraklarda çok sık görülür.',
    cozum: [MG_YAPRAK],
  },
  {
    id: 'domates-ca', bitki: 'Domates', besin: 'Kalsiyum', sembol: 'Ca', yaprak: 'meyve',
    kisa: 'Meyvenin alt (çiçek) ucunda siyah-kahverengi çökük leke.',
    belirtiler: ['Meyvenin çiçek ucunda önce su emmiş gibi, sonra siyah-kahverengi, deri gibi çökük leke (çiçek burnu çürüklüğü).', 'Genellikle ilk meyvelerde ve sıcak dönemde görülür.', 'Genç yaprak uçlarında kıvrılma olabilir.'],
    neden: 'Topraktaki kalsiyumdan çok düzensiz sulamadan kaynaklanır: kuruyup ıslanan toprakta ve sıcakta kalsiyum meyveye ulaşamaz.',
    cozum: ['Düzenli sulayın, toprağı kurutmayın; malç kullanın.', 'Kalsiyum nitrat ile gübreleyin; meyve tutumundan sonra yapraktan kalsiyum (%0,3–0,5 kalsiyum klorür) meyveye yönelik uygulanabilir.'],
  },
  {
    id: 'domates-fe', bitki: 'Domates', besin: 'Demir', sembol: 'Fe', anahtar: 'demir', yaprak: 'genç',
    kisa: 'Uç yapraklarda damarlar arası sararma, damarlar yeşil.',
    belirtiler: ['En uçtaki genç yapraklarda damarlar arası sararma.', 'İnce damarlar bile yeşil kalır.', 'Ağır durumda yapraklar beyazımsı olur.'],
    neden: 'Kireçli, yüksek pH\'lı topraklarda, fazla sulamada ve soğuk toprakta.',
    cozum: ['Damlayla şelatlı demir (Fe-EDDHA) verin; kireçli toprakta en etkili yol budur.', FE_YAPRAK],
  },

  // ───────── ELMA ─────────
  {
    id: 'elma-fe', bitki: 'Elma', besin: 'Demir', sembol: 'Fe', anahtar: 'demir', yaprak: 'genç',
    kisa: 'Sürgün ucundaki yapraklar sararır, damarlar yeşil kalır.',
    belirtiler: ['Sürgün ucundaki genç yapraklar sarı, damarlar yeşil ağ gibi kalır.', 'Ağır durumda yapraklar beyazlaşır, kenarlardan kurur.', 'Sürgün gelişimi zayıflar.'],
    neden: 'Kireçli topraklarda en yaygın meyve bahçesi sorunudur (kireç klorozu); ağır, ıslak topraklarda artar.',
    cozum: ['Ağacın taç izdüşümüne şelatlı demir (Fe-EDDHA); ilkbaharda uyanmadan önce, ağaç yaşına göre ağaç başına 20–60 g.', FE_YAPRAK],
  },
  {
    id: 'elma-ca', bitki: 'Elma', besin: 'Kalsiyum', sembol: 'Ca', yaprak: 'meyve',
    kisa: 'Meyve kabuğu altında küçük, çökük kahverengi benekler (acı benek).',
    belirtiler: ['Meyvenin özellikle alt yarısında kabuk altında küçük, çökük lekeler.', 'Lekelerin altındaki et kahverengi, mantarımsı ve acıdır.', 'Belirti çoğu zaman depoda artar.'],
    neden: 'Meyvede kalsiyum azlığından; iri meyve, az ürün, fazla azot ve düzensiz sulamada artar.',
    cozum: ['Haziran\'dan hasada kadar 10–14 günde bir yapraktan kalsiyum (%0,4–0,6 kalsiyum klorür veya kalsiyum nitrat).', 'Fazla azottan kaçının, düzenli sulayın.'],
  },
  {
    id: 'elma-zn', bitki: 'Elma', besin: 'Çinko', sembol: 'Zn', anahtar: 'cinko', yaprak: 'genç',
    kisa: 'Küçük, dar yapraklar sürgün ucunda rozet gibi toplanır.',
    belirtiler: ['Sürgün ucunda küçük, dar, sarımsı yapraklar rozet hâlinde toplanır (küçük yaprak).', 'Boğum araları çok kısalır.', 'Meyveler küçük ve şekilsiz olur.'],
    neden: 'Kireçli, yüksek pH\'lı ve fazla fosfor verilmiş topraklarda.',
    cozum: ['Kış sonunda, gözler uyanmadan çinko sülfat püskürtmesi; yaz başında yapraktan şelatlı çinko.', ZN_TOPRAK],
  },
  {
    id: 'elma-k', bitki: 'Elma', besin: 'Potasyum', sembol: 'K', anahtar: 'potasyum', yaprak: 'yaşlı',
    kisa: 'Yaprak kenarlarında kahverengi yanıklık.',
    belirtiler: ['Sürgünün orta ve alt yapraklarında kenardan başlayan kahverengi kuruma.', 'Yaprak kenarları yukarı kıvrılabilir.', 'Meyveler küçük, renk zayıf.'],
    neden: 'Ürün yükü fazla olan ağaçlarda, kumlu ya da kuru topraklarda.',
    cozum: [K_TOPRAK],
  },
  {
    id: 'elma-b', bitki: 'Elma', besin: 'Bor', sembol: 'B', anahtar: 'bor', yaprak: 'meyve',
    kisa: 'Meyve etinde kahverengi mantarlaşma, şekilsiz meyve.',
    belirtiler: ['Meyve etinde kahverengi, mantar gibi sert bölgeler (iç mantarlaşma).', 'Meyve şekilsiz ve çatlak olabilir.', 'Sürgün uçlarında geriye doğru kuruma.'],
    neden: 'Kuru yıllarda, kireçli ve kumlu topraklarda.',
    cozum: [B_YAPRAK.replace('çiçeklenmeden önce ve çiçeklenme başında', 'pembe tomurcuk ve taç yaprak dökümünde')],
  },

  // ───────── ÜZÜM ─────────
  {
    id: 'uzum-fe', bitki: 'Üzüm (bağ)', besin: 'Demir', sembol: 'Fe', anahtar: 'demir', yaprak: 'genç',
    kisa: 'Sürgün ucundaki yapraklar sarı, damarlar yeşil.',
    belirtiler: ['Sürgün ucundaki genç yapraklar sarı, damarlar yeşil ağ gibi kalır.', 'Ağır durumda yapraklar fildişi beyazı olur, kenarları kurur.', 'Salkım küçük, tane tutumu zayıf.'],
    neden: 'Kireçli topraklarda bağlarda çok yaygındır (kireç klorozu); ıslak ilkbaharda artar. Anacın kirece dayanımı önemlidir.',
    cozum: ['İlkbaharda omca dibine şelatlı demir (Fe-EDDHA).', FE_YAPRAK],
  },
  {
    id: 'uzum-mg', bitki: 'Üzüm (bağ)', besin: 'Magnezyum', sembol: 'Mg', yaprak: 'yaşlı',
    kisa: 'Yaşlı yapraklarda damarlar arası sararma (beyaz üzümde) ya da kızarma (siyah üzümde).',
    belirtiler: ['Yaşlı yapraklarda damarlar arası sararma; siyah çeşitlerde kızarma.', 'Ana damarların çevresi yeşil kalır.', 'Salkım sapı kuruması (salkım saplarının kuruması) artabilir.'],
    neden: 'Fazla potasyumlu gübrede ve kumlu-asidik topraklarda.',
    cozum: [MG_YAPRAK],
  },
  {
    id: 'uzum-k', bitki: 'Üzüm (bağ)', besin: 'Potasyum', sembol: 'K', anahtar: 'potasyum', yaprak: 'yaşlı',
    kisa: 'Yaprak kenarlarında kahverengi yanıklık, yapraklar aşağı kıvrık.',
    belirtiler: ['Orta ve yaşlı yapraklarda kenarlardan başlayan sararma ve kahverengi kuruma.', 'Siyah çeşitlerde yaprak yüzeyi morumsu-bronz olabilir.', 'Taneler küçük ve düzensiz olgunlaşır.'],
    neden: 'Ürün yükü fazla bağlarda, kuru ve kumlu topraklarda.',
    cozum: [K_TOPRAK],
  },
  {
    id: 'uzum-b', bitki: 'Üzüm (bağ)', besin: 'Bor', sembol: 'B', anahtar: 'bor', yaprak: 'meyve',
    kisa: 'Salkımda iri ve küçük taneler bir arada (tavuk-civciv görünümü).',
    belirtiler: ['Salkımda iri taneler arasında çok sayıda küçük, çekirdeksiz tane.', 'Tane tutumu zayıf, salkım seyrek.', 'Sürgün uçları ve genç yapraklar şekilsiz, damarlar arası sararma.'],
    neden: 'Kuru yıllarda, kumlu ve kireçli topraklarda.',
    cozum: [B_YAPRAK],
  },
  {
    id: 'uzum-zn', bitki: 'Üzüm (bağ)', besin: 'Çinko', sembol: 'Zn', anahtar: 'cinko', yaprak: 'genç',
    kisa: 'Küçük, asimetrik yapraklar; damarlar arası sararma.',
    belirtiler: ['Yapraklar küçük, asimetrik, yaprak sapı girintisi açık.', 'Damarlar arası sararma; damarlar yeşil.', 'Salkımda küçük ve iri taneler bir arada.'],
    neden: 'Kireçli, yüksek pH\'lı ve kumlu topraklarda.',
    cozum: ['Çiçeklenmeden 2–3 hafta önce yapraktan çinko sülfat ya da şelatlı çinko.', ZN_TOPRAK],
  },
];

export const noksanlikGorseli = (id: string) => `/noksanlik/${id}.webp`;

/** Rapordaki bitki adına uyan katalog bitkisi */
export function katalogBitkisi(bitki?: string | null): string | undefined {
  if (!bitki) return undefined;
  if (/keten/i.test(bitki)) return 'Keten';
  const z = zkartBul(bitki);
  return z && (BITKI_SIRASI as readonly string[]).includes(z.bitki) ? z.bitki : undefined;
}

export const bitkiNoksanliklari = (bitki: string) => NOKSANLIKLAR.filter((n) => n.bitki === bitki);
