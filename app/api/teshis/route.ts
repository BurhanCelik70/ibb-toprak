/**
 * POST /api/teshis  (multipart/form-data)
 *   foto: 1–3 resim (yakın yaprak, bütün bitki, tarla)
 *   cevaplar: JSON (TeshisCevaplari)
 * Yapay zeka fotoğrafı ve cevapları değerlendirip olasılıklı teşhis döndürür.
 * Ürün önerisi YAPAY ZEKAYA BIRAKILMAZ: istemci, teşhis edilen besine göre lib/teshis.ts'teki katalog eşleştirmesini gösterir.
 */
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { bolgeBilgisi } from '@/lib/bolgeler';
import { HASTALIKLAR } from '@/lib/hastaliklar';
import { suDegerlendir } from '@/lib/su';
import { SULAMA_YONTEMLERI } from '@/lib/sulama';
import { oturumKullanici } from '@/lib/supabase/server';
import type { Besin, TeshisCevaplari, TeshisSonucu, TeshisTuru } from '@/lib/teshis';
import { buildAiPayload } from '@/lib/toprak';
import type { Analiz, SuAnalizi, Tarla } from '@/lib/veri';

export const maxDuration = 300;

const client = new Anthropic();
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5-5';
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_BYTES = 4 * 1024 * 1024;

