import { OrnekRapor } from '@/components/analiz/OrnekRapor';
import { AppHeader, SiteFooter } from '@/components/site';

export const metadata = {
  title: 'Örnek rapor',
  description: 'Hesap açmadan Tarım 4.0 toprak raporunun nasıl göründüğüne bakın: toprak karnesi, öneriler ve adım adım sulama programı.',
};

export default function OrnekSayfa() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e6] text-[#1d2a22]">
      <AppHeader />
      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <OrnekRapor />
      </main>
      <SiteFooter />
    </div>
  );
}
