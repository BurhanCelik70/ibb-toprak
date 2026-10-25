/**
 * Türkiye'nin 81 ili, coğrafi bölgeleri ve bölgelerin GENEL toprak/iklim eğilimleri.
 * Yapay zekâ yorumuna bağlam olarak verilir; tarladaki analiz değerleri her zaman önceliklidir.
 * Bilgiler genel eğilimdir ("genellikle"); aynı il içinde bile topraklar çok değişebilir.
 */

export type Bolge = 'Marmara' | 'Ege' | 'Akdeniz' | 'İç Anadolu' | 'Karadeniz' | 'Doğu Anadolu' | 'Güneydoğu Anadolu';

const BOLGE_ILLERI: Record<Bolge, string[]> = {
  Marmara: ['Balıkesir', 'Bilecik', 'Bursa', 'Çanakkale', 'Edirne', 'İstanbul', 'Kırklareli', 'Kocaeli', 'Sakarya', 'Tekirdağ', 'Yalova'],
  Ege: ['Afyonkarahisar', 'Aydın', 'Denizli', 'İzmir', 'Kütahya', 'Manisa', 'Muğla', 'Uşak'],
  Akdeniz: ['Adana', 'Antalya', 'Burdur', 'Hatay', 'Isparta', 'Kahramanmaraş', 'Mersin', 'Osmaniye'],
  'İç Anadolu': ['Aksaray', 'Ankara', 'Çankırı', 'Eskişehir', 'Karaman', 'Kayseri', 'Kırıkkale', 'Kırşehir', 'Konya', 'Nevşehir', 'Niğde', 'Sivas', 'Yozgat'],
  Karadeniz: [
    'Amasya', 'Artvin', 'Bartın', 'Bayburt', 'Bolu', 'Çorum', 'Düzce', 'Giresun', 'Gümüşhane',
    'Karabük', 'Kastamonu', 'Ordu', 'Rize', 'Samsun', 'Sinop', 'Tokat', 'Trabzon', 'Zonguldak',
  ],
  'Doğu Anadolu': ['Ağrı', 'Ardahan', 'Bingöl', 'Bitlis', 'Elazığ', 'Erzincan', 'Erzurum', 'Hakkari', 'Iğdır', 'Kars', 'Malatya', 'Muş', 'Tunceli', 'Van'],
  'Güneydoğu Anadolu': ['Adıyaman', 'Batman', 'Diyarbakır', 'Gaziantep', 'Kilis', 'Mardin', 'Siirt', 'Şanlıurfa', 'Şırnak'],
};

/** Alfabetik 81 il */
export const ILLER: string[] = Object.values(BOLGE_ILLERI)
  .flat()
  .sort((a, b) => a.localeCompare(b, 'tr'));

export const ilBolgesi = (il?: string | null): Bolge | undefined =>
  il ? (Object.keys(BOLGE_ILLERI) as Bolge[]).find((b) => BOLGE_ILLERI[b].includes(il)) : undefined;

type BolgeOzellik = { iklim: string; toprak: string; dikkat: string[] };

