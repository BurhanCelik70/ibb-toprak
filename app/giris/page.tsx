import Link from 'next/link';
import { DilSecici } from '@/components/DilSecici';
import { Logo } from '@/components/site';
import { sozluk } from '@/lib/ceviri';
import { ceviriAl, dilAl } from '@/lib/dilSunucu';
import { GirisFormu } from './GirisFormu';

export async function generateMetadata() {
  return { title: sozluk(await dilAl()).giris.baslik, robots: { index: false, follow: true } };
}

export default async function GirisSayfasi({ searchParams }: { searchParams: Promise<{ sonra?: string; adim?: string; hata?: string }> }) {
  const { sonra, adim, hata } = await searchParams;
  const { dil, t } = await ceviriAl();
  const g = t.giris;
  // Yalnızca site içi yollara dön (açık yönlendirme açığını önler)
  const hedef = sonra && sonra.startsWith('/') && !sonra.startsWith('//') ? sonra : '/tarlalar';
  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-[#121410]">
      {/* Arka plan: olgun başak */}
      <div className="absolute inset-0 bg-[url('/hasat.jpg')] bg-cover bg-[62%_30%]" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#121410] via-[#121410]/60 to-[#121410]/20 lg:bg-gradient-to-r lg:from-[#121410]/90 lg:via-[#121410]/50 lg:to-[#121410]/10"
        aria-hidden
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label={g.anaSayfa}>
            <Logo size={36} acik dil={dil} />
          </Link>
          <DilSecici dil={dil} seffaf etiket={t.menu.dil} baslik={t.menu.dilSec} />
        </div>

        <div className="flex flex-1 flex-col justify-end gap-10 py-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="hidden max-w-md lg:block">
            <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-[-0.02em] text-white">
              {g.soz1}
              <span className="block italic text-[#e2b65c]">{g.soz2}</span>
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/70">
              {g.sozMetin}
            </p>
          </div>

          <div className="w-full max-w-md">
            <GirisFormu dil={dil} sonra={hedef} ilkAdim={adim === 'ad' ? 'ad' : 'eposta'} ilkHata={hata === 'baglanti' ? g.baglanti : null} />
            <p className="mt-5 text-center text-xs leading-5 text-white/55">
              {g.kabul}{' '}
              <Link href="/gizlilik" className="underline hover:text-white">{g.gizlilik}</Link>
            </p>
            <div className="mt-6 flex flex-col items-center gap-2 text-sm sm:flex-row sm:justify-center sm:gap-5">
              <Link href="/ornek" className="font-semibold text-[#e2b65c] hover:text-white">
                {g.ornek}
              </Link>
              <Link href="/" className="text-white/70 hover:text-white">
                {g.geri}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
