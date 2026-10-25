import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { AppHeader, SiteFooter } from '@/components/site';
import { TarlaFormu } from '@/components/tarla/TarlaFormu';
import { oturumKullanici } from '@/lib/supabase/server';
import type { Tarla } from '@/lib/veri';

export const metadata = { title: 'Tarlayı düzenle' };

export default async function TarlaDuzenle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await oturumKullanici();
  const { data: tarla } = await supabase.from('tarlalar').select('*').eq('id', id).maybeSingle<Tarla>();
  if (!tarla) notFound();
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e6]">
      <AppHeader aktif="tarlalar" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8">
        <Link href={`/tarlalar/${tarla.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#476456]">
          <ChevronLeft size={16} /> {tarla.ad}
        </Link>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.02em]">Tarlayı düzenle</h1>
        <div className="mt-6">
          <TarlaFormu tarla={tarla} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
