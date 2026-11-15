/** Dünya ülkesinin bölgeleri (eyalet / il), tarla formundaki seçim kutusu için. ?u=AZ */
import { NextResponse } from 'next/server';
import { dunyaBolgeleri } from '@/lib/dunyaIklim';
import { DUNYA_ATLAS } from '@/lib/dunya';

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get('u') ?? '';
  if (!/^[A-Z]{2}$/.test(u) || !DUNYA_ATLAS[u]) return NextResponse.json({ error: 'Ülke bulunamadı.' }, { status: 400 });
  return NextResponse.json(
    { bolgeler: dunyaBolgeleri(u) },
    { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=2592000' } },
  );
}