const SYSTEM = `Sen Türkiye'de tarla, bahçe ve serada 20 yıl çalışmış, bitki besleme ve bitki koruma konusunda uzman bir ziraat mühendisisin.
"Tarım Ticareti ve İşletmeciliği 4.0" uygulamasında çiftçinin gönderdiği yaprak / bitki fotoğraflarına ve cevaplarına bakarak OLASILIKLI bir ön teşhis yapıyorsun.

NASIL DÜŞÜN (sırayla):
1. Fotoğraf uygun mu? Bitki ve belirti net görünüyor mu? Bitki değilse, çok bulanık/karanlıksa ya da belirti seçilmiyorsa gorselUygun=false yap,
   gorselNotu'na hangi fotoğrafın nasıl çekilmesi gerektiğini yaz (ör. "Gün ışığında, sararmış yaprağı tek başına ve yakından, alt yüzüyle birlikte çekin").
   Yine de görebildiğin kadarıyla düşük yüzdeli olasılıklar verebilirsin.
2. Fotoğraftaki bitki, kullanıcının yazdığı bitkiyle uyuşuyor mu? gorulenBitki'ye ne gördüğünü yaz; uyuşmuyorsa özette belirt.
3. Belirtinin KONUMU: Hareketli besinler (N, P, K, Mg) önce ALT/YAŞLI yapraklarda; hareketsizler (Fe, Zn, Mn, Cu, B, Ca, S) önce ÜST/GENÇ yapraklarda.
4. DESEN: Bütün yaprak sararması (N, S), damarlar arası sararma (genç yaprakta Fe/Mn/Zn, yaşlıda Mg), kenar/uç yanığı (K, tuz, bor fazlası),
   mor renk (P, soğuk), şekil bozukluğu ve büyüme noktası ölümü (B, Ca), meyvede çiçek burnu çürüklüğü (Ca).
5. BESİN Mİ, BAŞKA BİR ŞEY Mİ?
   - Besin noksanlığı: aynı yaştaki yapraklarda simetrik, düzenli desen; yaprağın iki yarısı benzer; tarlada geniş alanda ya da toprak tipine bağlı kümeler halinde.
   - Hastalık: düzensiz dağılmış lekeler, lekenin etrafında sarı hale, halkalı/iç içe lekeler, küf, pas kabarcıkları (sürtünce toz bırakır), yaprak altında tüylenme;
     nemli havadan sonra artış; tek tük bitkiden yayılma.
   - Zararlı: delikler, kemirme, yaprak altında böcek/akar, ağ, gümüşi noktalanma (trips, akar), yapışkanlık (yaprak biti).
   - İlaç yanığı / herbisit: birden ortaya çıkar, ilaçlama izi ya da sıra boyunca; genç yapraklarda kıvrılma, çanaklaşma, beyazlaşma; ilaçlamadan kısa süre sonra.
   - Çevre stresi: don (birden kahverengileşme, açıkta kalan yapraklar), sıcak/güneş yanığı (güneş alan yüz), su fazlası (bütün bitki sararır, kök çürür), kuraklık (solma, yaprak kıvrılması).
6. Cevapları ve (varsa) toprak analizini kullan: dönem, belirtinin nerede başladığı, tarladaki dağılım, son 2 haftadaki olaylar.
   Toprak analizi verildiyse bağla (ör. pH 8 ve kireç %15 → demir/çinko noksanlığı olasılığı artar; potasyum düşük → K noksanlığı güçlenir).
   Fotoğraf cevaplarla çelişiyorsa bunu açıkça söyle (ör. "Alt yapraklarda başladı dediniz, fotoğraftaki ise genç yaprak gibi görünüyor").
7. Noksanlıkla en sık karışan hastalıklar ve ayırt etme yolu (bu bitkilerden biriyse dikkate al; hastalık buysa adını aynen böyle yaz):
${HASTALIKLAR.map((h) => `   - ${h.bitki}: ${h.ad} (${h.etmen}). ${h.noksanliktanFarki}`).join('\n')}

OLASILIKLAR:
- En fazla 3 olasılık, en olasıdan başla. Yüzdeler tam sayı; toplamı 100'ü geçmesin.
- ASLA %100 deme. Fotoğraf ve cevaplar çok net uyuşuyorsa en fazla %90; belirsizse %40–70.
- Her olasılığın "neden"inde fotoğraftaki somut gözlemi ve cevapları kullan: renk, desen, hangi yaprak, bitkinin dönemi, dağılım, hava (1-2 cümle).
- "tur": besin | hastalik | zararli | abiyotik | saglikli. Besin ise "besin" alanına sembolü yaz (N, P, K, Mg, Ca, S, Fe, Zn, Mn, B, Cu), değilse null.
- Hastalıkta adını Türkçe yaz (ör. "Pas hastalığı", "Külleme", "Alternaria yaprak lekesi").

YAZIM:
- ozet: 1-2 cümle, "Büyük ihtimalle (%80) ... görünüyor, çünkü ..." biçiminde. Kesin konuşma ama kaçamak da olma.
- ipuclari: fotoğrafta ve cevaplarda dayandığın 2-4 somut gözlem.
- kontrol: emin olmak için çiftçinin tarlada bakabileceği 2-3 basit şey (ör. "Yaprağı ters çevirin; alt yüzde turuncu toz varsa pas", "Sağlıklı bir bitkiyle yan yana karşılaştırın", "Yaprak analizi yaptırın").
- yapilacaklar: 2-4 somut adım. ÜRÜN ya da MARKA ADI YAZMA (ürünler uygulamada ayrıca gösteriliyor).
  Hastalık ve zararlıda İLAÇ ÖNERME: ilaç adı, etken madde, ilaç grubu ya da "ilaçlayın" yazma. Yalnızca kültürel önlemleri yaz
  (hastalıklı yaprakları toplayın, sulamayı yaprağı ıslatmadan yapın, ekim nöbeti vb.) ve "il/ilçe tarım müdürlüğünüze ya da ziraat mühendisinize danışın" de.
- Sade Türkçe, kısa cümleler, "siz" hitabı. Korkutma. "Bu öneri bağlayıcı değildir" gibi kalıp cümleler yazma.
Cevabını YALNIZCA teshis aracını çağırarak ver.`;

const TOOL: Anthropic.Tool = {
  name: 'teshis',
  description: 'Yaprak / bitki fotoğrafına göre olasılıklı ön teşhisi kaydeder.',
  input_schema: {
    type: 'object',
    properties: {
      gorselUygun: { type: 'boolean' },
      gorselNotu: { type: ['string', 'null'], description: 'Fotoğraf yetersizse nasıl çekilmeli; uygunsa null' },
      gorulenBitki: { type: ['string', 'null'] },
      ozet: { type: 'string' },
      guven: { type: 'string', enum: ['yüksek', 'orta', 'düşük'] },
      olasiliklar: {
        type: 'array',
        maxItems: 3,
        items: {
          type: 'object',
          properties: {
            ad: { type: 'string' },
            tur: { type: 'string', enum: ['besin', 'hastalik', 'zararli', 'abiyotik', 'saglikli'] },
            besin: { type: ['string', 'null'], enum: ['N', 'P', 'K', 'Mg', 'Ca', 'S', 'Fe', 'Zn', 'Mn', 'B', 'Cu', null] },
            yuzde: { type: 'integer', minimum: 1, maximum: 90 },
            neden: { type: 'string' },
          },
          required: ['ad', 'tur', 'besin', 'yuzde', 'neden'],
        },
      },
      ipuclari: { type: 'array', items: { type: 'string' }, maxItems: 4 },
      kontrol: { type: 'array', items: { type: 'string' }, maxItems: 3 },
      yapilacaklar: { type: 'array', items: { type: 'string' }, maxItems: 4 },
    },
    required: ['gorselUygun', 'gorselNotu', 'gorulenBitki', 'ozet', 'guven', 'olasiliklar', 'ipuclari', 'kontrol', 'yapilacaklar'],
  },
};

