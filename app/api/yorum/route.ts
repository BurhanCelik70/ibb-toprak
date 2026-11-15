/**
 * POST /api/yorum
 * Doğrulanmış toprak değerlerini alır; İGSAŞ / KIANA ürünleriyle (dekar başı dozlarla) çözüm planı döndürür.
 *
 * - Tablo, kalite indeksi ve Z-kart programı kodda hesaplanır; yapay zeka bunları değiştirmez.
 * - Yapay zeka yalnızca katalogdaki ürünleri ve katalogdaki/Z-karttaki dozları kullanır.
 * - Cevap "tool" olarak istenir: her zaman geçerli JSON gelir.
 */
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { dunyaBolgeBilgisi } from '@/lib/dunyaIklim';
import { bolgeBilgisi, ilBul } from '@/lib/bolgeler';
import { almanLaborDegerleri, mgkgLaborDegerleri } from '@/lib/birimler';
import { zkartBul } from '@/lib/bitki';
import { BESIN_SATIRLARI, IGSAS_KURALLAR, IGSAS_URUNLER, ORGANIK_MADDE_PROTOKOLU } from '@/lib/igsas';
import { kaliteIndeksi } from '@/lib/indeks';
import { KURALLAR, SULAMA_YONTEMLERI, ZAMANLAMA, zamanCizelgesi, type SulamaYontemi } from '@/lib/sulama';
import { oturumKullanici } from '@/lib/supabase/server';
import { buildAiPayload, type SoilReport } from '@/lib/toprak';
import { dilGecerli, type Dil } from '@/lib/dil';
import { COZUM_SURUMU, dildekiPlan, type Analiz, type CozumPlani, type Tarla } from '@/lib/veri';

// Uzun çözüm planları 60 sn'yi aşabiliyor (Vercel Runtime Timeout); Fluid Compute ile 300 sn'ye kadar izin var.
export const maxDuration = 300;

const client = new Anthropic();
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5-5';


