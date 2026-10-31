import { notFound } from 'next/navigation';
import { AppHeader, SiteFooter } from '@/components/site';
import { oturumKullanici } from '@/lib/supabase/server';
import { tarihYaz, type SuAnalizi, type Tarla } from '@/lib/veri';
import { SuSonucu } from './SuSonucu';

export const metadata = { title: 'Su karnesi' };

export default async function SuSayfasi({ params }: { params: Promise<{ id: string; sid: string }> }) {
  const { id, sid } = await params;
  const { supabase } = await oturumKullanici();
  const [{ data: tarla }, { data: su }] = await Promise.all([
    supabase.from('tarlalar').select('*').eq('id', id).maybeSingle<Tarla>(),
    supabase.from('su_analizleri').select('*').eq('id', sid).eq('tarla_id', id).maybeSingle<SuAnalizi>(),
  ]);
  if (!tarla || !su) notFound();
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e6]">
      <AppHeader aktif="tarlalar" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
        <SuSonucu
          tarlaId={tarla.id}
          suId={su.id}
          tarla={{ ad: tarla.ad, bitki: tarla.bitki, sulama: tarla.sulama, konum: [tarla.ilce, tarla.il].filter(Boolean).join(', ') || null }}
          rapor={su.rapor}
          tarih={tarihYaz(su.analiz_tarihi)}
          yorum={su.yorum}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
