import { BesinKatalogu } from '@/components/besin/BesinKatalogu';
import { AppHeader, SiteFooter } from '@/components/site';

export const metadata = {
  title: 'Besinleri tanıyalım: makro ve mikro elementler',
  alternates: { canonical: '/besinler' },
  description:
    'Azot, fosfor, potasyum, kalsiyum, magnezyum, kükürt, demir, çinko, mangan, bakır, bor, molibden ve silisyum bitkide ne işe yarar, toprakta nasıl davranır, ne zaman verilir. 15-15-15 gübre torbası nasıl okunur.',
};

export default async function BesinlerSayfasi({ searchParams }: { searchParams: Promise<{ b?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e6] text-[#1d2a22]">
      <AppHeader aktif="besin" seffaf />
      <header className="relative isolate overflow-hidden bg-[#0b100c] text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/besin/kapak.webp" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/50 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-[#f5f0e6] to-transparent" />
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8 sm:pb-32 sm:pt-40">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9bdd68]">Makro ve mikro elementler</p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl font-medium leading-[1.04] tracking-[-0.02em] sm:text-6xl">Besinleri tanıyalım</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
            Her besin bitkide ne işe yarar, toprakta nasıl davranır, eksikliği nerede görülür ve ne zaman verilir? Bir elemente dokunun, kartı açılsın.
          </p>
        </div>
      </header>
      <main className="-mt-6 flex-1 pb-16">
        <BesinKatalogu baslangic={sp.b} />
      </main>
      <SiteFooter />
    </div>
  );
}
