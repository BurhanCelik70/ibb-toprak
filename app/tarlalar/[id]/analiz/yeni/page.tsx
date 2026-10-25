import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { AppHeader, SiteFooter } from '@/components/site';
import { oturumKullanici } from '@/lib/supabase/server';
import { YeniAnaliz } from './YeniAnaliz';

export const metadata = { title: 'Yeni analiz' };

export default async function YeniAnalizSayfasi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await oturumKullanici();
  const { data: tarla } = await supabase.from('tarlalar').select('id, ad, il, ilce, bitki').eq('id', id).maybeSingle();
  if (!tarla) notFound();
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e6]">
      <AppHeader aktif="tarlalar" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
        <Link href={`/tarlalar/${tarla.id}`} className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[#476456]">
          <ChevronLeft size={16} /> {tarla.ad}
        </Link>
        <YeniAnaliz tarlaId={tarla.id} tarla={{ ad: tarla.ad, ilce: [tarla.ilce, tarla.il].filter(Boolean).join(', ') || null, bitki: tarla.bitki }} />
      </main>
      <SiteFooter />
    </div>
  );
}
