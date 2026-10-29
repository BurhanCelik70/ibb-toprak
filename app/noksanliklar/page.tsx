import { NoksanlikKatalogu } from '@/components/noksanlik/Katalog';
import { AppHeader, SiteFooter } from '@/components/site';
import { BITKI_SIRASI, katalogBitkisi } from '@/lib/noksanliklar';
import { oturumKullanici } from '@/lib/supabase/server';

export const metadata = {
  title: 'Bitki besin noksanlıkları',
  description: 'Mısır, buğday, şeker pancarı, ayçiçeği, pamuk ve diğer bitkilerde azot, fosfor, potasyum, çinko, demir, bor noksanlıklarının resimli kataloğu.',
};

export default async function NoksanlikSayfasi({ searchParams }: { searchParams: Promise<{ bitki?: string; n?: string }> }) {
  const sp = await searchParams;
  // Giriş yapan kullanıcının tarlalarındaki bitkiler öne alınır
  let tarlaBitkileri: string[] = [];
  try {
    const { supabase, kullaniciId } = await oturumKullanici();
    if (kullaniciId) {
      const { data } = await supabase.from('tarlalar').select('bitki').order('olusturma', { ascending: false });
      tarlaBitkileri = [...new Set((data ?? []).map((t: { bitki: string | null }) => katalogBitkisi(t.bitki)).filter((b): b is string => !!b))];
    }
  } catch {
    // Supabase yoksa misafir gibi davran
  }
  const bitki = sp.bitki && (BITKI_SIRASI as readonly string[]).includes(sp.bitki) ? sp.bitki : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e6] text-[#1d2a22]">
      <AppHeader aktif="noksanlik" />
      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <NoksanlikKatalogu baslangicBitki={bitki} baslangicId={sp.n} tarlaBitkileri={tarlaBitkileri} />
      </main>
      <SiteFooter />
    </div>
  );
}