export const BOLGE_OZELLIKLERI: Record<Bolge, BolgeOzellik> = {
  Marmara: {
    iklim: 'Ilıman geçiş iklimi; yağış çoğunlukla kış ve ilkbaharda, yazlar sıcak ve kurak geçebilir.',
    toprak: 'Trakya ve güney Marmara ovalarında genellikle killi-tınlı, pH nötr ile hafif alkali arası topraklar; kuzeyde ormanlık kesimlerde hafif asidik topraklar görülebilir.',
    dikkat: ['Killi topraklarda yağışlı dönemde su birikmesi ve sıkışma', 'Yaz kuraklığında ikinci ürün ve sebzede sulama ihtiyacı'],
  },
  Ege: {
    iklim: 'Kıyıda Akdeniz iklimi (sıcak-kurak yaz, ılık-yağışlı kış); iç Ege (Afyon, Kütahya, Uşak) daha karasal.',
    toprak: 'Gediz ve Menderes ovalarında verimli alüvyal topraklar; iç kesimlerde genellikle kireçli, pH hafif-orta alkali topraklar.',
    dikkat: ['Yaz aylarında sulama olmadan verim düşer', 'Ova tabanlarında ve delta kesimlerinde drenaj yetersizliği ve tuzlanma riski', 'Kireçli topraklarda demir ve çinko alım sorunu'],
  },
  Akdeniz: {
    iklim: 'Sıcak ve kurak yaz, ılık ve yağışlı kış; kıyıda yüksek nem. Göller yöresi (Isparta, Burdur) daha karasal.',
    toprak: 'Çukurova ve kıyı ovalarında verimli alüvyal, çoğunlukla kireçli ve pH 7,5 üzeri topraklar.',
    dikkat: ['Yüksek kireç nedeniyle demir (yaprakta sararma), çinko ve fosfor alım sorunu', 'Seralarda yoğun gübrelemeyle tuz birikimi (EC yükselmesi)', 'Yaz sıcağında bitki stresi'],
  },
  'İç Anadolu': {
    iklim: 'Karasal ve yarı kurak; yazlar sıcak-kurak, kışlar soğuk. Yağış az, ilkbahar geç donları görülür.',
    toprak: 'Genellikle kireçli ve alkali (pH çoğunlukla 7,8 üzeri), organik maddesi düşük topraklar. Konya kapalı havzası ve Tuz Gölü çevresinde tuzlu-alkali alanlar bulunur.',
    dikkat: [
      'Çinko eksikliği tahıllarda yaygındır',
      'Kireç nedeniyle fosfor, demir ve çinko alımı zorlaşır',
      'Organik madde düşüklüğü suyu tutmayı zorlaştırır',
      'Yeraltı suyu azalıyor: damla/yağmurlama ile su tasarrufu önemli',
      'İlkbahar geç donu ve yaz kuraklığı riski',
    ],
  },
  Karadeniz: {
    iklim: 'Kıyıda bol yağışlı ve nemli, her mevsim yağış; iç kesimler (Tokat, Amasya, Çorum) daha karasal.',
    toprak: 'Doğu Karadeniz kıyı kuşağında yoğun yağışla yıkanmış, genellikle asidik (pH 4–5,5) topraklar; iç kesimlerde nötr ile hafif alkali topraklar.',
    dikkat: ['Asidik topraklarda kalsiyum, magnezyum ve fosfor alımı düşer; kireçleme gerekebilir', 'Yoğun yağışla besin yıkanması', 'Eğimli arazide erozyon'],
  },
  'Doğu Anadolu': {
    iklim: 'Sert karasal; uzun-soğuk kış, kısa yetişme dönemi, yüksek rakım.',
    toprak: 'Yayla ve meralarda organik maddesi görece yüksek topraklar; ova ve vadilerde (Malatya, Elazığ) kireçli topraklar. Iğdır ovasında tuzlu-sodik alanlar bulunur.',
    dikkat: ['Kısa yetişme dönemi: ekim ve gübreleme zamanlaması kritik', 'Geç ilkbahar ve erken sonbahar donları', 'Bazı ovalarda tuzluluk ve drenaj sorunu'],
  },
  'Güneydoğu Anadolu': {
    iklim: 'Çok sıcak ve kurak yaz, ılık-yağışlı kış; yaz sıcakları 40 °C’yi aşabilir.',
    toprak: 'Genellikle ağır killi, kireçli ve alkali (pH 7,5–8,5) topraklar; organik madde çoğunlukla düşük.',
    dikkat: [
      'Aşırı sulamada taban suyu yükselir ve tuzlanma başlar (özellikle Harran Ovası)',
      'Kireç nedeniyle fosfor, demir ve çinko alım sorunu',
      'Yaz sıcağında yoğun bitki stresi ve yüksek su ihtiyacı',
      'Ağır killi toprakta sıkışma ve çatlama',
    ],
  },
};

