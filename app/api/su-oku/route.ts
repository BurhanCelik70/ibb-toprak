/**
 * POST /api/su-oku  (multipart/form-data, alan adı: "file")
 * PDF veya fotoğraftaki SULAMA SUYU analiz raporunu okur; değerleri standart birimlere (EC µS/cm, iyonlar me/l) çevirip döndürür.
 * Dönen değerler kullanıcıya kontrol ekranında onaylatılır.
 */
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { SU_ALANLARI, birimdenStandart, sayiCoz, type SuAlan, type SuRaporu } from '@/lib/su';
import { oturumKullanici } from '@/lib/supabase/server';

export const maxDuration = 300;

const client = new Anthropic();
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5-5';
const MAX_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const PROMPT = `Bu belge Türkiye'deki bir laboratuvarın SULAMA SUYU analiz raporu. Değerleri OKU, hesaplama yapma, tahmin etme.
Okuyamadığın ya da raporda olmayan değeri yazma. Sayıları nokta ondalık ayırıcı ile ver (7,12 -> 7.12).
Her değeri raporda yazan BİRİMLE ver ve birimi "birimler" içine aynen yaz (ör. "µS/cm", "dS/m", "mmhos/cm", "me/l", "meq/l", "mg/l", "ppm").

"degerler" anahtarları (raporda varsa):
ec (Elektriksel iletkenlik / EC / Tuzluluk), ph, na (Sodyum), ca (Kalsiyum), mg (Magnezyum), caMg (yalnızca Ca+Mg birlikte verilmişse),
k (Potasyum), co3 (Karbonat), hco3 (Bikarbonat), cl (Klorür), so4 (Sülfat), b (Bor), no3n (Nitrat azotu NO3-N; raporda NO3 yazıyorsa "no3" anahtarıyla ver),
sar (raporda yazan SAR değeri).

Raporda sınıf yazıyorsa (ör. "C3S1", "T3A1") "labSinif" alanına aynen yaz.

Sadece şu JSON'u döndür, başka metin ekleme:
{"raporNo": "...", "raporTarihi": "...", "kaynakAdi": "kuyu / kanal / dere ...", "labSinif": "C3S1",
 "degerler": {"ec": 1150, "ph": 7.8, "na": 3.4},
 "birimler": {"ec": "µS/cm", "ph": "-", "na": "me/l"}}`;

const ANAHTARLAR = SU_ALANLARI.map((a) => a.key);

export async function POST(req: Request) {
  try {
    const { kullaniciId } = await oturumKullanici();
    if (!kullaniciId) return NextResponse.json({ error: 'Devam etmek için giriş yapın.' }, { status: 401 });

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Dosya 10 MB’tan büyük olamaz.' }, { status: 413 });

    const data = Buffer.from(await file.arrayBuffer()).toString('base64');
    let source: Anthropic.ContentBlockParam;
    if (file.type === 'application/pdf') {
      source = { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } };
    } else if ((IMAGE_TYPES as readonly string[]).includes(file.type)) {
      source = { type: 'image', source: { type: 'base64', media_type: file.type as (typeof IMAGE_TYPES)[number], data } };
    } else {
      return NextResponse.json({ error: 'Yalnızca PDF, JPG, PNG veya WEBP yükleyebilirsiniz.' }, { status: 415 });
    }

    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 3000,
      messages: [{ role: 'user', content: [source, { type: 'text', text: PROMPT }] }],
    });
    const text = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    const raw = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)) as {
      raporNo?: unknown;
      raporTarihi?: unknown;
      kaynakAdi?: unknown;
      labSinif?: unknown;
      degerler?: Record<string, unknown>;
      birimler?: Record<string, unknown>;
    };

    const degerler: SuRaporu['degerler'] = {};
    const birim = (k: string) => (typeof raw.birimler?.[k] === 'string' ? (raw.birimler[k] as string) : undefined);
    for (const k of ANAHTARLAR) {
      const v = sayiCoz(raw.degerler?.[k]);
      if (v === undefined) continue;
      degerler[k as SuAlan] = birimdenStandart(k as SuAlan, v, birim(k));
    }
    // NO3 verilmişse NO3-N'ye çevir (1 mg NO3 = 0,2259 mg N)
    const no3 = sayiCoz(raw.degerler?.no3);
    if (degerler.no3n === undefined && no3 !== undefined) degerler.no3n = no3 * 0.2259;
    const sar = sayiCoz(raw.degerler?.sar);
    if (sar !== undefined) degerler.sarLab = sar;

    if (!Object.keys(degerler).length) {
      return NextResponse.json({ error: 'Belgede sulama suyu değeri bulunamadı. Değerleri elle girebilirsiniz.' }, { status: 422 });
    }
    const str = (x: unknown) => (typeof x === 'string' && x.trim() ? x.trim() : undefined);
    const rapor: SuRaporu = {
      raporNo: str(raw.raporNo),
      raporTarihi: str(raw.raporTarihi),
      kaynakAdi: str(raw.kaynakAdi),
      labSinif: str(raw.labSinif),
      degerler,
    };
    return NextResponse.json({ rapor });
  } catch (err) {
    console.error('su-oku hatası', err);
    return NextResponse.json({ error: 'Rapor okunamadı. Daha net bir fotoğraf deneyin ya da değerleri elle girin.' }, { status: 500 });
  }
}
