/**
 * "Besinleri tanıyalım": bitkinin ihtiyaç duyduğu makro, mikro ve faydalı elementler.
 * Resimler: public/besin/<sembol küçük harf>.webp (Cl ve Ni yalnızca yazıyla).
 * Dayanak: Marschner's Mineral Nutrition of Plants (3. bs.); FAO Plant Nutrition for Food Security (2006);
 * IPNI 4R Plant Nutrition Manual; Kacar & Katkat, Bitki Besleme. Ürün adları İGSAŞ/KIANA kataloğundan (lib/igsas.ts).
 */

export type BesinGrubu = 'birincil' | 'ikincil' | 'mikro' | 'faydali';

export type Besin = {
  sembol: string;
  ad: string;
  atomNo: number;
  grup: BesinGrubu;
  renk: string;
  resim?: string;
  /** Bitkinin kökten aldığı şekil */
  alinanSekil: string;
  /** Tek cümlelik özet */
  kisa: string;
  gorevler: string[];
  /** Bitki içinde taşınabilir mi: noksanlık önce hangi yaprakta görülür */
  hareket: 'hareketli' | 'az hareketli' | 'hareketsiz';
  noksanlikYeri: string;
  /** Toprakta nasıl davranır */
  toprakta: string;
  /** pH, kireç vb. alımı bozan durumlar */
  alimiBozan: string;
  neZaman: string;
  fazlasi: string;
  urunler: string[];
};

export const GRUP_ADI: Record<BesinGrubu, string> = {
  birincil: 'Ana makro besinler',
  ikincil: 'İkincil makro besinler',
  mikro: 'Mikro besinler',
  faydali: 'Faydalı element',
};

export const GRUP_ACIKLAMA: Record<BesinGrubu, string> = {
  birincil: 'Bitki en çok bunları ister; dekara kilogramlarla verilir. Gübre torbasındaki üç sayı bunlardır.',
  ikincil: 'Daha az miktarda ama düzenli gerekir; çoğu zaman başka gübrelerin içinde gelir.',
  mikro: 'Dekara gramlarla gerekir ama eksik olduğunda verimi ana besinler kadar düşürür.',
  faydali: 'Zorunlu sayılmaz ama bitkiyi güçlendirir, stres ve hastalığa dayanımı artırır.',
};

