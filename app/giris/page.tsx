import Link from 'next/link';
import { Logo } from '@/components/site';
import { GirisFormu } from './GirisFormu';

export const metadata = { title: 'Giriş' };

export default async function GirisSayfasi({ searchParams }: { searchParams: Promise<{ sonra?: string }> }) {
  const { sonra } = await searchParams;
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
        <Link href="/" className="self-start" aria-label="Ana sayfa">
          <Logo size={36} acik />
        </Link>

        <div className="flex flex-1 flex-col justify-end gap-10 py-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="hidden max-w-md lg:block">
            <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-[-0.02em] text-white">
              Toprağınız konuşuyor.
              <span className="block italic text-[#e2b65c]">Dinlemeye hazır mısınız?</span>
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/70">
              Tarlalarınız, analizleriniz ve reçeteleriniz tek yerde. Her yeni analizde ne değiştiğini görün.
            </p>
          </div>

          <div className="w-full max-w-md">
            <GirisFormu sonra={hedef} />
            <p className="mt-5 text-center text-xs leading-5 text-white/55">
              Giriş yaparak tarla ve analiz bilgilerinizin hesabınızda saklanmasını kabul etmiş olursunuz.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
