/**
 * POST /api/yorum
 * Doğrulanmış toprak değerlerini alır, vatandaşa sade Türkçe yorum döndürür.
 * API anahtarı yalnızca sunucuda durur (.env.local -> ANTHROPIC_API_KEY).
 *
 * Cevap "tool" olarak istenir: böylece her zaman geçerli JSON gelir, elle ayrıştırma gerekmez.
 */
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { buildAiPayload, type SoilReport } from '@/lib/toprak';

const client = new Anthropic();
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5-5';

const SYSTEM = `Sen İstanbul Büyükşehir Belediyesi Çevre Koruma ve Kontrol Dairesi Başkanlığı'nın "Toprak Rehberi" asistanısın.
Görevin: laboratuvar toprak analiz sonuçlarını tarım bilgisi olmayan bir vatandaşın anlayacağı sade Türkçeyle açıklamak.

Kurallar:
- Sana verilen sayıları ve sınıfları (sinif alanı) AYNEN kullan. Yeni ölçüm değeri uydurma, sınıfları değiştirme.
- "kaynak: laboratuvar" olan sınıflar resmî laboratuvar değerlendirmesidir; onlarla çelişme.
- Kesin gübre dozu, ilaç adı veya marka verme. Laboratuvar raporu da bağlayıcı gübreleme reçetesi değildir.
  Genel yön ver (ör. "fosforlu gübre ihtiyacı olabilir") ve kesin miktar için İlçe Tarım ve Orman Müdürlüğü'ne
  veya bir ziraat mühendisine danışılmasını öner.
- Planlanan bitki verilmişse önerileri o bitkiye göre yap; verilmemişse genel konuş.
- Kısa cümleler, teknik terim kullanırsan parantez içinde açıkla. Hitap: "siz".
- Raporda olmayan (sana gönderilmeyen) değerleri tahmin etme; önemli bir değer eksikse bunu "dikkatEdilecekler" içinde kısaca belirt.
- KISA TUT: her listede en fazla 3 madde, her madde en fazla 2 cümle.
- Cevabını yalnızca yorum_yaz aracıyla ver.`;

const TOOL: Anthropic.Tool = {
  name: 'yorum_yaz',
  description: 'Toprak analiz sonucunun vatandaşa yönelik sade yorumunu kaydeder.',
  input_schema: {
    type: 'object',
    properties: {
      ozet: { type: 'string', description: '2-3 cümlelik genel durum' },
      gucluYonler: { type: 'array', items: { type: 'string' }, maxItems: 3 },
      dikkatEdilecekler: { type: 'array', items: { type: 'string' }, maxItems: 3 },
      oneriler: {
        type: 'array',
        maxItems: 3,
        items: {
          type: 'object',
          properties: { baslik: { type: 'string' }, aciklama: { type: 'string' } },
          required: ['baslik', 'aciklama'],
        },
      },
      bitkiUygunlugu: {
        type: ['string', 'null'],
        description: 'Planlanan bitki için 1-2 cümle; bitki verilmediyse null',
      },
    },
    required: ['ozet', 'gucluYonler', 'dikkatEdilecekler', 'oneriler', 'bitkiUygunlugu'],
  },
};

export async function POST(req: Request) {
  try {
    const report = (await req.json()) as SoilReport;
    if (!report?.values || Object.keys(report.values).length === 0) {
      return NextResponse.json({ error: 'Yorum için en az bir ölçüm değeri gerekli.' }, { status: 400 });
    }

    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: TOOL.name },
      messages: [{ role: 'user', content: JSON.stringify(buildAiPayload(report)) }],
    });

    if (msg.stop_reason === 'max_tokens') {
      throw new Error('Cevap uzunluk sınırına takıldı (max_tokens). Sınırı artırın.');
    }

    const block = msg.content.find((b) => b.type === 'tool_use');
    if (!block || block.type !== 'tool_use') throw new Error('Model yorum_yaz aracını kullanmadı.');

    return NextResponse.json(block.input);
  } catch (err) {
    console.error('yorum hatası', err);
    return NextResponse.json(
      { error: 'Yorum şu anda oluşturulamadı. Değerlendirme tablosu yine de geçerlidir.' },
      { status: 500 },
    );
  }
}