export const BESINLER: Besin[] = [
  {
    sembol: 'N', ad: 'Azot', atomNo: 7, grup: 'birincil', renk: '#2f7d4f', resim: '/besin/n.webp',
    alinanSekil: 'Nitrat (NO₃⁻) ve amonyum (NH₄⁺)',
    kisa: 'Yeşil büyümenin yapı taşı: protein ve klorofilin temelidir.',
    gorevler: ['Protein, enzim ve klorofilin yapısına girer', 'Yaprak ve sürgün büyümesini hızlandırır', 'Tanede protein oranını belirler'],
    hareket: 'hareketli',
    noksanlikYeri: 'Önce yaşlı (alt) yapraklar açık yeşil-sarı olur; bitki azotu genç yapraklara taşır.',
    toprakta: 'Nitrat suyla kolayca yıkanır, özellikle kumlu toprakta ve bol yağışta kaybolur. Bu yüzden azot tek seferde değil, bölünerek verilir.',
    alimiBozan: 'Soğuk ve su basmış toprakta azot dönüşümü yavaşlar; yüzeye serpilen üre sıcak ve kuru havada amonyak olarak uçar.',
    neZaman: 'Az bir kısmı ekimde, kalanı bitkinin hızlı büyüdüğü dönemlerde (kardeşlenme, sapa kalkma, 6–8 yaprak) bölerek.',
    fazlasi: 'Fazla azot bitkiyi yumuşatır, yatmaya ve hastalığa açık hâle getirir, olgunlaşmayı geciktirir; yıkanan nitrat yer altı suyunu kirletir.',
    urunler: ['UAN-32', 'AS 21', 'KNO₃', 'Mg NİTRAT', 'DAP', 'N-CALBOR'],
  },
  {
    sembol: 'P', ad: 'Fosfor', atomNo: 15, grup: 'birincil', renk: '#7b4fa3', resim: '/besin/p.webp',
    alinanSekil: 'Fosfat (H₂PO₄⁻, HPO₄²⁻)',
    kisa: 'Bitkinin enerji taşıyıcısı: kök, çiçek ve tohum için şart.',
    gorevler: ['Enerji molekülü ATP’nin yapısına girer', 'Erken kök gelişimini sağlar', 'Çiçeklenme, tohum ve tane oluşumunu destekler'],
    hareket: 'hareketli',
    noksanlikYeri: 'Yaşlı yapraklarda koyu yeşil-mor renk; genç bitkide gelişme durur.',
    toprakta: 'Toprakta neredeyse hiç hareket etmez; verildiği yerde kalır. Bu yüzden tohumun yanına, köke yakın verilmelidir.',
    alimiBozan: 'Kireçli toprakta (pH > 7,5) kalsiyumla, asit toprakta demir ve alüminyumla bağlanıp kilitlenir. Soğuk toprakta kök az aldığı için ilkbaharda morarma sık görülür.',
    neZaman: 'Ekimde taban gübresiyle, tohumun yanına banda. Damlada erken dönemde fosforlu gübreyle desteklenir.',
    fazlasi: 'Fazla fosfor çinko ve demir alımını azaltır; tarladan akan fosfor göl ve derelerde yosunlaşmaya yol açar.',
    urunler: ['DAP', 'NPK 12-40-12', 'NPK 15-30-15+Zn', 'NPK 20.20.0+Zn', 'MKP', 'FOSFORİK ASİT'],
  },
  {
    sembol: 'K', ad: 'Potasyum', atomNo: 19, grup: 'birincil', renk: '#b5651d', resim: '/besin/k.webp',
    alinanSekil: 'Potasyum iyonu (K⁺)',
    kisa: 'Bitkinin su dengesi ve kalite elementi: dolum, tat, dayanıklılık.',
    gorevler: ['Gözeneklerin açılıp kapanmasını, yani su dengesini düzenler', 'Şekerin taneye ve meyveye taşınmasını sağlar', 'Sapı güçlendirir; kuraklık, soğuk ve hastalığa dayanımı artırır'],
    hareket: 'hareketli',
    noksanlikYeri: 'Yaşlı yaprakların kenarlarından başlayan sararma ve kahverengi yanıklık.',
    toprakta: 'Kil taneciklerine tutunur; killi toprakta iyi saklanır, kumlu toprakta yıkanabilir.',
    alimiBozan: 'Kuru toprakta alım düşer. Fazla kalsiyum ve magnezyum potasyumla yarışır.',
    neZaman: 'Bir kısmı ekimde, asıl ihtiyaç dolum ve meyve irileşme döneminde; damlada gübreli sularla bölerek.',
    fazlasi: 'Fazla potasyum magnezyum ve kalsiyum alımını engeller; yapraklarda magnezyum noksanlığı görülebilir.',
    urunler: ['K₂SO₄', 'KNO₃', 'ENLARGE POTASH', 'K-S', 'NPK 7-7-40+ME', 'MKP'],
  },
  {
    sembol: 'Ca', ad: 'Kalsiyum', atomNo: 20, grup: 'ikincil', renk: '#6b7b8c', resim: '/besin/ca.webp',
    alinanSekil: 'Kalsiyum iyonu (Ca²⁺)',
    kisa: 'Hücre duvarının harcı: sağlam doku, sert ve dayanıklı meyve.',
    gorevler: ['Hücre duvarlarını birbirine bağlar', 'Kök ve sürgün uçlarının büyümesi için gerekir', 'Meyvenin sertliğini ve raf ömrünü artırır'],
    hareket: 'hareketsiz',
    noksanlikYeri: 'Genç yapraklar, sürgün uçları ve meyvede: domateste çiçek burnu çürüklüğü, elmada acı benek.',
    toprakta: 'Kireçli topraklarımızda genellikle bol bulunur. Sorun çoğu zaman toprakta azlığı değil, bitkinin içinde meyveye taşınamamasıdır.',
    alimiBozan: 'Kalsiyum yalnızca suyla taşınır; düzensiz sulama, kuraklık ve aşırı nem taşınmayı keser. Fazla potasyum, magnezyum ve amonyum alımı azaltır.',
    neZaman: 'Meyve tutumundan itibaren düzenli sulamayla birlikte; gerekirse yapraktan, meyveye ulaşacak şekilde.',
    fazlasi: 'Topraktaki fazla kalsiyum (kireç) pH’ı yükseltir; demir, çinko, mangan ve fosforu bağlar.',
    urunler: ['N-CALBOR'],
  },
  {
    sembol: 'Mg', ad: 'Magnezyum', atomNo: 12, grup: 'ikincil', renk: '#4f8a3a', resim: '/besin/mg.webp',
    alinanSekil: 'Magnezyum iyonu (Mg²⁺)',
    kisa: 'Klorofilin kalbi: her klorofil molekülünün ortasında bir magnezyum vardır.',
    gorevler: ['Klorofilin merkez atomudur', 'Şekerin yapraktan taneye taşınmasına yardım eder', 'Birçok enzimi çalıştırır'],
    hareket: 'hareketli',
    noksanlikYeri: 'Yaşlı yapraklarda damarlar yeşil kalırken arası sararır.',
    toprakta: 'Kumlu ve asit topraklarda az bulunur ve yıkanır.',
    alimiBozan: 'Fazla potasyum ve amonyumlu gübre magnezyum alımını azaltır.',
    neZaman: 'Hızlı büyüme ve dolum döneminde; noksanlık görülürse yapraktan.',
    fazlasi: 'Nadiren sorun olur; aşırısı kalsiyum ve potasyum alımını bozabilir.',
    urunler: ['MAGNEZYUM', 'Mg NİTRAT'],
  },
  {
    sembol: 'S', ad: 'Kükürt', atomNo: 16, grup: 'ikincil', renk: '#c9a227', resim: '/besin/s.webp',
    alinanSekil: 'Sülfat (SO₄²⁻)',
    kisa: 'Protein ve yağın ortağı: azot kadar önemli, sık unutulan besin.',
    gorevler: ['Bazı amino asitlerin ve proteinin yapısına girer', 'Kanola, ayçiçeği gibi yağ bitkilerinde yağ oranını artırır', 'Azotun verimli kullanılmasını sağlar'],
    hareket: 'az hareketli',
    noksanlikYeri: 'Genç yapraklarda genel açık sarılık (azot noksanlığına benzer ama üstten başlar).',
    toprakta: 'Sülfat da nitrat gibi suyla yıkanır; organik maddesi düşük, kumlu topraklarda eksiklik sık görülür.',
    alimiBozan: 'Kükürtsüz gübrelerin (üre, DAP) yıllarca tek başına kullanılması eksikliği artırır.',
    neZaman: 'İlkbaharda büyüme başlarken, azotla birlikte. Kanolada sapa kalkmadan önce mutlaka.',
    fazlasi: 'Normal gübrelemede sorun olmaz; elementel kükürt fazlası toprağı asitleştirir.',
    urunler: ['AS 21', 'K₂SO₄', 'K-S'],
  },
  {
    sembol: 'Fe', ad: 'Demir', atomNo: 26, grup: 'mikro', renk: '#a0442c', resim: '/besin/fe.webp',
    alinanSekil: 'Fe²⁺ ve şelatlı demir',
    kisa: 'Klorofil yapımının işçisi: genç yaprakları yeşil tutar.',
    gorevler: ['Klorofilin yapımı için gerekir (yapısına girmez ama yapımını sağlar)', 'Fotosentez ve solunumda elektron taşır'],
    hareket: 'hareketsiz',
    noksanlikYeri: 'Genç yapraklarda damarlar yeşil, arası limon sarısı; ağır durumda yaprak beyazlar.',
    toprakta: 'Topraklarımızda demir bol ama kireçli ve yüksek pH’lı toprakta bitkinin alamayacağı şekle geçer.',
    alimiBozan: 'Kireç (yüksek pH), fazla sulama ve havasız toprak, yüksek bikarbonatlı sulama suyu.',
    neZaman: 'Belirti görülünce veya bilinen kireçli tarlada erken dönemde; kireçli toprakta EDDHA şelatı daha etkilidir.',
    fazlasi: 'Kireçli topraklarımızda pek görülmez; asit ve su basmış toprakta zehirlenme yapabilir.',
    urunler: ['DEMİR ŞELAT', 'KOMBİ', 'NPK 20-20-20+ME'],
  },
  {
    sembol: 'Zn', ad: 'Çinko', atomNo: 30, grup: 'mikro', renk: '#3b6ea5', resim: '/besin/zn.webp',
    alinanSekil: 'Çinko iyonu (Zn²⁺)',
    kisa: 'Büyüme hormonlarının anahtarı: Türkiye topraklarının yarısında eksik.',
    gorevler: ['Büyüme hormonu (oksin) yapımı için gerekir', 'Boğum aralarının uzamasını ve yaprak büyümesini sağlar', 'Tane dolumunu ve tanede çinko miktarını artırır'],
    hareket: 'az hareketli',
    noksanlikYeri: 'Genç yapraklarda açık renkli bantlar, küçük yaprak, kısa boğum (rozetleşme).',
    toprakta: 'İç Anadolu başta olmak üzere kireçli topraklarımızın yaklaşık yarısında çinko yetersizdir (Çakmak ve ark.).',
    alimiBozan: 'Kireç, yüksek pH, fazla fosfor, soğuk ve ıslak ilkbahar.',
    neZaman: 'Ekimde çinkolu taban gübresiyle; tahıllarda kardeşlenmede ve sapa kalkmada yapraktan.',
    fazlasi: 'Normal dozlarda görülmez; çok yüksek dozda demir alımını azaltır.',
    urunler: ['EDTA Zn-Mn', 'NPK 20.20.0+Zn', 'NPK 15-30-15+Zn', 'KOMBİ'],
  },
  {
    sembol: 'Mn', ad: 'Mangan', atomNo: 25, grup: 'mikro', renk: '#8a5a44', resim: '/besin/mn.webp',
    alinanSekil: 'Mangan iyonu (Mn²⁺)',
    kisa: 'Fotosentezde suyu parçalayan enzimin parçası.',
    gorevler: ['Fotosentezde suyu parçalayıp oksijen açığa çıkaran sistemde görev alır', 'Kök ve yaprakta hastalığa karşı savunmayı güçlendirir'],
    hareket: 'hareketsiz',
    noksanlikYeri: 'Genç-orta yapraklarda damar arası benekli sarılık; arpada gri benekler.',
    toprakta: 'Yüksek pH ve organik maddesi yüksek, gevşek topraklarda eksilir.',
    alimiBozan: 'Kireç, aşırı kireçleme, kuru ve havalı toprak.',
    neZaman: 'Belirti görülür görülmez yapraktan; tahıllarda erken ilkbaharda.',
    fazlasi: 'Asit ve su basmış topraklarda zehirlenme yapabilir; demir alımını azaltır.',
    urunler: ['EDTA Zn-Mn', 'KOMBİ'],
  },
  {
    sembol: 'Cu', ad: 'Bakır', atomNo: 29, grup: 'mikro', renk: '#b87333', resim: '/besin/cu.webp',
    alinanSekil: 'Bakır iyonu (Cu²⁺)',
    kisa: 'Sağlam doku ve dolu başak için az ama gerekli.',
    gorevler: ['Odunlaşma (lignin) yapımında görev alır, sapı güçlendirir', 'Polen verimliliği ve tane bağlama için gerekir'],
    hareket: 'az hareketli',
    noksanlikYeri: 'Genç yaprak uçlarında solgunluk ve kıvrılma; tahılda boş başak.',
    toprakta: 'Organik maddesi çok yüksek (turba) ve kumlu topraklarda eksik olabilir; çoğu tarlada yeterlidir.',
    alimiBozan: 'Organik maddeye sıkı bağlanır; fazla azot ve fosfor ihtiyacı artırır.',
    neZaman: 'Yalnızca analizde düşükse veya belirti varsa, mikro element karışımlarıyla yapraktan.',
    fazlasi: 'Bakırlı ilaçların yıllarca kullanıldığı bağ ve bahçelerde toprakta birikip köke zarar verebilir.',
    urunler: ['NPK 20-20-20+ME'],
  },
  {
    sembol: 'B', ad: 'Bor', atomNo: 5, grup: 'mikro', renk: '#c0567a', resim: '/besin/b.webp',
    alinanSekil: 'Borik asit (H₃BO₃)',
    kisa: 'Çiçeklenmenin ve meyve tutumunun elementi.',
    gorevler: ['Polen çimlenmesi ve polen borusunun uzaması için gerekir', 'Hücre duvarına sağlamlık verir', 'Şekerin taşınmasına yardım eder'],
    hareket: 'hareketsiz',
    noksanlikYeri: 'Büyüme uçlarında: uç sürgünün ölmesi, pancarda kalp çürüklüğü, ayçiçeğinde tabla bozukluğu, meyvede çatlama.',
    toprakta: 'Suyla yıkanır; kumlu topraklarda ve yağışlı yıllarda azalır.',
    alimiBozan: 'Kuraklık (bor kökten suyla gelir), yüksek pH ve kireç.',
    neZaman: 'Çiçeklenmeden hemen önce ve çiçeklenme başında yapraktan; pancar ve ayçiçeğinde mutlaka.',
    fazlasi: 'Yeterli ile zehirli doz arası çok dardır; fazlası yaprak kenarlarını yakar. Bazı sulama sularında bor yüksektir.',
    urunler: ['N-CALBOR', 'KOMBİ'],
  },
  {
    sembol: 'Mo', ad: 'Molibden', atomNo: 42, grup: 'mikro', renk: '#9a6fa0', resim: '/besin/mo.webp',
    alinanSekil: 'Molibdat (MoO₄²⁻)',
    kisa: 'Baklagillerin havadan azot almasının gizli ortağı.',
    gorevler: ['Bezelye, nohut, fasulye köklerindeki nodüllerde havadan azot bağlanmasını sağlar', 'Bitkinin nitratı kullanabilmesi için gerekir'],
    hareket: 'az hareketli',
    noksanlikYeri: 'Azot noksanlığına benzer genel sararma; karnabaharda yaprağın şeritleşmesi.',
    toprakta: 'Diğer mikro besinlerin tersine asit toprakta azalır, kireçli toprakta yeterlidir.',
    alimiBozan: 'Asit toprak (pH < 5,5) ve fazla sülfat.',
    neZaman: 'Asit topraklarda baklagillerde tohum uygulaması veya erken dönemde yapraktan; çok az miktar yeter.',
    fazlasi: 'Bitkiye zarar vermez ama çok yüksek olursa onu yiyen hayvanlarda sorun çıkarabilir.',
    urunler: ['NPK 20-20-20+ME'],
  },
  {
    sembol: 'Cl', ad: 'Klor', atomNo: 17, grup: 'mikro', renk: '#3f9a8c', resim: '/besin/cl.webp',
    alinanSekil: 'Klorür (Cl⁻)',
    kisa: 'Yaprak gözeneklerinin açılıp kapanmasına yardım eder.',
    gorevler: ['Gözeneklerin açılıp kapanmasında potasyumla birlikte çalışır', 'Fotosentezde suyun parçalanmasına yardım eder', 'Hücrenin su dengesini korur'],
    hareket: 'hareketli',
    noksanlikYeri: 'Tarlada çok nadir görülür; yaprak uçlarında solgunluk ve bronzlaşma.',
    toprakta: 'Suda kolayca çözünür ve yıkanır. Yağmur, sulama suyu ve gübrelerle (potasyum klorür) zaten fazlasıyla gelir.',
    alimiBozan: 'Nitrat ve sülfatla yarışır; eksiklikten çok fazlalığı önemlidir.',
    neZaman: 'Ayrıca verilmez. Tuzlu toprakta ve tuzlu suyla sulanan tarlada klorlu gübreden kaçınılır.',
    fazlasi: 'Tuzluluğun bir parçasıdır: yaprak kenarlarını yakar. Tütün, patates, üzüm ve meyve ağaçları klora hassastır; bunlarda potasyum klorür yerine potasyum sülfat tercih edilir.',
    urunler: [],
  },
  {
    sembol: 'Ni', ad: 'Nikel', atomNo: 28, grup: 'mikro', renk: '#7d9a7a', resim: '/besin/ni.webp',
    alinanSekil: 'Nikel iyonu (Ni²⁺)',
    kisa: 'Ürenin bitki içinde parçalanmasını sağlayan enzimin parçası.',
    gorevler: ['Üreyi parçalayan üreaz enziminin merkezinde bulunur', 'Azotun bitki içinde kullanılmasına yardım eder', 'Baklagillerde nodül çalışmasını destekler'],
    hareket: 'hareketli',
    noksanlikYeri: 'Çok nadir; yaprak uçlarında üre birikmesine bağlı koyu kahverengi ölü lekeler.',
    toprakta: 'Çok küçük miktarda gerekir; tarım topraklarının çoğunda yeterli bulunur.',
    alimiBozan: 'Yüksek pH ve kireç; fazla çinko, bakır ve demir alımını azaltır.',
    neZaman: 'Ayrıca verilmez. Analizde düşük çıkarsa ve bitki üreyle besleniyorsa ziraat mühendisinizle değerlendirin.',
    fazlasi: 'Serpantin kayalı bölgelerde ve bazı atık çamurlarda yüksek olabilir; fazlası zehirlidir.',
    urunler: [],
  },
  {
    sembol: 'Si', ad: 'Silisyum', atomNo: 14, grup: 'faydali', renk: '#4f8fa8', resim: '/besin/si.webp',
    alinanSekil: 'Silisik asit (H₄SiO₄)',
    kisa: 'Yaprağa cam gibi bir zırh: dik duruş ve dayanıklılık.',
    gorevler: ['Yaprak ve sap yüzeyinde ince bir silika katmanı oluşturur', 'Yatmaya, kuraklığa, mantar ve böceğe dayanımı artırır', 'Çeltik, buğday ve arpada çok miktarda birikir'],
    hareket: 'hareketsiz',
    noksanlikYeri: 'Belirgin belirtisi yoktur; yumuşak, yatmaya ve hastalığa yatkın bitki.',
    toprakta: 'Toprakta çok bol bulunur ama bitkinin alabileceği şekli sınırlıdır.',
    alimiBozan: 'Çok ayrışmış, kumlu ve organik topraklarda alınabilir silisyum azdır.',
    neZaman: 'Zorunlu değil; stres ve hastalık baskısının yüksek olduğu yıllarda destek olarak.',
    fazlasi: 'Bilinen bir zararı yoktur.',
    urunler: [],
  },
];

