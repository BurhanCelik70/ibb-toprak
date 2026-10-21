'use client';
/**
 * Ana sayfa açılışı: kaydırdıkça tohumdan başağa büyüyen buğday.
 * Video kareleri (public/buyume/001..097.webp) tuvale çizilir; kaydırma oranı hangi karenin
 * gösterileceğini belirler. Yazı panelleri de aynı orana göre belirip kaybolur.
 * Her karede React yeniden çizilmez; stil doğrudan DOM'a yazılır (telefonda akıcılık için).
 */
import { ArrowDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

const KARE_SAYISI = 97;
const kareYolu = (i: number) => `/buyume/${String(i + 1).padStart(3, '0')}.webp`;

/** [başlangıç, bitiş] kaydırma oranı (0–1) */
type Panel = { aralik: [number, number]; ilk?: boolean; son?: boolean; etiket?: string; baslik: string; metin: string };

const PANELLER: Panel[] = [
  {
    aralik: [0, 0.16],
    ilk: true,
    baslik: 'Her hasat topraktan başlar.',
    metin: 'Toprak analizinizi yükleyin. Neyin eksik olduğunu, hangi gübreyi ne kadar vereceğinizi ve sulamanıza göre hangi saatte uygulayacağınızı söyleyelim.',
  },
  {
    aralik: [0.22, 0.42],
    etiket: '01 · Tohum',
    baslik: 'Toprağınızı tanıyın.',
    metin: 'Laboratuvar raporunuzu Excel, PDF ya da fotoğrafla yükleyin. Değerler saniyeler içinde okunur, her tarlanın altına kaydedilir.',
  },
  {
    aralik: [0.46, 0.64],
    etiket: '02 · Filiz',
    baslik: 'Eksiği görün, doğrusunu verin.',
    metin: 'Toprak kalite indeksi, eksik ve fazla değerler, her sorun için ürün ve dekar başına doz. Tahmin yok, analiz var.',
  },
  {
    aralik: [0.68, 0.84],
    etiket: '03 · Başak',
    baslik: 'Sulamanıza göre reçete.',
    metin: 'Damla, yağmurlama ya da pivot: gübre sulamanın hangi saatinde verilir, tarlanıza toplam ne kadar düşer.',
  },
  {
    aralik: [0.88, 1.01],
    son: true,
    etiket: '04 · Hasat',
    baslik: 'Farkı hasatta görün.',
    metin: 'Her yeni analiz bir öncekiyle karşılaştırılır; toprağınızın yıldan yıla nasıl değiştiğini izlersiniz.',
  },
];

const ASAMALAR = ['Tohum', 'Filiz', 'Başak', 'Hasat'];
const sinirla = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

export function BuyumeSahnesi() {
  const kapRef = useRef<HTMLDivElement>(null);
  const tuvalRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<(HTMLDivElement | null)[]>([]);
  const cubukRef = useRef<HTMLDivElement>(null);
  const asamaRef = useRef<(HTMLSpanElement | null)[]>([]);
  const ipucuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const kap = kapRef.current!;
    const tuval = tuvalRef.current!;
    const ctx = tuval.getContext('2d')!;
    const kareler: (HTMLImageElement | null)[] = Array(KARE_SAYISI).fill(null);
    let sonCizilen = -1;
    let istek = 0;
    let iptal = false;

    const boyutla = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      tuval.width = Math.round(tuval.clientWidth * dpr);
      tuval.height = Math.round(tuval.clientHeight * dpr);
      sonCizilen = -1;
    };

    /** En yakın yüklenmiş kareyi "cover" yerleşimle çiz. */
    const ciz = (hedef: number) => {
      let i = hedef;
      for (let d = 0; d < KARE_SAYISI && !kareler[i]; d++) {
        const geri = hedef - d, ileri = hedef + d;
        if (geri >= 0 && kareler[geri]) { i = geri; break; }
        if (ileri < KARE_SAYISI && kareler[ileri]) { i = ileri; break; }
      }
      const img = kareler[i];
      if (!img || i === sonCizilen) return;
      const cw = tuval.width, ch = tuval.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      // Dar ekranda bitki ortada kalsın; yatayda hafif sağa yasla ki yazıya yer açılsın
      const odakX = cw > ch ? 0.62 : 0.5;
      const x = sinirla((cw - w) * odakX, cw - w, 0);
      ctx.drawImage(img, x, (ch - h) / 2, w, h);
      sonCizilen = i;
    };

    const oran = () => {
      const r = kap.getBoundingClientRect();
      const yol = r.height - window.innerHeight;
      return yol > 0 ? sinirla(-r.top / yol) : 0;
    };

    const guncelle = () => {
      istek = 0;
      const p = oran();
      ciz(Math.round(p * (KARE_SAYISI - 1)));

      PANELLER.forEach((pn, k) => {
        const el = panelRef.current[k];
        if (!el) return;
        const [a, b] = pn.aralik;
        const g = 0.05; // giriş/çıkış payı
        let o = pn.ilk ? 1 - sinirla((p - (b - g)) / g) : sinirla((p - a) / g) * (pn.son ? 1 : 1 - sinirla((p - (b - g)) / g));
        if (pn.ilk && p <= a) o = 1;
        el.style.opacity = String(o);
        el.style.transform = `translate3d(0, ${(1 - o) * (p < (a + b) / 2 ? 24 : -24)}px, 0)`;
        el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
      });

      if (cubukRef.current) cubukRef.current.style.transform = `scaleY(${p})`;
      const etkin = p < 0.42 ? 0 : p < 0.66 ? 1 : p < 0.86 ? 2 : 3;
      asamaRef.current.forEach((el, k) => {
        if (el) el.style.opacity = k === etkin ? '1' : '0.4';
      });
      if (ipucuRef.current) ipucuRef.current.style.opacity = String(1 - sinirla(p / 0.06));
    };

    const iste = () => {
      if (!istek) istek = requestAnimationFrame(guncelle);
    };

    // Önce ilk kare, sonra kalanlar sırayla (bant genişliğini boğmamak için 6'şar paralel)
    const yukle = (i: number) =>
      new Promise<void>((tamam) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = kareYolu(i);
        img.onload = () => {
          if (!iptal) {
            kareler[i] = img;
            iste();
          }
          tamam();
        };
        img.onerror = () => tamam();
      });
    (async () => {
      await yukle(0);
      const sira = Array.from({ length: KARE_SAYISI - 1 }, (_, k) => k + 1);
      const isci = async () => {
        while (sira.length && !iptal) await yukle(sira.shift()!);
      };
      await Promise.all(Array.from({ length: 6 }, isci));
    })();

    boyutla();
    guncelle();
    const yeniden = () => {
      boyutla();
      iste();
    };
    window.addEventListener('scroll', iste, { passive: true });
    window.addEventListener('resize', yeniden);
    return () => {
      iptal = true;
      cancelAnimationFrame(istek);
      window.removeEventListener('scroll', iste);
      window.removeEventListener('resize', yeniden);
    };
  }, []);

  return (
    <section ref={kapRef} className="relative h-[520svh] bg-[#121410]" aria-label="Tarım 4.0 nasıl çalışır">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Yüklenene kadar ilk kare arka planda */}
        <div className="absolute inset-0 bg-[url('/tohum.jpg')] bg-cover bg-center" aria-hidden />
        <canvas ref={tuvalRef} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* Yazının okunması için yumuşak karartma: yatayda soldan, dikeyde alttan */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121410] via-[#121410]/55 to-transparent md:bg-gradient-to-r md:from-[#121410]/95 md:via-[#121410]/45 md:to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#121410] to-transparent" aria-hidden />

        <div className="relative mx-auto flex h-full max-w-6xl items-end px-5 pb-16 sm:px-8 md:items-center md:pb-0">
          <div className="relative w-full max-w-xl">
            {PANELLER.map((pn, k) => (
              <div
                key={pn.baslik}
                ref={(el) => {
                  panelRef.current[k] = el;
                }}
                className={`sahne-panel ${pn.ilk ? 'relative' : 'absolute inset-x-0 bottom-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2'}`}
                style={{ opacity: pn.ilk ? 1 : 0 }}
              >
                {pn.etiket && <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e2b65c]">{pn.etiket}</p>}
                {pn.ilk && (
                  <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9bdd68]" /> Yapay zekâ destekli toprak analizi
                  </p>
                )}
                {pn.ilk ? (
                  <h1 className="mt-5 font-display text-[44px] font-medium leading-[1.02] tracking-[-0.02em] text-white sm:text-6xl lg:text-7xl">
                    {pn.baslik}
                  </h1>
                ) : (
                  <h2 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl">{pn.baslik}</h2>
                )}
                <p className="mt-5 max-w-md text-base leading-7 text-white/75 sm:text-lg">{pn.metin}</p>
                {(pn.ilk || pn.son) && (
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                      href="/tarlalar"
                      className="group inline-flex items-center gap-2 rounded-full bg-[#f5f0e6] px-6 py-3.5 text-[15px] font-semibold text-[#121410] transition hover:bg-white"
                    >
                      Ücretsiz başla <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    {pn.ilk && (
                      <a href="#tarla-defteri" className="rounded-full px-5 py-3.5 text-[15px] font-medium text-white/80 hover:text-white">
                        Uygulamayı gör
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Aşama göstergesi (geniş ekran) */}
        <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 items-stretch gap-4 lg:flex" aria-hidden>
          <div className="relative w-px bg-white/15">
            <div ref={cubukRef} className="absolute inset-0 origin-top bg-[#e2b65c]" style={{ transform: 'scaleY(0)' }} />
          </div>
          <div className="flex flex-col justify-between gap-10 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white">
            {ASAMALAR.map((a, k) => (
              <span
                key={a}
                ref={(el) => {
                  asamaRef.current[k] = el;
                }}
                className="transition-opacity duration-300"
                style={{ opacity: k === 0 ? 1 : 0.4 }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>

        <div ref={ipucuRef} className="absolute inset-x-0 bottom-6 hidden justify-center md:flex" aria-hidden>
          <span className="flex items-center gap-2 text-xs font-medium tracking-wide text-white/60">
            <ArrowDown size={14} className="animate-bounce" /> Kaydırın, tohum filizlensin
          </span>
        </div>
      </div>
    </section>
  );
}
