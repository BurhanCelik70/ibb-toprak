import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { YaprakTeshisi } from '@/components/noksanlik/Teshis';
import { AppHeader, SiteFooter } from '@/components/site';
import { oturumKullanici } from '@/lib/supabase/server';

export const metadata = {
  title: 'Yaprak teşhisi',
  description: 'Yaprağınızın fotoğrafını yükleyin, birkaç soruyu cevaplayın; olası besin noksanlığını, hastalığı ya da stresi ve ne yapmanız gerektiğini söyleyelim.',
};

export default async function TeshisSayfasi() {
  let girisli = false;
  let tarlalar: { id: string; ad: string; bitki: string | null }[] = [];
  try {
    const { supabase, kullaniciId } = await oturumKullanici();
    girisli = !!kullaniciId;
    if (kullaniciId) {
      const { data } = await supabase.from('tarlalar').select('id, ad, bitki').order('olusturma', { ascending: false });
      tarlalar = data ?? [];
    }
  } catch {
    // Supabase yoksa misafir
  }
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e6] text-[#1d2a22]">
      <AppHeader aktif="noksanlik" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/noksanliklar" className="inline-flex items-center gap-1 text-sm font-semibold text-[#476456]">
          <ChevronLeft size={16} /> Noksanlık kataloğu
        </Link>
        <header className="mt-3 mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f8f57]">Yapay zekâ ile ön teşhis</p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-[-0.02em] text-[#17352a] sm:text-5xl">Yaprağınızda ne var?</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#4f6158]">
            Fotoğrafı yükleyin, 8 kısa soruyu cevaplayın. Olası sorunları yüzdeleriyle, nedenleriyle ve gidermek için etken maddeyle birlikte gösterelim.
          </p>
        </header>
        <YaprakTeshisi girisli={girisli} tarlalar={tarlalar} />
      </main>
      <SiteFooter />
    </div>
  );
}
