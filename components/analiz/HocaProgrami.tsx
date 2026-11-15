'use client';
/**
 * "Hangi dönemde, nasıl verilecek?" — Prof. Dr. Metin Turan'ın HUMINTECH atlasındaki uygulama programı
 * (public/atlas/program.json; atlasın "Program" sekmesindeki verinin aynısı, atlastan çıkarıldı).
 * Sade tutmak için yalnızca tarlanın sulama yöntemine uyan uygulama yolu gösterilir:
 *   damla → Damla (fertigasyon) + Yapraktan · yağmurlama/pivot → Yağmurlama/pivot + Yapraktan · kuru → taban, baş gübre, yapraktan.
 * Dozlar atlastaki değerlerdir (hektar başına) ve bütün dillerde aynen gösterilir.
 */
import { Droplets, Leaf, Sprout } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTx } from '@/components/DilSaglayici';
import { atlasBitkiKodu } from '@/lib/atlas';
import { rejimSec, type Program } from '@/lib/hocaProgram';
import type { SulamaYontemi } from '@/lib/sulama';

export const DOZ_GOSTER = true;


/** Atlastaki doz ("1500–2000 kg/ha", "2.5 L/ha", "1 L / 100 L") bütün dillerde aynen, hektar başına; ondalık virgülle (Arapça hariç) */
export function hocaDozu(doz: string | null | undefined, dil: string): string {
  if (!doz) return '';
  return dil === 'ar' ? doz : doz.replace(/(\d)\.(\d)/g, '$1,$2');
}

export { rejimSec, type Program } from '@/lib/hocaProgram';

let onbellek: Promise<Program> | undefined;
export const hocaProgramiYukle = () => (onbellek ??= fetch('/atlas/program.json').then((r) => r.json() as Promise<Program>));

/** "PÜSKÜL – KOÇAN PÜSKÜLÜ" → "Püskül – koçan püskülü"; rakamlı kodlar (V8, R1) olduğu gibi kalır.
 *  Türkçe metinde Türkçe küçültme (I→ı) kullanılır; İngilizce metinde kullanılmaz ("SOWING" → "Sowing", "Sowıng" değil). */
export const baslikDuzelt = (s: string, li = 0) => {
  const yerel = li === 0 ? 'tr-TR' : 'en';
  return s
    .split(' ')
    .map((w, i) => (/\d/.test(w) ? w : i === 0 ? w.charAt(0) + w.slice(1).toLocaleLowerCase(yerel) : w.toLocaleLowerCase(yerel)))
    .join(' ');
};

export function HocaProgrami({ bitki, sulama, className = '' }: { bitki?: string | null; sulama?: SulamaYontemi; className?: string }) {
  const tx = useTx();
  const kod = atlasBitkiKodu(bitki);
  const [veri, setVeri] = useState<Program>();
  const [evre, setEvre] = useState(0);
  useEffect(() => {
    if (!kod) return;
    let iptal = false;
    hocaProgramiYukle().then((v) => !iptal && setVeri(v)).catch(() => {});
    return () => {
      iptal = true;
    };
  }, [kod]);

  const b = kod ? veri?.bitki[kod] : undefined;
  if (!kod || !veri || !b) return null;
  const li = tx.dil === 'de' ? 1 : 0; // atlas Almanca içermez: Almanca arayüzde İngilizce metin
  const { mod, sutun } = rejimSec(b.modlar, sulama);
  const e = b.evreler[Math.min(evre, b.evreler.length - 1)];
  const p = e.P[mod] ?? e.P[b.modlar[0]];
  const basliklar = veri.basliklar[mod]?.[li] ?? [];
  const dolu = sutun.filter((i) => p?.u[i]?.length);
  const ikon = (i: number) => (i === 2 ? <Leaf size={15} /> : mod === 'irr' || mod === 'flood' || mod === 'salma' ? <Droplets size={15} /> : <Sprout size={15} />);

  return (
    <section className={`overflow-hidden rounded-[28px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-8 ${className}`} aria-labelledby="hoca-program">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">{tx("Uygulama programı")} · Prof. Dr. Metin Turan</p>
      <h2 id="hoca-program" className="mt-2 font-display text-3xl font-medium tracking-[-0.01em] sm:text-4xl">{tx("Hangi dönemde, nasıl verilecek?")}</h2>
      <p className="mt-2 max-w-[70ch] text-sm leading-6 text-[#5b6f65]">{tx("Dönemi seçin; sulama yönteminize uyan uygulama yolu ve ürünler görünür.")}</p>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label={tx("Gelişme dönemi")}>
        {b.evreler.map((x, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === evre}
            onClick={() => setEvre(i)}
            className={`rounded-full px-3.5 py-2 text-left text-[13px] font-semibold transition ${i === evre ? 'bg-[#1f6f55] text-white' : 'bg-[#eef3ee] text-[#1d2a22] hover:bg-[#e1ebe2]'}`}
          >
            <span className="opacity-70">{i + 1}.</span> {baslikDuzelt(x.ad[li], li)}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {e.bbch && <p className="text-xs font-semibold text-[#5b6f65]">{e.bbch}</p>}
        {p?.not && <p className="mt-2 rounded-2xl bg-[#fbf6e8] px-4 py-3 text-sm leading-6 text-[#4a3d1c]">{p.not[li]}</p>}
        {dolu.length === 0 ? (
          <p className="mt-4 text-sm text-[#5b6f65]">{tx("Bu dönemde gübre uygulaması yok.")}</p>
        ) : (
          <div className={`mt-4 grid gap-4 ${dolu.length > 1 ? 'md:grid-cols-2' : ''} ${dolu.length > 2 ? 'lg:grid-cols-3' : ''}`}>
            {dolu.map((i) => (
              <div key={i} className="rounded-2xl ring-1 ring-[#1d2a22]/10">
                <p className="flex items-center gap-2 border-b border-[#1d2a22]/8 px-4 py-3 text-[13px] font-bold text-[#1f6f55]">
                  {ikon(i)} {baslikDuzelt(basliklar[i] ?? '', li)}
                </p>
                <ul className="divide-y divide-[#1d2a22]/6">
                  {p.u[i].map(([u, doz, nasil, alt], k) => {
                    const ur = veri.urun[u];
                    if (!ur) return null;
                    const humintech = ur[2] !== 'M' && ur[2] !== 'G';
                    return (
                      <li key={k} className="px-4 py-3">
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-[#1d2a22]">
                          {alt ? <span className="text-xs font-medium text-[#8a6a2a]">{tx("veya")}</span> : null}
                          {ur[li]}
                          {humintech && <span className="rounded-full bg-[#e6f2ea] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1f6f55]">Humintech</span>}
                        </p>
                        {(nasil && veri.nasil[nasil]) || (DOZ_GOSTER && doz) ? (
                          <p className="mt-0.5 text-[13px] leading-5 text-[#5b6f65]">
                            {DOZ_GOSTER && doz ? <b className="font-semibold text-[#1d2a22]">{hocaDozu(doz, tx.dil)}</b> : null}
                            {DOZ_GOSTER && doz && nasil ? ' · ' : ''}
                            {nasil ? veri.nasil[nasil]?.[li] : ''}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs leading-5 text-[#7b8a82]">{tx("Miktarlar toprak analizinize göre yukarıdaki dönem reçetesinde verilir; burada hangi ürünün hangi yolla ve ne zaman uygulanacağı gösterilir.")}</p>
      </div>
    </section>
  );
}
