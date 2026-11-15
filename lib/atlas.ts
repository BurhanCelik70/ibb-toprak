/**
 * Prof. Dr. Metin Turan · "Bitki Gelişim ve Etki Atlası" (public/atlas/index.html) bağlantısı.
 * Atlas üç.js ile GDD (büyüme derece günü), PAR, fotosentez, NDVI, sıcaklık ve nem değerlerini 3B gösterir;
 * değerler hocanın bitki parametreleridir (taban sıcaklık, dönem başına GDD, PAR doygunluğu …).
 * Buradan tarlanın bitkisi, bölgesi, sulama yöntemi ve toprağı seçili açılır.
 */
import { zkartBul } from './bitki';
import type { SoilReport } from './toprak';
import type { SulamaYontemi } from './sulama';
import { almanMi } from './almanya';
import { ispanyolMu } from './ispanya';
import type { Dil } from './dil';
import { DUNYA_ATLAS, dunyaIli } from './dunya';

/** Z-kart bitkisi → atlas bitki kodu (Türkiye listesi) */
const BITKI: Record<string, string> = {
  Buğday: 'wheat', Arpa: 'barley', 'Mısır (dane)': 'maize', Ayçiçeği: 'sunflower', Pamuk: 'cotton', 'Şeker pancarı': 'sugarbeet',
  Patates: 'potato', Domates: 'tomato', Salatalık: 'cucumber', Soğan: 'onion', Elma: 'apple', 'Şeftali / nektarin': 'peach',
  Kayısı: 'apricot', 'Üzüm (bağ)': 'grape', Zeytin: 'olive', 'Narenciye (mandalina)': 'citrus', İncir: 'fig', Nar: 'pomegranate',
  Fındık: 'hazelnut', Bezelye: 'pea', 'Çeltik (pirinç)': 'rice', Susam: 'sesame', Çay: 'tea', Tütün: 'tobacco', Kanola: 'rapeseed',
};

/** İl → atlasın Türkiye bölgesi. Atlasta Doğu Anadolu yok: karasal iklimi nedeniyle İç Anadolu'ya bağlandı (yaklaşık). */
const BOLGE: Record<string, string[]> = {
  AK: ['Adana', 'Antalya', 'Burdur', 'Hatay', 'Isparta', 'Kahramanmaraş', 'Mersin', 'Osmaniye'],
  EG: ['Afyonkarahisar', 'Aydın', 'Denizli', 'İzmir', 'Kütahya', 'Manisa', 'Muğla', 'Uşak'],
  MA: ['Balıkesir', 'Bilecik', 'Bursa', 'Çanakkale', 'Edirne', 'İstanbul', 'Kırklareli', 'Kocaeli', 'Sakarya', 'Tekirdağ', 'Yalova'],
  IA: [
    'Aksaray', 'Ankara', 'Çankırı', 'Eskişehir', 'Karaman', 'Kayseri', 'Kırıkkale', 'Kırşehir', 'Konya', 'Nevşehir', 'Niğde', 'Sivas', 'Yozgat',
    'Ağrı', 'Ardahan', 'Bingöl', 'Bitlis', 'Elazığ', 'Erzincan', 'Erzurum', 'Hakkari', 'Iğdır', 'Kars', 'Malatya', 'Muş', 'Tunceli', 'Van',
  ],
  KD: ['Amasya', 'Artvin', 'Bartın', 'Bayburt', 'Bolu', 'Çorum', 'Düzce', 'Giresun', 'Gümüşhane', 'Karabük', 'Kastamonu', 'Ordu', 'Rize', 'Samsun', 'Sinop', 'Tokat', 'Trabzon', 'Zonguldak'],
  GD: ['Adıyaman', 'Batman', 'Diyarbakır', 'Gaziantep', 'Kilis', 'Mardin', 'Siirt', 'Şanlıurfa', 'Şırnak'],
};
export const BOLGE_ADI: Record<string, string> = { AK: 'Akdeniz', EG: 'Ege', MA: 'Marmara', IA: 'İç Anadolu', KD: 'Karadeniz', GD: 'Güneydoğu', R: 'Orta Avrupa' };
/** Atlasın Akdeniz bölgesindeki bitkiler (İspanya önce bu bölgeyle, bitki orada yoksa Avrupa bölgesiyle açılır) */
const AKDENIZ_BITKI = new Set(['almond', 'apricot', 'avocado', 'barley', 'cherry', 'chickpea', 'citrus', 'cotton', 'cucumber', 'fig', 'garlic', 'grape', 'hazelnut', 'lettuce', 'melon', 'olive', 'onion', 'peach', 'pepper', 'pistachio', 'pomegranate', 'potato', 'strawberry', 'tomato', 'wheat']);

