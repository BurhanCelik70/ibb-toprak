import { ceviriAl } from '@/lib/dilSunucu';
import { redirect } from 'next/navigation';
import { DILLER } from '@/lib/dil';
import { AppHeader, SiteFooter } from '@/components/site';
import { oturumKullanici } from '@/lib/supabase/server';
import { CikisDugmesi } from './CikisDugmesi';

export async function generateMetadata() {
  const { tx } = await ceviriAl();
  return { title: tx('Hesabım'), robots: { index: false, follow: true } };
}

export default async function HesapSayfasi() {
  const { tx } = await ceviriAl();
  const { supabase, kullaniciId } = await oturumKullanici();
  if (!kullaniciId) redirect('/giris?sonra=/hesap');
  const { data: profil } = await supabase.from('profiller').select('ad_soyad, telefon, olusturma').eq('id', kullaniciId).maybeSingle();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { count } = await supabase.from('tarlalar').select('id', { count: 'exact', head: true });
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e6]">
      <AppHeader aktif="hesap" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:px-8">
        <h1 className="font-display text-4xl font-medium tracking-[-0.02em] sm:text-5xl">{tx("Hesabım")}</h1>
        <dl className="mt-6 divide-y divide-[#edf2ee] rounded-[24px] border border-[#dfe9df] bg-white px-5">
          {[
            [tx("Ad soyad"), profil?.ad_soyad ?? '—'],
            [tx("E-posta"), user?.email ?? profil?.telefon ?? '—'],
            [tx("Kayıtlı tarla"), String(count ?? 0)],
            [tx("Üyelik"), profil?.olusturma ? new Date(profil.olusturma).toLocaleDateString(DILLER[tx.dil].locale) : '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-4">
              <dt className="text-sm font-semibold text-[#51675d]">{k}</dt>
              <dd className="text-sm font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8">
          <CikisDugmesi />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
