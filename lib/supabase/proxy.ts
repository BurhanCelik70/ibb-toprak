import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** Giriş gerektiren sayfalar */
const KORUMALI = ['/tarlalar', '/hesap'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return supabaseResponse;

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  // createServerClient ile getClaims arasına kod koymayın (oturum rastgele kapanabilir).
  const { data } = await supabase.auth.getClaims();
  const girisli = !!data?.claims;
  const yol = request.nextUrl.pathname;

  const yonlendir = (hedef: string, sonra?: string) => {
    const url = request.nextUrl.clone();
    url.pathname = hedef;
    url.search = sonra ? `?sonra=${encodeURIComponent(sonra)}` : '';
    const res = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!girisli && KORUMALI.some((p) => yol === p || yol.startsWith(`${p}/`))) return yonlendir('/giris', yol);
  if (girisli && yol === '/giris') return yonlendir('/tarlalar');

  return supabaseResponse;
}