/** Atlasın Avrupa listesindeki bitkiler (Almanya bu bölgeyle açılır) */
const AB_BITKI = new Set(['wheat', 'maize', 'barley', 'rapeseed', 'sunflower', 'grape', 'olive', 'sugarbeet', 'potato', 'oats', 'apple', 'tomato', 'pea', 'onion', 'carrot', 'cabbage', 'peach', 'pear', 'cherry', 'plum', 'strawberry', 'pepper', 'cucumber', 'lettuce', 'hazelnut', 'kiwi']);

/** Dünya bölgeleri: atlastaki bitkiler (yalnız Türkiye listesiyle aynı kodlu olanlar; Program paneli bu kodlarla eşleşir) */
const DUNYA_BITKI: Record<string, Set<string>> = Object.fromEntries(
  Object.entries({"TH":["banana_th","cane_th","cassava_th","citrus_th","coconut_th","coffee_th","durian","groundnut_th","longan","maize_th","mango_th","oilpalm_th","papaya_th","pepper_th","pineapple_th","rice_th","rubber","soy_th"],"EU":["apple","barley","cabbage","carrot","cherry","cucumber","grape","hazelnut","kiwi","lettuce","maize","oats","olive","onion","pea","peach","pear","pepper","plum","potato","rapeseed","strawberry","sugarbeet","sunflower","tomato","wheat"],"UA":["apple","barley","blueberry","cabbage","carrot","cherry","cucumber","grape","maize","oats","onion","pea","plum","potato","rapeseed","soy","strawberry","sugarbeet","sunflower","tomato","wheat"],"RU":["alfalfa","apple","barley","cabbage","carrot","chickpea","cucumber","grape","lentil","maize","oats","onion","pea","potato","rapeseed","rice","soy","strawberry","sugarbeet","sunflower","tomato","wheat"],"MED":["almond","apricot","avocado","barley","cherry","chickpea","citrus","cotton","cucumber","fig","garlic","grape","hazelnut","lettuce","melon","olive","onion","peach","pepper","pistachio","pomegranate","potato","strawberry","tomato","wheat"],"ME":["alfalfa","apple","apricot","barley","citrus","cotton","cucumber","date","grape","lettuce","maize","melon","olive","onion","pepper","pistachio","pomegranate","potato","rice","sesame","sorghum","tomato","wheat"],"IQ":["date_iq","wheat_iq"],"AFR":["avocado","banana","cane","cashew","cassava","citrus","cocoa","coffee","cotton","drybean","groundnut","maize","mango","millet","oilpalm","onion","potato","rice","sesame","sorghum","soy","sweetpotato","tea","tobacco","tomato","wheat"],"IN":["banana","cane","cashew","chickpea","citrus","coconut","coffee","cotton","grape","groundnut","lentil","maize","mango","millet","onion","papaya","pepper","pomegranate","potato","rapeseed","rice","sorghum","soy","tea","tomato","wheat"],"CN":["apple","cabbage","cane","citrus","cotton","cucumber","garlic","grape","groundnut","kiwi","lettuce","maize","melon","peach","pear","pepper","potato","rapeseed","rice","soy","strawberry","sweetpotato","tea","tomato","wheat"],"APAC":["apple","banana","cabbage","cane","cashew","cassava","citrus","cocoa","coconut","coffee","groundnut","kiwi","maize","mango","oilpalm","papaya","pepper","pineapple","rice","soy","sweetpotato","tea","tomato"],"AUS":["almond","apple","avocado","banana","barley","blueberry","cane","cherry","chickpea","citrus","cotton","grape","lentil","macadamia","maize","mango","oats","onion","pea","potato","rapeseed","rice","sorghum","strawberry","tomato","wheat"],"MX":["alfalfa","avocado","banana","blueberry","cane","citrus","cocoa","coffee","cotton","cucumber","drybean","grape","lettuce","maize","mango","onion","papaya","pepper","pineapple","potato","sorghum","strawberry","tomato","wheat"],"BR":["apple","avocado","banana","cane","cassava","citrus","cocoa","coconut","coffee","cotton","drybean","grape","maize","mango","melon","papaya","pineapple","potato","rice","soy","tomato","wheat"],"LATAM":["apple","avocado","banana","barley","blueberry","cane","cherry","citrus","cocoa","coffee","drybean","grape","maize","mango","oilpalm","pear","pineapple","potato","rice","soy","sunflower","tomato","wheat"]} as Record<string, string[]>).map(([r, l]) => [r, new Set(l)]),
);
/** Bitki ülkenin atlas bölgesinde yoksa iklimce en yakın bölgeler sırayla denenir; en son Türkiye (bütün Z-kart bitkileri var) */
const YEDEK_BOLGE: Record<string, string[]> = {
  EU: ['MED'], MED: ['EU', 'ME'], ME: ['MED'], IQ: ['ME', 'MED'], RU: ['UA', 'EU'], UA: ['RU', 'EU'], AFR: ['MED', 'IN'],
  IN: ['ME', 'APAC'], CN: ['APAC', 'EU'], APAC: ['CN', 'IN'], AUS: ['MED', 'EU'], MX: ['LATAM', 'MED'], BR: ['LATAM', 'MX'],
  LATAM: ['BR', 'MX', 'MED'], TH: ['APAC', 'IN'],
};
/** Atlas bölgesinin ekrandaki adı (Türkçe kaynak metin) */
export const ATLAS_BOLGE_ADI: Record<string, string> = {
  TR: 'Türkiye', EU: 'Avrupa', MED: 'Akdeniz', ME: 'Orta Doğu', IQ: 'Irak', RU: 'Rusya', UA: 'Ukrayna', AFR: 'Afrika', IN: 'Hindistan',
  CN: 'Çin', APAC: 'Asya-Pasifik', AUS: 'Avustralya', MX: 'Meksika', BR: 'Brezilya', LATAM: 'Latin Amerika', TH: 'Tayland',
};
/** Dünya ülkesi için atlas bölgesi: ülkenin bölgesi, bitki orada yoksa yedekler, o da yoksa Türkiye */
export function dunyaAtlasBolgesi(iso: string, c0?: string): string {
  const ana = DUNYA_ATLAS[iso] ?? 'EU';
  if (!c0) return ana;
  return [ana, ...(YEDEK_BOLGE[ana] ?? [])].find((r) => DUNYA_BITKI[r]?.has(c0)) ?? 'TR';
}

