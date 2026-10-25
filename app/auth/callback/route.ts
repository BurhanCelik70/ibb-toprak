/**
 * Google girişi ve e-postadaki giriş bağlantısı buraya döner.
 * - Google ve varsayılan Supabase e-posta şablonu: ?code=… (aynı tarayıcıda)
 * - Bizim şablonumuz: ?token_hash=…&type=email (hangi tarayıcıda açılırsa açılsın çalışır)
 * Giriş olunca ad soyad yoksa ad adımına, varsa istenen sayfaya gönderir.
 */
import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const guvenliYol = (s: string | null) => (s && s.startsWith('/') && !s.startsWith('//') ? s : '/tarlalar');

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const sonra = guvenliYol(searchParams.get('sonra'));
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = (searchParams.get('type') ?? 'email') as EmailOtpType;

  const supabase = await createClient();
  let hata = true;
  if (code) hata = !!(await supabase.auth.exchangeCodeForSession(code)).error;
  else if (tokenHash) hata = !!(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;

  if (hata) return NextResponse.redirect(`${origin}/giris?hata=baglanti&sonra=${encodeURIComponent(sonra)}`);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profil } = user
    ? await supabase.from('profiller').select('ad_soyad').eq('id', user.id).maybeSingle()
    : { data: null };
  if (!profil?.ad_soyad) {
    // Google ile girişte ad soyad Google hesabından gelir; o zaman ayrıca sormayız
    const googleAdi = String(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? '').trim();
    if (user && googleAdi.length >= 2) {
      await supabase.from('profiller').upsert({ id: user.id, ad_soyad: googleAdi.slice(0, 80) });
      return NextResponse.redirect(`${origin}${sonra}`);
    }
    return NextResponse.redirect(`${origin}/giris?adim=ad&sonra=${encodeURIComponent(sonra)}`);
  }
  return NextResponse.redirect(`${origin}${sonra}`);
}