const SYSTEM = `Sen İGSAŞ (İstanbul Gübre Sanayii A.Ş.) ve KIANA ürünlerini çok iyi bilen, Türkiye'nin tüm bölgelerinde çalışmış
kıdemli bir toprak bilimci ve ziraat mühendisisin. "İGSAŞ Toprak Asistanı" uygulaması için laboratuvar toprak analizini
PROFESYONEL bir rapor diliyle yorumluyor, çiftçiye NET, UYGULANABİLİR ve ÜRÜN ODAKLI bir çözüm planı yazıyorsun: hangi İGSAŞ
gübresinden, ne zaman, dekara ne kadar.

Sana verilenler: parametre değerleri ve sınıfları, uygun aralığa göre farklar, Toprak Kalite İndeksi, İGSAŞ/KIANA ürün kataloğu
(ürün, ne işe yaradığı, uygulama yoluna göre dozlar, etiketler), öneri kuralları, organik madde protokolü ve (varsa) bitkinin
İGSAŞ Z-kartı (dönem dönem ürün ve doz programı).

KESİN KURALLAR
1. Ürün olarak YALNIZCA katalogdaki adları aynen yaz (ör. "KIANA CLIMATE PLUS", "N-CALBOR", "HÜMİK ASİT", "NPK 12-40-12", "DAP").
   Başka marka ya da ürün adı YAZMA (piyasa gübre markaları, humik asit markaları vb. yasak).
2. Dozu katalogdan, organik madde protokolünden veya Z-karttan AYNEN al; doz uydurma. Her ürünün yanına dozunu yaz.
3. Ahır gübresi, kompost, yeşil gübre gibi genel öneriler YAZMA. Organik madde düşükse ORGANİK MADDE PROTOKOLÜNÜ kullan.
4. "Bir uzmana/İlçe Tarım'a danışın", "bu öneri bağlayıcı değildir" gibi uyarı cümleleri YAZMA. Ürün etkisini abartma; katalogdaki
   "ne_ise_yarar" ifadelerinin ötesine geçme.
5. Sayıları ve sınıfları değiştirme; laboratuvar değerlendirmesiyle çelişme.

ÖNERİ MANTIĞI (öneri kuralları "oneriKurallari" alanında; ürün etiketleriyle eşleşir)
- Organik madde düşük: ORGANİK MADDE PROTOKOLÜ kullanıcıya ayrı bir tabloda zaten gösteriliyor. "sorunlar"daki organik madde satırına
  protokolden en etkili 2-3 ürünü dozuyla yaz (LEONARDİT GRANÜL, ODA GRANÜL, damlada HÜMİK ASİT). "kokGelisimi"nde protokol
  ürünlerini TEKRAR ETME; onun yerine KIANA EARTH PLUS, MOL-50 gibi tamamlayıcıları yaz.
- Kök gelişimi: KIANA EARTH PLUS, MOL-50, AMİNO ASİT, HÜMİK ASİT; fosfor düşükse NPK 12-40-12 / DAP / MKP (Z-karttaki dönem ve dozla).
- İklim koruma ("iklimKoruma"): KIANA CLIMATE PLUS 200–300 g/da, don/sıcak/kuraklık beklentisinden 5–10 gün ÖNCE; bitkinin hassas
  dönemini Z-karttan belirt (ör. meyvede çiçeklenme donu, tahılda bayrak yaprağı/dolum sıcağı). Kuraklıkta KIANA SOIL SOUL, stres
  sonrası toparlanmada AMİNO ASİT.
- pH yüksek / kireçli toprak: AS 21, EDTA Zn-Mn, DEMİR ŞELAT; damla sulamada NİTRİK ASİT veya FOSFORİK ASİT ile su pH'ı düzenleme.
- Tuzluluk: HÜMİK ASİT desteği, KIANA EARTH PLUS; stres için AMİNO ASİT. Klorürlü potasyum yerine K₂SO₄ / KNO₃.
- Potasyum düşük: ENLARGE POTASH, K-S, KNO₃, K₂SO₄, NPK 7-7-40+ME. Magnezyum düşük: MAGNEZYUM, Mg NİTRAT.
  Mikro element eksik: EDTA Zn-Mn, DEMİR ŞELAT, KOMBİ.
- Kalsiyum/bor, çiçek ve meyve tutumu: N-CALBOR, FLOWER GOLD. Renklenme: COLORFUL.
- Azot: taban gübresinde DAP / NPK 20.20.0+Zn; baş gübrede UAN-32, AS 21; damlada KNO₃, NPK 18-18-18 (Z-karttaki dönem ve dozla).
- Z-kart varsa "gubreleme" içinde programa göre BU TOPRAĞA ÖZEL düzeltmeleri yaz (ör. "Fosfor çok az: ekimde NPK 12-40-12 dozunu
  üst sınırdan, 4 kg/da uygulayın"). Z-kartı baştan sona tekrar etme; o ayrıca gösteriliyor. Z-kart yoksa katalogdan genel bir program öner.

BÖLGE (İL / İLÇE)
- "bolge" alanında tarlanın ili, coğrafi bölgesi ve o bölgenin GENEL toprak-iklim eğilimleri verilir.
- Önce ANALİZ DEĞERLERİNE bak; bölge bilgisi yalnızca yorumu zenginleştirir. Analiz bölgeyle çelişiyorsa analizi esas al ve bunu belirt.
- Bölgenin iklim riskine göre "iklimKoruma" zamanlamasını ayarla.
- "bolgeNotu": bölgeye özgü 1-2 cümlelik, bu analize bağlanan somut bir yorum. Bölge verilmemişse null.

SULAMA YÖNTEMİ
- "sulamaNotlari" içine yönteme göre 2-4 somut uygulama notu yaz (damlada gübre penceresi "zamanCizelgesi"nden aynen, ör. "Mg NİTRAT'ı
  6 saatlik sulamanın 1:30–4:30 gübre penceresinde verin"; yağmurlamada gübreden sonra temiz suyla yıkama; pivotta bir tur boyunca
  sabit oran; salma ve kuru tarımda serpme + sulama/yağış zamanlaması).
- Damla/yağmurlama/pivotta suda tam çözünen ürünleri (NPK 12-40-12, NPK 18-18-18, KNO₃, MKP, UAN-32, sıvılar) öne çıkar;
  kuru tarımda taban gübresi ve yaprak uygulamaları.

ALAN BİRİMİ: DEKAR
- Dozları dekar başına ver ("15–20 kg/da", "200–300 g/da", "1–2 L/da"). Tarla alanı "tarla.alanDekar" alanındadır.

YAZIM (profesyonel rapor dili)
- "ozet": toprağın bünyesi, tepkimesi, tuzluluk, organik madde ve besin durumunu bir uzman raporu gibi 3-4 cümlede özetle; verimi
  sınırlayan 2-3 konuyu öncelik sırasıyla belirt; uygulanırsa ne beklendiğini söyle. Kalite indeksi puanını tekrar etme.
- "sorunlar"daki "parametre" kısa olsun (ör. "Organik madde", "Çinko", "Çinko ve demir", "Fosfor"); "etki" 1 cümle.
- Diğer açıklamalar en fazla 2 cümle; ürünün ne işe yaradığını bir cümleyle söyle. Hitap "siz". Teknik terimi parantez içinde açıkla.
- Cevabını yalnızca cozum_plani aracıyla ver.`;

