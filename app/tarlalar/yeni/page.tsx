import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { AppHeader, SiteFooter } from '@/components/site';
import { TarlaFormu } from '@/components/tarla/TarlaFormu';

export const metadata = { title: 'Yeni tarla' };

export default function YeniTarla() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7faf5]">
      <AppHeader aktif="tarlalar" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8">
        <Link href="/tarlalar" className="inline-flex items-center gap-1 text-sm font-semibold text-[#476456]">
          <ChevronLeft size={16} /> Tarlalarım
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Yeni tarla</h1>
        <p className="mt-2 text-[#64766c]">Bu bilgileri bir kez girersiniz; her analizde yeniden sorulmaz.</p>
        <div className="mt-6">
          <TarlaFormu />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
