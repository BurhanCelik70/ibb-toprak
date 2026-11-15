'use client';
/**
 * Ana sayfa açılışı (İGSAŞ): ebru + yağlı boya tarzı tek resim (zeytin ağacı, ırmak, filizli tarla, çiftçi traktöre
 * bağlı serpme makinesine gübre döküyor). Kodla eklenen hareket: yavaş yakınlaşma ve gökte süzülen altın toz.
 * Ortada başlık, yarı saydam bilgi kutusu ve iki düğme. "Hareketi azalt" açıksa resim durur.
 *
 * Resim: public/giris/igsas-ebru.webp (2576 px) ve küçük kopyası igsas-ebru-m.webp (1400 px, telefon). Resim, taneler
 * çuvalın ağzına denk gelsin diye ekranı kaplayan bir kutuda ölçeklenir; telefonda çiftçi ortada kalır.
 * Kodla eklenen hareket: yavaş yakınlaşma, çuvaldan huniye parlayan taneler, gökte altın toz.
 * Altta sayfa boyunca yüzen hap biçiminde menü vardır (YuzenMenu).
 */
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { IgsasLogo } from '@/components/IgsasLogo';

const RESIM = '/giris/igsas-ebru.webp'; // 2576×1438
const RESIM_KUCUK = '/giris/igsas-ebru-m.webp'; // 1400 genişlik, telefon
const YEDEK = '/hasat.jpg';
/** Resmin en/boy oranı ve odak noktası (çiftçi ile serpme makinesi); dar ekranda bu nokta ortada kalır */
const ORAN = 2576 / 1438;
const ODAK_X = 0.84;

type Metinler = { bolum: string; baslik: string; metin: string; asagi: string; basla: string; ornek: string };

/** Sabit tohumlu sözde rastgele (sunucu ve tarayıcıda aynı sonuç) */
const r = (i: number, n: number) => (Math.sin(i * 97.13 + n * 13.7) + 1) / 2;
/** Gökte süzülen altın toz */
const TOZ = Array.from({ length: 28 }, (_, i) => ({ x: r(i, 1) * 100, y: r(i, 2) * 50, b: 1.5 + r(i, 3) * 3, s: 9 + r(i, 4) * 10, g: -r(i, 5) * 12 }));
/** Çuvalın ağzından huniye dökülen parlak taneler (resim koordinatında, %) */
const TANE = Array.from({ length: 18 }, (_, i) => ({ x: 83.6 + r(i, 6) * 1.4, b: 3 + r(i, 7) * 3, s: 0.9 + r(i, 8) * 0.7, g: -r(i, 9) * 1.6 }));

/**
 * Resim kutusu: "object-cover" gibi ekranı tamamen kaplar ama taneler resimle birlikte ölçeklensin diye
 * gerçek bir kutudur. Dar ekranda (telefon) odak noktası ortaya gelecek şekilde kaydırılır.
 */
const KUTU = {
  width: `max(100cqw, ${ORAN * 100}cqh)`,
  aspectRatio: String(ORAN),
  left: `clamp(calc(100cqw - max(100cqw, ${ORAN * 100}cqh)), calc(50cqw - ${ODAK_X} * max(100cqw, ${ORAN * 100}cqh)), 0px)`,
  top: `calc(50cqh - max(100cqw, ${ORAN * 100}cqh) / ${ORAN} / 2)`,
} as const;

export function EbruGiris({ m, ustSag, baslaHref, ornekHref = '/ornek' }: { m: Metinler; ustSag?: ReactNode; baslaHref: string; ornekHref?: string }) {
  // Resim yüklenemezse yedek resme düş
  const [yedek, setYedek] = useState(false);

  return (
    <section className="relative h-svh min-h-[560px] overflow-hidden bg-[#10251b] text-white [container-type:size]" aria-label={m.bolum}>
      <div className="absolute" style={KUTU} aria-hidden>
        <div className="ebru-yakinlas absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={yedek ? YEDEK : RESIM}
            srcSet={yedek ? undefined : `${RESIM_KUCUK} 1400w, ${RESIM} 2576w`}
            sizes={`max(100vw, ${Math.round(ORAN * 100)}vh)`}
            alt=""
            fetchPriority="high"
            onError={() => setYedek(true)}
            className="h-full w-full object-cover"
          />
          {/* Çuvaldan huniye dökülen taneler */}
          {!yedek &&
            TANE.map((t, i) => (
              <span
                key={i}
                className="ebru-tane absolute rounded-full bg-[#fff1c4]"
                style={{ left: `${t.x}%`, top: '71.6%', width: t.b, height: t.b, animationDuration: `${t.s}s`, animationDelay: `${t.g}s` }}
              />
            ))}
        </div>
      </div>
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,37,27,.45),rgba(16,37,27,.15)_70%)]" aria-hidden />

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
          <h1 className="giris-baslik text-balance font-display text-[42px] font-medium leading-[1.04] tracking-[-0.02em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,.6)] sm:text-6xl lg:text-[80px]">
            {m.baslik}
          </h1>
          <p className="mx-auto mt-6 max-w-xl rounded-2xl bg-[#10251b]/50 px-5 py-4 text-[15px] leading-7 text-white/90 ring-1 ring-white/15 backdrop-blur-md sm:text-base">
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
