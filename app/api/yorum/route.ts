/**
 * POST /api/yorum
 * Doğrulanmış toprak değerlerini alır, İGSAŞ / KIANA ürünleriyle çözüm planı döndürür.
 *
 * - Tablo, kalite indeksi ve Z-kart programı kodda hesaplanır; yapay zeka bunları değiştirmez.
 * - Yapay zeka yalnızca katalogdaki ürünleri ve katalogdaki/Z-karttaki dozları kullanır.
 * - Cevap "tool" olarak istenir: her zaman geçerli JSON gelir.
 */
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { ORGANIK_MADDE_PROTOKOLU, URUNLER, zkartBul } from '@/lib/igsas';
import { kaliteIndeksi } from '@/lib/indeks';
import { KURALLAR, SULAMA_YONTEMLERI, ZAMANLAMA, zamanCizelgesi, type SulamaYontemi } from '@/lib/sulama';
import { oturumKullanici } from '@/lib/supabase/server';
import { buildAiPayload, type SoilReport } from '@/lib/toprak';
import type { Analiz, Tarla } from '@/lib/veri';

export const maxDuration = 60;

const client = new Anthropic();
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5-5';

const SYSTEM = `Sen İGSAŞ ve KIANA ürünlerini çok iyi bilen deneyimli bir ziraat mühendisisin. İstanbul Büyükşehir Belediyesi
"Toprak Rehberi" için, laboratuvar toprak analizine göre çiftçiye NET, UYGULANABİLİR ve ÜRÜN ODAKLI bir çözüm planı yazıyorsun.

Sana verilenler: parametre değerleri ve sınıfları, uygun aralığa göre farklar, Toprak Kalite İndeksi, ürün kataloğu,
organik madde protokolü ve (varsa) bitkinin İGSAŞ Z-kartı (dönem dönem ürün ve doz programı).

KESİN KURALLAR
1. Yalnızca KATALOGDAKİ ürün adlarını aynen yaz (ör. "KIANA CLIMATE PLUS", "N-CALBOR", "HÜMİK ASİT"). Başka ürün, başka marka yazma.
2. Dozu katalogdan, organik madde protokolünden veya Z-karttan AYNEN al; doz uydurma. Her ürünün yanına dozunu yaz.
3. Ahır gübresi, kompost, yeşil gübre gibi genel öneriler YAZMA. Organik madde düşükse yalnızca ORGANİK MADDE PROTOKOLÜNÜ uygula.
4. "Bir uzmana/İlçe Tarım'a danışın", "bu öneri bağlayıcı değildir" gibi uyarı cümleleri YAZMA.
5. Sayıları ve sınıfları değiştirme; laboratuvar değerlendirmesiyle çelişme.

ÖNERİ MANTIĞI
- Organik madde uygun aralığın altındaysa ORGANİK MADDE PROTOKOLÜ kullanıcıya ayrı bir tabloda zaten gösteriliyor:
  "sorunlar" tablosundaki organik madde satırına protokolden en etkili 2-3 ürünü dozuyla yaz; "kokGelisimi" içinde protokol
  ürünlerini TEKRAR ETME, onun yerine KIANA EARTH PLUS, MOL-50 gibi tamamlayıcı ürünleri yaz.
- Kök gelişimi: KIANA EARTH PLUS, MOL-50, AMİNO ASİT, HÜMİK ASİT; fosfor düşükse NPK 12-40-12 / DAP / MKP (Z-karttaki dönem ve dozla).
- İklim koruma ("iklimKoruma"): KIANA CLIMATE PLUS 200–300 g/da, don/sıcak/kuraklık beklentisinden 5–10 gün ÖNCE; bitkinin
  hassas dönemini (ör. meyvede çiçeklenme donu, tahılda bayrak yaprağı/dolum sıcağı) Z-karttan belirt. Kuraklıkta KIANA SOIL SOUL,
  stres sonrası toparlanmada AMİNO ASİT.
- pH yüksek / kireçli toprak: AS 21, EDTA Zn-Mn; damla sulamada NİTRİK ASİT veya FOSFORİK ASİT ile su pH'ı düzenleme.
- Potasyum düşükse: ENLARGE POTASH, K-S, KNO₃, K₂SO₄, NPK 7-7-40+ME. Mikro element eksikse: EDTA Zn-Mn, DEMİR ŞELAT, KOMBİ.
- Çiçek/meyve tutumu: FLOWER GOLD, N-CALBOR. Renklenme: COLORFUL.
- Z-kart varsa "gubreleme" içinde Z-kart programına göre BU TOPRAĞA ÖZEL düzeltmeleri yaz
  (ör. "Fosfor çok az: ekimde NPK 12-40-12 dozunu üst sınırdan, 4 kg/da uygulayın"). Z-kartı baştan sona tekrar etme; o ayrıca gösteriliyor.
- Z-kart yoksa "gubreleme" içinde katalogdan genel bir program öner.

SULAMA YÖNTEMİ
- Tarlanın sulama yöntemi ve süresi verilir. "sulamaNotlari" içine bu yönteme göre 2-4 somut uygulama notu yaz
  (ör. damlada "Mg NİTRAT'ı 6 saatlik sulamanın 1:30–4:30 gübre penceresinde verin"; yağmurlamada "gübreyi 2. saatte verin,
  kalan sürede yaprakları temiz suyla yıkayın"; pivotta "bir tur boyunca sabit oranda enjekte edin"). Zaman penceresini
  verilen "zamanCizelgesi"nden aynen al. Salma ve kuru tarımda serpme + sulama / yağış zamanlamasını anlat.
- Gübre önerilerinde yöntemi dikkate al: damla/yağmurlama/pivotta suda tam çözünen ürünleri öne çıkar.

YAZIM
- Kısa ve net: her açıklama en fazla 2 cümle. Ürünün NE İŞE YARADIĞINI bir cümleyle söyle.
- Hitap "siz". Teknik terimi parantez içinde açıkla. Abartma, korkutma.
- Cevabını yalnızca cozum_plani aracıyla ver.`;

