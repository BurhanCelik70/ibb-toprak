/**
 * POST /api/rapor-oku  (multipart/form-data, alan adı: "file")
 * PDF veya fotoğraftaki İBB toprak analiz raporunu okuyup SoilReport JSON'u döndürür.
 * Dönen değerler kullanıcıya ÖZET ekranında onaylatılmalıdır – OCR hata yapabilir.
 */
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { ISTANBUL_ILCELERI, PARAMS, parseNumber, type ParamKey, type SoilReport } from '@/lib/toprak';

export const maxDuration = 60;

const client = new Anthropic();
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5-5';
const MAX_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const PROMPT = `Bu belge İBB Çevre Laboratuvarı toprak analiz raporu. Değerleri OKU, hesaplama yapma.
Belgede birden fazla rapor varsa hepsini dizi olarak ver. Okuyamadığın değeri dahil etme (tahmin etme).
Sayıları nokta ondalık ayırıcı ile ver (7,12 -> 7.12). EC değerini raporda yazan birimle (µS/cm) ver.
Sadece şu JSON dizisini döndür, başka metin ekleme:
[{
  "raporNo": "T26-286", "raporTarihi": "...", "adres": "...", "numuneAdi": "...", "bitki": "...",
  "bunyeSinifi": "CL (Killi Tın Bünyeli)",
  "values": {"doygunluk": 0, "ph": 0, "ec": 0, "tuz": 0, "kum": 0, "silt": 0, "kil": 0,
             "kirec": 0, "organikMadde": 0, "fosfor": 0, "potasyum": 0},
  "labDegerlendirme": {"doygunluk": "...", "ph": "...", "ec": "...", "bunye": "...", "kirec": "...",
                       "organikMadde": "...", "fosfor": "...", "potasyum": "..."}
}]`;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Dosya 10 MB’tan büyük olamaz.' }, { status: 413 });

    const data = Buffer.from(await file.arrayBuffer()).toString('base64');
    let source: Anthropic.ContentBlockParam;
    if (file.type === 'application/pdf') {
      source = { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } };
    } else if ((IMAGE_TYPES as readonly string[]).includes(file.type)) {
      source = {
        type: 'image',
        source: { type: 'base64', media_type: file.type as (typeof IMAGE_TYPES)[number], data },
      };
    } else {
      return NextResponse.json({ error: 'Yalnızca PDF, JPG, PNG veya WEBP yükleyebilirsiniz.' }, { status: 415 });
    }

    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      messages: [{ role: 'user', content: [source, { type: 'text', text: PROMPT }] }],
    });

    const text = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    const raw = JSON.parse(text.replace(/```json|```/g, '').trim());
    const parsed = (Array.isArray(raw) ? raw : [raw]) as SoilReport[];

    const reports = parsed.map((r) => ({
      ...r,
      // null, metin ya da birimli değerleri sayıya çevir; okunamayanları at
      values: Object.fromEntries(
        (Object.keys(PARAMS) as ParamKey[])
          .map((k) => [k, parseNumber(r.values?.[k])] as const)
          .filter(([, v]) => v !== undefined),
      ),
      labDegerlendirme: r.labDegerlendirme ?? {},
      ilce:
        r.ilce ??
        ISTANBUL_ILCELERI.find((i) => r.adres?.toLocaleLowerCase('tr-TR').includes(i.toLocaleLowerCase('tr-TR'))),
    }));

    return NextResponse.json({ reports });
  } catch (err) {
    console.error('rapor-oku hatası', err);
    return NextResponse.json(
      { error: 'Rapor okunamadı. Daha net bir fotoğraf deneyin ya da değerleri elle girin.' },
      { status: 500 },
    );
  }
}