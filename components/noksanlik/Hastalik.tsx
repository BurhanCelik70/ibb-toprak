'use client';
/**
 * Noksanlıkla karışabilen bitki hastalıkları: kart + detay penceresi. Yalnızca bilgilendirme; ilaç önerisi yok.
 */
import { Bug, CloudRain, Info, Leaf, Scale, Search, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { hastalikGorseli, type Hastalik } from '@/lib/hastaliklar';
import { BITKI_KISA, NOKSANLIKLAR, noksanlikGorseli, type Noksanlik } from '@/lib/noksanliklar';

const kisaAd = (b: string) => BITKI_KISA[b] ?? b;

export const TUR_RENK: Record<Hastalik['tur'], string> = {
  Mantar: '#8a5a2b',
  'Oomiset (mildiyö)': '#4b6a8f',
  Bakteri: '#9b3d3d',
  Virüs: '#6d4b8f',
};

export const BILGI_NOTU =
  'Bu bilgiler tanımaya yardım etmek içindir; ilaç önerisi değildir. Mücadele kararı ve ilaç seçimi için il/ilçe tarım müdürlüğünüze ya da ziraat mühendisinize danışın.';

/** Resim yoksa ya da yüklenemezse sade bir zemin gösterir */
function HastalikResmi({ h, className }: { h: Hastalik; className: string }) {
  const [hata, setHata] = useState(false);
  if (hata)
    return (
      <span className={`flex items-center justify-center bg-gradient-to-br from-[#3c4f3f] to-[#1f2f25] text-white/70 ${className}`}>
        <Bug size={42} />
      </span>
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={hastalikGorseli(h.id)} alt={`${kisaAd(h.bitki)} bitkisinde ${h.ad.toLocaleLowerCase('tr-TR')}`} loading="lazy" onError={() => setHata(true)} className={`object-cover ${className}`} />
  );
}

export function TurRozeti({ h, buyuk = false }: { h: Hastalik; buyuk?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold text-white ${buyuk ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'}`} style={{ background: TUR_RENK[h.tur] }}>
      <Bug size={buyuk ? 15 : 13} /> {h.tur}
    </span>
  );
}

export function HastalikKarti({ h, onAc, bitkiGoster = false }: { h: Hastalik; onAc: () => void; bitkiGoster?: boolean }) {
  return (
    <button
      type="button"
      onClick={onAc}
      className="group flex flex-col overflow-hidden rounded-[22px] border border-[#e3dccb] bg-white text-left transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(30,45,35,.45)]"
    >
      <span className="relative block aspect-[4/3] overflow-hidden bg-[#e9e3d4]">
        <HastalikResmi h={h} className="h-full w-full transition duration-500 group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3">
          <TurRozeti h={h} />
        </span>
      </span>
      <span className="flex flex-1 flex-col p-4">
        {bitkiGoster && <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a877e]">{kisaAd(h.bitki)}</span>}
        <span className="font-display text-xl font-medium leading-tight text-[#17352a]">{h.ad}</span>
        <span className="text-xs italic text-[#7a877e]">{h.etmen}</span>
        <span className="mt-1.5 text-sm leading-6 text-[#4f6158]">{h.kisa}</span>
        <span className="mt-auto pt-3 text-xs font-semibold text-[#8a5a2b]">Nasıl tanınır, noksanlıktan farkı →</span>
      </span>
    </button>
  );
}

export function HastalikDetayi({ h, onKapat, onNoksanlik }: { h: Hastalik; onKapat: () => void; onNoksanlik?: (n: Noksanlik) => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onKapat();
    document.addEventListener('keydown', k);
    const eski = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', k);
      document.body.style.overflow = eski;
    };
  }, [onKapat]);

  const benzerler = h.benzer.map((id) => NOKSANLIKLAR.find((n) => n.id === id)).filter((n): n is Noksanlik => !!n);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0e1510]/70 backdrop-blur-sm sm:items-center sm:p-6" onClick={onKapat} role="dialog" aria-modal aria-label={h.ad}>
      <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-[28px] bg-[#fbf8f1] sm:rounded-[28px]" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <HastalikResmi h={h} className="block aspect-[4/3] w-full sm:aspect-[16/9]" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-5 pb-5 pt-16 sm:px-8">
            <TurRozeti h={h} buyuk />
            <h2 className="mt-2 font-display text-3xl font-medium text-white sm:text-4xl">
              {kisaAd(h.bitki)}: {h.ad.toLocaleLowerCase('tr-TR')}
            </h2>
            <p className="text-sm italic text-white/75">{h.etmen}</p>
          </div>
          <button type="button" onClick={onKapat} aria-label="Kapat" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:p-8 md:grid-cols-[1.1fr_1fr]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[#7a877e]">Nasıl tanınır?</h3>
            <ul className="mt-2 space-y-2">
              {h.belirtiler.map((b) => (
                <li key={b} className="flex gap-2.5 text-[15px] leading-6 text-[#24342b]">
                  <Search size={16} className="mt-1 shrink-0 text-[#8a5a2b]" /> {b}
                </li>
              ))}
            </ul>
            <h3 className="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[#7a877e]">
              <CloudRain size={15} /> Ne zaman çıkar?
            </h3>
            <p className="mt-2 text-[15px] leading-6 text-[#24342b]">{h.kosullar}</p>
          </div>
          <div className="space-y-4">
            <div className="rounded-[20px] border border-[#ecd9b0] bg-[#fbf1dc] p-5">
              <h3 className="flex items-center gap-2 font-bold text-[#5a4a2a]">
                <Scale size={18} /> Noksanlıktan nasıl ayırırım?
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#5a4a2a]">{h.noksanliktanFarki}</p>
              {benzerler.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {benzerler.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      disabled={!onNoksanlik}
                      onClick={() => onNoksanlik?.(n)}
                      className="flex items-center gap-2 rounded-full border border-[#e2cf9f] bg-white py-1 pl-1 pr-3 text-xs font-semibold text-[#3f3420] enabled:hover:border-[#238f61]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={noksanlikGorseli(n.id)} alt="" className="h-7 w-7 rounded-full object-cover" />
                      {n.besin} noksanlığı
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-[20px] bg-[#e8f3e6] p-5">
              <h3 className="flex items-center gap-2 font-bold text-[#17352a]">
                <ShieldCheck size={18} className="text-[#238f61]" /> Önlemek için (ilaçsız)
              </h3>
              <ul className="mt-3 space-y-2">
                {h.onlemler.map((c) => (
                  <li key={c} className="flex gap-2.5 text-sm leading-6 text-[#24342b]">
                    <Leaf size={15} className="mt-1 shrink-0 text-[#238f61]" /> {c}
                  </li>
                ))}
              </ul>
            </div>
            <p className="flex gap-2 text-xs leading-5 text-[#7a877e]">
              <Info size={14} className="mt-0.5 shrink-0" /> {BILGI_NOTU}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