const urunItem = {
  type: 'object',
  properties: {
    urun: { type: 'string', description: 'Katalogdaki ürün adı, aynen' },
    doz: { type: 'string', description: 'Katalog/protokol/Z-kart dozu, ör. "200–300 g/da"' },
    aciklama: { type: 'string', description: 'Ne işe yarar + ne zaman/nasıl uygulanır, en fazla 2 cümle' },
  },
  required: ['urun', 'doz', 'aciklama'],
} as const;

const TOOL: Anthropic.Tool = {
  name: 'cozum_plani',
  description: 'Toprak analizine göre İGSAŞ/KIANA ürünleriyle çözüm planını kaydeder.',
  input_schema: {
    type: 'object',
    properties: {
      ozet: { type: 'string', description: 'Toprağın genel durumu ve kalite indeksi yorumu, 2-3 cümle.' },
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
      bitkiUygunlugu: { type: ['string', 'null'], description: 'Planlanan bitki için 1-2 cümle; bitki yoksa null.' },
    },
    required: ['ozet', 'sorunlar', 'kokGelisimi', 'iklimKoruma', 'gubreleme', 'sulamaNotlari', 'bitkiUygunlugu'],
  },
};

/** Ürün adını katalogla eşleştirir; katalogda olmayan ürünler cevaptan çıkarılır. */
const TUM_URUNLER = Array.from(
  new Set([...URUNLER.map((u) => u.ad), ...ORGANIK_MADDE_PROTOKOLU.map((p) => p.urun)]),
);
const sade = (s: string) =>
  s.toLocaleUpperCase('tr-TR').replace(/[₂]/g, '2').replace(/[₃]/g, '3').replace(/[₄]/g, '4').replace(/[^A-ZÇĞİÖŞÜ0-9]/g, '');