/** Türkçe dışındaki dillerde alan birimi hektar (Türkçede dekar) */
const HEKTAR = `

ALAN BİRİMİ: HEKTAR (yukarıdaki DEKAR kuralının yerine geçer)
- Tüm dozları hektar başına ver (dekar değerinin 10 katı), biçim "66–83 kg/ha", "5–10 L/ha", "1–2 kg/ha". Katalogdaki ve Z-karttaki
  "/da" dozlarını 10 ile çarpıp "/ha" yaz. Metin içinde de "kg/da" ya da "dekar" yazma; "kg/ha" ve "ha" kullan.
  Tarla alanı "tarla.alanHektar" alanındadır. (Laboratuvar değerleri "analiz" içinde olduğu gibi kalır; onları çevirme.)`;

/** İspanyolca ve Arapça rapor için dil talimatı */
const DIL_TALIMATI: Record<'en' | 'es' | 'ar', string> = {
  en: `

DİL: İNGİLİZCE (English)
- Bu rapor uluslararası bir okuyucu içindir. "ozet", "etki", "aciklama", "zaman", "sulamaNotlari", "bolgeNotu", "bitkiUygunlugu"
  ve "parametre" dahil BÜTÜN metinleri doğal, profesyonel İNGİLİZCE (British English) yaz. Türkçe kelime kullanma.
- "urun" alanlarını ÇEVİRME: İGSAŞ/KIANA ürün adlarını AYNEN yaz; ekranda çevrilir.
- LABORATUVAR BİRİMLERİ: fosfor ve potasyumdan söz ederken YALNIZCA "laboratuvarMgKg" alanındaki mg/kg değerlerini yaz
  ("Olsen P 18 mg/kg", "K 220 mg/kg"); "analiz"deki kg/da birimini kullanma.`,
  es: `

DİL: İSPANYOLCA (Español)
- Bu rapor İspanyolca konuşan bir çiftçi içindir. "ozet", "etki", "aciklama", "zaman", "sulamaNotlari", "bolgeNotu", "bitkiUygunlugu"
  ve "parametre" dahil BÜTÜN metinleri doğal, profesyonel İSPANYOLCA yaz ("usted" hitabı). Türkçe kelime kullanma.
- "urun" alanlarını ÇEVİRME: İGSAŞ/KIANA ürün adlarını AYNEN yaz; ekranda çevrilir.
- LABORATUVAR BİRİMLERİ: İspanyol çiftçi fosfor ve potasyumu mg/kg görür. Metinde fosfor ve potasyumdan söz ederken YALNIZCA
  "laboratuvarMgKg" alanındaki değerleri yaz ("P Olsen 18 mg/kg", "K 220 mg/kg"); "analiz"deki kg/da birimini kullanma.
- Tarla İspanya'daysa ("bolge" alanı İspanyolca bölge bilgisi verir) Real Decreto 1051/2022 (nutrición sostenible de suelos agrarios)
  ilkelerine uy: azotu ihtiyaca göre ve bölünmüş öner, nitrata hassas bölgelerde (zonas vulnerables) dikkatli ol.`,
  ar: `

DİL: ARAPÇA (العربية)
- Bu rapor Arapça konuşan bir çiftçi içindir. "ozet", "etki", "aciklama", "zaman", "sulamaNotlari", "bolgeNotu", "bitkiUygunlugu"
  ve "parametre" dahil BÜTÜN metinleri doğal, profesyonel MODERN STANDART ARAPÇA yaz. Türkçe kelime kullanma.
- Rakamları Latin rakamlarıyla (0–9) yaz; birimleri Latin harfleriyle bırak ("kg/ha", "L/ha", "mg/kg").
- LABORATUVAR BİRİMLERİ: fosfor ve potasyumdan söz ederken YALNIZCA "laboratuvarMgKg" alanındaki mg/kg değerlerini yaz;
  "analiz"deki kg/da birimini kullanma.
- "urun" alanlarını ÇEVİRME: İGSAŞ/KIANA ürün adlarını AYNEN yaz; ekranda çevrilir.`,
};

