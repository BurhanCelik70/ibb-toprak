import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { SuEkle } from '@/components/su/SuEkle';
import { AppHeader, SiteFooter } from '@/components/site';
import { oturumKullanici } from '@/lib/supabase/server';

export const metadata = { title: 'Su analizi ekle' };

export default async function SuEkleSayfasi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await oturumKullanici();
  const { data: tarla } = await supabase.from('tarlalar').select('id, ad').eq('id', id).maybeSingle();
  if (!tarla) notFound();
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e6]">
      <AppHeader aktif="tarlalar" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
        <Link href={`/tarlalar/${tarla.id}`} className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[#476456]">
          <ChevronLeft size={16} /> {tarla.ad}
        </Link>
        <SuEkle tarlaId={tarla.id} tarlaAd={tarla.ad} />
      </main>
      <SiteFooter />
    </div>
  );
}