function katalogAdi(ad: unknown): string | undefined {
  if (typeof ad !== 'string') return undefined;
  const s = sade(ad);
  return TUM_URUNLER.find((u) => sade(u) === s) ?? TUM_URUNLER.find((u) => s.includes(sade(u)) || sade(u).includes(s));
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

    const { analizId, yenile } = (await req.json()) as { analizId?: string; yenile?: boolean };
    if (!analizId) return NextResponse.json({ error: 'Analiz bulunamadı.' }, { status: 400 });

    // RLS sayesinde yalnızca kullanıcının kendi analizi gelir
    const { data: analiz } = await supabase.from('analizler').select('*').eq('id', analizId).single<Analiz>();
    if (!analiz) return NextResponse.json({ error: 'Analiz bulunamadı.' }, { status: 404 });
    if (analiz.cozum && !yenile) return NextResponse.json(analiz.cozum);

    const { data: tarla } = await supabase.from('tarlalar').select('*').eq('id', analiz.tarla_id).single<Tarla>();
    if (!tarla) return NextResponse.json({ error: 'Tarla bulunamadı.' }, { status: 404 });

    const report: SoilReport = { ...analiz.rapor, bitki: tarla.bitki ?? analiz.rapor.bitki, ilce: tarla.ilce ?? analiz.rapor.ilce };
    const hasData = Object.keys(report?.values ?? {}).length > 0 || (report?.ekDegerler?.length ?? 0) > 0;
    if (!hasData) {
      return NextResponse.json({ error: 'Yorum için en az bir ölçüm değeri gerekli.' }, { status: 400 });
    }
    const yontem = tarla.sulama as SulamaYontemi;
    const sure = tarla.sulama_suresi_saat ?? SULAMA_YONTEMLERI[yontem].varsayilanSure;

    const zkart = zkartBul(report.bitki);
    const indeks = kaliteIndeksi(report);
    const input = {
      tarla: { alanDekar: tarla.alan_dekar, ilce: tarla.ilce },
      sulama: {
        yontem: SULAMA_YONTEMLERI[yontem].ad,
        sureSaat: sure,
        zamanCizelgesi: sure ? zamanCizelgesi(yontem, sure)?.map((d) => `${d.bas}–${d.bit}: ${d.baslik}`) : undefined,
        oranlar: yontem === 'damla' || yontem === 'yagmurlama' ? ZAMANLAMA[yontem] : undefined,
        kurallar: KURALLAR[yontem],
      },
      analiz: buildAiPayload(report),
      kaliteIndeksi: indeks && {
        puan100: indeks.yuzde,
        sinif: indeks.sinif,
        parametrePuanlari: indeks.satirlar.map((s) => ({ parametre: s.ad, puan0_5: s.puan })),
      },
      urunKatalogu: URUNLER.map((u) => ({ urun: u.ad, ne_ise_yarar: u.rol, doz: u.doz })),
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
        : `Bu bitki (${report.bitki ?? 'belirtilmedi'}) için Z-kart yok; katalogdan genel program öner.`,
    };

    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: TOOL.name },
      messages: [{ role: 'user', content: JSON.stringify(input) }],
    });

    if (msg.stop_reason === 'max_tokens') {
      throw new Error('Cevap uzunluk sınırına takıldı (max_tokens). Sınırı artırın.');
    }
    const block = msg.content.find((b) => b.type === 'tool_use');
    if (!block || block.type !== 'tool_use') throw new Error('Model cozum_plani aracını kullanmadı.');

    const out = block.input as Record<string, unknown>;
    const cozum = {
      ozet: typeof out.ozet === 'string' ? out.ozet : '',
      sorunlar: (Array.isArray(out.sorunlar) ? out.sorunlar : []).map((s: Record<string, unknown>) => ({
        ...s,
        urunler: temizle(s.urunler),
      })),
      kokGelisimi: temizle(out.kokGelisimi),
      iklimKoruma: temizle(out.iklimKoruma),
      gubreleme: temizle(out.gubreleme),
      sulamaNotlari: (Array.isArray(out.sulamaNotlari) ? out.sulamaNotlari : []).filter((x): x is string => typeof x === 'string'),
      bitkiUygunlugu: typeof out.bitkiUygunlugu === 'string' ? out.bitkiUygunlugu : null,
    };

    // Kaydet: aynı analiz tekrar açıldığında yapay zekaya yeniden ücret ödenmez
    await supabase.from('analizler').update({ cozum, cozum_tarihi: new Date().toISOString() }).eq('id', analizId);
    return NextResponse.json(cozum);
  } catch (err) {
    console.error('yorum hatası', err);
    return NextResponse.json(
      { error: 'Çözüm planı şu anda oluşturulamadı. Analiz tablosu yine de geçerlidir.' },
      { status: 500 },
    );
  }
}