/** Almanca rapor istendiğinde sistem talimatına eklenir */
const ALMANCA = `

DİL: ALMANCA (Deutsch)
- Bu rapor Almanca konuşan bir çiftçi içindir. "ozet", "etki", "aciklama", "zaman", "sulamaNotlari", "bolgeNotu", "bitkiUygunlugu"
  ve "parametre" dahil BÜTÜN metinleri doğal, profesyonel ALMANCA yaz (Sie-Form). Türkçe kelime kullanma.
- "urun" alanlarını ÇEVİRME: İGSAŞ/KIANA ürün adlarını AYNEN yaz; ekranda çevrilir.
- LABORATUVAR BİRİMLERİ: Alman çiftçi değerleri VDLUFA birimleriyle görür. "analiz" içindeki değerler Türk birimidir
  (pH suda, P₂O₅/K₂O kg/da); metinde pH, fosfor ve potasyumdan söz ederken YALNIZCA "almanLaborDegerleri" alanındaki
  karşılıkları yaz: "pH (CaCl₂) 6,1", "P₂O₅ 9 mg/100 g (Gehaltsklasse C)". Sınıfları A–E (VDLUFA) diye adlandır.
- Tarla Almanya'daysa ("bolge" alanı Almanca bölge bilgisi verir) Düngeverordnung (DüV) sınırlarına dikkat et:
  azotu gerçek ihtiyaca göre ve bölünmüş öner; sonbaharda azotu kısıtlı tut.`;

const urunItem = {
  type: 'object',
  properties: {
    urun: { type: 'string', description: 'İGSAŞ/KIANA kataloğundaki ürün adı, aynen' },
    doz: { type: 'string', description: 'Katalog/protokol/Z-kart dozu, ör. "200–300 g/da", "15–20 kg/da"' },
    aciklama: { type: 'string', description: 'Ne işe yarar + ne zaman/nasıl uygulanır, en fazla 2 cümle' },
  },
  required: ['urun', 'doz', 'aciklama'],
} as const;