/** Bölge genel bilgisinin ötesinde bilinen il özellikleri */
const IL_NOTLARI: Record<string, string> = {
  Konya: 'Kapalı havza; yağış az (yıllık ~300–350 mm), yeraltı suyu hızla düşüyor. Topraklar genellikle kireçli-alkali, organik madde düşük; ova tabanında tuzluluk görülebilir. Tahılda çinko eksikliği yaygın.',
  Karaman: 'Konya kapalı havzasının parçası; kireçli-alkali, organik maddesi düşük topraklar, yarı kurak iklim ve sınırlı su.',
  Aksaray: 'Tuz Gölü havzasına yakın; tuzlu-alkali alanlar görülebilir, yarı kurak iklim.',
  Niğde: 'Yüksek rakımlı yarı kurak ova; kireçli topraklar, patates ve elma yoğun.',
  Eskişehir: 'Karasal iklim; Porsuk ovasında alüvyal, çevresinde kireçli topraklar.',
  Şanlıurfa: 'Harran Ovası: ağır killi, kireçli-alkali topraklar. GAP sulamasıyla aşırı sulama yapılan yerlerde taban suyu yükselmesi ve tuzlanma önemli bir sorun; damla sulama ve drenaj önerilir.',
  Diyarbakır: 'Kireçli, killi kırmızı-kahverengi topraklar; çok sıcak yaz.',
  Mardin: 'Kireçli topraklar, Mardin eşiğinin güneyinde sıcak ve kurak ova.',
  Iğdır: 'Düşük rakımlı, ılıman mikroklima; ovada tuzlu-sodik topraklar ve drenaj sorunu yaygın.',
  Rize: 'Çok yağışlı; topraklar belirgin asidik (çoğunlukla pH 4–5), çay tarımı. Kireçleme ve dengeli gübreleme önemli.',
  Trabzon: 'Bol yağışlı; asidik topraklar, eğimli arazi ve erozyon riski. Fındık ve çay.',
  Artvin: 'Bol yağışlı ve dağlık; asidik topraklar, eğim nedeniyle erozyon riski.',
  Giresun: 'Fındık bölgesi; yağışla yıkanmış asidik topraklar, eğimli arazi.',
  Ordu: 'Fındık bölgesi; asidik topraklar, eğimli arazi.',
  Adana: 'Çukurova: derin, verimli alüvyal ve kireçli topraklar; pamuk, mısır, narenciye. Kireç kaynaklı demir/çinko eksikliği görülebilir.',
  Mersin: 'Kıyıda narenciye ve seracılık; kireçli topraklar, seralarda tuz birikimi riski.',
  Antalya: 'Türkiye’nin sera merkezi; seralarda yoğun gübreleme ile tuz birikimi (EC yükselmesi) sık görülür, kireçli topraklar.',
  Hatay: 'Amik Ovası: verimli alüvyal, kireçli topraklar; drenaj sorunlu alanlar olabilir.',
  Malatya: 'Kayısı merkezi; kireçli topraklar, ilkbahar geç donları kayısıda büyük risk.',
  Manisa: 'Gediz ovası; üzüm ve sebze, verimli alüvyal topraklar, yaz sulaması şart.',
  Aydın: 'Büyük Menderes ovası; incir, pamuk, zeytin; ova tabanında yer yer tuzluluk ve drenaj sorunu.',
  İzmir: 'Küçük Menderes ve Gediz ovaları; verimli alüvyal topraklar, sıcak-kurak yaz.',
  Bursa: 'Verimli ovalar; sebze, meyve, zeytin; ılıman iklim.',
  Edirne: 'Ergene ve Meriç havzası; çeltik ve ayçiçeği, killi topraklar.',
  Tekirdağ: 'Trakya: buğday-ayçiçeği münavebesi, killi-tınlı topraklar.',
  Samsun: 'Bafra ve Çarşamba ovaları: verimli alüvyal topraklar, nemli iklim.',
  Ankara: 'Yarı kurak karasal iklim; kireçli-alkali, organik maddesi düşük topraklar.',
  Kayseri: 'Yarı kurak, yüksek rakımlı; kireçli topraklar, geç donlar.',
  Sivas: 'Sert karasal iklim; kireçli topraklar, kısa yetişme dönemi.',
};

export type BolgeBilgisi = { il: string; ilce?: string; bolge: Bolge; iklim: string; toprak: string; dikkat: string[]; ilNotu?: string };

export function bolgeBilgisi(il?: string | null, ilce?: string | null): BolgeBilgisi | undefined {
  const bolge = ilBolgesi(il);
  if (!il || !bolge) return undefined;
  return { il, ilce: ilce || undefined, bolge, ...BOLGE_OZELLIKLERI[bolge], ilNotu: IL_NOTLARI[il] };
}

/** Serbest metinde (adres, rapor başlığı) geçen ili bulur. */
export function ilBul(metin?: string | null): string | undefined {
  if (!metin) return undefined;
  const t = metin.toLocaleLowerCase('tr-TR');
  // Uzun adları önce dene (ör. "Afyonkarahisar" "Afyon"dan önce)
  return [...ILLER].sort((a, b) => b.length - a.length).find((il) => t.includes(il.toLocaleLowerCase('tr-TR')));
}
