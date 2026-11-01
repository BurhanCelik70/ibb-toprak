/**
 * Yaygın bitki hastalıkları kataloğu (bilgilendirme amaçlı; İLAÇ ÖNERİSİ YOK).
 * Her kartın resmi: public/hastalik/<id>.webp
 * "benzer": görünüşü karışabilen besin noksanlığı kartları (lib/noksanliklar.ts id'leri).
 * Kaynak: Tarım ve Orman Bakanlığı il müdürlükleri ve araştırma enstitülerinin hastalık duyuruları; genel bitki koruma bilgisi.
 */
export type Hastalik = {
  id: string;
  bitki: string; // noksanlık kataloğundaki bitki adıyla aynı
  ad: string;
  etmen: string; // hastalık etmeni (bilimsel ad)
  tur: 'Mantar' | 'Oomiset (mildiyö)' | 'Bakteri' | 'Virüs';
  kisa: string;
  belirtiler: string[];
  kosullar: string; // hangi koşullarda çıkar / yayılır
  onlemler: string[]; // kültürel önlemler (ilaçsız)
  noksanliktanFarki: string;
  benzer: string[];
};

export const HASTALIKLAR: Hastalik[] = [
  {
    id: 'bugday-sari-pas',
    bitki: 'Buğday',
    ad: 'Sarı pas',
    etmen: 'Puccinia striiformis',
    tur: 'Mantar',
    kisa: 'Yaprakta damarlar boyunca sıra sıra dizilmiş sarı-turuncu toz kabarcıklar.',
    belirtiler: [
      'Yaprak üzerinde damarlar arasında, çizgi hâlinde dizilmiş limon sarısı-turuncu küçük kabarcıklar (püstül).',
      'Kabarcıklara parmakla sürtünce sarı toz bırakır.',
      'Ağır durumda yapraklar sararıp kurur, bayrak yaprak etkilenirse tane cılız kalır.',
    ],
    kosullar: 'Serin (10–15 °C) ve nemli ilkbahar havasında, çiyli sabahlarda hızla yayılır. Rüzgârla uzak tarlalara taşınır.',
    onlemler: ['Dayanıklı çeşit ekin; bölgenizde önerilen çeşitleri il müdürlüğünden öğrenin.', 'Aşırı ve geç azotlu gübrelemeden kaçının; sık ekim hastalığı artırır.', 'İlkbaharda tarlayı haftada bir gezin; bayrak yaprağa ulaşmadan fark etmek önemlidir.'],
    noksanliktanFarki: 'Azot ve kükürt noksanlığında yaprak düzgün ve toz bırakmadan sararır; sarı pasta ise yaprak üzerinde sürtünce toz bırakan kabarcık çizgileri vardır.',
    benzer: ['bugday-n', 'bugday-s'],
  },
  {
    id: 'bugday-septorya',
    bitki: 'Buğday',
    ad: 'Septorya yaprak lekesi',
    etmen: 'Zymoseptoria tritici',
    tur: 'Mantar',
    kisa: 'Alt yapraklarda kahverengi, içinde siyah noktacıklar olan lekeler.',
    belirtiler: [
      'Önce alt yapraklarda sarımsı, sonra kahverengi düzensiz lekeler; lekeler damarlarla sınırlanır.',
      'Lekelerin içinde büyüteçle görülen küçük siyah noktacıklar (mantarın üreme organları).',
      'Yağmurla alttan üste doğru ilerler.',
    ],
    kosullar: 'Ilık ve yağışlı havada, yağmur damlalarının sıçramasıyla yayılır. Anızı tarlada kalan ve üst üste buğday ekilen tarlalarda daha çoktur.',
    onlemler: ['Ekim nöbeti uygulayın; buğdaydan sonra yine buğday ekmeyin.', 'Hastalıklı anızı toprağa karıştırın.', 'Çok erken ve çok sık ekimden kaçının.'],
    noksanliktanFarki: 'Çinko noksanlığında ölü lekeler yaprağın ortasında toplanır, yaprak ortadan kırılır ve içinde siyah noktacık yoktur.',
    benzer: ['bugday-zn', 'bugday-k'],
  },
  {
    id: 'misir-yaprak-yanikligi',
    bitki: 'Mısır (dane)',
    ad: 'Yaprak yanıklığı',
    etmen: 'Exserohilum turcicum',
    tur: 'Mantar',
    kisa: 'Yapraklarda puro biçiminde, 5–15 cm uzunluğunda gri-kahverengi lekeler.',
    belirtiler: [
      'Yapraklarda uzun, elips (puro) biçimli, gri-yeşil sonra açık kahverengi lekeler.',
      'Lekeler önce alt yapraklarda başlar, yukarı çıkar; birleşince yaprak yanmış gibi görünür.',
      'Nemli havada lekelerin üzerinde koyu gri küf tabakası.',
    ],
    kosullar: 'Ilık (18–27 °C), uzun süre yaprak ıslaklığı olan, çiyli ve yağışlı dönemlerde yayılır. Hastalıklı bitki artıkları kaynaktır.',
    onlemler: ['Dayanıklı çeşit (hibrit) seçin.', 'Ekim nöbeti yapın, bitki artıklarını toprağa gömün.', 'Yağmurlamada akşam geç saatte sulamayın; yaprakların uzun süre ıslak kalmasını önleyin.'],
    noksanliktanFarki: 'Potasyum noksanlığı yaprak kenarından düzgün bir yanıklık yapar; yaprak yanıklığında ise yaprağın ortasında ayrı ayrı puro biçimli lekeler olur.',
    benzer: ['misir-k', 'misir-n'],
  },
  {
    id: 'pancar-cercospora',
    bitki: 'Şeker pancarı',
    ad: 'Cercospora yaprak lekesi',
    etmen: 'Cercospora beticola',
    tur: 'Mantar',
    kisa: 'Yaşlı yapraklarda ortası kül grisi, kenarı kırmızı-mor küçük yuvarlak lekeler.',
    belirtiler: [
      '2–4 mm büyüklüğünde, ortası kül grisi, kenarı kırmızımsı-mor halkalı yuvarlak lekeler.',
      'Lekeler çoğalıp birleşince yaprak kahverengileşip kurur; bitki yeni yaprak çıkardıkça şeker oranı düşer.',
      'Belirti önce dış (yaşlı) yapraklarda başlar.',
    ],
    kosullar: 'Sıcak (25–35 °C) ve nemli yaz günlerinde, özellikle yağmurlama sulanan ve sık ekilen tarlalarda hızla yayılır.',
    onlemler: ['Pancarı aynı tarlaya en az 3–4 yıl arayla ekin.', 'Hasat sonrası yaprak artıklarını toprağa gömün.', 'Tolerant çeşit kullanın; şeker fabrikasının uyarılarını takip edin.'],
    noksanliktanFarki: 'Mangan noksanlığında benekler sarıdır ve kenarlarında kırmızı-mor halka olmaz; magnezyum noksanlığında ise sararma yaprak kenarından içe doğru yayılır.',
    benzer: ['pancar-mn', 'pancar-mg'],
  },
  {
    id: 'aycicegi-mildiyo',
    bitki: 'Ayçiçeği',
    ad: 'Mildiyö',
    etmen: 'Plasmopara halstedii',
    tur: 'Oomiset (mildiyö)',
    kisa: 'Bodur bitki, yaprakta damar boyunca sararma ve alt yüzde beyaz küf.',
    belirtiler: [
      'Genç bitkiler bodur kalır, boğum araları kısalır.',
      'Yapraklarda yaprak sapından başlayıp damarlar boyunca yayılan açık sarı-yeşil renk açılması.',
      'Nemli havada yaprağın ALT yüzünde beyaz, pamuksu küf tabakası; tabla küçük ve dik kalır.',
    ],
    kosullar: 'Ekimden sonra toprak soğuk ve çok ıslakken (yoğun yağış, göllenme) kökten bulaşır. Etmen toprakta uzun yıllar yaşar.',
    onlemler: ['Dayanıklı çeşit ve sertifikalı tohum kullanın.', 'Ayçiçeğini aynı tarlaya 4–5 yıldan önce ekmeyin.', 'Su tutan, drenajı kötü tarlalarda ekimi geciktirin; hastalıklı bitkileri söküp tarladan çıkarın.'],
    noksanliktanFarki: 'Besin noksanlığında yaprağın alt yüzünde beyaz küf olmaz; mildiyöde bitki bodurlaşır ve yaprak altı tüylenir.',
    benzer: ['aycicegi-n', 'aycicegi-mg'],
  },
  {
    id: 'pamuk-solgunluk',
    bitki: 'Pamuk',
    ad: 'Verticillium solgunluğu',
    etmen: 'Verticillium dahliae',
    tur: 'Mantar',
    kisa: 'Yapraklarda kaplan postu gibi sarı-kahverengi alacalanma, kesilen gövdede kahverengi damar.',
    belirtiler: [
      'Yapraklarda damarlar arasında ve kenarlarda sararma, sonra kahverengileşme (kaplan postu görünümü).',
      'Yapraklar solar ve dökülür; çoğu zaman bitkinin bir tarafı daha çok etkilenir.',
      'Gövde ya da dal kesildiğinde iletim dokusunda kahverengi renk değişimi.',
    ],
    kosullar: 'Toprak kaynaklıdır; serin geçen yazlarda ve aşırı sulanan, fazla azot verilen tarlalarda belirginleşir. Etmen toprakta yıllarca canlı kalır.',
    onlemler: ['Tolerant çeşit kullanın.', 'Hububatla ekim nöbeti yapın; domates, patates, patlıcan gibi konukçulardan sonra pamuk ekmeyin.', 'Aşırı sulama ve fazla azottan kaçının; hastalıklı bitki artıklarını tarlada bırakmayın.'],
    noksanliktanFarki: 'Potasyum noksanlığında da yapraklar bronzlaşır, ama gövde kesildiğinde iletim dokusu temiz ve beyazdır; solgunlukta kahverengidir.',
    benzer: ['pamuk-k', 'pamuk-mg'],
  },
  {
    id: 'patates-mildiyo',
    bitki: 'Patates',
    ad: 'Mildiyö (geç yanıklık)',
    etmen: 'Phytophthora infestans',
    tur: 'Oomiset (mildiyö)',
    kisa: 'Yapraklarda su emmiş gibi koyu lekeler, kenarında beyaz küf; çok hızlı yayılır.',
    belirtiler: [
      'Yaprak uç ve kenarlarında su emmiş gibi, hızla büyüyen koyu kahverengi-siyah lekeler.',
      'Nemli sabahlarda lekenin kenarında, yaprağın alt yüzünde beyaz küf halkası.',
      'Gövdede kahverengi lekeler; yumruda kabuk altında pas renkli kuru çürüklük.',
    ],
    kosullar: 'Serin geceler (10–15 °C) ve ılık günlerle birlikte uzun süren nem, sis, yağmur ya da yağmurlama sonrasında birkaç günde bütün tarlayı sarabilir.',
    onlemler: ['Sağlıklı, sertifikalı tohumluk kullanın.', 'Boğaz doldurmayı iyi yapın; yumrular toprakla örtülü kalsın.', 'Yağmurlamayı akşam yapmayın; hastalıklı bitkileri ve atılan yumru yığınlarını imha edin.'],
    noksanliktanFarki: 'Besin noksanlığında lekeler yavaş ilerler ve küf olmaz; mildiyö birkaç günde yayılır ve leke kenarında beyaz küf görülür.',
    benzer: ['patates-k', 'patates-mg'],
  },
  {
    id: 'domates-erken-yaniklik',
    bitki: 'Domates',
    ad: 'Erken yanıklık (Alternaria)',
    etmen: 'Alternaria solani',
    tur: 'Mantar',
    kisa: 'Alt yapraklarda iç içe halkalı (hedef tahtası gibi) kahverengi lekeler.',
    belirtiler: [
      'Önce alt (yaşlı) yapraklarda, iç içe halkalar içeren koyu kahverengi lekeler; çevresinde sarı hale.',
      'Lekeler büyüyüp birleşince yaprak sararır ve dökülür, belirti yukarı çıkar.',
      'Meyvenin sap çevresinde de çökük, halkalı koyu lekeler olabilir.',
    ],
    kosullar: 'Ilık-sıcak (24–29 °C) havada, gece çiy ve yağışla yaprakların ıslak kaldığı dönemlerde; zayıf ve yükü fazla bitkilerde daha çok görülür.',
    onlemler: ['Hastalıklı alt yaprakları toplayıp tarladan uzaklaştırın.', 'Sulamayı damla ile yapın, yaprakları ıslatmayın; bitkiler arasında hava akışı olsun.', 'Ekim nöbeti yapın; dengeli gübreleyin, bitkiyi aç bırakmayın.'],
    noksanliktanFarki: 'Potasyum ve magnezyum noksanlığında yaprakta iç içe halkalı leke olmaz; sararma kenardan ya da damarlar arasından düzgün ilerler.',
    benzer: ['domates-k', 'domates-mg'],
  },
  {
    id: 'uzum-kulleme',
    bitki: 'Üzüm (bağ)',
    ad: 'Külleme',
    etmen: 'Erysiphe necator',
    tur: 'Mantar',
    kisa: 'Yaprak, sürgün ve tanelerde kül serpilmiş gibi beyaz-gri toz tabaka.',
    belirtiler: [
      'Yaprakların üst ve alt yüzünde, sürgünlerde beyaz-gri unumsu tabaka; silince altında koyu lekeler kalır.',
      'Taneler unlanmış gibi görünür, büyüme durur ve çatlar; çatlaklardan çürüklük başlar.',
      'Sürgünlerde kahverengi-siyah ağ şeklinde lekeler.',
    ],
    kosullar: 'Yağmur gerektirmez: ılık (20–27 °C), nemli ve gölgeli, havasız omcalarda yayılır. Sık yapraklı, iyi budanmamış bağlarda daha çoktur.',
    onlemler: ['Yeşil budama ve koltuk alma ile salkım bölgesini havalandırın.', 'Aşırı azotlu gübrelemeden kaçının; çok sık yaprak hastalığı artırır.', 'Kışın hastalıklı sürgünleri budayıp bağdan çıkarın.'],
    noksanliktanFarki: 'Besin noksanlığında yaprak yüzeyinde silinebilen toz olmaz; küllemede beyaz tabaka parmakla silinir.',
    benzer: ['uzum-mg', 'uzum-k'],
  },
  {
    id: 'elma-karaleke',
    bitki: 'Elma',
    ad: 'Karaleke',
    etmen: 'Venturia inaequalis',
    tur: 'Mantar',
    kisa: 'Yaprak ve meyvede zeytin yeşili-siyah kadifemsi lekeler, meyvede mantarlaşma ve çatlak.',
    belirtiler: [
      'Yapraklarda zeytin yeşili, sonra kahverengi-siyah, kadife görünümlü yuvarlak lekeler.',
      'Meyvede koyu, sert, mantarımsı lekeler; meyve şekilsizleşir ve çatlar.',
      'Ağır durumda yapraklar erken dökülür.',
    ],
    kosullar: 'İlkbaharda yaprak ve çiçek açarken yağmurlu ve serin (ılık) havada, yerdeki hastalıklı yapraklardan bulaşır.',
    onlemler: ['Sonbaharda dökülen yaprakları toplayıp gömün ya da parçalayın.', 'Taç içini havalandıracak şekilde budayın.', 'Yeni bahçede dayanıklı çeşit tercih edin.'],
    noksanliktanFarki: 'Kalsiyum noksanlığındaki acı benek kabuk altında küçük çökük lekelerdir; karalekede ise lekeler kabuğun üstünde, kadifemsi ve yaprakta da görülür.',
    benzer: ['elma-ca', 'elma-b'],
  },
  {
    id: 'bugday-kahverengi-pas',
    bitki: 'Buğday',
    ad: 'Kahverengi pas',
    etmen: 'Puccinia triticina',
    tur: 'Mantar',
    kisa: 'Yaprağa dağınık serpilmiş, yuvarlak, turuncu-kahverengi toz kabarcıklar.',
    belirtiler: [
      'Yaprağın üst yüzünde 1–2 mm büyüklüğünde, yuvarlak, turuncu-kahverengi kabarcıklar (püstül).',
      'Kabarcıklar sarı pastaki gibi çizgi oluşturmaz, yaprağa dağınık serpilir.',
      'Parmakla sürtünce pas renginde toz bırakır; ağır durumda yaprak erken kurur ve tane cılız kalır.',
    ],
    kosullar: 'Sarı pastan daha sıcak havayı sever (15–22 °C). İlkbahar sonunda, çiyli gecelerin ardından yayılır; sporlar rüzgârla uzaklara taşınır.',
    onlemler: ['Dayanıklı çeşit ekin; bölgenize uygun çeşidi il müdürlüğünden öğrenin.', 'Kendiliğinden çıkan buğdayları (gönüllü bitkiler) temizleyin; hastalığı yazdan sonbahara taşırlar.', 'Aşırı azot ve sık ekimden kaçının; başaklanma öncesi tarlayı düzenli gezin.'],
    noksanliktanFarki: 'Potasyum noksanlığında yaprak kenarı düzgünce kahverengileşir, yüzeyde toz olmaz. Kahverengi pasta ise yaprak yüzeyi toz bırakan küçük kabarcıklarla doludur.',
    benzer: ['bugday-k', 'bugday-n'],
  },
  {
    id: 'arpa-ag-benek',
    bitki: 'Arpa',
    ad: 'Ağ benek lekesi',
    etmen: 'Pyrenophora teres',
    tur: 'Mantar',
    kisa: 'Kahverengi lekelerin içinde birbirini kesen koyu çizgilerden ağ deseni, kenarda sarılık.',
    belirtiler: [
      'Yapraklarda uzunca koyu kahverengi lekeler; lekenin içinde enine ve boyuna koyu çizgilerden oluşan ağ deseni.',
      'Lekelerin çevresi sarıdır; lekeler birleşince yaprak uçtan kurur.',
      'Belirti önce alt yapraklarda başlar, nemli havada üst yapraklara çıkar.',
    ],
    kosullar: 'Serin ve nemli ilkbaharda yayılır. Hastalık tohumla ve tarlada kalan anızla taşınır; üst üste arpa ekilen tarlalarda daha şiddetlidir.',
    onlemler: ['Temiz, sertifikalı tohum kullanın.', 'Ekim nöbeti uygulayın; arpadan sonra yine arpa ekmeyin.', 'Hastalıklı anızı toprağa karıştırın; dayanıklı çeşit tercih edin.'],
    noksanliktanFarki: 'Mangan noksanlığında genç yapraklarda gri-kahverengi küçük benekler olur ve ağ deseni görülmez. Çinko noksanlığında ise lekeler yaprağın ortasında toplanır. Ağ benekte lekenin içindeki ağ çizgileri belirgindir.',
    benzer: ['arpa-mn', 'arpa-zn'],
  },
  {
    id: 'arpa-sari-cucelik',
    bitki: 'Arpa',
    ad: 'Sarı cücelik virüsü',
    etmen: 'Barley yellow dwarf virus (BYDV)',
    tur: 'Virüs',
    kisa: 'Yapraklar uçtan başlayarak parlak sarı-turuncuya döner, bitkiler bodur kalır; tarlada yama yama görülür.',
    belirtiler: [
      'Yapraklar UÇTAN başlayarak tabana doğru parlak sarı ya da turuncu-sarıya döner; bazı yaprak uçları kırmızı-mor renk alır.',
      'Bitkiler çevresindeki sağlıklı bitkilere göre bodur kalır, kardeş ve başak sayısı azalır.',
      'Tarlada yuvarlak yamalar hâlinde görülür; yamaların ortasındaki bitkiler daha ağır etkilenir.',
    ],
    kosullar: 'Virüs yaprak bitleriyle taşınır. Ilık geçen sonbaharda erken ekilen tarlalarda yaprak bitleri bitkileri genç dönemde enfekte eder; kış ılık geçerse sorun büyür.',
    onlemler: ['Sonbaharda çok erken ekimden kaçının; bölgeniz için önerilen ekim zamanına uyun.', 'Tarla kenarındaki ve kendiliğinden çıkan tahıl ve yabani otları temizleyin; virüs ve yaprak bitleri burada barınır.', 'Toleranslı çeşit kullanın; sonbaharda yaprak bitlerini düzenli kontrol edin.'],
    noksanliktanFarki: 'Azot noksanlığında sararma yaşlı yapraklardan başlar, bütün tarlada düzgün görülür ve azotlu gübreden sonra düzelir. Sarı cücelikte sararma yaprak ucundan başlar, tarlada yama yama görülür ve gübreyle düzelmez.',
    benzer: ['arpa-n', 'arpa-p'],
  },
  {
    id: 'misir-pasi',
    bitki: 'Mısır (dane)',
    ad: 'Mısır pası',
    etmen: 'Puccinia sorghi',
    tur: 'Mantar',
    kisa: 'Yaprağın iki yüzünde de uzunca, tarçın rengi toz kabarcıklar.',
    belirtiler: [
      'Yaprağın hem üst hem alt yüzünde uzunca, kabarık, tarçın-kahverengi kabarcıklar (püstül).',
      'Kabarcıklar patlayınca pas renginde toz dökülür; parmakla sürtünce toz bırakır.',
      'Hastalık ilerledikçe kabarcıklar koyulaşır, çok sayıda olursa yaprak sararıp kurur.',
    ],
    kosullar: 'Ilıman sıcaklıkta (16–23 °C) ve yüksek nemde, çiyli gecelerde yayılır. Sporlar rüzgârla uzak mesafelere taşınır; geç ekilen tarlalar daha çok etkilenir.',
    onlemler: ['Dayanıklı ya da toleranslı hibrit seçin.', 'Bölgeniz için uygun zamanda ekin; çok geç ekimden kaçının.', 'Dengeli gübreleyin; aşırı azot yaprağı hastalığa açık hâle getirir.'],
    noksanliktanFarki: 'Potasyum ve azot noksanlığında yaprak kenardan ya da uçtan düzgünce sararır, yüzeyde kabarcık ve toz olmaz. Mısır pasında yaprak yüzeyi tarçın rengi tozlu kabarcıklarla kaplıdır.',
    benzer: ['misir-k', 'misir-n'],
  },
  {
    id: 'misir-cuce-mozaik',
    bitki: 'Mısır (dane)',
    ad: 'Cüce mozaik virüsü',
    etmen: 'Maize dwarf mosaic virus (MDMV)',
    tur: 'Virüs',
    kisa: 'Genç yapraklarda açık ve koyu yeşil, kesik kesik çizgilerden mozaik desen; bitki bodurlaşır.',
    belirtiler: [
      'En genç yapraklarda damarlar boyunca açık yeşil-sarı ve koyu yeşil, kesik kesik çizgilerden oluşan mozaik desen.',
      'Bitki bodur kalır, boğum araları kısalır; koçan küçük ve eksik taneli olabilir.',
      'Hastalıklı bitkiler tarlada tek tek ya da küçük gruplar hâlinde dağınık görülür.',
    ],
    kosullar: 'Virüs yaprak bitleriyle taşınır. Tarla kenarındaki kanyaş (Sorghum halepense) virüsün ana kaynağıdır; geç ekilen tarlalar daha çok etkilenir.',
    onlemler: ['Toleranslı hibrit kullanın.', 'Tarla içindeki ve kenarındaki kanyaşı temizleyin.', 'Bölgeniz için önerilen zamanda ekin; çok geç ekimden kaçının.'],
    noksanliktanFarki: 'Çinko noksanlığında yaprak tabanında, orta damarın iki yanında geniş beyaz-sarı bir şerit olur. Demir noksanlığında genç yaprakta damar araları boydan boya düzgün sararır. Mozaikte ise çizgiler kesik kesik ve düzensizdir, hastalıklı bitkiler tarlada dağınık durur.',
    benzer: ['misir-zn', 'misir-fe'],
  },
  {
    id: 'pancar-kulleme',
    bitki: 'Şeker pancarı',
    ad: 'Külleme',
    etmen: 'Erysiphe betae',
    tur: 'Mantar',
    kisa: 'Yaşlı yaprakların üst yüzünde un serpilmiş gibi beyaz toz tabaka.',
    belirtiler: [
      'Önce yaşlı yaprakların üst yüzünde küçük beyaz lekeler, sonra bütün yaprağı kaplayan un gibi beyaz-gri tabaka.',
      'Beyaz tabaka parmakla silinebilir; altında yaprak sararır.',
      'Ağır durumda yapraklar sararıp kurur, kök verimi ve şeker oranı düşer.',
    ],
    kosullar: 'Yaz sonunda sıcak ve kuru günler ile çiyli serin gecelerin art arda geldiği dönemde hızla yayılır; yağmur gerektirmez.',
    onlemler: ['Toleranslı çeşit kullanın.', 'Ekim nöbeti uygulayın; hasat sonrası yaprak artıklarını toprağa gömün.', 'Dengeli gübreleyin ve düzenli sulayın; susuz kalan bitki daha çabuk hastalanır.'],
    noksanliktanFarki: 'Magnezyum ve azot noksanlığında yaprak sararır ama yüzeyde silinebilen toz olmaz. Küllemede beyaz tabaka parmakla silinir.',
    benzer: ['pancar-mg', 'pancar-n'],
  },
  {
    id: 'pancar-rizomani',
    bitki: 'Şeker pancarı',
    ad: 'Rizomani',
    etmen: 'Beet necrotic yellow vein virus (BNYVV)',
    tur: 'Virüs',
    kisa: 'Soluk sarı-yeşil, dik ve dar yapraklar; kök küçük ve etrafı ince kılcal köklerle sakal gibi.',
    belirtiler: [
      'Yapraklar soluk sarı-yeşil, dar ve uzun saplı olur, dik durur; sıcak saatlerde solar.',
      'Kök küçük kalır ve etrafını ince kılcal köklerden oluşan bir "sakal" sarar.',
      'Kök kesildiğinde iletim demetlerinde kahverengileşme görülür; tarlada yama yama ortaya çıkar.',
    ],
    kosullar: 'Virüs topraktaki mikroskobik bir organizmayla (Polymyxa betae) taşınır ve toprakta uzun yıllar yaşar. Sıcak ve ıslak toprakta, fazla sulanan tarlalarda şiddetlenir; toprakla, makineyle ve sulama suyuyla yayılır.',
    onlemler: ['Rizomaniye dayanıklı çeşit ekin; en etkili önlem budur.', 'Hastalıklı tarladan çıkan makineleri ve aletleri topraktan temizleyin.', 'Ekim nöbeti uygulayın ve aşırı sulamadan kaçının; şeker fabrikasının uyarılarını takip edin.'],
    noksanliktanFarki: 'Azot noksanlığında yapraklar sararır ama kökte "sakal" olmaz ve azotlu gübreyle düzelir. Rizomanide kök küçük ve sakallıdır, gübre vermek sorunu çözmez.',
    benzer: ['pancar-n', 'pancar-mg'],
  },
  {
    id: 'uzum-mildiyo',
    bitki: 'Üzüm (bağ)',
    ad: 'Mildiyö',
    etmen: 'Plasmopara viticola',
    tur: 'Oomiset (mildiyö)',
    kisa: 'Yaprak üstünde sarı yağ lekeleri, altında beyaz küf; taneler kahverengileşip büzülür.',
    belirtiler: [
      'Yaprağın üst yüzünde sarımsı, yağlı görünümlü yuvarlak lekeler ("yağ lekesi").',
      'Lekelerin tam altında, yaprağın alt yüzünde beyaz, pamuksu küf.',
      'Genç salkım ve taneler kahverengileşir, büzülür ve dökülür.',
    ],
    kosullar: 'Yağmurlu ilkbaharda yayılır. Bağcılıkta "10-10-10" diye bilinen koşullar tehlike işaretidir: sıcaklık 10 °C üstünde, 10 mm yağış, sürgünler 10 cm boyda.',
    onlemler: ['Yeşil budama ile omcayı havalandırın; yapraklar çabuk kurusun.', 'Toprağa yakın sürgünleri ve dipten çıkan filizleri alın.', 'Yağışlı dönemde bağı sık kontrol edin; il müdürlüğünün uyarı duyurularını takip edin.'],
    noksanliktanFarki: 'Magnezyum noksanlığında yaşlı yapraklarda damar araları düzgünce sararır ve yaprağın altında küf olmaz. Mildiyöde sarı lekeler yuvarlaktır ve altlarında beyaz küf bulunur.',
    benzer: ['uzum-mg', 'uzum-k'],
  },
  {
    id: 'domates-tswv',
    bitki: 'Domates',
    ad: 'Lekeli solgunluk virüsü (TSWV)',
    etmen: 'Tomato spotted wilt virus',
    tur: 'Virüs',
    kisa: 'Genç yapraklarda bronzlaşma ve küçük koyu lekeler, meyvede sarı halkalar.',
    belirtiler: [
      'Genç yapraklarda bronz-mor renk değişimi ve çok sayıda küçük koyu kahverengi ölü leke.',
      'Yapraklar kıvrılır; bitkinin büyümesi durur ve uç kısmı solar.',
      'Meyvede iç içe açık sarı halkalar ve alacalı renklenme görülür.',
    ],
    kosullar: 'Virüs tripslerle taşınır. Sıcak ve kuru dönemde trips çoğaldığında hızla yayılır; sera ve tarla çevresindeki yabancı otlar virüsün kaynağıdır.',
    onlemler: ['Sağlıklı, sertifikalı fide kullanın; toleranslı çeşit tercih edin.', 'Tarla ve sera çevresindeki yabancı otları temizleyin.', 'Belirti gösteren bitkileri erkenden söküp uzaklaştırın; mavi yapışkan tuzakla tripsi izleyin.'],
    noksanliktanFarki: 'Potasyum ve magnezyum noksanlığı yaşlı yapraklardan başlar, sararma kenardan ya da damar aralarından düzgün ilerler. Lekeli solgunlukta belirti genç yapraklarda başlar; bronzlaşma, koyu benekler ve meyvede halkalar olur.',
    benzer: ['domates-k', 'domates-mg'],
  },
  {
    id: 'domates-mozaik',
    bitki: 'Domates',
    ad: 'Mozaik virüsü',
    etmen: 'Tomato mosaic virus (ToMV)',
    tur: 'Virüs',
    kisa: 'Yapraklarda açık ve koyu yeşil alaca desen, genç yapraklarda buruşma ve daralma.',
    belirtiler: [
      'Yaprakçıklarda açık yeşil-sarı ve koyu yeşil alanlardan oluşan düzensiz alaca (mozaik) desen.',
      'Genç yapraklar buruşur, kıvrılır, daralır; bazen eğrelti otu yaprağı gibi incelir.',
      'Bitki zayıf gelişir, meyve tutumu ve meyve kalitesi düşer.',
    ],
    kosullar: 'Virüs çok dayanıklıdır; tohumla, ellerle, budama makasıyla ve bitki artıklarıyla bitkiden bitkiye bulaşır. Koltuk alma ve bağlama gibi işler sırasında kolayca yayılır.',
    onlemler: ['Sertifikalı tohum ve sağlıklı fide kullanın; dayanıklı çeşit tercih edin.', 'Bitkilerle çalışmadan önce elleri sabunla yıkayın, aletleri sık sık temizleyin; sigara içenler bitkiye dokunmadan önce ellerini mutlaka yıkasın.', 'Hastalıklı bitkileri söküp uzaklaştırın, artıklarını tarlada bırakmayın.'],
    noksanliktanFarki: 'Magnezyum noksanlığında yaşlı yapraklarda damar araları düzgünce sararır. Demir noksanlığında genç yapraklar sararır ama damarlar yeşil kalır ve yaprak buruşmaz. Mozaikte alacalanma düzensizdir, yaprak buruşur ve şekli bozulur.',
    benzer: ['domates-mg', 'domates-fe'],
  },
  {
    id: 'elma-ates-yanikligi',
    bitki: 'Elma',
    ad: 'Ateş yanıklığı',
    etmen: 'Erwinia amylovora',
    tur: 'Bakteri',
    kisa: 'Sürgün ucu çoban değneği gibi kıvrılır; yaprak ve çiçekler yanmış gibi kararır ama dalda kalır.',
    belirtiler: [
      'Çiçek salkımları ve genç sürgünler aniden solup kararır, ateşte yanmış gibi görünür.',
      'Sürgün ucu aşağı doğru kıvrılarak çoban değneği şeklini alır.',
      'Kararan yapraklar ve çiçekler dökülmez, dalda asılı kalır; nemli havada yaralardan yapışkan sıvı sızabilir.',
    ],
    kosullar: 'Çiçeklenme döneminde ılık (18 °C üstü) ve nemli ya da yağmurlu havada yayılır. Bakteri arı ve diğer böceklerle, yağmurla ve budama aletleriyle taşınır; dolu yaraları bulaşmayı artırır.',
    onlemler: ['Hastalıklı sürgünleri, görünen belirtinin 30–40 cm altından kesip bahçeden uzaklaştırın.', 'Budama makasını her kesimden sonra alkolle silin.', 'Aşırı azotlu gübrelemeden kaçının; gördüğünüzde il/ilçe tarım müdürlüğüne haber verin.'],
    noksanliktanFarki: 'Bor noksanlığında sürgün uçları kuruyabilir ama yapraklar kömür gibi kararıp dalda asılı kalmaz. Çinko noksanlığında ise sürgün ucunda küçük yapraklar rozet oluşturur. Ateş yanıklığında kararma hızlıdır ve sürgün ucu çoban değneği gibi kıvrılır.',
    benzer: ['elma-b', 'elma-zn'],
  },
  {
    id: 'keten-solgunluk',
    bitki: 'Keten',
    ad: 'Fusarium solgunluğu',
    etmen: 'Fusarium oxysporum f. sp. lini',
    tur: 'Mantar',
    kisa: 'Bitkiler sararıp solar, uçları sarkar; yapraklar tabandan yukarı kahverengileşir.',
    belirtiler: [
      'Bitkiler sararır ve solar; sürgün uçları aşağı sarkar.',
      'Yapraklar alttan yukarıya doğru kahverengileşip kurur.',
      'Tarlada yama yama görülür; genç bitkiler tamamen ölebilir.',
    ],
    kosullar: 'Toprak kaynaklıdır; etmen toprakta uzun yıllar canlı kalır. Sıcak toprakta ve keten sık aralıklarla aynı tarlaya ekildiğinde şiddetlenir.',
    onlemler: ['Dayanıklı çeşit ve temiz tohum kullanın.', 'Keteni aynı tarlaya uzun aralıklarla (en az 5–6 yıl) ekin.', 'Hastalıklı bitki artıklarını tarlada bırakmayın.'],
    noksanliktanFarki: 'Azot ve demir noksanlığında yapraklar sararır ama bitki solmaz ve uçlar sarkmaz. Fusarium solgunluğunda bitki solar, uçlar sarkar ve tarlada yama yama ölüm görülür.',
    benzer: ['keten-n', 'keten-fe'],
  },
];