const TOOL: Anthropic.Tool = {
  name: 'cozum_plani',
  description: 'Toprak analizine göre İGSAŞ / KIANA ürünleriyle çözüm planını kaydeder.',
  input_schema: {
    type: 'object',
    properties: {
      ozet: { type: 'string', description: 'Uzman raporu dilinde toprağın genel durumu, 3-4 cümle.' },
      sorunlar: {
        type: 'array',
        maxItems: 8,
        description: 'Yalnızca dikkat/sorun durumundaki parametreler, önem sırasına göre.',
        items: {
          type: 'object',
          properties: {
            parametre: { type: 'string' },
            etki: { type: 'string', description: 'Bitkiye etkisi, 1 cümle.' },
            urunler: {
              type: 'array',
              maxItems: 3,
              items: {
                type: 'object',
                properties: { urun: { type: 'string' }, doz: { type: 'string' } },
                required: ['urun', 'doz'],
              },
            },
            zaman: { type: 'string', description: 'Ne zaman, ör. "Ekimden önce, tohum yatağına"' },
          },
          required: ['parametre', 'etki', 'urunler', 'zaman'],
        },
      },
      kokGelisimi: { type: 'array', maxItems: 6, items: urunItem, description: 'Kök gelişimi ve toprak canlılığı (organik madde protokolü dahil).' },
      iklimKoruma: { type: 'array', maxItems: 4, items: urunItem, description: 'Don, sıcak ve kuraklık stresine karşı koruma.' },
      gubreleme: { type: 'array', maxItems: 6, items: urunItem, description: 'Z-karta göre bu toprağa özel gübreleme düzeltmeleri.' },
      sulamaNotlari: { type: 'array', maxItems: 4, items: { type: 'string' }, description: 'Sulama yöntemine göre somut uygulama notları.' },
      bolgeNotu: { type: ['string', 'null'], description: 'İl/bölgenin toprak-iklim özelliklerini bu analize bağlayan 1-2 cümle; bölge yoksa null.' },
      bitkiUygunlugu: { type: ['string', 'null'], description: 'Planlanan bitki için 1-2 cümle; bitki yoksa null.' },
    },
    required: ['ozet', 'sorunlar', 'kokGelisimi', 'iklimKoruma', 'gubreleme', 'sulamaNotlari', 'bolgeNotu', 'bitkiUygunlugu'],
  },
};

/** Ürün adını katalogla eşleştirir; katalogda olmayan ürünler cevaptan çıkarılır. */
const TUM_URUNLER = Array.from(
  new Set([...IGSAS_URUNLER.map((u) => u.ad), ...ORGANIK_MADDE_PROTOKOLU.map((p) => p.urun), ...Object.keys(BESIN_SATIRLARI)]),
);
const sade = (s: string) =>
  s.toLocaleUpperCase('tr-TR').replace(/[₂]/g, '2').replace(/[₃]/g, '3').replace(/[₄]/g, '4').replace(/[^A-ZÇĞİÖŞÜ0-9]/g, '');
/** Besin satırının kısa adları: "Azot", "N", "P2O5", "Fosfor" … → "Azot (N)" */
const BESIN_TAKMA: [RegExp, string][] = [
  [/^(AZOT|N|SAFN|AZOTN)$/, 'Azot (N)'],
  [/^(FOSFOR|P|P2O5|FOSFORP2O5)$/, 'Fosfor (P₂O₅)'],
  [/^(POTASYUM|K|K2O|POTASYUMK2O)$/, 'Potasyum (K₂O)'],
  [/^(MAGNEZYUM|MG|MGO|MAGNEZYUMMGO)$/, 'Magnezyum (MgO)'],
  [/^(KÜKÜRT|S|KÜKÜRTS)$/, 'Kükürt (S)'],
  [/^(ÇİNKO|ZN|ÇİNKOZN)$/, 'Çinko (Zn)'],
];
function katalogAdi(ad: unknown): string | undefined {
  if (typeof ad !== 'string') return undefined;
  const s = sade(ad);
  const besin = BESIN_TAKMA.find(([re]) => re.test(s));
  if (besin) return besin[1];
  return TUM_URUNLER.find((u) => sade(u) === s) ?? TUM_URUNLER.find((u) => sade(u).length > 4 && (s.includes(sade(u)) || sade(u).includes(s)));
}
type Item = { urun: string; doz: string; aciklama?: string };
function temizle<T extends Item>(list: unknown): T[] {
  if (!Array.isArray(list)) return [];
  return list.flatMap((x) => {
    const ad = katalogAdi(x?.urun);
    return ad ? [{ ...x, urun: ad } as T] : [];
  });
}

