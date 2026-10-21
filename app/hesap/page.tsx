import { redirect } from 'next/navigation';
import { AppHeader, SiteFooter } from '@/components/site';
import { oturumKullanici } from '@/lib/supabase/server';
import { CikisDugmesi } from './CikisDugmesi';

export const metadata = { title: 'Hesabım' };

export default async function HesapSayfasi() {
  const { supabase, kullaniciId } = await oturumKullanici();
  if (!kullaniciId) redirect('/giris?sonra=/hesap');
  const { data: profil } = await supabase.from('profiller').select('ad_soyad, telefon, olusturma').eq('id', kullaniciId).maybeSingle();
  const { count } = await supabase.from('tarlalar').select('id', { count: 'exact', head: true });
  return (
    <div className="flex min-h-screen flex-col bg-[#f7faf5]">
      <AppHeader aktif="hesap" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Hesabım</h1>
        <dl className="mt-6 divide-y divide-[#edf2ee] rounded-[24px] border border-[#dfe9df] bg-white px-5">
          {[
            ['Ad soyad', profil?.ad_soyad ?? '—'],
            ['Telefon', profil?.telefon ?? '—'],
            ['Kayıtlı tarla', String(count ?? 0)],
            ['Üyelik', profil?.olusturma ? new Date(profil.olusturma).toLocaleDateString('tr-TR') : '—'],
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
