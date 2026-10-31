/**
 * POST /api/su-yorum  { suAnaliziId, yenile? }
 * Sınıflandırma ve tüm hesaplar kodda (lib/su.ts) yapılır; yapay zeka yalnızca sonucu çiftçinin anlayacağı dille anlatır.
 */
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { SULAMA_YONTEMLERI, type SulamaYontemi } from '@/lib/sulama';
import { suAiOzeti, suDegerlendir } from '@/lib/su';
import { oturumKullanici } from '@/lib/supabase/server';
import type { SuAnalizi, Tarla } from '@/lib/veri';

export const maxDuration = 300;

const client = new Anthropic();
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5-5';

const SYSTEM = `Sen sulama suyu kalitesini çiftçiye anlatan deneyimli bir ziraat mühendisisin ("Tarım Ticareti ve İşletmeciliği 4.0" uygulaması).
Sana bir sulama suyu analizinin KODDA HESAPLANMIŞ sonuçları verilir: ABD Tuzluluk Laboratuvarı sınıfı (C-S), FAO 29 tablosuna göre
her sorunun kısıtlama derecesi, kalıntı sodyum karbonat (RSC), bitkiye göre bor ve tuz toleransı, sulama yöntemlerinin uygunluğu.

KURALLAR
1. Sınıfları, dereceleri, sayıları DEĞİŞTİRME; yeni sayı uydurma. Verilen sayıları gerekirse aynen kullan.
2. Çiftçinin anlayacağı sade Türkçe: kısa cümleler, "siz" hitabı. Teknik terimi parantez içinde bir kelimeyle açıkla.
3. Korkutma, abartma. "Uzmana danışın" gibi kaçamak cümleler yazma.
4. Ürün ya da marka adı yazma.

ÇIKTI (su_yorumu aracı):
- ozet: 2-3 cümle. Suyun genel durumu ve en önemli 1-2 konu, bu bitki ve bu sulama yöntemi için ne anlama geldiği.
- yapilacaklar: önem sırasına göre 3-5 madde; her biri tek cümle, somut eylem (ne, ne zaman, nasıl).
- yontemNotu: 1-2 cümle. Kullandığı sulama yöntemi bu su için uygun mu; değilse önerilen yöntem ve nedeni.
- bitkiNotu: bitki biliniyorsa 1 cümle (tuz ve bor toleransına göre); bilinmiyorsa null.
Cevabını YALNIZCA su_yorumu aracını çağırarak ver.`;

const TOOL: Anthropic.Tool = {
  name: 'su_yorumu',
  description: 'Sulama suyu analizinin sade anlatımını kaydeder.',
  input_schema: {
    type: 'object',
    properties: {
      ozet: { type: 'string' },
      yapilacaklar: { type: 'array', items: { type: 'string' }, maxItems: 5 },
      yontemNotu: { type: 'string' },
      bitkiNotu: { type: ['string', 'null'] },
    },
    required: ['ozet', 'yapilacaklar', 'yontemNotu', 'bitkiNotu'],
  },
};

export async function POST(req: Request) {
  try {
    const { supabase, kullaniciId } = await oturumKullanici();
    if (!kullaniciId) return NextResponse.json({ error: 'Devam etmek için giriş yapın.' }, { status: 401 });
    const { suAnaliziId, yenile } = (await req.json()) as { suAnaliziId?: string; yenile?: boolean };
    if (!suAnaliziId) return NextResponse.json({ error: 'Analiz bulunamadı.' }, { status: 400 });

    const { data: su } = await supabase.from('su_analizleri').select('*').eq('id', suAnaliziId).single<SuAnalizi>();
    if (!su) return NextResponse.json({ error: 'Analiz bulunamadı.' }, { status: 404 });
    if (su.yorum && !yenile) return NextResponse.json(su.yorum);
    const { data: tarla } = await supabase.from('tarlalar').select('*').eq('id', su.tarla_id).single<Tarla>();
    if (!tarla) return NextResponse.json({ error: 'Tarla bulunamadı.' }, { status: 404 });

    const yontem = tarla.sulama as SulamaYontemi;
    const v = suDegerlendir(su.rapor, { bitki: tarla.bitki, yontem });
    const input = suAiOzeti(su.rapor, v, { bitki: tarla.bitki, yontem: SULAMA_YONTEMLERI[yontem].ad, il: tarla.il });

    const mesaj = { role: 'user' as const, content: JSON.stringify(input) };
    let msg = await client.messages.create({ model: MODEL, max_tokens: 2000, system: SYSTEM, tools: [TOOL], tool_choice: { type: 'auto' }, messages: [mesaj] });
    if (!msg.content.some((b) => b.type === 'tool_use')) {
      msg = await client.messages.create({
        model: MODEL,
        max_tokens: 2000,
        system: SYSTEM,
        tools: [TOOL],
        tool_choice: { type: 'auto' },
        messages: [mesaj, { role: 'assistant', content: msg.content }, { role: 'user', content: 'Lütfen cevabı su_yorumu aracını çağırarak ver.' }],
      });
    }
    const block = msg.content.find((b) => b.type === 'tool_use');
    if (!block || block.type !== 'tool_use') throw new Error('Model su_yorumu aracını kullanmadı.');
    const o = block.input as Record<string, unknown>;
    const yorum = {
      ozet: typeof o.ozet === 'string' ? o.ozet : '',
      yapilacaklar: (Array.isArray(o.yapilacaklar) ? o.yapilacaklar : []).filter((x): x is string => typeof x === 'string'),
      yontemNotu: typeof o.yontemNotu === 'string' ? o.yontemNotu : '',
      bitkiNotu: typeof o.bitkiNotu === 'string' && o.bitkiNotu.trim() ? o.bitkiNotu : null,
    };
    await supabase.from('su_analizleri').update({ yorum, yorum_tarihi: new Date().toISOString() }).eq('id', suAnaliziId);
    return NextResponse.json(yorum);
  } catch (err) {
    console.error('su-yorum hatası', err);
    return NextResponse.json({ error: 'Yorum şu anda hazırlanamadı. Su karnesi yine de geçerlidir.' }, { status: 500 });
  }
}
