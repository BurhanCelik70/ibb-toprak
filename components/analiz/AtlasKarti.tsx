'use client';
/**
 * Raporda "Isı, ışık ve gelişim" bölümü: Prof. Dr. Metin Turan'ın Bitki Gelişim ve Etki Atlası,
 * tarlanın bitkisi, bölgesi, sulaması ve toprağı seçili olarak 3B açılır. Ağır olduğu için (≈2,4 MB, WebGL)
 * tıklanınca yüklenir; yüksekliği atlasın gönderdiği mesajla ayarlanır.
 */
import { useTx } from '@/components/DilSaglayici';
import { ArrowUpRight, Play, Sun, Thermometer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { atlasAdresi, atlasToprak, type AtlasParametre } from '@/lib/atlas';
import type { SulamaYontemi } from '@/lib/sulama';
import type { SoilReport } from '@/lib/toprak';
import { AtlasEvrePaneli } from './AtlasEvrePaneli';

const PARAMETRELER: { k: AtlasParametre; ad: string; aciklama: string }[] = [
  { k: 'gdd', ad: 'GDD · sıcaklık toplamı', aciklama: 'Her dönemin tamamlanması için gereken ısı (depo boyu) ve bölgenizin sağladığı (dolum).' },
  { k: 'par', ad: 'PAR · ışık', aciklama: 'Fotosentezde kullanılan ışık: dönem hedefi ve bölgenin verdiği.' },
  { k: 'peff', ad: 'Fotosentez', aciklama: 'Sıcaklık, ışık ve stoma açıklığına göre fotosentez verimi.' },
  { k: 'ndvi', ad: 'NDVI · yeşil örtü', aciklama: 'Dönem dönem olması gereken yaprak örtüsü.' },
];

export function AtlasKarti({
  bitki,
  il,
  sulama,
  report,
  alan,
  className = '',
}: {
  bitki?: string | null;
  il?: string | null;
  sulama?: SulamaYontemi;
  report?: SoilReport | null;
  alan?: number | null;
  className?: string;
}) {
  const tx = useTx();
  const [acik, setAcik] = useState(false);
  const [param, setParam] = useState<AtlasParametre>('gdd');
  const [yukseklik, setYukseklik] = useState(1400);
  // Atlasta seçili dönem; alttaki gübre paneliyle iki yönlü eşitlenir
  const [evre, setEvre] = useState(0);
  const ref = useRef<HTMLIFrameElement>(null);
  // iframe ilk açılıştaki parametreyle yüklenir; sonraki değişimler mesajla gider (yeniden yükleme yok)
  const [ilkParam, setIlkParam] = useState<AtlasParametre>('gdd');
  const { adres, bitkiVar, bolgeAdi } = atlasAdresi({ bitki, il, sulama, report, parametre: ilkParam, gomulu: true, dil: tx.dil });
  const tamEkran = atlasAdresi({ bitki, il, sulama, report, parametre: param, dil: tx.dil }).adres;

  useEffect(() => {
    const dinle = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      const h = (e.data as { atlasYukseklik?: number })?.atlasYukseklik;
      if (typeof h === 'number' && h > 300) setYukseklik(Math.min(h + 4, 4000));
      const ev = (e.data as { atlasEvre?: number })?.atlasEvre;
      if (typeof ev === 'number') setEvre(ev);
    };
    window.addEventListener('message', dinle);
    return () => window.removeEventListener('message', dinle);
  }, []);

  if (!bitkiVar) return null;

  return (
    <section className={`overflow-hidden rounded-[28px] bg-white ring-1 ring-[#1d2a22]/8 ${className}`} aria-labelledby="atlas-baslik">
      <div className="p-5 sm:p-8">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">
          <Thermometer size={14} />{' '}{tx("Isı · ışık · gelişim")}
        </p>
        <h2 id="atlas-baslik" className="mt-2 font-display text-3xl font-medium tracking-[-0.01em] sm:text-4xl">
          
          {tx("Bitkiniz yeterince ısı ve ışık alıyor mu?")}
        </h2>
        <p className="mt-2 max-w-[72ch] text-sm leading-6 text-[#5b6f65]">
          
          {tx("Her gelişme dönemi belli bir sıcaklık toplamı (GDD) ve ışık (PAR) ister. 3B görünümde arkadaki depolar dönemin ihtiyacını, dolum")}
          {bolgeAdi ? tx(" {a} bölgesinin", { a: tx(bolgeAdi) }) : tx(" bölgenizin")}{' '}{tx("sağladığını gösterir; öndeki bitkiler açığın etkisini ve besin desteğini.")}
        </p>

        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label={tx("Parametre")}>
          {PARAMETRELER.map((p) => (
            <button
              key={p.k}
              type="button"
              role="tab"
              aria-selected={p.k === param}
              onClick={() => {
                setParam(p.k);
                if (acik) ref.current?.contentWindow?.postMessage({ atlasParametre: p.k }, '*');
                else setIlkParam(p.k);
              }}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${p.k === param ? 'bg-[#17352a] text-white' : 'bg-[#f1efe8] text-[#476456] hover:bg-[#e7e3d8]'}`}
            >
              {p.k === 'par' ? <Sun size={14} className="mr-1 inline -translate-y-px" /> : null}
              {tx(p.ad)}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[#7a877e]">{tx(PARAMETRELER.find((p) => p.k === param)?.aciklama)}</p>
      </div>

      {acik ? (
        <iframe
          ref={ref}
          key={adres}
          src={adres}
          title={tx("Bitki Gelişim ve Etki Atlası · 3B")}
          className="block w-full border-0 bg-[#f7f6f1]"
          style={{ height: yukseklik }}
          loading="lazy"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAcik(true)}
          className="group relative block aspect-[16/9] w-full overflow-hidden bg-[#e6ede6] text-left"
          aria-label={tx("3B görünümü başlat")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/atlas/onizleme.webp" alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex items-center gap-2 rounded-full bg-white/95 px-6 py-3.5 font-semibold text-[#17352a] shadow-xl transition group-hover:scale-105">
              <Play size={18} className="fill-current" />{' '}{tx("3B görünümü başlat")}
            </span>
          </span>
          <span className="absolute bottom-3 left-4 text-xs font-medium text-white/85">
            
            {tx("Döndürmek için sürükleyin · yaklaştırmak için tekerleği kullanın")}
          </span>
        </button>
      )}

      <AtlasEvrePaneli
        bitki={bitki} toprak={atlasToprak(report)}
        sulama={sulama}
        evre={evre}
        onEvre={(i) => {
          setEvre(i);
          ref.current?.contentWindow?.postMessage({ atlasEvreSec: i }, '*');
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1d2a22]/8 px-5 py-3.5 text-xs text-[#7a877e] sm:px-8">
        <span>{tx("Prof. Dr. Metin Turan · Bitki Gelişim ve Etki Atlası · değerler tahminidir.")}</span>
        <a href={tamEkran} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#1f6f4a] hover:underline">
          
          {tx("Atlası tam ekran aç")}{' '}<ArrowUpRight size={14} />
        </a>
      </div>
    </section>
  );
}
