import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/** Sunucu bileşenleri, server action'lar ve API route'ları için. Her istekte yeniden oluşturun. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component içinden çağrıldıysa yok sayılır; oturumu proxy yeniler.
        }
      },
    },
  });
}

/** Giriş yapmış kullanıcının kimliği (yoksa null). Yetki kararları için getClaims kullanılır. */
export async function oturumKullanici() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub as string | undefined;
  return { supabase, kullaniciId: id ?? null };
}
