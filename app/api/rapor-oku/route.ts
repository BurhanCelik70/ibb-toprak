/**
 * POST /api/rapor-oku  (multipart/form-data, alan adı: "file")
 * PDF veya fotoğraftaki toprak analiz raporunu okuyup SoilReport JSON'u döndürür.
 * Dönen değerler kullanıcıya ÖZET ekranında onaylatılmalıdır – OCR hata yapabilir.
 */
import Anthropic from '@anthropic-ai/sdk';
import { ilBul } from '@/lib/bolgeler';
import { NextResponse } from 'next/server';
import {
  ISTANBUL_ILCELERI,
  PARAMS,
  parseNumber,
  unitCompatible,
  type EkDeger,
  type ParamKey,
  type SoilReport,
} from '@/lib/toprak';
import { oturumKullanici } from '@/lib/supabase/server';

export const maxDuration = 60;

const client = new Anthropic();
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5-5';
const MAX_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const PROMPT = `Bu belge Türkiye'deki bir laboratuvarın toprak analiz raporu (İBB, il tarım müdürlüğü, üniversite, ziraat odası, özel laboratuvar vb.). Değerleri OKU, hesaplama yapma.
Belgede birden fazla rapor/numune varsa hepsini dizi olarak ver. Okuyamadığın değeri dahil etme, tahmin etme.
Sayıları nokta ondalık ayırıcı ile ver (7,12 -> 7.12). Her değeri raporda yazan birimle ver ve birimi "birimler" içine yaz.

"values" anahtarları (raporda varsa):
doygunluk (Su ile doygunluk %), ph, ec (EC, µS/cm), tuz (%), kum, silt, kil (%), kirec (Kireç %),
organikMadde (%), fosfor (Yarayışlı fosfor, P2O5 kg/da), potasyum (Yarayışlı potasyum, K2O kg/da),
azot (Toplam azot %), demir (Fe), cinko (Zn), mangan (Mn), bakir (Cu), bor (B).

ÖNEMLİ: Tablodaki HER ölçüm satırını al. Yukarıdaki listede olmayan her ölçümü (ör. kalsiyum, magnezyum,
sodyum, kükürt, nitrat) "ekDegerler" içine yaz. Hiçbir satırı atlama.

Sadece şu JSON dizisini döndür, başka metin ekleme:
[{
  "raporNo": "...", "raporTarihi": "...", "adres": "...", "ilce": "ilçe ve il, ör. Çumra, Konya", "numuneAdi": "...", "bitki": "...",
  "bunyeSinifi": "CL (Killi Tın Bünyeli)",
  "values": {"ph": 7.12, "ec": 658},
  "birimler": {"ph": "-", "ec": "µS/cm"},
  "labDegerlendirme": {"ph": "Nötr", "ec": "Tuzsuz", "bunye": "..."},
  "ekDegerler": [{"ad": "Kalsiyum (Ca)", "deger": 3200, "birim": "mg/kg", "labDegerlendirme": "Yeterli"}]
}]`;

type RawReport = SoilReport & { birimler?: Record<string, unknown> };

/** Yapay zekanın döndürdüğü raporu temizler: sayıya çevirir, birimi uymayanı "ek değerler"e taşır. */
function cleanReport(r: RawReport): SoilReport {
  const values: SoilReport['values'] = {};
  const labDegerlendirme: SoilReport['labDegerlendirme'] = {};
  const ekDegerler: EkDeger[] = [];

  (Object.keys(PARAMS) as ParamKey[]).forEach((k) => {
    const v = parseNumber(r.values?.[k]);
    if (v === undefined) return;
    const unit = typeof r.birimler?.[k] === 'string' ? (r.birimler[k] as string) : undefined;
    const lab = r.labDegerlendirme?.[k];
    if (unitCompatible(k, unit)) {
      values[k] = v;
      if (typeof lab === 'string' && lab.trim()) labDegerlendirme[k] = lab.trim();
    } else {
      ekDegerler.push({ ad: PARAMS[k].label, deger: v, birim: unit, labDegerlendirme: typeof lab === 'string' ? lab : undefined });
    }
  });
  if (typeof r.labDegerlendirme?.bunye === 'string') labDegerlendirme.bunye = r.labDegerlendirme.bunye;

  for (const e of Array.isArray(r.ekDegerler) ? r.ekDegerler : []) {
    const deger = parseNumber(e?.deger);
    if (typeof e?.ad !== 'string' || deger === undefined) continue;
    ekDegerler.push({
      ad: e.ad.trim(),
      deger,
      birim: typeof e.birim === 'string' ? e.birim : undefined,
      labDegerlendirme: typeof e.labDegerlendirme === 'string' ? e.labDegerlendirme : undefined,
    });
  }

  const str = (x: unknown) => (typeof x === 'string' && x.trim() ? x.trim() : undefined);
  const adres = str(r.adres);
  return {
    raporNo: str(r.raporNo),
    raporTarihi: str(r.raporTarihi),
    adres,
    numuneAdi: str(r.numuneAdi),
    bitki: str(r.bitki),
    bunyeSinifi: str(r.bunyeSinifi),
    ilce:
      str(r.ilce) ??
      ISTANBUL_ILCELERI.find((i) => adres?.toLocaleLowerCase('tr-TR').includes(i.toLocaleLowerCase('tr-TR'))) ??
      ilBul(adres),
    values,
    labDegerlendirme,
    ekDegerler,
  };
}

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
    // Cevabın başında/sonunda açıklama metni olsa bile yalnızca JSON kısmını al
    const start = text.search(/[[{]/);
    const end = Math.max(text.lastIndexOf(']'), text.lastIndexOf('}'));
    const raw = JSON.parse(text.slice(start, end + 1));
    const parsed = (Array.isArray(raw) ? raw : [raw]) as SoilReport[];

    const reports = parsed.map((r) => cleanReport(r as RawReport));

    return NextResponse.json({ reports });
  } catch (err) {
    console.error('rapor-oku hatası', err);
    return NextResponse.json(
      { error: 'Rapor okunamadı. Daha net bir fotoğraf deneyin ya da değerleri elle girin.' },
      { status: 500 },
    );
  }
}