export const hastalikGorseli = (id: string) => `/hastalik/${id}.webp`;
export const bitkiHastaliklari = (bitki: string) => HASTALIKLAR.filter((h) => h.bitki === bitki);
export const benzerHastaliklar = (noksanlikId: string) => HASTALIKLAR.filter((h) => h.benzer.includes(noksanlikId));

/** Teşhis sonucundaki hastalık adını katalogla eşleştirir (önce özel adlar, sonra genel adlar) */
const ESLESME: [RegExp, RegExp][] = [
  [/kahverengi pas|yaprak pas|triticina|recondita/, /kahverengi-pas/],
  [/sar[ıi] ?pas|[çc]izgi pas|striiformis/, /sari-pas/],
  [/a[ğg] ?benek|pyrenophora/, /ag-benek/],
  [/sar[ıi] c[üu]celik|bydv/, /sari-cucelik/],
  [/rizomani|bnyvv/, /rizomani/],
  [/c[üu]ce mozaik|mdmv/, /cuce-mozaik/],
  [/lekeli solgunluk|tswv/, /tswv/],
  [/mozaik|tomv|tmv/, /mozaik/],
  [/ate[şs] yan[ıi]kl|erwinia/, /ates-yanikligi/],
  [/mildiy|phytophthora|plasmopara|ge[çc] yan[ıi]kl/, /mildiyo/],
  [/septor/, /septorya/],
  [/pas|puccinia/, /pas/],
  [/yan[ıi]kl|alternaria|turcicum|helminthosporium/, /yanikl/],
  [/cercospora|yaprak lekesi/, /cercospora/],
  [/solgunluk|verticillium|fusarium/, /solgunluk/],
  [/k[üu]lleme|erysiphe/, /kulleme/],
  [/karaleke|venturia/, /karaleke/],
];

export function hastalikBul(bitki: string | undefined, ad: string): Hastalik | undefined {
  if (!bitki) return undefined;
  const a = ad.toLocaleLowerCase('tr-TR');
  const adaylar = HASTALIKLAR.filter((h) => h.bitki === bitki);
  for (const [adRe, idRe] of ESLESME) {
    if (!adRe.test(a)) continue;
    const h = adaylar.find((x) => idRe.test(x.id));
    if (h) return h;
  }
  return undefined;
}
