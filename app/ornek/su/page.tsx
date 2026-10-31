import Link from 'next/link';
import { SuKarnesi } from '@/components/su/SuKarnesi';
import { AppHeader, SiteFooter } from '@/components/site';

export const metadata = {
  title: 'Örnek su karnesi',
  description: 'Hesap açmadan sulama suyu karnesinin nasıl göründüğüne bakın: FAO ölçütlerine göre tuzluluk, sodyum, bikarbonat ve size uygun sulama yöntemi.',
};

/** Konya ovasında tipik bir kuyu suyu (örnek değerler) */
const RAPOR = {
  kaynakAdi: 'Kuyu suyu',
  degerler: { ec: 1150, ph: 7.9, na: 3.4, ca: 4.2, mg: 3.1, k: 0.1, co3: 0, hco3: 5.6, cl: 4.6, so4: 2.1, b: 0.6, no3n: 6 },
};
const YORUM = {
  ozet: 'Kuyu suyunuz yüksek tuzlu (C3) ama sodyumu az (S1). Mısır bu tuzluluğa dayanır, verim kaybı neredeyse yok; yalnızca klorür hafif yüksek ve damlatıcılarda kireçlenme riski var.',
  yapilacaklar: [
    'Her sulamada bitkinin ihtiyacından yaklaşık %16 fazla su verin; tuz kök bölgesinden aşağı yıkansın.',
    'Toprağı kurutmayın: sulamaları aksatmadan, düzenli aralıklarla yapın.',
    'Sezonda 2–3 kez sulama suyuna asit verip damla hatlarını yıkayın, filtreyi her hafta temizleyin.',
    'Potasyum gübresi olarak potasyum klorür yerine potasyum sülfat ya da potasyum nitrat kullanın.',
    'Suyunuz azot taşıyor: azotlu gübreyi biraz azaltabilirsiniz.',
  ],
  yontemNotu: 'Damla sulama bu su için en doğru yöntem: yaprak ıslanmadığı için klorür yaprağı yakmaz, toprak sürekli nemli kaldığından tuz kök bölgesinden uzak tutulur.',
  bitkiNotu: 'Mısır bu tuzlulukta verimini korur ve bu bor düzeyinden etkilenmez.',
};

export default function OrnekSuSayfasi() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e6] text-[#1d2a22]">
      <AppHeader />
      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto mb-6 flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#e8f3f8] px-5 py-4 text-sm text-[#0b3a52]">
          <span>Bu bir örnek su karnesidir. Kendi su analizinizi eklemek için ücretsiz hesap açın.</span>
          <Link href="/giris?sonra=%2Ftarlalar" className="rounded-full bg-[#0f5a73] px-4 py-2 font-bold text-white hover:bg-[#0b3a52]">
            Ücretsiz başla
          </Link>
        </div>
        <SuKarnesi rapor={RAPOR} tarla={{ ad: 'Örnek Tarla', bitki: 'Mısır (dane)', sulama: 'damla', konum: 'Konya / Karatay' }} tarih="Örnek" yorum={YORUM} />
      </main>
      <SiteFooter />
    </div>
  );
}