export async function POST(req: Request) {
  try {
    const { supabase, kullaniciId } = await oturumKullanici();
    if (!kullaniciId) return NextResponse.json({ error: 'Devam etmek için giriş yapın.' }, { status: 401 });

    const { analizId, yenile, dil: istenen } = (await req.json()) as { analizId?: string; yenile?: boolean; dil?: string };
    const dil: Dil = dilGecerli(istenen) ? istenen : 'tr';
    if (!analizId) return NextResponse.json({ error: 'Analiz bulunamadı.' }, { status: 400 });

    // RLS sayesinde yalnızca kullanıcının kendi analizi gelir
    const { data: analiz } = await supabase.from('analizler').select('*').eq('id', analizId).single<Analiz>();
    if (!analiz) return NextResponse.json({ error: 'Analiz bulunamadı.' }, { status: 404 });
    // Eski sürüm planlar yeniden yazılır
    const kayitli = analiz.cozum as CozumPlani | null;
    const hazir = !yenile && dildekiPlan(kayitli, dil);
    if (hazir) return NextResponse.json(hazir);

    const { data: tarla } = await supabase.from('tarlalar').select('*').eq('id', analiz.tarla_id).single<Tarla>();
    if (!tarla) return NextResponse.json({ error: 'Tarla bulunamadı.' }, { status: 404 });

    const konum = [tarla.ilce, tarla.il].filter(Boolean).join(', ');
    const report: SoilReport = { ...analiz.rapor, bitki: tarla.bitki ?? analiz.rapor.bitki, ilce: konum || analiz.rapor.ilce };
    // İl tarlada yoksa rapordaki adres/konumdan bulmayı dene
    const il = tarla.il ?? ilBul(analiz.rapor.ilce) ?? ilBul(analiz.rapor.adres);
    const hasData = Object.keys(report?.values ?? {}).length > 0 || (report?.ekDegerler?.length ?? 0) > 0;
    if (!hasData) {
      return NextResponse.json({ error: 'Yorum için en az bir ölçüm değeri gerekli.' }, { status: 400 });
    }
    const yontem = tarla.sulama as SulamaYontemi;
    const sure = tarla.sulama_suresi_saat ?? SULAMA_YONTEMLERI[yontem].varsayilanSure;

    const zkart = zkartBul(report.bitki);
    const indeks = kaliteIndeksi(report);
    const input = {
      tarla: { alanDekar: tarla.alan_dekar, alanHektar: tarla.alan_dekar ? tarla.alan_dekar / 10 : null, il, ilce: tarla.ilce },
      bolge: bolgeBilgisi(il, tarla.ilce) ?? (await dunyaBolgeBilgisi(il, tarla.ilce)) ?? 'Tarlanın ili belirtilmemiş; bölgesel yorum yapma.',
      sulama: {
        yontem: SULAMA_YONTEMLERI[yontem].ad,
        sureSaat: sure,
        zamanCizelgesi: sure ? zamanCizelgesi(yontem, sure)?.map((d) => `${d.bas}–${d.bit}: ${d.baslik}`) : undefined,
        oranlar: yontem === 'damla' || yontem === 'yagmurlama' ? ZAMANLAMA[yontem] : undefined,
        kurallar: KURALLAR[yontem],
      },
      analiz: buildAiPayload(report),
      ...(dil === 'de' ? { almanLaborDegerleri: almanLaborDegerleri(report.values) } : {}),
      ...(dil === 'en' || dil === 'es' || dil === 'ar' ? { laboratuvarMgKg: mgkgLaborDegerleri(report.values) } : {}),
      kaliteIndeksi: indeks && {
        puan100: indeks.yuzde,
        sinif: indeks.sinif,
        parametrePuanlari: indeks.satirlar.map((s) => ({ parametre: s.ad, puan0_5: s.puan })),
      },
      urunKatalogu: IGSAS_URUNLER.map((u) => ({ urun: u.ad, marka: u.marka, grup: u.grup, ne_ise_yarar: u.rol, dozlar: u.dozlar, etiketler: u.etiket })),
      oneriKurallari: IGSAS_KURALLAR,
      organikMaddeProtokolu: ORGANIK_MADDE_PROTOKOLU,
      zKart: zkart
        ? {
            bitki: zkart.bitki,
            sulama: zkart.sulama,
            evreler: zkart.evreler.map((e) => ({
              evre: e.evre,
              bbch: e.bbch,
              donem: e.donem,
              hedef: e.hedef,
              uygulamalar: e.uygulamalar.map((g) => `${g.yontem}: ${g.urunler.map((u) => `${u.urun} ${u.doz}`).join('; ')}`),
            })),
          }
        : `Bu bitki (${report.bitki ?? 'belirtilmedi'}) için Z-kart yok; analize göre genel bir program öner.`,
    };

    // Yeni modeller zorunlu araç seçimini (tool_choice: tool/any) desteklemiyor; aracı 'auto' ile sunup
    // talimatla kullanmasını istiyoruz. Araç kullanmadan cevap verirse bir kez daha hatırlatıyoruz.
    const sistem = `${SYSTEM}${dil === 'tr' ? '' : HEKTAR}${dil === 'de' ? ALMANCA : dil === 'en' || dil === 'es' || dil === 'ar' ? DIL_TALIMATI[dil] : ''}\n\nCEVAP BİÇİMİ: Cevabını YALNIZCA "${TOOL.name}" aracını çağırarak ver; düz metin yazma.`;
    const ilkMesaj = { role: 'user' as const, content: JSON.stringify(input) };
    let msg = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: sistem,
      tools: [TOOL],
      tool_choice: { type: 'auto' },
      messages: [ilkMesaj],
    });
    if (!msg.content.some((b) => b.type === 'tool_use') && msg.stop_reason !== 'max_tokens') {
      msg = await client.messages.create({
        model: MODEL,
        max_tokens: 8000,
        system: sistem,
        tools: [TOOL],
        tool_choice: { type: 'auto' },
        messages: [ilkMesaj, { role: 'assistant', content: msg.content }, { role: 'user', content: `Lütfen planı "${TOOL.name}" aracını çağırarak ver.` }],
      });
    }

    if (msg.stop_reason === 'max_tokens') {
      throw new Error('Cevap uzunluk sınırına takıldı (max_tokens). Sınırı artırın.');
    }
    const block = msg.content.find((b) => b.type === 'tool_use');
    if (!block || block.type !== 'tool_use') throw new Error('Model cozum_plani aracını kullanmadı.');

    const out = block.input as Record<string, unknown>;
    const plan = {
      surum: COZUM_SURUMU,
      dil,
      ozet: typeof out.ozet === 'string' ? out.ozet : '',
      sorunlar: (Array.isArray(out.sorunlar) ? out.sorunlar : []).map((s: Record<string, unknown>) => ({
        ...s,
        urunler: temizle(s.urunler),
      })),
      kokGelisimi: temizle(out.kokGelisimi),
      iklimKoruma: temizle(out.iklimKoruma),
      gubreleme: temizle(out.gubreleme),
      sulamaNotlari: (Array.isArray(out.sulamaNotlari) ? out.sulamaNotlari : []).filter((x): x is string => typeof x === 'string'),
      bolgeNotu: typeof out.bolgeNotu === 'string' && out.bolgeNotu.trim() ? out.bolgeNotu : null,
      bitkiUygunlugu: typeof out.bitkiUygunlugu === 'string' ? out.bitkiUygunlugu : null,
    };

    // Kaydet: aynı analiz tekrar açıldığında yapay zekaya yeniden ücret ödenmez
    // Türkçe plan üst düzeyde, diğer diller onun "de", "es", "ar" alanlarında saklanır; biri yenilenince diğerleri korunur
    const eskiTr = kayitli && kayitli.surum === COZUM_SURUMU ? kayitli : null;
    const digerleri = Object.fromEntries((['en', 'de', 'es', 'ar'] as const).flatMap((d) => (d !== dil && dildekiPlan(kayitli, d) ? [[d, dildekiPlan(kayitli, d)]] : [])));
    const cozum = dil === 'tr' ? { ...plan, ...digerleri } : { ...(eskiTr ?? {}), ...digerleri, [dil]: plan };
    await supabase.from('analizler').update({ cozum, cozum_tarihi: new Date().toISOString() }).eq('id', analizId);
    return NextResponse.json(plan);
  } catch (err) {
    console.error('yorum hatası', err);
    return NextResponse.json(
      { error: 'Çözüm planı şu anda oluşturulamadı. Analiz tablosu yine de geçerlidir.' },
      { status: 500 },
    );
  }
}
