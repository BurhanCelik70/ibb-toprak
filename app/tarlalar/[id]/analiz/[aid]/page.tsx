import { ceviriAl } from '@/lib/dilSunucu';
import { notFound } from 'next/navigation';
import { AppHeader, SiteFooter } from '@/components/site';
import { oturumKullanici } from '@/lib/supabase/server';
import { tarihYaz, type Analiz, type Tarla } from '@/lib/veri';
import { AnalizSonucu } from './AnalizSonucu';
import { dunyaIklimleri } from '@/lib/dunyaIklim';
import { ilGoster } from '@/lib/dunya';
import { IklimKaydi } from '@/components/IklimKaydi';

export async function generateMetadata() {
  const { tx } = await ceviriAl();
  return { title: tx('Analiz sonucu') };
}

export default async function AnalizSayfasi({ params }: { params: Promise<{ id: string; aid: string }> }) {
  const { tx } = await ceviriAl();
  const { id, aid } = await params;
  const { supabase } = await oturumKullanici();
  const [{ data: tarla }, { data: analiz }] = await Promise.all([
    supabase.from('tarlalar').select('*').eq('id', id).maybeSingle<Tarla>(),
    supabase.from('analizler').select('*').eq('id', aid).eq('tarla_id', id).maybeSingle<Analiz>(),
  ]);
  if (!tarla || !analiz) notFound();
  const iklimP = dunyaIklimleri([tarla.il]);

  // Bu analizden önceki en yakın analiz (karşılaştırma için)
  const { data: onceki } = await supabase
    .from('analizler')
    .select('rapor, analiz_tarihi')
    .eq('tarla_id', id)
    .neq('id', aid)
    .lte('analiz_tarihi', analiz.analiz_tarihi)
    .order('analiz_tarihi', { ascending: false })
    .order('olusturma', { ascending: false })
    .limit(1)
    .maybeSingle<Pick<Analiz, 'rapor' | 'analiz_tarihi'>>();
  const iklim = await iklimP;

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e6]">
      <AppHeader aktif="tarlalar" />
      <IklimKaydi iklim={iklim}>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
        <AnalizSonucu
          tarlaId={tarla.id}
          analizId={analiz.id}
          tarla={{
            ad: tarla.ad,
            bitki: tarla.bitki,
            sulama: tarla.sulama,
            alan_dekar: tarla.alan_dekar,
            sulama_suresi_saat: tarla.sulama_suresi_saat,
            konum: [tarla.ilce, ilGoster(tarla.il, tx.dil)].filter(Boolean).join(', ') || null,
            il: tarla.il ?? null,
            ilce: tarla.ilce ?? null,
          }}
          rapor={{ ...analiz.rapor, bitki: tarla.bitki ?? analiz.rapor.bitki }}
          tarih={tarihYaz(analiz.analiz_tarihi, tx.dil)}
          cozum={analiz.cozum}
          onceki={onceki ? { rapor: onceki.rapor, tarih: tarihYaz(onceki.analiz_tarihi, tx.dil) } : null}
        />
      </main>
      </IklimKaydi>
      <SiteFooter />
    </div>
  );
}