export function besinBul(sembol: string | undefined | null) {
  if (!sembol) return undefined;
  return BESINLER.find((b) => b.sembol.toLowerCase() === sembol.toLowerCase());
}

/** Bitkinin havadan ve sudan aldığı üç element (gübreyle verilmez) */
export const HAVA_SU = [
  { sembol: 'C', ad: 'Karbon', kaynak: 'Havadaki karbondioksitten' },
  { sembol: 'H', ad: 'Hidrojen', kaynak: 'Sudan' },
  { sembol: 'O', ad: 'Oksijen', kaynak: 'Hava ve sudan' },
];

/** Gübre etiketinde fosfor P₂O₅, potasyum K₂O olarak yazılır. Element hâline çevirme katsayıları. */
export const P2O5_P = 0.436;
export const K2O_K = 0.83;

/** Azotun toprakta dönüşümü (ılık, nemli toprakta yaklaşık süreler) */
export const AZOT_YOLU = [
  { ad: 'Üre', formul: 'CO(NH₂)₂', sure: '', not: 'Torbadan toprağa' },
  { ad: 'Amonyum', formul: 'NH₄⁺', sure: '2–7 gün', not: 'Toprağa tutunur, kolay yıkanmaz' },
  { ad: 'Nitrat', formul: 'NO₃⁻', sure: '1–3 hafta', not: 'Bitki en çok bunu alır; suyla yıkanır' },
];