/** Z-kart bitkisi → atlas bitki kodu; atlasta yoksa undefined */
export function atlasBitkiKodu(bitki?: string | null): string | undefined {
  const z = zkartBul(bitki ?? undefined);
  return z ? BITKI[z.bitki] : undefined;
}

export function atlasBolgesi(il?: string | null): string | undefined {
  if (!il) return undefined;
  if (almanMi(il) || ispanyolMu(il)) return 'R'; // atlasın Avrupa / Akdeniz bölgesi (tek iklim kuşağı)
  const k = il.toLocaleLowerCase('tr-TR');
  return Object.keys(BOLGE).find((b) => BOLGE[b].some((x) => x.toLocaleLowerCase('tr-TR') === k));
}

/** Rapordan atlasın toprak sınıfı: tuzlu → aşırı kireçli → alkali → asidik → dengeli */
export function atlasToprak(r?: SoilReport | null): string | undefined {
  const v = r?.values;
  if (!v) return undefined;
  // EC raporda µS/cm'dir (ör. 658); küçük değerler (≤ 50) dS/m kabul edilir. Tuzlu sınırı 4 dS/m = 4000 µS/cm
  const ecDs = v.ec === undefined ? undefined : v.ec > 50 ? v.ec / 1000 : v.ec;
  if (ecDs !== undefined && ecDs >= 4) return 'saline';
  if (v.kirec !== undefined && v.kirec >= 15) return 'calc';
  if (v.ph !== undefined && v.ph >= 7.8) return 'alk';
  if (v.ph !== undefined && v.ph < 5.5) return 'acid';
  return 'neutral';
}

