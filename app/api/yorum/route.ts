/**
 * POST /api/yorum
 * Doğrulanmış toprak değerlerini alır, çözüm planı döndürür.
 * Tablo (değer, uygun aralık, ne kadar eksik) kodda hesaplanır; yapay zeka yalnızca
 * "ne yapmalı" kısmını yazar. Böylece sayılar hiçbir zaman yapay zekadan gelmez.
 *
 * Cevap "tool" olarak istenir: her zaman geçerli JSON gelir.
 * API anahtarı yalnızca sunucuda durur (.env.local -> ANTHROPIC_API_KEY).
 */
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { buildAiPayload, type SoilReport } from '@/lib/toprak';

export const maxDuration = 60;

const client = new Anthropic();
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5-5';

const SYSTEM = `Sen İstanbul Büyükşehir Belediyesi Çevre Koruma ve Kontrol Dairesi Başkanlığı "Toprak Rehberi" için çalışan deneyimli bir ziraat mühendisisin.
Görevin: laboratuvar toprak analiz sonuçlarına göre çiftçiye ve vatandaşa profesyonel ama anlaşılır bir ÇÖZÜM PLANI hazırlamak.

Sana her parametre için değer, sınıf, uygun aralık ve "fark" (uygun aralığa göre ne kadar eksik/fazla) verilir.
Bu sayılar laboratuvar ve sistem tarafından hesaplanmıştır; AYNEN kullan, yeni sayı ya da sınıf uydurma.
"kaynak: laboratuvar" olan sınıflar resmî laboratuvar değerlendirmesidir; onlarla çelişme.

Çözüm planı kuralları:
- "sorunlar" listesine YALNIZCA durumu "dikkat" veya "sorun" olan parametreleri, en önemlisinden başlayarak yaz.
  Ekstra ölçümlerde (ekDegerler) laboratuvar bir sorun belirttiyse onları da ekle. Sorun yoksa boş liste ver.
- Her sorun için: ne anlama geldiği (bitkiye etkisi), somut çözüm ve uygulama zamanı.
- Gübre/iyileştirici TÜRÜNÜ adıyla söyleyebilirsin (ör. triple süperfosfat, DAP, amonyum sülfat, üre, potasyum sülfat,
  çinko sülfat, demir şelatı, elementel kükürt, jips, yanmış ahır gübresi, kompost, yeşil gübre bitkileri).
- Ticari MARKA verme. Kesin doz (kg/da) verme: doz verim hedefine, bitkiye ve önceki gübrelemeye göre değişir;
  doz için İlçe Tarım ve Orman Müdürlüğü'ne veya bir ziraat mühendisine danışılmasını belirt (bunu bir kez söylemen yeterli).
- Planlanan bitki verilmişse tüm önerileri o bitkiye göre yap (ekim zamanı, kritik dönemler). Verilmemişse genel konuş.
- Toprak bünyesini (kumlu/killi) sulama ve toprak işleme önerilerinde dikkate al.
- Raporda olmayan değerleri tahmin etme. Önemli bir analiz eksikse (ör. azot ölçülmemişse) "ekAnalizOnerisi" içinde belirt.
- Dil: kısa, net cümleler; teknik terimi parantez içinde açıkla; hitap "siz". Abartı ve korkutucu ifade kullanma.
- Cevabını yalnızca cozum_plani aracıyla ver.`;

const str = { type: 'string' } as const;
const list = (max: number, description: string) => ({ type: 'array', items: str, maxItems: max, description }) as const;

const TOOL: Anthropic.Tool = {
  name: 'cozum_plani',
  description: 'Toprak analiz sonucuna göre çözüm planını kaydeder.',
  input_schema: {
    type: 'object',
    properties: {
      ozet: { type: 'string', description: 'Toprağın genel durumu, 2-3 cümle.' },
      sorunlar: {
        type: 'array',
        maxItems: 8,
        description: 'Yalnızca dikkat/sorun durumundaki parametreler, önem sırasına göre.',
        items: {
          type: 'object',
          properties: {
            parametre: { type: 'string', description: 'Tablodaki adıyla, ör. "Organik madde"' },
            etki: { type: 'string', description: 'Bitkiye etkisi, 1 cümle.' },
            cozum: { type: 'string', description: 'Ne yapılmalı, 1-2 cümle.' },
            zaman: { type: 'string', description: 'Ne zaman, ör. "Ekimden önce, toprak hazırlığında"' },
          },
          required: ['parametre', 'etki', 'cozum', 'zaman'],
        },
      },
      gubreleme: list(4, 'Gübreleme önerileri (tür ve zamanlama, doz yok).'),
      toprakIyilestirme: list(4, 'Organik madde, pH, kireç, tuzluluk ve yapı için öneriler.'),
      sulama: list(3, 'Sulama ve toprak işleme önerileri (bünyeye göre).'),
      bitkiUygunlugu: {
        type: ['string', 'null'],
        description: 'Planlanan bitki için 1-2 cümle değerlendirme; bitki yoksa null.',
      },
      ekAnalizOnerisi: {
        type: ['string', 'null'],
        description: 'Yaptırılması faydalı olacak ek analiz varsa 1 cümle; yoksa null.',
      },
    },
    required: ['ozet', 'sorunlar', 'gubreleme', 'toprakIyilestirme', 'sulama', 'bitkiUygunlugu', 'ekAnalizOnerisi'],
  },
};

export async function POST(req: Request) {
  try {
    const report = (await req.json()) as SoilReport;
    const hasData = Object.keys(report?.values ?? {}).length > 0 || (report?.ekDegerler?.length ?? 0) > 0;
    if (!hasData) {
      return NextResponse.json({ error: 'Yorum için en az bir ölçüm değeri gerekli.' }, { status: 400 });
    }

    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 6000,
      system: SYSTEM,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: TOOL.name },
      messages: [{ role: 'user', content: JSON.stringify(buildAiPayload(report)) }],
    });

    if (msg.stop_reason === 'max_tokens') {
      throw new Error('Cevap uzunluk sınırına takıldı (max_tokens). Sınırı artırın.');
    }

    const block = msg.content.find((b) => b.type === 'tool_use');
    if (!block || block.type !== 'tool_use') throw new Error('Model cozum_plani aracını kullanmadı.');

    return NextResponse.json(block.input);
  } catch (err) {
    console.error('yorum hatası', err);
    return NextResponse.json(
      { error: 'Çözüm planı şu anda oluşturulamadı. Analiz tablosu yine de geçerlidir.' },
      { status: 500 },
    );
  }
}