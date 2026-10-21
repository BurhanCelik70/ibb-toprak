import { ArrowRight, CirclePlay, Droplets, GitCompareArrows, MapPinned } from 'lucide-react';
import Link from 'next/link';
import { BuyumeSahnesi } from '@/components/BuyumeSahnesi';
import { AppHeader, DerinlikCizimi, SiteFooter, ZikzakCizimi } from '@/components/site';

const VIDEO_LISTESI = {
  baslik: 'Toprağın uzmanı cevaplıyor',
  listeId: 'PLKFaLkVfBg00uFvdD9r9bRpSDIznvIuUT',
  url: 'https://www.youtube.com/playlist?list=PLKFaLkVfBg00uFvdD9r9bRpSDIznvIuUT',
};

const OZELLIKLER = [
  {
    i: MapPinned,
    t: 'Tarlanızı bir kez kaydedin',
    d: 'Ad, alan, bitki ve sulama yöntemi. Sonraki her analiz o tarlanın altına düşer, bilgileri tekrar girmezsiniz.',
  },
  {
    i: GitCompareArrows,
    t: 'Neyin değiştiğini görün',
    d: 'Yeni analizde hangi değer iyileşti, hangisi geriledi; kalite indeksi yıllar içinde nasıl değişti.',
  },
  {
    i: Droplets,
    t: 'Sulamanıza göre uygulayın',
    d: 'Damlada gübre hangi saat aralığında, yağmurlamada kaçıncı saatte, pivotta hangi hızla. Tarlanıza düşen toplam miktarla.',
  },
];

