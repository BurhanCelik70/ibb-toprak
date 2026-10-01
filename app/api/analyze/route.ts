import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      ph,
      nitrogen,
      phosphorus,
      potassium,
      moisture,
      organicMatter,
      crop,
      location,
    } = data;

    const prompt = `
Sen "Toprak Rehberi" adlı tarım uygulamasının yapay zeka analiz asistanısın.

Kullanıcının verdiği toprak ve tarım bilgilerini değerlendir.

ÖNEMLİ:
- Kesin tarımsal karar verme.
- Laboratuvar analizinin yerini aldığını söyleme.
- Bilinmeyen değerleri tahmin etme.
- Verilen değerleri açıkça kullan.
- Değerlerden biri yoksa bunu belirt.
- Çiftçinin anlayabileceği sade Türkçe kullan.
- Gereksiz teknik ifadeler kullanma.

Kullanıcı bilgileri:

pH: ${ph ?? "Bilinmiyor"}
Azot (N): ${nitrogen ?? "Bilinmiyor"}
Fosfor (P): ${phosphorus ?? "Bilinmiyor"}
Potasyum (K): ${potassium ?? "Bilinmiyor"}
Toprak nemi: ${moisture ?? "Bilinmiyor"}
Organik madde: ${organicMatter ?? "Bilinmiyor"}
Yetiştirilecek ürün: ${crop ?? "Belirtilmemiş"}
Konum: ${location ?? "Belirtilmemiş"}

Şu başlıklarla kısa ve anlaşılır bir değerlendirme hazırla:

1. Toprak durumu
2. Dikkat edilmesi gerekenler
3. Ürün açısından değerlendirme
4. Geliştirme önerileri

Eğer veriler yetersizse, hangi bilgilerin eksik olduğunu ayrıca belirt.
`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return NextResponse.json({
      success: true,
      result: text,
    });
  } catch (error) {
    console.error("Claude API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Toprak analizi sırasında bir hata oluştu.",
      },
      { status: 500 }
    );
  }
}