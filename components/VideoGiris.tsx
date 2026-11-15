'use client';
/**
 * Ana sayfa açılışı (İGSAŞ): ebru + yağlı boya tarzı tek resim (zeytin ağacı, ırmak, filizli tarla, çiftçi traktöre
 * bağlı serpme makinesine gübre döküyor). Kodla eklenen hareket: yavaş yakınlaşma ve gökte süzülen altın toz.
 * Ortada başlık, yarı saydam bilgi kutusu ve iki düğme. "Hareketi azalt" açıksa resim durur.
 *
 * Resim: public/giris/igsas-ebru.webp (masaüstü) ve public/giris/igsas-ebru-m.webp (telefon). Yüksek çözünürlüklü
 * orijinal Gemini'den indirilip webp'ye çevrilecek; dosya yokken yedek resim (public/hasat.jpg) görünür.
 * Altta sayfa boyunca yüzen hap biçiminde menü vardır (YuzenMenu).
 */
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { IgsasLogo } from '@/components/IgsasLogo';

const RESIM = '/giris/igsas-ebru.webp';
const RESIM_MOBIL = '/giris/igsas-ebru-m.webp';
const YEDEK = '/hasat.jpg';

type Metinler = { bolum: string; baslik: string; metin: string; asagi: string; basla: string; ornek: string };

/** Gökte süzülen altın toz: sabit tohumla üretilir (sunucu ve tarayıcıda aynı) */
const TOZ = Array.from({ length: 28 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 97.13 + n * 13.7) + 1) / 2);
  return { x: r(1) * 100, y: r(2) * 55, b: 1.5 + r(3) * 3, s: 9 + r(4) * 10, g: -r(5) * 12 };
});

export function EbruGiris({ m, ustSag, baslaHref, ornekHref = '/ornek' }: { m: Metinler; ustSag?: ReactNode; baslaHref: string; ornekHref?: string }) {
  // Resim yoksa yedek resme düş
  const [kaynak, setKaynak] = useState<{ d: string; m: string }>({ d: RESIM, m: RESIM_MOBIL });
  useEffect(() => {
    const img = new Image();
    img.onerror = () => setKaynak({ d: YEDEK, m: YEDEK });
    img.src = RESIM;
  }, []);

  return (
    <section className="relative h-svh min-h-[560px] overflow-hidden bg-[#10251b] text-white" aria-label={m.bolum}>
      <picture className="absolute inset-0 block" aria-hidden>
        <source media="(max-width: 767px)" srcSet={kaynak.m} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={kaynak.d} alt="" className="ebru-yakinlas h-full w-full object-cover" fetchPriority="high" onError={() => setKaynak({ d: YEDEK, m: YEDEK })} />
      </picture>
      {/* Altın toz */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {TOZ.map((t, i) => (
          <span
            key={i}
            className="ebru-toz absolute rounded-full bg-[#f3d27a]"
            style={{ left: `${t.x}%`, top: `${t.y}%`, width: t.b, height: t.b, animationDuration: `${t.s}s`, animationDelay: `${t.g}s` }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/45 to-transparent" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,37,27,.35),rgba(16,37,27,.65))]" aria-hidden />

      {/* Üst: solda logo, sağda dil ve giriş */}
      <div className="absolute inset-x-0 top-0 z-10 flex justify-start px-5 pt-5 sm:px-8 sm:pt-7">
        <Link href="/" aria-label="İGSAŞ" className="drop-shadow-[0_2px_12px_rgba(0,0,0,.35)]">
          <IgsasLogo className="h-auto w-44 sm:w-56" />
        </Link>
      </div>
      {ustSag && <div className="absolute end-4 top-4 z-20 flex items-center gap-2 sm:end-6 sm:top-6">{ustSag}</div>}

      {/* Ortada başlık, bilgi kutusu ve iki düğme */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-5 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="giris-baslik text-balance font-display text-[42px] font-medium leading-[1.04] tracking-[-0.02em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,.45)] sm:text-6xl lg:text-[80px]">
            {m.baslik}
          </h1>
          <p className="mx-auto mt-6 max-w-xl rounded-2xl bg-[#10251b]/45 px-5 py-4 text-[15px] leading-7 text-white/90 ring-1 ring-white/15 backdrop-blur-md sm:text-base">
            {m.metin}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={baslaHref}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#2fbf5f] px-6 text-[15px] font-semibold text-[#0d2318] shadow-[0_10px_30px_-10px_rgba(47,191,95,.7)] transition hover:brightness-110"
            >
              {m.basla} <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href={ornekHref} className="inline-flex h-12 items-center rounded-full border border-white/50 bg-white/10 px-6 text-[15px] font-semibold text-white backdrop-blur hover:bg-white/20">
              {m.ornek}
            </Link>
          </div>
        </div>
      </div>

      <a href="#icerik" className="absolute bottom-9 start-6 z-10 hidden items-center gap-2 text-sm font-semibold text-white/85 hover:text-white md:flex">
        <ChevronDown size={18} className="animate-bounce" /> {m.asagi}
      </a>
    </section>
  );
}

/** Ana sayfada sayfa boyunca altta yüzen hap menü (Bayer tarzı) */
export function YuzenMenu({
  linkler,
  cta,
  etiket,
}: {
  linkler: { href: string; ad: string }[];
  cta: { href: string; ad: string };
  etiket: string;
}) {
  return (
    <nav aria-label={etiket} className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-3 print:hidden sm:bottom-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center rounded-full bg-white/95 py-1.5 pl-1.5 pr-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,.45)] backdrop-blur sm:pr-4">
          <Link href="/" aria-label="İGSAŞ" className="grid h-11 w-11 place-items-center rounded-full sm:h-12 sm:w-12">
            <IgsasLogo isaret acik className="h-10 w-10 sm:h-11 sm:w-11" />
          </Link>
          {linkler.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className={`${i > 1 ? 'hidden md:block' : i > 0 ? 'hidden sm:block' : ''} whitespace-nowrap rounded-full px-3 py-2 text-[15px] font-medium text-[#1d2a22] hover:bg-[#eef3ee] sm:px-4`}
            >
              {l.ad}
            </Link>
          ))}
        </div>
        <Link
          href={cta.href}
          className="group inline-flex h-14 items-center gap-2 rounded-full bg-gradient-to-br from-[#2fbf5f] to-[#1C4734] px-5 text-[15px] font-semibold text-white shadow-[0_12px_40px_-12px_rgba(0,0,0,.45)] transition hover:brightness-110 sm:h-[60px] sm:px-6"
        >
          {cta.ad} <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </nav>
  );
}