export default function AnaSayfa() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[#f5f0e6] text-[#1d2a22]">
      <AppHeader seffaf />
      <BuyumeSahnesi />

      {/* Tarla defteri */}
      <section id="tarla-defteri" className="scroll-mt-10 px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">Cebinizde tarla defteri</p>
            <h2 className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-5xl">
              Her tarlanın kendi toprak geçmişi.
            </h2>
            <ul className="mt-10 divide-y divide-[#1d2a22]/10 border-y border-[#1d2a22]/10">
              {OZELLIKLER.map(({ i: Ikon, t, d }) => (
                <li key={t} className="flex gap-5 py-6">
                  <Ikon size={22} strokeWidth={1.6} className="mt-1 shrink-0 text-[#2f7a4f]" />
                  <div>
                    <h3 className="text-lg font-semibold">{t}</h3>
                    <p className="mt-1.5 text-[15px] leading-7 text-[#5e6a60]">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Uygulama önizlemesi */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-3 -z-0 rounded-[38px] sm:-inset-6 sm:rounded-[44px] bg-[url('/hasat.jpg')] bg-cover bg-center opacity-90" aria-hidden />
            <div className="relative rounded-[30px] bg-white p-5 shadow-[0_40px_80px_-20px_rgba(18,20,16,0.45)] sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold">Tepe Tarla</div>
                  <div className="mt-1 text-xs text-[#6d786f]">Mısır · Damla · 12 dekar</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-4xl font-medium leading-none">64</div>
                  <div className="mt-1 text-xs font-semibold text-[#3f8f3a]">▲ 8 · İyi</div>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-xs font-medium text-[#6d786f]">6 saatlik damla sulama</div>
                <div className="mt-2 flex h-8 overflow-hidden rounded-xl text-[11px] font-semibold">
                  <div className="flex w-1/4 items-center justify-center bg-[#e4eef1] text-[#3d5a66]">Su</div>
                  <div className="flex w-1/2 items-center justify-center bg-[#2f7a4f] text-white">1:30–4:30 gübre</div>
                  <div className="flex w-1/4 items-center justify-center bg-[#eef4f6] text-[#3d5a66]">Su</div>
                </div>
              </div>
              <ul className="mt-5 space-y-1">
                {[
                  ['Mg NİTRAT', '2–3 kg/da', '24–36 kg'],
                  ['KIANA CLIMATE PLUS', '200–300 g/da', '2,4–3,6 kg'],
                ].map(([u, d, t]) => (
                  <li key={u} className="flex items-center justify-between gap-3 border-t border-[#1d2a22]/8 py-3 text-sm">
                    <span className="font-semibold">{u}</span>
                    <span className="text-right">
                      <span className="block text-xs font-semibold text-[#2f7a4f]">{d}</span>
                      <span className="block text-[11px] text-[#6d786f]">Tarlanız için {t}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Toprak hakkında */}
      <section className="bg-[#121410] text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:py-28">
          <blockquote>
            <p className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.02em] sm:text-5xl">
              Bir santimetre verimli toprağın oluşması
              <span className="italic text-[#e2b65c]"> bin yıl sürebilir.</span>
            </p>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65">
              Bir mevsimlik yanlış gübreleme ise bu birikimi tuzlanma ve çoraklaşmayla hızla tüketebilir. Toprak analizi, toprağa
              ihtiyacı olanı, ihtiyacı kadar vermenin en güvenilir yoludur.
            </p>
          </blockquote>
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <dt className="font-display text-3xl">%95</dt>
              <dd className="mt-1 text-sm leading-6 text-white/60">Gıdamızın yaklaşık %95’i doğrudan ya da dolaylı olarak topraktan gelir.</dd>
            </div>
            <div>
              <dt className="font-display text-3xl">Bir kaşık toprak</dt>
              <dd className="mt-1 text-sm leading-6 text-white/60">Sağlıklı bir kaşık toprakta dünyadaki insan sayısından fazla canlı yaşar.</dd>
            </div>
            <p className="text-xs text-white/35 sm:col-span-2 lg:col-span-1">Kaynak: BM Gıda ve Tarım Örgütü (FAO)</p>
          </dl>
        </div>
      </section>

      {/* Örnek alma rehberi */}
      <section id="ornek" className="scroll-mt-10 px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">Doğru sonuç, doğru örnekle başlar</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-5xl">
            Toprak örneği nasıl alınır?
          </h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] bg-[#fbf8f2] p-6 sm:p-8">
              <h3 className="text-lg font-semibold">Nasıl?</h3>
              <div className="mt-5">
                <ZikzakCizimi />
              </div>
              <ol className="mt-6 space-y-3 text-[15px] leading-7 text-[#3f4a42]">
                <li><span className="font-display text-[#a87a2a]">1.</span> Tarlada zikzak çizerek 8–10 noktadan, küreğin 3–4 cm’lik dilimiyle örnek alın.</li>
                <li><span className="font-display text-[#a87a2a]">2.</span> Toprakları temiz bir zeminde karıştırın; kesekleri ufalayın, taş ve bitki artıklarını atın.</li>
                <li><span className="font-display text-[#a87a2a]">3.</span> Karışımdan yaklaşık <strong>2 kg</strong> alıp temiz bir torbaya koyun ve etiketleyin.</li>
              </ol>
            </div>
            <div className="grid gap-6">
              <div className="rounded-[28px] bg-[#fbf8f2] p-6 sm:p-8">
                <h3 className="text-lg font-semibold">Hangi derinlikten?</h3>
                <div className="mt-5">
                  <DerinlikCizimi />
                </div>
              </div>
              <div className="rounded-[28px] bg-[#fbf8f2] p-6 sm:p-8">
                <h3 className="text-lg font-semibold">Ne zaman?</h3>
                <ul className="mt-3 space-y-2 text-[15px] leading-7 text-[#3f4a42]">
                  <li><strong>Tek yıllık bitki ve seracılık:</strong> ekim ya da dikimden 1–2 ay önce.</li>
                  <li><strong>Meyve bahçesi ve bağ:</strong> gübreleme tarihinden 1–2 ay önce.</li>
                  <li className="text-[#a3402a]">Donmuş ya da çok çamurlu topraktan örnek almayın.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Videolar */}
      <section id="videolar" className="scroll-mt-10 px-5 pb-20 sm:px-8 lg:pb-28">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-5xl">{VIDEO_LISTESI.baslik}</h2>
              <p className="mt-3 text-[#5e6a60]">Toprak, gübreleme ve bitki besleme üzerine kısa uzman cevapları.</p>
            </div>
            <a
              href={VIDEO_LISTESI.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#1d2a22]/15 px-5 py-2.5 text-sm font-semibold hover:bg-white"
            >
              <CirclePlay size={18} className="text-[#c4302b]" /> YouTube’da tüm liste
            </a>
          </div>
          <div className="mt-10 overflow-hidden rounded-[28px] bg-[#121410] shadow-[0_30px_60px_-20px_rgba(18,20,16,0.4)]">
            <iframe
              className="aspect-video w-full"
              src={`https://www.youtube-nocookie.com/embed/videoseries?list=${VIDEO_LISTESI.listeId}`}
              title={`${VIDEO_LISTESI.baslik} – video listesi`}
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Son çağrı */}
      <section className="relative overflow-hidden bg-[#121410] text-white">
        <div className="absolute inset-0 bg-[url('/hasat.jpg')] bg-cover bg-[center_30%] opacity-70" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121410] via-[#121410]/70 to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
          <h2 className="max-w-lg font-display text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-6xl">İlk tarlanızı bugün ekleyin.</h2>
          <p className="mt-5 max-w-md text-white/70">Telefon numaranızla bir dakikada hesap açın. Şifre yok, ücret yok.</p>
          <Link
            href="/tarlalar"
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-[#f5f0e6] px-7 py-4 font-semibold text-[#121410] transition hover:bg-white"
          >
            Ücretsiz başla <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
