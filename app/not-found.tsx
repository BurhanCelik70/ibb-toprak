import Link from 'next/link';
import { AppHeader, SiteFooter } from '@/components/site';

export const metadata = { title: 'Sayfa bulunamadı' };

export default function SayfaYok() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e6] text-[#1d2a22]">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-20 text-center">
        <p className="font-display text-7xl text-[#2f8f57]">404</p>
        <h1 className="mt-4 font-display text-3xl font-medium">Aradığınız sayfa bulunamadı</h1>
        <p className="mt-3 text-[15px] leading-7 text-[#5b6f65]">Bağlantı eskimiş ya da sayfa taşınmış olabilir.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-[#238f61] px-6 py-3 font-bold text-white hover:bg-[#1d7d54]">
            Ana sayfa
          </Link>
          <Link href="/tarlalar" className="rounded-full border border-[#cfc6b2] bg-white px-6 py-3 font-semibold text-[#17352a] hover:border-[#238f61]">
            Tarlalarım
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