const BESINLER: Besin[] = ['N', 'P', 'K', 'Mg', 'Ca', 'S', 'Fe', 'Zn', 'Mn', 'B', 'Cu'];
const TURLER: TeshisTuru[] = ['besin', 'hastalik', 'zararli', 'abiyotik', 'saglikli'];
const metinler = (x: unknown) => (Array.isArray(x) ? x.filter((s): s is string => typeof s === 'string' && !!s.trim()) : []);

export async function POST(req: Request) {
  try {
    const { supabase, kullaniciId } = await oturumKullanici();
    if (!kullaniciId) return NextResponse.json({ error: 'Teşhis için giriş yapın.' }, { status: 401 });

    const form = await req.formData();
    const fotolar = form.getAll('foto').filter((f): f is File => f instanceof File).slice(0, 3);
    if (!fotolar.length) return NextResponse.json({ error: 'En az bir fotoğraf ekleyin.' }, { status: 400 });
    const cevaplar = JSON.parse(String(form.get('cevaplar') ?? '{}')) as TeshisCevaplari;
    if (!cevaplar.bitki?.trim()) return NextResponse.json({ error: 'Bitkiyi seçin.' }, { status: 400 });

    const resimler: Anthropic.ContentBlockParam[] = [];
    const etiketler = ['Yakından yaprak', 'Bitkinin tamamı', 'Tarladan genel görünüm'];
    for (const [i, f] of fotolar.entries()) {
      if (!(IMAGE_TYPES as readonly string[]).includes(f.type)) return NextResponse.json({ error: 'Yalnızca JPG, PNG veya WEBP fotoğraf yükleyin.' }, { status: 415 });
      if (f.size > MAX_BYTES) return NextResponse.json({ error: 'Fotoğraf çok büyük.' }, { status: 413 });
      resimler.push({ type: 'text', text: `Fotoğraf ${i + 1}: ${String(form.get(`etiket${i}`) ?? etiketler[i] ?? '')}` });
      resimler.push({ type: 'image', source: { type: 'base64', media_type: f.type as (typeof IMAGE_TYPES)[number], data: Buffer.from(await f.arrayBuffer()).toString('base64') } });
    }

    // Seçilen tarlanın son toprak ve su analizi (varsa) bağlam olarak eklenir
    let tarlaBilgisi: Record<string, unknown> | undefined;
    if (cevaplar.tarlaId) {
      const [{ data: tarla }, { data: analiz }, { data: su }] = await Promise.all([
        supabase.from('tarlalar').select('*').eq('id', cevaplar.tarlaId).maybeSingle<Tarla>(),
        supabase.from('analizler').select('rapor, analiz_tarihi').eq('tarla_id', cevaplar.tarlaId).order('analiz_tarihi', { ascending: false }).limit(1).maybeSingle<Pick<Analiz, 'rapor' | 'analiz_tarihi'>>(),
        supabase.from('su_analizleri').select('rapor, analiz_tarihi').eq('tarla_id', cevaplar.tarlaId).order('analiz_tarihi', { ascending: false }).limit(1).maybeSingle<Pick<SuAnalizi, 'rapor' | 'analiz_tarihi'>>(),
      ]);
      if (tarla) {
        const sv = su ? suDegerlendir(su.rapor, { bitki: tarla.bitki, yontem: tarla.sulama }) : undefined;
        tarlaBilgisi = {
          il: tarla.il,
          ilce: tarla.ilce,
          bolge: bolgeBilgisi(tarla.il, tarla.ilce) ?? undefined,
          sulama: SULAMA_YONTEMLERI[tarla.sulama].ad,
          sonToprakAnalizi: analiz ? { tarih: analiz.analiz_tarihi, ...buildAiPayload(analiz.rapor) } : 'yok',
          sonSuAnalizi: sv ? { sinif: sv.sinif, genel: sv.genel.baslik, bulgular: sv.bulgular.map((b) => `${b.baslik}: ${b.deger} (${b.durum})`) } : 'yok',
        };
      }
    }

    const metin = {
      bitki: cevaplar.bitki,
      gelismeDonemi: cevaplar.donem ?? 'belirtilmedi',
      belirtininBasladigiYer: cevaplar.konum ?? 'belirtilmedi',
      belirtiler: cevaplar.belirtiler?.length ? cevaplar.belirtiler : 'belirtilmedi',
      tarladakiDagilim: cevaplar.dagilim ?? 'belirtilmedi',
      neZamandir: cevaplar.baslangic ?? 'belirtilmedi',
      son2HaftadakiOlaylar: cevaplar.olaylar?.length ? cevaplar.olaylar : 'belirtilmedi',
      ciftcininNotu: cevaplar.not?.slice(0, 600) || 'yok',
      tarla: tarlaBilgisi ?? 'Tarla seçilmedi; toprak analizi yok.',
    };

    const icerik: Anthropic.ContentBlockParam[] = [...resimler, { type: 'text', text: `Çiftçinin cevapları:\n${JSON.stringify(metin, null, 1)}` }];
    let msg = await client.messages.create({ model: MODEL, max_tokens: 3000, system: SYSTEM, tools: [TOOL], tool_choice: { type: 'auto' }, messages: [{ role: 'user', content: icerik }] });
    if (!msg.content.some((b) => b.type === 'tool_use')) {
      msg = await client.messages.create({
        model: MODEL,
        max_tokens: 3000,
        system: SYSTEM,
        tools: [TOOL],
        tool_choice: { type: 'auto' },
        messages: [{ role: 'user', content: icerik }, { role: 'assistant', content: msg.content }, { role: 'user', content: 'Lütfen cevabı teshis aracını çağırarak ver.' }],
      });
    }
    const block = msg.content.find((b) => b.type === 'tool_use');
    if (!block || block.type !== 'tool_use') throw new Error('Model teshis aracını kullanmadı.');
    const o = block.input as Record<string, unknown>;

    // Temizle: yüzdeleri sınırla (en fazla %90, toplam ≤ 100), türleri doğrula
    let olasiliklar = (Array.isArray(o.olasiliklar) ? o.olasiliklar : [])
      .map((x: Record<string, unknown>) => ({
        ad: String(x.ad ?? '').trim(),
        tur: (TURLER.includes(x.tur as TeshisTuru) ? x.tur : 'besin') as TeshisTuru,
        besin: BESINLER.includes(x.besin as Besin) ? (x.besin as Besin) : null,
        yuzde: Math.max(1, Math.min(90, Math.round(Number(x.yuzde) || 0))),
        neden: String(x.neden ?? '').trim(),
      }))
      .filter((x) => x.ad)
      .sort((a, b) => b.yuzde - a.yuzde)
      .slice(0, 3);
    const toplam = olasiliklar.reduce((t, x) => t + x.yuzde, 0);
    if (toplam > 100) olasiliklar = olasiliklar.map((x) => ({ ...x, yuzde: Math.max(1, Math.floor((x.yuzde * 100) / toplam)) }));
    olasiliklar = olasiliklar.map((x) => (x.tur === 'besin' ? x : { ...x, besin: null }));

    const sonuc: TeshisSonucu = {
      gorselUygun: o.gorselUygun !== false,
      gorselNotu: typeof o.gorselNotu === 'string' && o.gorselNotu.trim() ? o.gorselNotu : null,
      gorulenBitki: typeof o.gorulenBitki === 'string' && o.gorulenBitki.trim() ? o.gorulenBitki : null,
      ozet: typeof o.ozet === 'string' ? o.ozet : '',
      guven: o.guven === 'yüksek' || o.guven === 'düşük' ? o.guven : 'orta',
      olasiliklar,
      ipuclari: metinler(o.ipuclari),
      kontrol: metinler(o.kontrol),
      yapilacaklar: metinler(o.yapilacaklar),
    };
    return NextResponse.json(sonuc);
  } catch (err) {
    console.error('teshis hatası', err);
    return NextResponse.json({ error: 'Teşhis şu anda yapılamadı. Biraz sonra tekrar deneyin.' }, { status: 500 });
  }
}