export type AtlasParametre = 'gdd' | 'par' | 'peff' | 'ndvi' | 'temp' | 'rh';

export function atlasAdresi(o: {
  bitki?: string | null;
  il?: string | null;
  sulama?: SulamaYontemi;
  report?: SoilReport | null;
  parametre?: AtlasParametre;
  gomulu?: boolean;
  dil?: Dil;
}) {
  const z = zkartBul(o.bitki ?? undefined);
  const c0 = z ? BITKI[z.bitki] : undefined;
  // Almanya → Avrupa bölgesi; İspanya → Akdeniz bölgesi (bitki orada yoksa Avrupa); diğerleri → Türkiye
  const es = ispanyolMu(o.il);
  const dunya = dunyaIli(o.il);
  const bolgeKodu = dunya ? dunyaAtlasBolgesi(dunya.ulke, c0) : es ? (c0 && AKDENIZ_BITKI.has(c0) ? 'MED' : 'EU') : almanMi(o.il) ? 'EU' : 'TR';
  // Atlasın dilleri: tr, en, es, ar, zh. Almanca yok: Almanca arayüzde İngilizce açılır
  const q = new URLSearchParams({ l: o.dil === 'de' ? 'en' : o.dil ?? 'tr', r: bolgeKodu, v: 'eco', e: o.parametre ?? 'gdd' });
  const c = bolgeKodu === 'EU' && c0 && !AB_BITKI.has(c0) ? undefined : c0;
  if (c) q.set('c', c);
  // Dünya ülkesinde atlasın alt bölgesi seçilmez (bölgenin kendi varsayılanı); Türkiye'ye düşerse İç Anadolu değil, atlasın varsayılanı
  const b = dunya ? undefined : atlasBolgesi(o.il);
  if (b) q.set('z', b);
  if (o.sulama) q.set('w', o.sulama === 'kuru' ? 'dry' : 'irr');
  const s = atlasToprak(o.report);
  if (s) q.set('s', s);
  // İGSAŞ sürümü: atlasın "Program" sekmesi Humintech ürünleriyle yazılı olduğu için her dilde gizlenir.
  // Dönem programı sayfadaki panelde İGSAŞ Z-kartından gösterilir (components/analiz/AtlasEvrePaneli.tsx).
  q.set('prog', '0');
  if (o.gomulu) q.set('gomulu', '1');
  // Bölgenin ekrandaki adı (Türkçe kaynak metin; tx ile çevrilir)
  const bolgeAdi = dunya ? ATLAS_BOLGE_ADI[bolgeKodu] : !b ? undefined : es ? (bolgeKodu === 'MED' ? 'Akdeniz (İspanya)' : 'Avrupa (İspanya)') : BOLGE_ADI[b];
  return { adres: `/atlas/index.html?${q.toString()}`, bitkiVar: !!c, bolge: b, bolgeAdi };
}
